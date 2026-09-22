'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { submitInquiry } from '@/app/(admin)/admin/actions';
import {
    createApplicationFormData,
    PROGRAM_TITLES,
    resolveProfileType,
    type ApplicationFormData,
    type ProfileType,
} from './application-form';

interface UseApplicationFormArgs {
    isOpen: boolean;
    onClose: () => void;
    defaultProgramId: string;
}

export interface ApplicationFormController {
    profileType: ProfileType;
    setProfileType: React.Dispatch<React.SetStateAction<ProfileType>>;
    formData: ApplicationFormData;
    setFormData: React.Dispatch<React.SetStateAction<ApplicationFormData>>;
    isSubmitted: boolean;
    isSubmitting: boolean;
    submitError: string | null;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

/**
 * Orchestration de la candidature : profil synchronisé sur le programme
 * d'ouverture, verrou de scroll + échap, envoi vers `site_inquiries`.
 */
export function useApplicationForm({
    isOpen,
    onClose,
    defaultProgramId,
}: UseApplicationFormArgs): ApplicationFormController {
    const t = useTranslations('applicationModal');
    const [profileType, setProfileType] = useState<ProfileType>(() => resolveProfileType(defaultProgramId));

    const [formData, setFormData] = useState<ApplicationFormData>(createApplicationFormData);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Synchronize profileType when defaultProgramId changes
    const [prevDefaultProgramId, setPrevDefaultProgramId] = useState(defaultProgramId);
    if (prevDefaultProgramId !== defaultProgramId) {
        setPrevDefaultProgramId(defaultProgramId);
        setProfileType(resolveProfileType(defaultProgramId));
    }

    // UX & Accessibility: Close on Escape key and lock body scroll
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        const res = await submitInquiry({
            full_name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            program_id: defaultProgramId || profileType,
            program_title: PROGRAM_TITLES[profileType] || profileType,
            age: formData.age,
            sport_background: formData.sportBackground,
            session_date: formData.sessionDate,
            afdas_status: formData.afdasStatus,
            message: formData.message,
        });

        setIsSubmitting(false);
        if (res.success) {
            setIsSubmitted(true);
        } else {
            setSubmitError(res.error || t('submitError'));
        }
    };

    return {
        profileType,
        setProfileType,
        formData,
        setFormData,
        isSubmitted,
        isSubmitting,
        submitError,
        handleSubmit,
    };
}
