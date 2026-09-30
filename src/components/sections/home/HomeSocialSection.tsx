'use client';

import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { SocialIcon } from '@/components/ui/logos/SocialLogos';
import { InstagramFollowerBadge } from '@/components/ui/InstagramFollowerBadge';
import { useSocialLinks } from '@/lib/hooks/useNavigation';
import {
  StudioParallaxScene,
  StudioParallaxLayer,
  StudioParallaxCard,
} from '@/components/ui/parallax';

import { getFeaturedInstagramReels } from '@/lib/data/site-service';
import { getLatestInstagramReelsAction } from '@/app/(admin)/admin/actions/instagram-featured';
import type { InstagramReel } from '@/data/instagram-reels';
import { HomeReelCard, HomePostFallbackCard } from './HomeSocialCards';

export interface HomeSocialData {
  badge?: string;
  title?: string;
  subtitle?: string;
  handle?: string;
  join_text?: string;
  see_instagram?: string;
  avatar_url?: string;
  /** Publications Instagram — copie éditoriale alignée par index. */
  posts?: Array<{ title?: string; tag?: string; desc?: string; image?: string; link?: string }>;
}

interface HomeSocialSectionProps {
  socialData?: HomeSocialData;
}

export const HomeSocialSection: React.FC<HomeSocialSectionProps> = ({ socialData }) => {
  const t = useTranslations('home.social');
  const [liveReels, setLiveReels] = React.useState<InstagramReel[]>([]);

  React.useEffect(() => {
    getLatestInstagramReelsAction(6, true).then((res) => {
      if (res.success && res.reels.length > 0) {
        setLiveReels(res.reels.slice(0, 6));
      } else {
        getFeaturedInstagramReels().then((reels) => setLiveReels(reels.slice(0, 6)));
      }
    });
  }, []);

  /**
   * Réseaux pilotés par `site_social_links` — aucune URL en dur ici.
   */
  const socialLinks = useSocialLinks();
  const activeSocials = socialLinks.filter((social) => social.is_active);
  const instagramUrl =
    socialLinks.find((social) => social.platform === 'instagram')?.url ??
    'https://www.instagram.com/campus.univers.cascades/';
  const postDefaults =
    (t.raw('posts') as { title: string; tag: string; desc: string }[]) ?? [];

  const badge = socialData?.badge || t('badge');
  const title = socialData?.title || t('title');
  const subtitle = socialData?.subtitle || t('subtitle');
  const handle = socialData?.handle || t('handle');
  const joinText = socialData?.join_text || t('join');
  const seeInstagram = socialData?.see_instagram || t('seeInstagram');
  const avatarUrl =
    socialData?.avatar_url ||
    'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/campus.univers.cascades.webp';

  /**
   * Médias locaux (lien, image, amplitude de parallaxe) + copie de repli
   * traduite : `sections_data.social.posts.<index>` prime, la structure reste
   * locale pour qu'aucune liste ne puisse être vidée ou inventée.
   */
  const postMedia = [
    {
      link: 'https://www.instagram.com/reel/DJW5wq0MIzt/',
      image:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/001.webp',
      speed: -0.05,
    },
    {
      link: 'https://www.instagram.com/reel/DKAFa9dsRVa/',
      image:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/002.webp',
      speed: 0.05,
    },
    {
      link: 'https://www.instagram.com/reel/DJmOS2tMQpk/',
      image:
        'https://xkbkcsypftvspmkfnrfm.supabase.co/storage/v1/object/public/cuc-vitrine-assets/media/cuc-visual/defenestration.webp',
      speed: -0.04,
    },
  ];

  const instagramPosts = postMedia.map((media, idx) => ({
    ...media,
    title: socialData?.posts?.[idx]?.title || postDefaults[idx]?.title || '',
    tag: socialData?.posts?.[idx]?.tag || postDefaults[idx]?.tag || '',
    desc: socialData?.posts?.[idx]?.desc || postDefaults[idx]?.desc || '',
    link: socialData?.posts?.[idx]?.link || media.link,
    image: socialData?.posts?.[idx]?.image || media.image,
  }));

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
              <div
                data-cuc-field="sections_data.social.avatar_url"
                data-cuc-kind="image"
                className="relative w-16 h-16 rounded-full border-2 border-[#FFE500] overflow-hidden bg-black shrink-0 shadow-[0_0_20px_rgba(255,229,0,0.35)]"
              >
                <Image
                  src={avatarUrl}
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
                <span
                  data-cuc-field="sections_data.social.handle"
                  className="text-xs font-mono-tech text-zinc-500"
                >
                  {handle}
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
              <div className="mt-3.5">
                <InstagramFollowerBadge variant="pill" />
              </div>
            </div>
          </div>

          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <TacticalButton
              variant="secondary"
              size="md"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              <span data-cuc-field="sections_data.social.join_text">{joinText}</span>
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

        {/* Grille des Reels Instagram en direct (Meta Graph API) */}
        {liveReels.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {liveReels.map((reel) => (
              <HomeReelCard key={reel.id} reel={reel} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instagramPosts.map((post, idx) => (
              <HomePostFallbackCard
                key={idx}
                post={post}
                idx={idx}
                seeInstagram={seeInstagram}
              />
            ))}
          </div>
        )}
      </div>
    </StudioParallaxScene>
  );
};
