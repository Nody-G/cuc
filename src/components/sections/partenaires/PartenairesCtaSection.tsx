'use client';
import { Link } from '@/i18n/navigation';

import React from 'react';
import { useTranslations } from 'next-intl';

import { StuntBadge } from '@/components/ui/StuntBadge';
import { TacticalButton } from '@/components/ui/TacticalButton';
import { Handshake, ChevronRight } from 'lucide-react';
import { cucMicro } from '@/lib/preview/cuc-micro';

export const PartenairesCtaSection: React.FC = () => {
  const t = useTranslations('partenaires');

  return (
    <section className="py-16 bg-[#0c0c10] border-t border-zinc-800">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <StuntBadge variant="yellow" icon={<Handshake className="w-3.5 h-3.5" />}>
          <span {...cucMicro('partenaires.ctaBadge')}>{t('ctaBadge')}</span>
        </StuntBadge>
        <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wide text-white mt-3 mb-4">
          <span {...cucMicro('partenaires.ctaTitle')}>{t('ctaTitle')}</span>
        </h2>
        <p className="text-xs sm:text-sm font-tech text-zinc-400 leading-relaxed mb-8 max-w-2xl mx-auto">
          <span {...cucMicro('partenaires.ctaBody')}>{t('ctaBody')}</span>
        </p>
        <Link href="/contact-cuc?demande=tournage-production">
          <TacticalButton variant="primary" size="lg" icon={<ChevronRight className="w-4 h-4" />}>
            <span {...cucMicro('partenaires.ctaButton')}>{t('ctaButton')}</span>
          </TacticalButton>
        </Link>
      </div>
    </section>
  );
};
