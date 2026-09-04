import { helpSections } from '@/features/help/help-content';

describe('help content', () => {
  it('keeps unique anchors and the complete user guide', () => {
    expect(helpSections).toHaveLength(16);
    expect(new Set(helpSections.map((section) => section.id)).size).toBe(helpSections.length);
    expect(helpSections[0]?.title).toBe('Resumen rápido');
    expect(helpSections.at(-1)?.title).toBe('Cierre de la guía');
  });
});
