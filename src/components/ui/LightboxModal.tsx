'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface LightboxImage {
  src: string;
  title: string;
  category?: string;
}

interface LightboxModalProps {
  images: LightboxImage[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  images,
  currentIndex,
  onClose,
  onNavigate,
}) => {
  useEffect(() => {
    if (currentIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight') {
        onNavigate((currentIndex + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        onNavigate((currentIndex - 1 + images.length) % images.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (currentIndex === null || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNavigate((currentIndex + 1) % images.length);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200"
    >
      {/* Top Header Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex items-center justify-between z-10 w-full max-w-7xl mx-auto border-b border-zinc-800 pb-3"
      >
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 bg-[#FFE500] text-black font-mono-tech text-xs font-bold uppercase">
            PHOTO CUC
          </span>
          <span className="text-xs font-mono-tech text-zinc-400">
            {currentIndex + 1} / {images.length}
          </span>
          {currentImage.category && (
            <span className="text-xs font-mono-tech text-zinc-500 hidden sm:inline">
              {'// ' + currentImage.category}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-[#FFE500] hover:bg-[#181820] border border-zinc-800 transition-colors cursor-pointer"
            aria-label="Fermer la visionneuse"
            title="Fermer (Échap)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex-grow flex items-center justify-center my-4 w-full max-w-6xl mx-auto overflow-hidden"
      >
        {/* Left Arrow */}
        <button
          onClick={handlePrev}
          className="absolute left-2 sm:left-4 z-20 p-3 bg-black/80 hover:bg-[#FFE500] text-white hover:text-black border border-zinc-700 transition-all cursor-pointer shadow-2xl"
          aria-label="Photo précédente"
          title="Précédente (Flèche gauche)"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* The Image */}
        <div className="relative w-full h-[65vh] sm:h-[75vh] flex items-center justify-center">
          <Image
            src={currentImage.src}
            alt={currentImage.title}
            fill
            sizes="90vw"
            className="object-contain"
            priority
          />
        </div>

        {/* Right Arrow */}
        <button
          onClick={handleNext}
          className="absolute right-2 sm:right-4 z-20 p-3 bg-black/80 hover:bg-[#FFE500] text-white hover:text-black border border-zinc-700 transition-all cursor-pointer shadow-2xl"
          aria-label="Photo suivante"
          title="Suivante (Flèche droite)"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Bottom Caption Bar */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-7xl mx-auto text-center border-t border-zinc-800 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2"
      >
        <div className="font-display uppercase text-sm sm:text-base text-white tracking-wider">
          {currentImage.title}
        </div>
        <div className="text-[11px] font-mono-tech text-zinc-500">
          Navigation : Touches ← / → pour parcourir • Échap pour fermer
        </div>
      </div>
    </div>
  );
};
