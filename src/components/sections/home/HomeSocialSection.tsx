'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { SocialIcon } from '@/components/ui/logos/SocialLogos';
import { useSocialLinks } from '@/lib/hooks/useNavigation';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';

export interface HomeSocialData {
  badge?: string;
  title?: string;
  subtitle?: string;
}

interface HomeSocialSectionProps {
  socialData?: HomeSocialData;
}

export const HomeSocialSection: React.FC<HomeSocialSectionProps> = ({ socialData }) => {
  const t = useTranslations('home.social');
  /**
   * Réseaux pilotés par `site_social_links` — aucune URL en dur ici. Les logos
   * sont seuls (aucun libellé visible qui surcharge) : le nom de la plateforme
   * et le handle restent accessibles via `aria-label`/`title`.
   */
  const socialLinks = useSocialLinks();
  const activeSocials = socialLinks.filter((social) => social.is_active);
  const instagramUrl =
    socialLinks.find((social) => social.platform === 'instagram')?.url ??
    'https://www.instagram.com/campus.univers.cascades/';
  const postCopy =
    (t.raw('posts') as { title: string; tag: string; desc: string }[]) ?? [];

  const badge = socialData?.badge || t('badge');
  const title = socialData?.title || t('title');
  const subtitle = socialData?.subtitle || t('subtitle');

  /**
   * Seuls le lien, l'image et l'amplitude de parallaxe restent locaux : la copie
   * est dans `home.social.posts` (alignée par index).
   */
  const instagramPosts = [
    {
      link: 'https://www.instagram.com/reel/DJW5wq0MIzt/',
      image:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/001.jpg',
      speed: -0.05,
    },
    {
      link: 'https://www.instagram.com/reel/DKAFa9dsRVa/',
      image:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/002.jpg',
      speed: 0.05,
    },
    {
      link: 'https://www.instagram.com/reel/DJmOS2tMQpk/',
      image:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/defenestration.jpg',
      speed: -0.04,
    },
  ];

  return (
    <StudioParallaxScene className="py-24 bg-[#060608]/90 border-b border-zinc-800/80 relative overflow-hidden">
      {/* Ambient Depth Halo */}
      <StudioParallaxLayer
        speed={-0.22}
        className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-[#FFE500]/[0.025] blur-3xl pointer-events-none"
      />

      <div className="page-shell relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="flex items-center gap-5">
            <StudioParallaxCard maxTilt={8}>
              <div className="relative w-16 h-16 rounded-full border-2 border-[#FFE500] overflow-hidden bg-black shrink-0 shadow-[0_0_20px_rgba(255,229,0,0.35)]">
                <Image
                  src="https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus.univers.cascades.webp"
                  alt={t('avatarAlt')}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
            </StudioParallaxCard>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  data-cuc-field="sections_data.social.badge"
                  className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider"
                >
                  {badge}
                </span>
                <span className="text-xs font-mono-tech text-zinc-500">
                  {t('handle')}
                </span>
              </div>
              <h2
                data-cuc-field="sections_data.social.title"
                className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white"
              >
                {title}
              </h2>
              <p
                data-cuc-field="sections_data.social.subtitle"
                className="text-sm font-tech text-zinc-400 mt-1"
              >
                {subtitle}
              </p>
            </div>
          </div>

          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <TacticalButton
              variant="secondary"
              size="md"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              {t('join')}
            </TacticalButton>
          </a>
        </div>

        {/* Rangée de logos seuls — l'envie de cliquer vient de l'icône, pas du texte */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-10">
          {activeSocials.map((social) => {
            const label = social.handle ? `${social.label} ${social.handle}` : social.label;
            return (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                title={label}
                style={{ ['--brand' as string]: social.brand_color || '#FFE500' } as React.CSSProperties}
                className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center bg-[#0e0e14]/90 border border-zinc-800 hover:border-[color:var(--brand)] hover:bg-white/[0.04] transition-colors duration-200 group/soc"
              >
                <SocialIcon
                  platform={social.platform}
                  variant="color"
                  className="w-5 h-5 sm:w-[22px] sm:h-[22px] group-hover/soc:scale-110 transition-transform duration-200"
                />
              </a>
            );
          })}
        </div>

        {/* Instagram 3D Spatialized Triptyque */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {instagramPosts.map((post, idx) => (
            <StudioParallaxLayer key={idx} speed={post.speed}>
              <StudioParallaxCard maxTilt={5} className="h-full">
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#0e0e14]/95 backdrop-blur-xs border border-zinc-800 hover:border-[#FFE500]/60 p-5 group transition-all flex flex-col justify-between h-full shadow-lg hover:shadow-[0_10px_35px_rgba(255,229,0,0.1)] block"
                >
                  <div>
                    <div className="relative h-56 w-full mb-4 overflow-hidden border border-zinc-800 bg-black">
                      <Image
                        src={post.image}
                        alt={postCopy[idx]?.title ?? ''}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-85"
                      />
                      <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 text-[10px] font-mono-tech text-[#FFE500] font-bold border border-white/20">
                        {postCopy[idx]?.tag ?? ''}
                      </div>
                    </div>

                    <h3 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-2">
                      {postCopy[idx]?.title ?? ''}
                    </h3>
                    <p className="text-xs font-tech text-zinc-400 leading-relaxed mb-4">
                      {postCopy[idx]?.desc ?? ''}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-tech text-zinc-500">
                    <span>{t('seeInstagram')}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#FFE500] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              </StudioParallaxCard>
            </StudioParallaxLayer>
          ))}
        </div>
      </div>
    </StudioParallaxScene>
  );
};
