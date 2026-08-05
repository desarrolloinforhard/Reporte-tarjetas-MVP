import { Platform } from 'react-native';

export type ExportColumn<T> = {
  label: string;
  value: (row: T) => string | number | null | undefined;
};

function escapeCsv(value: unknown) {
  const text = String(value ?? '');
  return `"${text.replaceAll('"', '""')}"`;
}

function escapeTab(value: unknown) {
  const text = String(value ?? '');
  return /[\t\r\n"]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function utf16Le(value: string) {
  const bytes = new Uint8Array(2 + value.length * 2);
  bytes[0] = 0xff;
  bytes[1] = 0xfe;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    bytes[2 + index * 2] = code & 0xff;
    bytes[3 + index * 2] = code >> 8;
  }
  return bytes;
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function safeName(value: string) {
  return value.replace(/[^a-z0-9_-]+/gi, '_');
}

export async function exportCsv<T>(name: string, columns: ExportColumn<T>[], rows: T[]) {
  const csv = [
    'sep=;',
    columns.map((column) => escapeCsv(column.label)).join(';'),
    ...rows.map((row) => columns.map((column) => escapeCsv(column.value(row))).join(';')),
  ].join('\r\n');
  const filename = `${safeName(name)}.csv`;

  if (Platform.OS === 'web') {
    // Excel para Windows detecta de forma confiable UTF-16LE + tabuladores,
    // incluso cuando la configuración regional no interpreta UTF-8 en CSV.
    const excelText = [
      columns.map((column) => escapeTab(column.label)).join('\t'),
      ...rows.map((row) => columns.map((column) => escapeTab(column.value(row))).join('\t')),
    ].join('\r\n');
    const blob = new Blob([utf16Le(excelText)], { type: 'text/csv;charset=utf-16le' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  // Estos módulos incluyen código nativo. Se cargan solamente al exportar para
  // que un development build antiguo pueda iniciar y mostrar el resto de la app.
  const [FileSystem, Sharing] = await Promise.all([
    import('expo-file-system/legacy'),
    import('expo-sharing'),
  ]);
  const uri = `${FileSystem.cacheDirectory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, `\uFEFF${csv}`, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await Sharing.shareAsync(uri, { mimeType: 'text/csv', dialogTitle: 'Exportar archivo CSV' });
}

export async function exportPdf<T>(
  name: string,
  title: string,
  columns: ExportColumn<T>[],
  rows: T[],
) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>
    @page{size:A4 landscape;margin:10mm}*{box-sizing:border-box}
    body{font-family:Arial,sans-serif;color:#142019;margin:0}h1{font-size:18px;color:#008a46;margin:0 0 5px}
    p{font-size:10px;color:#5d6c64;margin:0 0 10px}table{width:100%;border-collapse:collapse;font-size:8px;table-layout:auto}
    th{background:#e8f5ee;text-align:left;padding:5px;border:1px solid #c9d8d0;white-space:nowrap}
    td{padding:4px 5px;border:1px solid #d8e1dc;vertical-align:top}tr:nth-child(even){background:#f7faf8}
    thead{display:table-header-group}tr{break-inside:avoid}
  </style></head><body><h1>${escapeHtml(title)}</h1><p>${rows.length} registros exportados</p>
  <table><thead><tr>${columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join('')}</tr></thead>
  <tbody>${rows.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(column.value(row))}</td>`).join('')}</tr>`).join('')}</tbody></table></body></html>`;

  if (Platform.OS === 'web') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) throw new Error('El navegador bloqueó la ventana de impresión.');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    return;
  }

  const [Print, Sharing] = await Promise.all([import('expo-print'), import('expo-sharing')]);
  const { uri } = await Print.printToFileAsync({ html });
  await Sharing.shareAsync(uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Exportar ${safeName(name)}.pdf`,
  });
}
