'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Layers,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { TacticalButton } from '@/components/ui/TacticalButton';
import {
  InstagramLogo,
  YouTubeLogo,
  TikTokLogo,
  FacebookLogo,
  WhatsAppLogo,
} from '@/components/ui/BrandLogos';

interface NavMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NavMobileDrawer: React.FC<NavMobileDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="xl:hidden bg-[#0a0a0e] border-b border-[#FFE500]/40 p-5 space-y-3 shadow-2xl max-h-[85vh] overflow-y-auto overflow-hidden"
        >
          <div className="h-1 w-full hazard-stripes mb-2" />

          {/* Mobile Brand Header */}
          <div className="flex items-center gap-3 pb-2.5 mb-1 border-b border-zinc-800">
            <div className="relative w-9 h-9 shrink-0">
              <Image
                src="/images/logos/cuc-logo-yellow.png"
                alt="Logo Campus Univers Cascades"
                width={36}
                height={36}
                className="object-contain drop-shadow-[0_0_8px_rgba(255,229,0,0.4)]"
              />
            </div>
            <div>
              <span className="font-display text-sm font-bold tracking-wider text-white block leading-tight">
                CAMPUS UNIVERS CASCADES
              </span>
              <span className="text-[9px] font-mono-tech text-[#FFE500] uppercase tracking-widest block">
                Stunt Academy &amp; Team
              </span>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <Link
              href="/"
              onClick={onClose}
              className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800"
            >
              Accueil
            </Link>

            {/* Formations Mobile Group */}
            <div className="py-2 border-b border-zinc-800">
              <span className="text-xs font-mono-tech uppercase text-[#FFE500] block mb-1">
                Formation & Stages :
              </span>
              <div className="pl-3 space-y-2 text-sm font-display uppercase tracking-wider">
                <Link
                  href="/formation-de-cascadeur"
                  onClick={onClose}
                  className="block text-zinc-300 hover:text-[#FFE500]"
                >
                  • Formation de cascadeur pro
                </Link>
                <Link
                  href="/stages-cascades-parkour-2"
                  onClick={onClose}
                  className="block text-zinc-300 hover:text-[#FFE500]"
                >
                  • Stages & séjours (Week-end, AFDAS)
                </Link>
              </div>
            </div>

            {/* Campus Mobile Group */}
            <div className="py-2 border-b border-zinc-800">
              <span className="text-xs font-mono-tech uppercase text-[#FFE500] block mb-1">
                Le Campus :
              </span>
              <div className="pl-3 space-y-2 text-sm font-display uppercase tracking-wider">
                <Link
                  href="/visite-guidee"
                  onClick={onClose}
                  className="block text-zinc-300 hover:text-[#FFE500]"
                >
                  • Visite guidée & 9 espaces
                </Link>
                <Link
                  href="/visite-virtuelle"
                  onClick={onClose}
                  className="block text-[#FFE500] font-bold flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>• Visite Virtuelle 360° (HD Media)</span>
                </Link>
              </div>
            </div>

            <Link
              href="/stunt-workshop-cuc"
              onClick={onClose}
              className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800"
            >
              Workshop
            </Link>

            <Link
              href="/equipe-cascadeurs-pro"
              onClick={onClose}
              className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800"
            >
              L’équipe
            </Link>

            <Link
              href="/videos-cascadeur"
              onClick={onClose}
              className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800"
            >
              Nos Vidéos
            </Link>

            <Link
              href="/cuc-team-cascadeur"
              onClick={onClose}
              className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800"
            >
              Tournages
            </Link>

            {/* Events Mobile Group */}
            <div className="py-2 border-b border-zinc-800">
              <span className="text-xs font-mono-tech uppercase text-[#FFE500] block mb-1">
                CUC Events :
              </span>
              <div className="pl-3 space-y-2 text-sm font-display uppercase tracking-wider">
                <Link
                  href="/cuc-events-agence"
                  onClick={onClose}
                  className="block text-zinc-300 hover:text-[#FFE500]"
                >
                  • Agence CUC Events
                </Link>
                <Link
                  href="/spectacles-cascadeurs-yamakasi"
                  onClick={onClose}
                  className="block text-zinc-300 hover:text-[#FFE500]"
                >
                  • Spectacles Cascadeurs & Yamakasi
                </Link>
                <Link
                  href="/animations-airbag-parkour"
                  onClick={onClose}
                  className="block text-zinc-300 hover:text-[#FFE500]"
                >
                  • Animations Xtrem Jump Airbag
                </Link>
                <Link
                  href="/team-building-cascades"
                  onClick={onClose}
                  className="block text-zinc-300 hover:text-[#FFE500]"
                >
                  • Team Building d'exception
                </Link>
              </div>
            </div>

            <Link
              href="/partenaires"
              onClick={onClose}
              className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800"
            >
              Partenaires
            </Link>

            <Link
              href="/visite-virtuelle#plan-3d-campus"
              onClick={onClose}
              className="text-base font-display uppercase tracking-widest text-[#FFE500] hover:text-white py-2 border-b border-zinc-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#FFE500]" />
                <span>Plan 3D du Domaine</span>
              </div>
              <span className="text-[9px] font-mono-tech px-1.5 py-0.2 bg-[#FFE500] text-black font-bold">
                3D
              </span>
            </Link>

            <a
              href="https://ma-boutique-club.com/campus-universcascades/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#FFE500]" />
                <span>Boutique</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-500" />
            </a>

            <Link
              href="/contact-cuc"
              onClick={onClose}
              className="text-base font-display uppercase tracking-widest text-zinc-200 hover:text-[#FFE500] py-2 border-b border-zinc-800"
            >
              Contact
            </Link>
          </div>

          <div className="pt-3 flex flex-col gap-2">
            <Link href="/contact-cuc" onClick={onClose}>
              <TacticalButton variant="primary" size="md" className="w-full">
                Contacter le Campus
              </TacticalButton>
            </Link>
            <div className="flex items-center justify-between text-xs font-mono-tech text-zinc-400 pt-2">
              <span>Le Cateau-Cambrésis (59)</span>
              <a href="tel:+33672849492" className="text-[#FFE500]">
                06 72 84 94 92
              </a>
            </div>

            {/* Official Social Links Mobile Strip */}
            <div className="flex items-center justify-center gap-3 pt-3 border-t border-zinc-800">
              <a
                href="https://www.instagram.com/campus.univers.cascades/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#14141c] border border-zinc-800 hover:border-[#E1306C] transition-colors group"
                aria-label="Instagram CUC"
              >
                <InstagramLogo
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                  variant="color"
                />
              </a>
              <a
                href="https://www.youtube.com/@campusuniverscascades"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#14141c] border border-zinc-800 hover:border-[#FF0000] transition-colors group"
                aria-label="YouTube CUC"
              >
                <YouTubeLogo
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                  variant="color"
                />
              </a>
              <a
                href="https://www.tiktok.com/@campusuniverscascades"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#14141c] border border-zinc-800 hover:border-[#25F4EE] transition-colors group"
                aria-label="TikTok CUC"
              >
                <TikTokLogo
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                  variant="color"
                />
              </a>
              <a
                href="https://www.facebook.com/CampusUniversCascades/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#14141c] border border-zinc-800 hover:border-[#1877F2] transition-colors group"
                aria-label="Facebook CUC"
              >
                <FacebookLogo
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                  variant="color"
                />
              </a>
              <a
                href="https://wa.me/33672849492"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#14141c] border border-zinc-800 hover:border-[#25D366] transition-colors group"
                aria-label="WhatsApp CUC"
              >
                <WhatsAppLogo
                  className="w-4 h-4 group-hover:scale-110 transition-transform"
                  variant="color"
                />
              </a>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
