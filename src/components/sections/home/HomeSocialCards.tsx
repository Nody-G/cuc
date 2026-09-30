'use client';

import React from 'react';
import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import { StudioParallaxLayer, StudioParallaxCard } from '@/components/ui/parallax';
import type { InstagramReel } from '@/data/instagram-reels';

export interface HomeReelCardProps {
  reel: InstagramReel;
}

export const HomeReelCard: React.FC<HomeReelCardProps> = ({ reel }) => (
  <a
    href={reel.url || `https://www.instagram.com/reel/${reel.shortcode}/`}
    target="_blank"
    rel="noopener noreferrer"
    className="group relative aspect-[9/16] rounded-xl overflow-hidden bg-[#0c0c10] border border-zinc-800/80 hover:border-[#FFE500]/70 cursor-pointer shadow-lg hover:shadow-[0_10px_35px_rgba(255,229,0,0.15)] transition-all duration-300 flex flex-col justify-end p-3"
  >
    {reel.coverImage ? (
      <Image
        src={reel.coverImage}
        alt={reel.title}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
        unoptimized={reel.coverImage.startsWith('http')}
        className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 group-hover:brightness-100"
      />
    ) : (
      <div className="absolute inset-0 bg-gradient-to-b from-[#121218] to-black" />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/20 group-hover:border-[#FFE500] group-hover:scale-110 flex items-center justify-center transition-all duration-300 text-white group-hover:text-[#FFE500]">
        <Play className="w-4 h-4 fill-current translate-x-0.5" />
      </div>
    </div>

    <div className="relative z-10">
      <h3 className="text-xs font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors line-clamp-2">
        {reel.title}
      </h3>
    </div>
  </a>
);

export interface HomePostFallbackCardProps {
  post: {
    link: string;
    image: string;
    speed: number;
    title: string;
    tag: string;
    desc: string;
  };
  idx: number;
  seeInstagram: string;
}

export const HomePostFallbackCard: React.FC<HomePostFallbackCardProps> = ({
  post,
  idx,
  seeInstagram,
}) => (
  <StudioParallaxLayer speed={post.speed}>
    <StudioParallaxCard maxTilt={5} className="h-full">
      <a
        href={post.link}
        data-cuc-field={`sections_data.social.posts.${idx}.link`}
        data-cuc-kind="link"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-[#0e0e14]/95 backdrop-blur-xs border border-zinc-800 hover:border-[#FFE500]/60 p-5 group transition-all flex flex-col justify-between h-full shadow-lg hover:shadow-[0_10px_35px_rgba(255,229,0,0.1)] block"
      >
        <div>
          <div
            data-cuc-field={`sections_data.social.posts.${idx}.image`}
            data-cuc-kind="image"
            className="relative h-56 w-full mb-4 overflow-hidden border border-zinc-800 bg-black"
          >
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-85"
            />
            <div
              data-cuc-field={`sections_data.social.posts.${idx}.tag`}
              className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 text-[10px] font-mono-tech text-[#FFE500] font-bold border border-white/20"
            >
              {post.tag}
            </div>
          </div>

          <h3
            data-cuc-field={`sections_data.social.posts.${idx}.title`}
            className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-2"
          >
            {post.title}
          </h3>
          <p
            data-cuc-field={`sections_data.social.posts.${idx}.desc`}
            className="text-xs font-tech text-zinc-400 leading-relaxed mb-4"
          >
            {post.desc}
          </p>
        </div>

        <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-tech text-zinc-500">
          <span data-cuc-field="sections_data.social.see_instagram">{seeInstagram}</span>
          <ExternalLink className="w-3.5 h-3.5 text-[#FFE500] group-hover:translate-x-0.5 transition-transform" />
        </div>
      </a>
    </StudioParallaxCard>
  </StudioParallaxLayer>
);
