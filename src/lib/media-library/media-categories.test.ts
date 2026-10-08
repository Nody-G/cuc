import { describe, expect, it } from 'vitest';
import {
    MEDIA_CATEGORIES,
    groupMediaByCategory,
    inferMediaCategory,
    type MediaCategory,
} from './media-categories';
import type { MediaObject } from '@/app/(admin)/admin/media-shared';

function makeMedia(path: string, kind: 'image' | 'video' | 'document' | 'other' = 'image'): MediaObject {
    const name = path.split('/').pop() || path;
    return {
        path,
        name,
        kind,
        folder: path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '',
        url: `https://mock.supabase.co/${path}`,
        size: 1024,
        mimetype: kind === 'image' ? 'image/webp' : 'application/octet-stream',
        createdAt: '2026-10-08T00:00:00Z',
    };
}

describe('inferMediaCategory', () => {
    it('respects manual overrides as priority #1', () => {
        const file = makeMedia('media/cuc-visual/random.webp');
        const overrides: Record<string, MediaCategory> = {
            'media/cuc-visual/random.webp': 'campus',
        };
        expect(inferMediaCategory(file, null, overrides)).toBe('campus');
    });

    it('identifies videos and reels', () => {
        expect(inferMediaCategory(makeMedia('media/reels/clip1.mp4', 'video'))).toBe('reels');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/instagram-reel.mp4'))).toBe('reels');
    });

    it('identifies documents and PDFs', () => {
        expect(inferMediaCategory(makeMedia('media/document/plaquette.pdf', 'document'))).toBe('documents');
    });

    it('identifies film posters and partners by bucket folder', () => {
        expect(inferMediaCategory(makeMedia('media/film-poster/bac-nord.webp'))).toBe('films');
        expect(inferMediaCategory(makeMedia('media/partner-logo/cnc.webp'))).toBe('partenaires');
        expect(inferMediaCategory(makeMedia('media/events/spectacle-01.webp'))).toBe('events');
    });

    it('identifies campus facilities from semantic names', () => {
        expect(inferMediaCategory(makeMedia('media/cuc-visual/campus-01-cuc-tower.webp'))).toBe('campus');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/Zoe-Bell-Hall.webp'))).toBe('campus');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/City-Stade-CUC-2.0.webp'))).toBe('campus');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/studio-01.webp'))).toBe('campus');
    });

    it('identifies stages and formations', () => {
        expect(inferMediaCategory(makeMedia('media/cuc-visual/stages-banner-stages.webp'))).toBe('formations');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/Stage-Summer-Camp-2.webp'))).toBe('formations');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/ecole-de-cascade.webp'))).toBe('formations');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/cuc-5-0-462.webp'))).toBe('formations');
    });

    it('identifies stunts and tournages', () => {
        expect(inferMediaCategory(makeMedia('media/cuc-visual/tournage-cascade-action-01.webp'))).toBe('tournage');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/defenestration.webp'))).toBe('tournage');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/cascadeur-saut-niels.webp'))).toBe('tournage');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/CUC-PROD.webp'))).toBe('tournage');
    });

    it('identifies team members and coach portraits', () => {
        expect(inferMediaCategory(makeMedia('media/cuc-visual/equipe-stunt-photo-01.webp'))).toBe('equipe');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/1-lucas.webp'))).toBe('equipe');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/12-alex.webp'))).toBe('equipe');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/coach-trombinoscope.webp'))).toBe('equipe');
    });

    it('identifies covers and home elements', () => {
        expect(inferMediaCategory(makeMedia('media/cuc-visual/home-couv-1.webp'))).toBe('accueil');
        expect(inferMediaCategory(makeMedia('media/cuc-visual/slider-5-scaled.webp'))).toBe('accueil');
    });

    it('falls back to "autres" for generic assets', () => {
        expect(inferMediaCategory(makeMedia('media/cuc-visual/trait-separation.webp'))).toBe('autres');
    });
});

describe('groupMediaByCategory', () => {
    it('creates all defined categories in output', () => {
        const files: MediaObject[] = [
            makeMedia('media/cuc-visual/home-couv-1.webp'),
            makeMedia('media/cuc-visual/campus-01-cuc-tower.webp'),
        ];
        const groups = groupMediaByCategory(files, (f) => inferMediaCategory(f));

        for (const cat of MEDIA_CATEGORIES) {
            expect(groups[cat.id]).toBeDefined();
        }
        expect(groups.accueil).toHaveLength(1);
        expect(groups.campus).toHaveLength(1);
        expect(groups.tournage).toHaveLength(0);
    });
});
