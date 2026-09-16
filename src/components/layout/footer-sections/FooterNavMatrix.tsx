'use client';

import React from 'react';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';

export const FooterNavMatrix: React.FC = () => {
  return (
    <div className="py-8 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs font-mono-tech">
      <div>
        <span className="text-[#FFE500] uppercase font-bold block mb-2">
          Formations
        </span>
        <ul className="space-y-1.5 text-zinc-400">
          <li>
            <Link
              href="/formation-de-cascadeur"
              className="hover:text-white transition-colors"
            >
              Formation Pro 2 ans
            </Link>
          </li>
          <li>
            <Link
              href="/formation-de-cascadeur"
              className="hover:text-white transition-colors"
            >
              Formule Découverte (12j)
            </Link>
          </li>
          <li>
            <Link
              href="/stages-cascades-parkour-2"
              className="hover:text-white transition-colors"
            >
              Stages Week-end (250€)
            </Link>
          </li>
          <li>
            <Link
              href="/stages-cascades-parkour-2"
              className="hover:text-white transition-colors"
            >
              Prise en charge AFDAS
            </Link>
          </li>
          <li>
            <Link
              href="/stunt-workshop-cuc"
              className="hover:text-white transition-colors"
            >
              International Workshop
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <span className="text-[#FFE500] uppercase font-bold block mb-2">
          Le Campus
        </span>
        <ul className="space-y-1.5 text-zinc-400">
          <li>
            <Link
              href="/visite-guidee"
              className="hover:text-white transition-colors"
            >
              Visite Guidée des 6 Ha
            </Link>
          </li>
          <li>
            <Link
              href="/visite-virtuelle"
              className="hover:text-white text-[#FFE500] font-semibold transition-colors"
            >
              Visite Virtuelle 360°
            </Link>
          </li>
          <li>
            <Link
              href="/visite-guidee"
              className="hover:text-white transition-colors"
            >
              Zoé Bell Hall &amp; Fosse
            </Link>
          </li>
          <li>
            <Link
              href="/visite-guidee"
              className="hover:text-white transition-colors"
            >
              CUC Tower 21 mètres
            </Link>
          </li>
          <li>
            <Link
              href="/visite-guidee"
              className="hover:text-white transition-colors"
            >
              Dojos &amp; Manège équestre
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <span className="text-[#FFE500] uppercase font-bold block mb-2">
          CUC Events
        </span>
        <ul className="space-y-1.5 text-zinc-400">
          <li>
            <Link
              href="/cuc-events-agence"
              className="hover:text-white transition-colors"
            >
              Agence CUC Events
            </Link>
          </li>
          <li>
            <Link
              href="/spectacles-cascadeurs-yamakasi"
              className="hover:text-white transition-colors"
            >
              Spectacles &amp; Shows Cinéma
            </Link>
          </li>
          <li>
            <Link
              href="/animations-airbag-parkour"
              className="hover:text-white transition-colors"
            >
              Xtrem Jump Airbag Géant
            </Link>
          </li>
          <li>
            <Link
              href="/team-building-cascades"
              className="hover:text-white transition-colors"
            >
              Team Building Séminaires
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <span className="text-[#FFE500] uppercase font-bold block mb-2">
          L'Académie
        </span>
        <ul className="space-y-1.5 text-zinc-400">
          <li>
            <Link
              href="/equipe-cascadeurs-pro"
              className="hover:text-white transition-colors"
            >
              L'Équipe des Formateurs
            </Link>
          </li>
          <li>
            <Link
              href="/cuc-team-cascadeur"
              className="hover:text-white transition-colors"
            >
              Tournages &amp; Affiches Films
            </Link>
          </li>
          <li>
            <Link
              href="/videos-cascadeur"
              className="hover:text-white transition-colors"
            >
              Reportages TF1 &amp; France 2
            </Link>
          </li>
          <li>
            <Link
              href="/partenaires"
              className="hover:text-white transition-colors"
            >
              Nos Partenaires Officiels
            </Link>
          </li>
          <li>
            <a
              href="https://ma-boutique-club.com/campus-universcascades/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              Boutique Club <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};
