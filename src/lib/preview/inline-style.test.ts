import { buildInlineEditorTypography, fieldChipLabel } from './inline-style';

describe('buildInlineEditorTypography', () => {
    it('reprend la typographie de l’élément édité', () => {
        const style = buildInlineEditorTypography({
            fontFamily: 'Bebas Neue',
            fontSize: '56px',
            fontWeight: '700',
            fontStyle: 'normal',
            lineHeight: '1.05',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            textAlign: 'center',
            color: 'rgb(255, 229, 0)',
            padding: '0px',
        });

        expect(style.fontFamily).toBe('Bebas Neue');
        expect(style.fontSize).toBe('56px');
        expect(style.fontWeight).toBe('700');
        expect(style.lineHeight).toBe('1.05');
        expect(style.textTransform).toBe('uppercase');
        expect(style.textAlign).toBe('center');
        expect(style.color).toBe('rgb(255, 229, 0)');
    });

    it('ne pose ni bordure ni marge : l’encadré appartient à la couche', () => {
        const style = buildInlineEditorTypography({ fontSize: '16px' });
        expect(style.border).toBe(0);
        expect(style.margin).toBe(0);
        expect(style.outline).toBe('none');
        expect(style.background).toContain('rgba(255, 229, 0');
    });

    it('reste lisible quand le style calculé est vide', () => {
        const style = buildInlineEditorTypography({});
        expect(style.fontSize).toBe('14px');
        expect(style.letterSpacing).toBe('normal');
        expect(style.textTransform).toBe('none');
        expect(style.padding).toBe('2px 4px');
        expect(style.boxSizing).toBe('border-box');
    });

    it('ignore les valeurs blanches plutôt que de les propager', () => {
        const style = buildInlineEditorTypography({ fontSize: '   ', color: '' });
        expect(style.fontSize).toBe('14px');
        expect(style.color).toBe('inherit');
    });

    it('occupe exactement la boîte de l’élément', () => {
        const style = buildInlineEditorTypography({});
        expect(style.width).toBe('100%');
        expect(style.height).toBe('100%');
        expect(style.resize).toBe('none');
    });
});

describe('fieldChipLabel', () => {
    it('réduit un chemin aux deux derniers segments', () => {
        expect(fieldChipLabel('sections_data.about.pillars.0.title')).toBe('0.title');
        expect(fieldChipLabel('hero.badge')).toBe('hero.badge');
    });

    it('tolère un chemin d’un seul segment ou vide', () => {
        expect(fieldChipLabel('title')).toBe('title');
        expect(fieldChipLabel('')).toBe('');
    });
});
