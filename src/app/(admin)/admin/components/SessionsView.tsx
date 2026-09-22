'use client';

import React from 'react';
import type { StuntProgram } from '@/types';
import type { SiteInquiry } from '@/lib/data/site-service';
import { useSessionsEditor } from './sessions-view/useSessionsEditor';
import { SessionsHeader } from './sessions-view/SessionsHeader';
import { ProgramSelector } from './sessions-view/ProgramSelector';
import { ProgramSessionsPanel } from './sessions-view/ProgramSessionsPanel';
import { AddSessionModal } from './sessions-view/AddSessionModal';

interface SessionsViewProps {
  programs: StuntProgram[];
  setPrograms: React.Dispatch<React.SetStateAction<StuntProgram[]>>;
  inquiries?: SiteInquiry[];
  showToast: (msg: string) => void;
}

/**
 * Gestion des dates de stage : statut par session, duplication, ajout et
 * suppression, synchronisation des effectifs CUC Sign. Implémentation
 * découpée dans `./sessions-view/**`.
 */
export const SessionsView: React.FC<SessionsViewProps> = ({
  programs,
  setPrograms,
  inquiries = [],
  showToast,
}) => {
  const editor = useSessionsEditor({ programs, setPrograms, showToast });
  const { currentProgram } = editor;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <SessionsHeader />

      {/* Sélecteur de programme */}
      <ProgramSelector
        programs={programs}
        currentProgramId={currentProgram?.id}
        onSelectProgram={editor.selectProgram}
      />

      {currentProgram && (
        <ProgramSessionsPanel
          program={currentProgram}
          inquiries={inquiries}
          isSyncingSeats={editor.isSyncingSeats}
          onSyncSeats={editor.handleSyncSeats}
          onAddSession={editor.openAddSessionModal}
          onStatusChange={(session, status) =>
            editor.handleStatusChange(currentProgram.id, session, status)
          }
          onDuplicate={editor.startDuplicateSession}
          onDelete={(dateDisplay) => editor.handleDeleteSession(currentProgram.id, dateDisplay)}
        />
      )}

      {/* Modal d'ajout de date */}
      {editor.showAddSessionModal && currentProgram && (
        <AddSessionModal
          program={currentProgram}
          date={editor.newSessionDate}
          status={editor.newSessionStatus}
          onDateChange={editor.setNewSessionDate}
          onStatusChange={editor.setNewSessionStatus}
          onSubmit={editor.handleAddSession}
          onClose={editor.closeAddSessionModal}
        />
      )}
    </div>
  );
};
