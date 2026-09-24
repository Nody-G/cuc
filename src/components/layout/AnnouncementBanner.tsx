'use client';
import { Link } from '@/i18n/navigation';

import React, { useEffect, useState } from 'react';

import { getActiveAnnouncement, getSiteSettings, SiteAnnouncement } from '@/lib/data/site-service';
import { useRealtimeRefresh } from '@/lib/hooks/useRealtimeRefresh';
import { entityRef } from '@/lib/preview/entity-ref';
import { cucEntity } from '@/lib/preview/cuc-entity';
import { resolveEntityOverride, usePreviewEntities } from '@/lib/preview/use-preview-entity';

/**
 * Sondage de secours du bandeau, **onglet visible seulement**.
 *
 * Décision assumée : c'est le seul contenu de la vitrine dont la fraîcheur
 * justifie un aller-retour périodique (fermeture exceptionnelle, alerte météo).
 * Cinq minutes est un compromis explicite — un visiteur qui revient sur l'onglet
 * ou navigue voit l'alerte immédiatement, et un onglet laissé ouvert la reçoit
 * au plus tard dans les cinq minutes, pour 12 lectures par heure et par onglet
 * visible (au lieu d'un WebSocket tenu en permanence). Tout le reste de la page
 * ne sonde rien du tout : la fraîcheur vient de la navigation.
 */
const ANNOUNCEMENT_POLL_MS = 5 * 60 * 1000;

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<SiteAnnouncement | null>(null);
  /** Surcharges locales d'entités (édition en place dans l'aperçu). */
  const entityOverrides = usePreviewEntities();

  /** Rechargement annonce + alerte d'urgence : état initial et Realtime. */
  const loadAnnouncement = React.useCallback(() => {
    getActiveAnnouncement().then((data) => {
      if (data && data.is_active) {
        setAnnouncement(data);
        return;
      }
      // Repli : alerte d'urgence globale portée par `site_settings`.
      getSiteSettings().then((st) => {
        if (st.emergency_active && st.emergency_message) {
          setAnnouncement({
            id: 'emergency-alert',
            title: st.emergency_badge || 'ALERTE CUC',
            message: st.emergency_message,
            badge: st.emergency_badge || 'URGENCE',
            link_url: st.emergency_link_url || '',
            link_text: st.emergency_link_text || 'En savoir plus',
            style: st.emergency_style || 'alert',
            is_active: true,
          });
        } else {
          setAnnouncement(null);
        }
      });
    });
  }, []);

  useEffect(() => {
    loadAnnouncement();
  }, [loadAnnouncement]);

  // Cockpit : canal partagé (instantané). Vitrine : reprise d'onglet + sondage
  // de secours sur le seul contenu dont l'urgence justifie la fraîcheur.
  useRealtimeRefresh(['site_announcements', 'site_settings'], loadAnnouncement, {
    pollMs: ANNOUNCEMENT_POLL_MS,
  });

  if (!announcement || !announcement.is_active) {
    return null;
  }

  /**
   * Édition en place : l'alerte d'urgence (portée par les réglages) n'est pas
   * une entité — seules les annonces réelles s'ancrent sur `site_announcements`.
   */
  type BannerField = 'title' | 'message' | 'badge' | 'link_text';
  const entityEditable = announcement.id !== 'emergency-alert';
  const refFor = (field: BannerField) =>
    entityEditable ? entityRef('site_announcements', announcement.id, field) : null;
  const attrFor = (field: BannerField) =>
    entityEditable ? cucEntity('site_announcements', announcement.id, field) : {};
  const valueOf = (field: BannerField, base: string) =>
    resolveEntityOverride(entityOverrides, refFor(field)) ?? base;

  const badgeText = announcement.badge ? valueOf('badge', announcement.badge) : '';
  const titleText = valueOf('title', announcement.title);
  const messageText = announcement.message ? valueOf('message', announcement.message) : '';
  const linkText = valueOf('link_text', announcement.link_text || 'En savoir plus');

  const styleClasses = {
    gold: 'bg-[#FFE500] text-black border-b border-black/10',
    info: 'bg-blue-600 text-white border-b border-blue-700',
    alert: 'bg-red-600 text-white border-b border-red-700',
    dark: 'bg-zinc-900 text-white border-b border-white/10',
  };

  return (
    <aside
      aria-label="Annonce importante"
      className={`relative z-50 w-full py-1.5 px-4 text-xs font-semibold tracking-wide transition-all ${styleClasses[announcement.style] || styleClasses.gold
        }`}
    >
      <div className="max-w-[1680px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {badgeText && (
            <span
              className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/20 shrink-0"
              {...attrFor('badge')}
            >
              {badgeText}
            </span>
          )}
          <span className="truncate">
            <strong className="font-bold" {...attrFor('title')}>
              {titleText}
            </strong>
            {messageText && (
              <span className="opacity-90 font-medium">
                {' — '}
                <span {...attrFor('message')}>{messageText}</span>
              </span>
            )}
          </span>
        </div>

        {announcement.link_url && (
          <Link
            href={announcement.link_url}
            className="shrink-0 underline font-bold hover:opacity-80 text-xs transition-opacity ml-2"
          >
            <span {...attrFor('link_text')}>{linkText}</span> →
          </Link>
        )}
      </div>
    </aside>
  );
};
