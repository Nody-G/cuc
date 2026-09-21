'use client';
import { Link } from '@/i18n/navigation';

import React, { useEffect, useState } from 'react';

import { getActiveAnnouncement, getSiteSettings, SiteAnnouncement } from '@/lib/data/site-service';
import { createClient } from '@/lib/supabase/client';
import { createSafeChannel, removeSafeChannel } from '@/lib/supabase/realtime';

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<SiteAnnouncement | null>(null);

  useEffect(() => {
    // 1. Chargement initial
    getActiveAnnouncement().then((data) => {
      if (data && data.is_active) {
        setAnnouncement(data);
      } else {
        // Vérifie si une alerte d'urgence globale est active dans SiteSettings
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
          }
        });
      }
    });

    // 2. Souscription Supabase Realtime en direct (canal à nom unique + garde)
    const supabase = createClient();
    const channel = createSafeChannel(supabase, 'realtime:site_announcements', (ch) =>
      ch.on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'site_announcements' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setAnnouncement(null);
          } else {
            const row = payload.new as SiteAnnouncement;
            if (row && row.is_active) {
              setAnnouncement(row);
            } else {
              setAnnouncement(null);
            }
          }
        }
      )
    );

    return () => {
      removeSafeChannel(supabase, channel);
    };
  }, []);

  if (!announcement || !announcement.is_active) {
    return null;
  }

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
          {announcement.badge && (
            <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/20 shrink-0">
              {announcement.badge}
            </span>
          )}
          <span className="truncate">
            <strong className="font-bold">{announcement.title}</strong>
            {announcement.message && <span className="opacity-90 font-medium"> — {announcement.message}</span>}
          </span>
        </div>

        {announcement.link_url && (
          <Link
            href={announcement.link_url}
            className="shrink-0 underline font-bold hover:opacity-80 text-xs transition-opacity ml-2"
          >
            {announcement.link_text || 'En savoir plus'} →
          </Link>
        )}
      </div>
    </aside>
  );
};
