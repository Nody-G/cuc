'use client';

import { useState, useTransition } from 'react';
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from '@/lib/data/site-service';
import { updateSiteSettings } from '../../actions';
import type { SettingsChangeHandler, SettingsSectionId } from './settings-sections';

export interface UseSettingsFormArgs {
    initialSettings?: SiteSettings;
}

/**
 * État du formulaire de réglages généraux : valeurs, section active, message de
 * statut et écriture serveur (`updateSiteSettings('general', …)`).
 *
 * Couche « Hooks & Orchestration » (`AGENTS.md` § 1).
 */
export function useSettingsForm({ initialSettings }: UseSettingsFormArgs) {
    const [settings, setSettings] = useState<SiteSettings>(initialSettings || DEFAULT_SITE_SETTINGS);
    const [isPending, startTransition] = useTransition();
    const [statusMessage, setStatusMessage] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);
    const [activeSection, setActiveSection] = useState<SettingsSectionId>('all');

    const handleChange: SettingsChangeHandler = (key, value) => {
        setSettings((prev) => ({ ...prev, [key]: value } as SiteSettings));
    };

    const handleSave = () => {
        startTransition(async () => {
            try {
                const res = await updateSiteSettings('general', settings);
                if (res.success) {
                    setStatusMessage({
                        type: 'success',
                        text: 'Paramètres généraux enregistrés et appliqués en direct sur tout le site !',
                    });
                } else {
                    setStatusMessage({ type: 'error', text: res.error || 'Erreur lors de l\'enregistrement.' });
                }
            } catch (err) {
                setStatusMessage({
                    type: 'error',
                    text: err instanceof Error ? err.message : 'Erreur inattendue.',
                });
            }
            setTimeout(() => setStatusMessage(null), 5000);
        });
    };

    const handleResetToDefault = () => {
        if (confirm('Voulez-vous réinitialiser le formulaire avec les valeurs standards du campus ?')) {
            setSettings(DEFAULT_SITE_SETTINGS);
        }
    };

    return {
        settings,
        isPending,
        statusMessage,
        activeSection,
        setActiveSection,
        handleChange,
        handleSave,
        handleResetToDefault,
    };
}
