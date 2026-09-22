'use client';

import React from 'react';
import type { SiteEvent } from '@/lib/data/site-service';
import { MediaPickerModal } from './MediaPickerModal';
import { useEventsEditor } from './events-view/useEventsEditor';
import { EventsHeader } from './events-view/EventsHeader';
import { EventCard } from './events-view/EventCard';
import { EventEditModal } from './events-view/EventEditModal';

interface EventsViewProps {
  events: SiteEvent[];
  onEventSaved: (event: SiteEvent) => void;
  onEventDeleted: (id: string) => void;
  showToast: (msg: string) => void;
}

/**
 * Éditeur des prestations & événements professionnels — façade de composition.
 *
 * L'orchestration vit dans `useEventsEditor` ; les blocs visuels dans
 * `events-view/**` (header, carte de prestation, modale d'édition).
 */
export const EventsView: React.FC<EventsViewProps> = ({
  events,
  onEventSaved,
  onEventDeleted,
  showToast,
}) => {
  const editor = useEventsEditor(events, onEventSaved, onEventDeleted, showToast);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <EventsHeader onAdd={editor.startCreate} />

      {/* Grille des prestations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onEdit={editor.setEditingEvent}
            onDelete={editor.handleDelete}
          />
        ))}
      </div>

      {/* Modal d'édition de prestation */}
      {editor.editingEvent && (
        <EventEditModal
          editingEvent={editor.editingEvent}
          setEditingEvent={editor.setEditingEvent}
          featureInput={editor.featureInput}
          setFeatureInput={editor.setFeatureInput}
          onSave={editor.handleSave}
          onClose={() => editor.setEditingEvent(null)}
          onAddFeature={editor.handleAddFeature}
          onRemoveFeature={editor.handleRemoveFeature}
          onOpenMediaPicker={() => editor.setShowMediaPicker(true)}
        />
      )}

      {/* Media Picker Modal */}
      {editor.showMediaPicker && (
        <MediaPickerModal
          isOpen={true}
          onClose={() => editor.setShowMediaPicker(false)}
          onSelectUrl={(url) => {
            editor.applySelectedImage(url);
          }}
          title="Sélectionner l'image de la prestation"
        />
      )}
    </div>
  );
};
