'use client';

import React from 'react';
import { SitePageContent } from '@/lib/data/site-service';

interface ContactPageEditorProps {
  formData: SitePageContent;
  setFormData: React.Dispatch<React.SetStateAction<SitePageContent>>;
}

export const ContactPageEditor: React.FC<ContactPageEditorProps> = ({
  formData,
  setFormData,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl p-6 space-y-4">
        <div className="border-b border-white/10 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Informations d&apos;Accès &amp; Transports
            </h3>
            <p className="text-xs text-gray-400">
              Gares TGV, autoroutes et accès au domaine de 6 hectares.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#FFE500] px-2 py-0.5 rounded bg-white/5 border border-white/10">
            access_info
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Liaisons Ferroviaires &amp; TGV</label>
            <input
              type="text"
              value={formData.sections_data?.access_info?.train_info || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sections_data: {
                    ...(prev.sections_data || {}),
                    access_info: {
                      ...(prev.sections_data?.access_info || {}),
                      train_info: e.target.value,
                    },
                  },
                }))
              }
              className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Autoroutes &amp; Voitures</label>
            <input
              type="text"
              value={formData.sections_data?.access_info?.car_info || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sections_data: {
                    ...(prev.sections_data || {}),
                    access_info: {
                      ...(prev.sections_data?.access_info || {}),
                      car_info: e.target.value,
                    },
                  },
                }))
              }
              className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Parking &amp; Accueil sur Place</label>
            <input
              type="text"
              value={formData.sections_data?.access_info?.parking_info || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sections_data: {
                    ...(prev.sections_data || {}),
                    access_info: {
                      ...(prev.sections_data?.access_info || {}),
                      parking_info: e.target.value,
                    },
                  },
                }))
              }
              className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">Horaires du Standard</label>
            <input
              type="text"
              value={formData.sections_data?.access_info?.schedule_info || ''}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sections_data: {
                    ...(prev.sections_data || {}),
                    access_info: {
                      ...(prev.sections_data?.access_info || {}),
                      schedule_info: e.target.value,
                    },
                  },
                }))
              }
              className="w-full bg-black/60 border border-white/20 rounded px-3 py-2 text-xs text-white focus:border-[#FFE500] focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
