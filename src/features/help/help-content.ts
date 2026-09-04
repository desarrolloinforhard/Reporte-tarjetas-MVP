export type HelpDefinition = { term: string; description: string };

export type HelpBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'heading'; text: string }
  | { type: 'bullets'; items: string[] }
  | { type: 'steps'; items: string[] }
  | { type: 'definitions'; items: HelpDefinition[] };

export type HelpSection = {
  id: string;
  number?: string;
  title: string;
  blocks: HelpBlock[];
};

export const helpSections: HelpSection[] = [
  {
    id: 'resumen',
    title: 'Resumen rápido',
    blocks: [
      { type: 'paragraph', text: 'Reportes de Tarjetas es la aplicación de INFORHARD S.R.L. para consultar, en modo de solo lectura, los cobros electrónicos del supermercado: pagos de Mercado Pago y Clover, liquidaciones, conciliación con las ventas y calidad de los datos.' },
      { type: 'paragraph', text: 'No modifica ventas, pagos, cajas ni datos del sistema comercial. Solo permite consultar.' },
      { type: 'heading', text: 'Lo esencial en 6 pasos' },
      { type: 'steps', items: ['Ingresá con tu usuario y contraseña.', 'Elegí un período en Inicio: Hoy, Últimos 7 días o Este mes.', 'Mirá el resumen de pagos y la comparación por proveedor.', 'Buscá una operación puntual en Pagos.', 'Abrí su detalle para ver productos, pagos asociados y datos técnicos.', 'Si algo no coincide, revisá Conciliación y Calidad de datos antes de avisar a soporte.'] },
      { type: 'paragraph', text: 'Usá el índice para saltar directamente a cualquier sección.' },
    ],
  },
  {
    id: 'iniciar-sesion', number: '01', title: 'Iniciar sesión',
    blocks: [
      { type: 'heading', text: 'Acceso a la aplicación' },
      { type: 'paragraph', text: 'Al abrir la aplicación vas a encontrar la pantalla de inicio de sesión. Ingresá tu usuario y tu contraseña, después presioná Ingresar.' },
      { type: 'paragraph', text: 'Si los datos son correctos, accederás automáticamente a la pantalla de Inicio.' },
      { type: 'heading', text: 'Si ingresás una contraseña incorrecta' },
      { type: 'paragraph', text: 'Revisá que:' },
      { type: 'bullets', items: ['El usuario esté escrito correctamente.', 'No haya espacios antes o después del usuario.', 'La contraseña respete mayúsculas, minúsculas y símbolos.', 'El teclado del celular no haya activado automáticamente una mayúscula.'] },
      { type: 'paragraph', text: 'Por seguridad, después de varios intentos incorrectos la aplicación puede bloquear temporalmente nuevos intentos. La pantalla mostrará cuánto falta para volver a intentar. Podés cerrar la aplicación o bloquear el teléfono: el tiempo continuará transcurriendo normalmente.' },
      { type: 'heading', text: 'Seguridad de la cuenta' },
      { type: 'paragraph', text: 'No compartas la contraseña por mensajes, fotografías o grupos. INFORHARD nunca necesita que envíes tu contraseña para revisar un inconveniente.' },
    ],
  },
  {
    id: 'instalar', number: '02', title: 'Instalar la aplicación',
    blocks: [
      { type: 'paragraph', text: 'Reportes de Tarjetas es una aplicación web instalable. Una vez instalada, se abre desde un ícono como cualquier otra aplicación.' },
      { type: 'heading', text: 'En Android' },
      { type: 'steps', items: ['Abrí el enlace en Chrome.', 'Cuando aparezca el aviso Instalar Reportes de Tarjetas, presioná Instalar.', 'Esperá a que termine la instalación.', 'Abrí la aplicación desde el ícono agregado al teléfono.'] },
      { type: 'heading', text: 'En una computadora' },
      { type: 'paragraph', text: 'Cuando el navegador muestre el ícono de instalación en la barra de direcciones:' },
      { type: 'steps', items: ['Presioná el ícono.', 'Seleccioná Instalar.', 'La aplicación se abrirá en una ventana independiente.'] },
      { type: 'heading', text: 'Importante' },
      { type: 'paragraph', text: 'Aunque esté instalada, la aplicación necesita conexión a Internet para consultar información actualizada.' },
    ],
  },
  {
    id: 'inicio', number: '03', title: 'Pantalla de Inicio',
    blocks: [
      { type: 'paragraph', text: 'La pantalla de Inicio ofrece un resumen rápido de la actividad del supermercado.' },
      { type: 'definitions', items: [{ term: 'Hoy', description: 'Muestra las operaciones del día.' }, { term: 'Últimos 7 días', description: 'Muestra la actividad de la última semana.' }, { term: 'Este mes', description: 'Muestra las operaciones del mes actual.' }] },
      { type: 'heading', text: 'Indicadores principales' },
      { type: 'definitions', items: [{ term: 'Pagos', description: 'Cantidad total de operaciones encontradas durante el período.' }, { term: 'Total cobrado', description: 'Suma total de los pagos aprobados.' }, { term: 'Aprobados', description: 'Operaciones procesadas correctamente.' }, { term: 'Devueltos', description: 'Pagos reembolsados total o parcialmente.' }, { term: 'Pendientes', description: 'Operaciones que todavía requieren confirmación o revisión.' }, { term: 'Con problema', description: 'Operaciones con información faltante o diferencias entre pago y venta.' }] },
      { type: 'heading', text: 'Comparación por proveedor' },
      { type: 'paragraph', text: 'Separa los resultados de Clover y Mercado Pago. Para cada proveedor muestra total cobrado, pagos, aprobación, rechazo, importe promedio y total devuelto. Presioná Ver pagos para consultar sus operaciones.' },
      { type: 'heading', text: 'Estado del sistema' },
      { type: 'paragraph', text: 'Informa si la aplicación se comunica correctamente con el servicio de reportes y la base de datos. La leyenda Solo lectura confirma que se consulta información sin modificar el sistema de ventas.' },
    ],
  },
  {
    id: 'pagos', number: '04', title: 'Pagos',
    blocks: [
      { type: 'paragraph', text: 'La sección Pagos permite buscar y revisar cada cobro electrónico registrado.' },
      { type: 'heading', text: 'Cómo buscar pagos' },
      { type: 'bullets', items: ['Fecha desde y hasta.', 'Importe mínimo y máximo.', 'Proveedor y estado.', 'Sucursal y terminal o caja.', 'Medio de pago y marca de tarjeta.', 'Referencia de venta.'] },
      { type: 'paragraph', text: 'Después de elegir los filtros, presioná Aplicar filtros. Para volver a ver todos los resultados, utilizá Limpiar filtros.' },
      { type: 'heading', text: 'Información de la lista' },
      { type: 'paragraph', text: 'Cada fila muestra fecha y hora, proveedor, estado, importe, medio de pago, marca, caja o terminal y referencia. Presioná una operación para abrir su detalle.' },
      { type: 'heading', text: 'Estados de los pagos' },
      { type: 'definitions', items: [{ term: 'Aprobado', description: 'El proveedor confirmó correctamente el pago.' }, { term: 'Rechazado', description: 'El pago no fue aprobado por el proveedor.' }, { term: 'Pendiente', description: 'El pago todavía no tiene una resolución definitiva.' }, { term: 'Devuelto', description: 'El importe fue reembolsado total o parcialmente.' }] },
      { type: 'heading', text: 'Exportar pagos' },
      { type: 'paragraph', text: 'Exportar descarga los resultados de acuerdo con el período y los filtros seleccionados. Revisá los filtros antes de generar el archivo.' },
    ],
  },
  {
    id: 'detalle', number: '05', title: 'Detalle de una venta',
    blocks: [
      { type: 'paragraph', text: 'Al seleccionar un pago se abre una ventana con toda la información disponible.' },
      { type: 'heading', text: 'Resumen' },
      { type: 'definitions', items: [{ term: 'Total venta', description: 'Importe registrado por el sistema de ventas.' }, { term: 'Total pagos', description: 'Suma de los pagos asociados a esa venta.' }, { term: 'Diferencia', description: 'Diferencia entre la venta y lo efectivamente pagado. Cuando es cero, los importes coinciden.' }] },
      { type: 'heading', text: 'Productos' },
      { type: 'paragraph', text: 'Cuando la venta está disponible, muestra código, descripción, cantidad, precio unitario, descuento, impuestos e importe total. Si Productos no aparece, la aplicación no pudo encontrar la venta relacionada.' },
      { type: 'heading', text: 'Pagos asociados' },
      { type: 'paragraph', text: 'Muestra todos los medios aplicados a la misma venta. Es útil cuando una compra se abonó combinando efectivo, tarjetas o proveedores electrónicos.' },
      { type: 'heading', text: 'Datos técnicos' },
      { type: 'paragraph', text: 'Contiene identificadores, referencia, proveedor, fecha, importe, medio de pago, marca, cuotas, autorización, caja, cajero y tabla de origen. Utilizalos cuando soporte los solicite.' },
      { type: 'heading', text: 'Venta no encontrada' },
      { type: 'paragraph', text: 'Significa que el pago existe, pero no se encontró la venta correspondiente. No implica necesariamente que el cobro sea incorrecto. Si es reciente, esperá unos minutos y reintentá. Si es antigua, informá a soporte la referencia y fecha del pago.' },
    ],
  },
  {
    id: 'liquidaciones', number: '06', title: 'Liquidaciones',
    blocks: [
      { type: 'paragraph', text: 'Liquidaciones permite revisar cómo fueron acreditados los pagos por cada proveedor. Podés filtrar por período, proveedor, estado, referencia, importe y fecha de acreditación.' },
      { type: 'heading', text: 'Información importante' },
      { type: 'bullets', items: ['Importe bruto.', 'Comisión descontada.', 'Retenciones.', 'Importe neto.', 'Fecha estimada o efectiva de acreditación.', 'Estado y pago relacionado.'] },
      { type: 'heading', text: 'Diferencia entre pago y liquidación' },
      { type: 'paragraph', text: 'El pago representa lo abonado por el cliente. La liquidación representa lo acreditado al supermercado después de comisiones, retenciones o ajustes.' },
    ],
  },
  {
    id: 'conciliacion', number: '07', title: 'Conciliación',
    blocks: [
      { type: 'paragraph', text: 'La conciliación compara los pagos electrónicos con las ventas registradas para detectar operaciones que necesitan revisión.' },
      { type: 'heading', text: 'Estados posibles' },
      { type: 'definitions', items: [{ term: 'Conciliado', description: 'El pago y la venta fueron encontrados y sus importes coinciden.' }, { term: 'Diferencia de importe', description: 'La venta y el pago existen, pero sus importes no coinciden.' }, { term: 'Venta no encontrada', description: 'Existe el pago, pero no se encontró la venta asociada.' }, { term: 'Pago no encontrado', description: 'Existe la venta, pero falta el pago electrónico esperado.' }, { term: 'Pendiente de revisión', description: 'Todavía no hay información suficiente.' }] },
      { type: 'heading', text: 'Cómo revisar una diferencia' },
      { type: 'steps', items: ['Abrí la operación.', 'Compará el total de la venta con el total de pagos.', 'Revisá si hubo pagos combinados.', 'Verificá si existe una devolución.', 'Revisá fecha, caja y referencia.', 'Si continúa, anotá la referencia y comunicate con soporte.'] },
      { type: 'paragraph', text: 'La conciliación ayuda al control, pero no reemplaza la revisión contable ni los informes oficiales de cada proveedor.' },
    ],
  },
  {
    id: 'calidad', number: '08', title: 'Calidad de datos',
    blocks: [
      { type: 'paragraph', text: 'Detecta información faltante, duplicada o inconsistente antes de realizar controles o conciliaciones.' },
      { type: 'heading', text: 'Tipos de advertencia' },
      { type: 'definitions', items: [{ term: 'Referencia faltante', description: 'El pago no contiene una referencia para relacionarlo con una venta.' }, { term: 'Venta no encontrada', description: 'Existe el pago, pero no se encontró el comprobante.' }, { term: 'Posible duplicado', description: 'Dos o más registros podrían representar la misma operación.' }, { term: 'Datos incompletos', description: 'Faltan campos importantes.' }, { term: 'Importe fuera de lo habitual', description: 'La operación puede necesitar revisión por su valor.' }] },
      { type: 'heading', text: 'Qué hacer ante una advertencia' },
      { type: 'steps', items: ['Abrí el detalle.', 'Revisá proveedor, fecha, importe y referencia.', 'Compará con el sistema de ventas.', 'No asumas automáticamente que existe un error de cobro.', 'Si no podés determinar la causa, informá a soporte.'] },
      { type: 'paragraph', text: 'Esta pantalla informa posibles problemas; no modifica ni elimina registros.' },
    ],
  },
  {
    id: 'configuracion', number: '09', title: 'Configuración',
    blocks: [
      { type: 'paragraph', text: 'Configuración permite consultar el estado de la aplicación y ajustar su apariencia.' },
      { type: 'heading', text: 'Apariencia' },
      { type: 'definitions', items: [{ term: 'Sistema', description: 'Usa la configuración del dispositivo.' }, { term: 'Claro', description: 'Utiliza fondo claro.' }, { term: 'Oscuro', description: 'Utiliza fondo oscuro.' }] },
      { type: 'paragraph', text: 'La preferencia queda guardada en el dispositivo.' },
      { type: 'heading', text: 'Diagnóstico' },
      { type: 'paragraph', text: 'Muestra versión, ambiente, servicio configurado, estado de la API y base, última comprobación y plataformas compatibles.' },
      { type: 'heading', text: 'Cuenta' },
      { type: 'paragraph', text: 'Muestra el usuario activo. Cerrá sesión al terminar, al usar un dispositivo compartido, para cambiar de cuenta o cuando la aplicación indique que la sesión venció.' },
    ],
  },
  {
    id: 'actualizar', number: '10', title: 'Actualizar la información',
    blocks: [
      { type: 'paragraph', text: 'La aplicación consulta datos al abrir una pantalla o al reintentar una operación. Si esperás un pago reciente y todavía no aparece:' },
      { type: 'steps', items: ['Verificá la conexión a Internet.', 'Actualizá la página.', 'Volvé a seleccionar el período.', 'Revisá que los filtros estén limpios.', 'Esperá unos minutos y volvé a intentar.'] },
      { type: 'paragraph', text: 'Cerrar y abrir nuevamente la aplicación también fuerza una consulta actualizada.' },
    ],
  },
  {
    id: 'problemas', number: '11', title: 'Problemas frecuentes',
    blocks: [
      { type: 'heading', text: 'No aparecen pagos' },
      { type: 'paragraph', text: 'Comprobá el período, los filtros, el proveedor y que la API y la base figuren conectadas.' },
      { type: 'heading', text: 'Todos los valores aparecen en cero' },
      { type: 'paragraph', text: 'Puede no haber operaciones, existir filtros demasiado específicos o haber un inconveniente con la fuente. Probá Últimos 7 días o Este mes y limpiá los filtros.' },
      { type: 'heading', text: 'El pago aparece, pero no muestra productos' },
      { type: 'paragraph', text: 'Anotá la referencia de venta, identificador del pago, fecha, proveedor e importe y enviá esos datos a soporte.' },
      { type: 'heading', text: 'La sesión venció' },
      { type: 'paragraph', text: 'Volvé a la pantalla de acceso e iniciá sesión nuevamente.' },
      { type: 'heading', text: 'Aparece Demasiados intentos' },
      { type: 'paragraph', text: 'Esperá a que finalice el contador antes de volver a intentar y revisá cuidadosamente las credenciales.' },
      { type: 'heading', text: 'La aplicación parece desactualizada' },
      { type: 'paragraph', text: 'Cerrala completamente y volvé a abrirla. En el navegador también podés actualizar la página.' },
    ],
  },
  {
    id: 'soporte', number: '12', title: 'Qué información enviar a soporte',
    blocks: [
      { type: 'paragraph', text: 'Para resolver un problema más rápidamente, enviá:' },
      { type: 'bullets', items: ['Una captura de pantalla.', 'Fecha y hora de la operación.', 'Proveedor e importe.', 'Referencia de la venta.', 'Identificador del pago.', 'Sección donde ocurrió.', 'Mensaje de error visible.'] },
      { type: 'paragraph', text: 'No envíes tu contraseña.' },
    ],
  },
  {
    id: 'practicas', number: '13', title: 'Buenas prácticas',
    blocks: [
      { type: 'bullets', items: ['Revisá diariamente el resumen de pagos.', 'Controlá las operaciones con problemas.', 'Compará pagos con liquidaciones.', 'Prestá atención a devoluciones y diferencias.', 'Usá períodos cortos para búsquedas rápidas.', 'Limpiá filtros antes de una nueva consulta.', 'Cerrá sesión en dispositivos compartidos.', 'No compartas capturas con datos sensibles.', 'Usá los datos técnicos solo cuando soporte los solicite.'] },
    ],
  },
  {
    id: 'glosario', number: '14', title: 'Glosario simple',
    blocks: [
      { type: 'definitions', items: [{ term: 'Pago', description: 'Cobro electrónico realizado por un cliente.' }, { term: 'Venta', description: 'Comprobante del sistema comercial con los productos adquiridos.' }, { term: 'Referencia', description: 'Código que relaciona el pago con la venta.' }, { term: 'Proveedor', description: 'Empresa que procesa el pago, como Clover o Mercado Pago.' }, { term: 'Liquidación', description: 'Dinero depositado al supermercado después de descuentos y comisiones.' }, { term: 'Conciliación', description: 'Comparación entre una venta y sus pagos.' }, { term: 'Comisión', description: 'Importe descontado por procesar una operación.' }, { term: 'Importe neto', description: 'Dinero final que recibe el supermercado.' }, { term: 'Devolución', description: 'Reintegro total o parcial de un pago.' }, { term: 'Terminal', description: 'Dispositivo o caja donde se realizó la operación.' }] },
    ],
  },
  {
    id: 'cierre', number: '15', title: 'Cierre de la guía',
    blocks: [
      { type: 'paragraph', text: 'Reportes de Tarjetas fue diseñada para facilitar el control diario de cobros electrónicos. Ante cualquier duda:' },
      { type: 'steps', items: ['Revisá el período y los filtros.', 'Abrí el detalle de la operación.', 'Consultá Calidad de datos.', 'Anotá la referencia y el identificador del pago.', 'Comunicate con el soporte de INFORHARD S.R.L.'] },
      { type: 'paragraph', text: 'Nunca compartas tu contraseña ni permitas que personas no autorizadas accedan a la aplicación.' },
    ],
  },
];
