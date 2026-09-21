'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  InstagramLogo,
  YouTubeLogo,
  TikTokLogo,
  FacebookLogo,
  WhatsAppLogo,
} from '@/components/ui/BrandLogos';
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
  const channels = (t.raw('channels') as Record<string, string>) ?? {};
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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

          <a
            href="https://www.instagram.com/campus.univers.cascades/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <TacticalButton
              variant="secondary"
              size="md"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              {t('join')}
            </TacticalButton>
          </a>
        </div>

        {/* Social Links Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
          <a
            href="https://www.instagram.com/campus.univers.cascades/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0e0e14]/90 backdrop-blur-xs border border-zinc-800 hover:border-[#E1306C] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(225,48,108,0.2)]"
          >
            <div className="p-2 bg-black/60 border border-zinc-800 group-hover:border-[#E1306C] transition-colors shrink-0">
              <InstagramLogo
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                variant="color"
              />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-mono-tech text-[#E1306C] font-bold block uppercase leading-tight">
                Instagram
              </span>
              <span className="text-[10px] font-tech text-zinc-400 truncate block">
                @campus.univers.cascades
              </span>
            </div>
          </a>

          <a
            href="https://www.youtube.com/@campusuniverscascades"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0e0e14]/90 backdrop-blur-xs border border-zinc-800 hover:border-[#FF0000] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(255,0,0,0.2)]"
          >
            <div className="p-2 bg-black/60 border border-zinc-800 group-hover:border-[#FF0000] transition-colors shrink-0">
              <YouTubeLogo
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                variant="color"
              />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-mono-tech text-[#FF0000] font-bold block uppercase leading-tight">
                YouTube
              </span>
              <span className="text-[10px] font-tech text-zinc-400 truncate block">
                {channels.youtube ?? ''}
              </span>
            </div>
          </a>

          <a
            href="https://www.tiktok.com/@campusuniverscascades"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0e0e14]/90 backdrop-blur-xs border border-zinc-800 hover:border-[#25F4EE] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(37,244,238,0.2)]"
          >
            <div className="p-2 bg-black/60 border border-zinc-800 group-hover:border-[#25F4EE] transition-colors shrink-0">
              <TikTokLogo
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                variant="color"
              />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-mono-tech text-[#25F4EE] font-bold block uppercase leading-tight">
                TikTok
              </span>
              <span className="text-[10px] font-tech text-zinc-400 truncate block">
                {channels.tiktok ?? ''}
              </span>
            </div>
          </a>

          <a
            href="https://www.facebook.com/campus.univers.cascades"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0e0e14]/90 backdrop-blur-xs border border-zinc-800 hover:border-[#1877F2] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(24,119,242,0.2)]"
          >
            <div className="p-2 bg-black/60 border border-zinc-800 group-hover:border-[#1877F2] transition-colors shrink-0">
              <FacebookLogo
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                variant="color"
              />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-mono-tech text-[#1877F2] font-bold block uppercase leading-tight">
                Facebook
              </span>
              <span className="text-[10px] font-tech text-zinc-400 truncate block">
                {channels.facebook ?? ''}
              </span>
            </div>
          </a>

          <a
            href="https://wa.me/33672849492"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0e0e14]/90 backdrop-blur-xs border border-zinc-800 hover:border-[#25D366] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(37,211,102,0.2)]"
          >
            <div className="p-2 bg-black/60 border border-zinc-800 group-hover:border-[#25D366] transition-colors shrink-0">
              <WhatsAppLogo
                className="w-5 h-5 group-hover:scale-110 transition-transform"
                variant="color"
              />
            </div>
            <div className="overflow-hidden">
              <span className="text-[11px] font-mono-tech text-[#25D366] font-bold block uppercase leading-tight">
                WhatsApp
              </span>
              <span className="text-[10px] font-tech text-zinc-400 truncate block">
                {channels.whatsapp ?? ''}
              </span>
            </div>
          </a>
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
