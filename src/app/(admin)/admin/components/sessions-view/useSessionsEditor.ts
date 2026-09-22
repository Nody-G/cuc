'use client';

import { useState, useTransition, type Dispatch, type SetStateAction } from 'react';
import type { StuntProgram } from '@/types';
import {
    createSession,
    deleteSession,
    syncSessionsSeatCountsFromCucSign,
    updateSessionStatus,
} from '../../actions';
import type { NewSessionStatus, ProgramSession, SessionStatus } from './session-form';

export interface UseSessionsEditorArgs {
    programs: StuntProgram[];
    setPrograms: Dispatch<SetStateAction<StuntProgram[]>>;
    showToast: (msg: string) => void;
}

export interface UseSessionsEditorResult {
    currentProgram: StuntProgram | undefined;
    selectedProgramId: string;
    selectProgram: (id: string) => void;
    isSyncingSeats: boolean;
    showAddSessionModal: boolean;
    newSessionDate: string;
    newSessionStatus: NewSessionStatus;
    setNewSessionDate: (value: string) => void;
    setNewSessionStatus: (status: NewSessionStatus) => void;
    openAddSessionModal: () => void;
    closeAddSessionModal: () => void;
    startDuplicateSession: (session: ProgramSession) => void;
    handleSyncSeats: () => Promise<void>;
    handleStatusChange: (
        progId: string,
        session: ProgramSession,
        newStat: SessionStatus
    ) => void;
    handleAddSession: (e: React.FormEvent) => void;
    handleDeleteSession: (progId: string, dateDisplay: string) => void;
}

export function useSessionsEditor({
    programs,
    setPrograms,
    showToast,
}: UseSessionsEditorArgs): UseSessionsEditorResult {
    const [, startTransition] = useTransition();
    const [selectedProgramId, setSelectedProgramId] = useState<string>('');
    const [showAddSessionModal, setShowAddSessionModal] = useState(false);
    const [newSessionDate, setNewSessionDate] = useState('');
    const [newSessionStatus, setNewSessionStatus] = useState<NewSessionStatus>('ouvert');
    const [isSyncingSeats, setIsSyncingSeats] = useState(false);

    const currentProgram =
        programs.find((p) => p.id === (selectedProgramId || programs[0]?.id)) || programs[0];

    const handleSyncSeats = async () => {
        setIsSyncingSeats(true);
        try {
            const res = await syncSessionsSeatCountsFromCucSign();
            if (res.success) {
                showToast(res.message || 'Effectifs CUC Sign synchronisés !');
            } else {
                showToast(`Erreur : ${res.error}`);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            showToast(`Erreur : ${message}`);
        } finally {
            setIsSyncingSeats(false);
        }
    };

    const handleStatusChange = (
        progId: string,
        session: ProgramSession,
        newStat: SessionStatus
    ) => {
        const sessionKey = session.id || session.date;
        setPrograms((prev) =>
            prev.map((p) => {
                if (p.id !== progId) return p;
                return {
                    ...p,
                    nextSessions: p.nextSessions.map((s) =>
                        ((s.id && s.id === session.id) || s.date === session.date) ? { ...s, status: newStat } : s
                    ),
                };
            })
        );
        showToast(`Statut mis à jour : ${newStat}`);

        startTransition(async () => {
            await updateSessionStatus(sessionKey, newStat, session.cuc_sign_formation_id);
        });
    };

    const handleAddSession = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSessionDate.trim() || !currentProgram) return;

        const progId = currentProgram.id;
        const dateText = newSessionDate.trim();
        const stat = newSessionStatus;

        setPrograms((prev) =>
            prev.map((p) => {
                if (p.id !== progId) return p;
                return {
                    ...p,
                    nextSessions: [...(p.nextSessions || []), { date: dateText, status: stat }],
                };
            })
        );
        setNewSessionDate('');
        setShowAddSessionModal(false);
        showToast('Session ajoutée avec succès !');

        startTransition(async () => {
            await createSession({
                program_id: progId,
                date_display: dateText,
                status: stat,
            });
        });
    };

    const handleDeleteSession = (progId: string, dateDisplay: string) => {
        if (!confirm(`Supprimer définitivement la session "${dateDisplay}" ?`)) return;

        setPrograms((prev) =>
            prev.map((p) => {
                if (p.id !== progId) return p;
                return {
                    ...p,
                    nextSessions: p.nextSessions.filter((s) => s.date !== dateDisplay),
                };
            })
        );
        showToast('Session supprimée.');

        startTransition(async () => {
            await deleteSession(dateDisplay);
        });
    };

    const startDuplicateSession = (session: ProgramSession) => {
        setNewSessionDate(`${session.date} (Copie)`);
        setNewSessionStatus(session.status === 'bientôt' ? 'ouvert' : session.status);
        setShowAddSessionModal(true);
    };

    return {
        currentProgram,
        selectedProgramId,
        selectProgram: setSelectedProgramId,
        isSyncingSeats,
        showAddSessionModal,
        newSessionDate,
        newSessionStatus,
        setNewSessionDate,
        setNewSessionStatus,
        openAddSessionModal: () => setShowAddSessionModal(true),
        closeAddSessionModal: () => setShowAddSessionModal(false),
        startDuplicateSession,
        handleSyncSeats,
        handleStatusChange,
        handleAddSession,
        handleDeleteSession,
    };
}
