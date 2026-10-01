'use client';

import React from 'react';
import { X } from 'lucide-react';
import type { Instructor } from '@/types';
import type { EditorLocaleOption } from '../ui';
import { EntityLocaleBar } from '../entity-translation/EntityLocaleBar';
import type { EntityEditorLocale } from '../entity-translation/entity-translation.contract';
import { TeamMemberIdentityFields } from './TeamMemberIdentityFields';
import { TeamCreditsPanel, type TeamCreditsPanelProps } from './TeamCreditsPanel';

export interface TeamMemberEditorModalProps {
    /** Fiche active : français en FR, contenu localisé en EN. */
    member: Instructor;
    /** Écriture du brouillon actif (mêmes champs, locale courante). */
    onMemberChange: (next: Instructor) => void;
    /** Fiche source française : la colonne Filmographie s'y écrit toujours. */
    sourceMember: Instructor;
    onSourceMemberChange: (next: Instructor) => void;
    /** État bilingue : barre FR | EN et verrous de champs. */
    localeEditor: EntityEditorLocale<Instructor>;
    onLocaleChange: (next: EditorLocaleOption) => void;
    isFieldReadOnly: (field: string) => boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    /** Ouvre la médiathèque pour l'avatar. */
    onOpenMediaPicker: () => void;
    /** Modèle de l'éditeur de crédits (colonne droite). */
    credits: Omit<TeamCreditsPanelProps, 'member' | 'onMemberChange'>;
}

/**
 * Éditeur de fiche formateur — en-tête fixe (titre + barre bilingue), corps
 * défilant, pied fixe. En anglais, seule l'identité éditoriale reste
 * éditable : la colonne Filmographie bascule en lecture seule.
 */
export const TeamMemberEditorModal: React.FC<TeamMemberEditorModalProps> = ({
    member,
    onMemberChange,
    sourceMember,
    onSourceMemberChange,
    localeEditor,
    onLocaleChange,
    isFieldReadOnly,
    onClose,
    onSubmit,
    onOpenMediaPicker,
    credits,
}) => (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
        <div className="bg-[#12121A] border border-white/10 rounded-xl w-full max-w-[95vw] xl:max-w-[1500px] h-[94vh] flex flex-col shadow-2xl overflow-hidden">
            {/* En-tête fixe */}
            <div className="flex flex-col gap-3 px-6 py-4 border-b border-white/10 bg-[#16161F] shrink-0">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-base font-bold text-white uppercase tracking-wide truncate">
                        {member.name ? `Modifier : ${member.name}` : 'Nouveau formateur'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                        aria-label="Fermer"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Bascule FR | EN : la traduction s'édite dans le même formulaire. */}
                <EntityLocaleBar
                    entityLabel={member.name || 'Nouveau formateur'}
                    locale={localeEditor.locale}
                    onLocaleChange={onLocaleChange}
                    coverage={localeEditor.coverage}
                    dirty={localeEditor.isEnglish && localeEditor.dirty}
                    busy={localeEditor.loading}
                    ready={localeEditor.ready}
                    saving={localeEditor.saving}
                    onSaveTranslation={() => void localeEditor.saveTranslation()}
                    onRevertTranslation={localeEditor.revertTranslation}
                    onRemoveTranslation={() => void localeEditor.removeTranslation()}
                />

                {localeEditor.error && (
                    <p role="alert" className="text-[11px] text-red-400">
                        {localeEditor.error}
                    </p>
                )}
            </div>

            <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
                {/* Corps défilant */}
                <div className="flex-1 min-h-0 overflow-y-auto px-6 py-5">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                        {/* Colonne gauche : identité & profil (éditable en EN) */}
                        <TeamMemberIdentityFields
                            member={member}
                            onMemberChange={onMemberChange}
                            onOpenMediaPicker={onOpenMediaPicker}
                            isFieldReadOnly={isFieldReadOnly}
                        />

                        {/* Colonne droite : filmographie unifiée (source FR, jamais traduite) */}
                        <fieldset
                            disabled={localeEditor.isEnglish}
                            className="m-0 min-w-0 border-0 p-0"
                        >
                            <TeamCreditsPanel
                                {...credits}
                                member={sourceMember}
                                onMemberChange={onSourceMemberChange}
                            />
                        </fieldset>
                    </div>
                </div>

                {/* Pied fixe */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/10 bg-[#16161F] shrink-0">
                    <div className="text-[11px] font-mono text-zinc-500">
                        {credits.selectedCount} crédit(s) • {credits.featuredCount} mis en avant
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={
                                localeEditor.isEnglish && (localeEditor.saving || !localeEditor.ready)
                            }
                            className="px-5 py-2 rounded-lg bg-[#FFE500] hover:bg-[#ffe600e6] text-black text-xs font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {localeEditor.isEnglish
                                ? localeEditor.saving
                                    ? 'Enregistrement…'
                                    : 'Enregistrer EN'
                                : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
);
