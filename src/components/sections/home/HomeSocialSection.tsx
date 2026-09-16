'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  InstagramLogo,
  YouTubeLogo,
  TikTokLogo,
  FacebookLogo,
  WhatsAppLogo,
} from '@/components/ui/BrandLogos';

export const HomeSocialSection: React.FC = () => {
  const instagramPosts = [
    {
      title: 'COKA CHICAS au cinéma',
      tag: 'SORTIE EN SALLES',
      desc: 'Cascades coordonnées et doublées par la CUC Stunt Team pour le long-métrage de Roxine Helberg avec Fadily Camara, Zoé Marchal, Eva Huault.',
      link: 'https://www.instagram.com/reel/DJW5wq0MIzt/',
      image:
        'https://www.campus-universcascades.com/wp-content/uploads/2022/12/001.jpg',
    },
    {
      title: 'Training Combat & Martial Arts',
      tag: 'PLATEAU TECHNIQUE',
      desc: "Coordination chirurgicale des frappes et esquives sur tatamis d'impact avec l'équipe de chorégraphes du campus.",
      link: 'https://www.instagram.com/reel/DKAFa9dsRVa/',
      image:
        'https://www.campus-universcascades.com/wp-content/uploads/2022/12/002.jpg',
    },
    {
      title: 'Risk Zone & Défenestration',
      tag: 'CHUTES DE HAUTEUR',
      desc: 'Exercices de chutes de hauteur et simulation de défenestration sur le domaine du Cateau-Cambrésis.',
      link: 'https://www.instagram.com/reel/DJmOS2tMQpk/',
      image:
        'https://www.campus-universcascades.com/wp-content/uploads/2022/12/défenestration.jpg',
    },
  ];

  return (
    <section className="py-20 bg-[#060608] border-b border-zinc-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
            <div className="flex items-center gap-5">
              <div className="relative w-16 h-16 rounded-full border-2 border-[#FFE500] overflow-hidden bg-black shrink-0 shadow-[0_0_15px_rgba(255,229,0,0.3)]">
                <Image
                  src="https://www.campus-universcascades.com/wp-content/uploads/sb-instagram-feed-images/campus.univers.cascades.webp"
                  alt="Campus Univers Cascades Instagram"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono-tech text-[#FFE500] uppercase font-bold tracking-wider">
                    RÉSEAUX SOCIAUX &amp; ACTUALITÉS
                  </span>
                  <span className="text-xs font-mono-tech text-zinc-500">
                    • @CAMPUS.UNIVERS.CASCADES
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display uppercase tracking-tight text-white">
                  COMMUNAUTÉ &amp; RÉSEAUX SOCIAUX
                </h2>
                <p className="text-sm font-tech text-zinc-400 mt-1">
                  🇲🇫 <strong className="text-white">French Stunt Team</strong> •
                  Stuntmen | Fighters | Performers • 🔥 Break the limits • 🌍
                  Biggest Stunt School in the World
                </p>
              </div>
            </div>

            <a
              href="https://www.instagram.com/campus.univers.cascades/"
              target="_blank"
              rel="noreferrer"
            >
              <TacticalButton
                variant="secondary"
                size="md"
                icon={<ExternalLink className="w-4 h-4" />}
              >
                Rejoindre le Compte Officiel
              </TacticalButton>
            </a>
          </div>

          {/* Social Links Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-10">
            <a
              href="https://www.instagram.com/campus.univers.cascades/"
              target="_blank"
              rel="noreferrer"
              className="bg-[#0e0e14] border border-zinc-800 hover:border-[#E1306C] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(225,48,108,0.2)]"
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
              rel="noreferrer"
              className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FF0000] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(255,0,0,0.2)]"
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
                  Chaîne Officielle CUC
                </span>
              </div>
            </a>

            <a
              href="https://www.tiktok.com/@campusuniverscascades"
              target="_blank"
              rel="noreferrer"
              className="bg-[#0e0e14] border border-zinc-800 hover:border-[#25F4EE] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(37,244,238,0.2)]"
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
                  Cascades &amp; Backstage
                </span>
              </div>
            </a>

            <a
              href="https://www.facebook.com/CampusUniversCascades/"
              target="_blank"
              rel="noreferrer"
              className="bg-[#0e0e14] border border-zinc-800 hover:border-[#1877F2] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(24,119,242,0.2)]"
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
                  Actualités &amp; Stages
                </span>
              </div>
            </a>

            <a
              href="https://wa.me/33672849492"
              target="_blank"
              rel="noreferrer"
              className="bg-[#0e0e14] border border-zinc-800 hover:border-[#25D366] p-3.5 flex items-center gap-3 transition-all duration-300 group hover:shadow-[0_0_20px_rgba(37,211,102,0.2)]"
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
                  Admissions Directes
                </span>
              </div>
            </a>
          </div>

          {/* Instagram Recent Feed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {instagramPosts.map((post, idx) => (
              <a
                key={idx}
                href={post.link}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0e0e14] border border-zinc-800 hover:border-[#FFE500]/60 p-5 group transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 w-full mb-4 overflow-hidden border border-zinc-800 bg-black">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300 brightness-85"
                    />
                    <div className="absolute top-3 left-3 bg-black/80 px-2 py-0.5 text-[10px] font-mono-tech text-[#FFE500] font-bold border border-white/20">
                      {post.tag}
                    </div>
                  </div>

                  <h3 className="text-xl font-display uppercase tracking-wide text-white group-hover:text-[#FFE500] transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs font-tech text-zinc-400 leading-relaxed mb-4">
                    {post.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono-tech text-zinc-500">
                  <span>Voir sur Instagram</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#FFE500] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
