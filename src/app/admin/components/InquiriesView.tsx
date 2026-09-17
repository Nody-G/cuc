'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Inbox,
  Search,
  Download,
  CheckCircle2,
  Clock,
  Archive,
  XCircle,
  Phone,
  Mail,
  FileText,
  Trash2,
  RefreshCw,
  Check,
  X,
  Copy,
  Send,
  CheckSquare,
  Square,
  Sparkles,
  Calendar,
} from 'lucide-react';
import { SiteInquiry, getInquiries } from '@/lib/data/site-service';
import { StuntProgram } from '@/types';
import { updateInquiryStatus, updateInquiryNotes, deleteInquiry } from '@/app/admin/actions';

interface EmailTemplate {
  id: string;
  name: string;
  badge: string;
  subject: (inq: SiteInquiry) => string;
  body: (inq: SiteInquiry) => string;
}

const RESPONSE_TEMPLATES: EmailTemplate[] = [
  {
    id: 'audition',
    name: 'Convocation Audition CUC',
    badge: 'Auditions',
    subject: (inq) => `[CUC] Convocation aux auditions de sélection - ${inq.full_name}`,
    body: (inq) => `Bonjour ${inq.full_name},

Faisant suite à votre candidature pour la formation ${inq.program_title || inq.program_id}, nous avons le plaisir de vous convoquer aux prochaines auditions de sélection au sein du Campus Univers Cascades (Le Cannet-des-Maures, Var).

Rappel des éléments requis le jour de l'audition :
- Certificat médical de non-contre-indication à la pratique des cascades physiques de moins de 3 mois.
- Tenue de sport adaptée (training, baskets propres d'intérieur, protège-dents conseillé).
- Pièce d'identité en cours de validité.

Merci de nous confirmer votre présence par retour de mail sous 48h.

Bien cordialement,
Lucas Dollfus & L'Équipe Pédagogique
Campus Univers Cascades (CUC)
contact@campus-univers-cascades.com`,
  },
  {
    id: 'afdas',
    name: 'Dossier AFDAS / OPCO',
    badge: 'Financement',
    subject: (inq) => `[CUC] Dossier de financement AFDAS / OPCO - ${inq.full_name}`,
    body: (inq) => `Bonjour ${inq.full_name},

Nous faisons suite à votre demande concernant le financement AFDAS pour la formation ${inq.program_title || inq.program_id} au Campus Univers Cascades.

Le CUC étant un organisme de formation certifié Qualiopi (Certificat N° 21452296), nos parcours sont éligibles aux financements AFDAS (artistes, intermittents du spectacle et techniciens).

Vous trouverez ci-joint :
- Le programme pédagogique détaillé et le devis conventionné aux normes AFDAS.
- L'attestation d'éligibilité et le calendrier prévisionnel.

Procédure :
1. Déposez ce devis et ce programme sur votre espace adhérent AFDAS au moins 4 semaines avant le début de la session.
2. Transmettez-nous l'accord de prise en charge dès réception.

Restant à votre entière disposition,
Le Secrétariat Administratif CUC`,
  },
  {
    id: 'devis_event',
    name: 'Devis Immersion & Team Building',
    badge: 'Entreprises',
    subject: (inq) => `[CUC] Devis & Proposition d'immersion cascade cinéma - ${inq.full_name}`,
    body: (inq) => `Bonjour ${inq.full_name},

Merci pour votre prise de contact avec le Campus Univers Cascades.

Nous avons le plaisir de vous soumettre notre proposition d'expérience immersive cascade cinéma adaptée à votre équipe :
- Initiation aux chorégraphies de combats scéniques et maniement d'armes sous la direction de cascadeurs professionnels.
- Ateliers chutes, câblage cinéma (wirework) et sécurité des plateaux.
- Restitution et tournage d'une scène d'action montée en direct.

N'hésitez pas à nous indiquer vos créneaux préférentiels pour convenir d'un échange téléphonique et caler le devis définitif.

L'Équipe Événements CUC
contact@campus-univers-cascades.com`,
  },
  {
    id: 'admission',
    name: 'Confirmation d\'Admission',
    badge: 'Inscription',
    subject: (inq) => `[CUC] Félicitations - Admission confirmée au Campus Univers Cascades - ${inq.full_name}`,
    body: (inq) => `Bonjour ${inq.full_name},

Nous avons le plaisir de vous annoncer votre admission officielle pour la session ${inq.program_title || inq.program_id} au sein du Campus Univers Cascades !

Vos prochaines étapes :
1. Retournez-nous le contrat de formation signé ainsi que le règlement intérieur paraphé.
2. Réglez l'acompte de réservation de place (ou transmettez votre accord de prise en charge).
3. Préparez votre arrivée sur le campus du Cannet-des-Maures (Var).

Nous avons hâte de vous compter parmi nos élèves cascadeurs.

Lucas Dollfus & L'Équipe du CUC`,
  },
];

const CHECKLIST_STEPS = [
  { id: 'contact', label: '1. Premier contact téléphonique effectué' },
  { id: 'dossier', label: '2. Dossier & certificat médical reçus' },
  { id: 'financement', label: '3. Financement validé (AFDAS / Personnel)' },
  { id: 'convocation', label: '4. Convocation / Contrat officiel envoyé' },
];

function parseNotesAndChecklist(raw: string): { checklist: Record<string, boolean>; notes: string } {
  const match = raw.match(/<!-- CUC_CHECKLIST:([a-z,]+) -->/);
  if (!match) {
    return { checklist: {}, notes: raw };
  }
  const completedKeys = match[1].split(',').filter(Boolean);
  const checklist: Record<string, boolean> = {};
  completedKeys.forEach((k) => {
    checklist[k] = true;
  });
  const notes = raw.replace(/<!-- CUC_CHECKLIST:[a-z,]+ -->\n?/, '').trim();
  return { checklist, notes };
}

function serializeNotesAndChecklist(checklist: Record<string, boolean>, notes: string): string {
  const completed = Object.entries(checklist)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(',');
  if (!completed) return notes;
  return `<!-- CUC_CHECKLIST:${completed} -->\n${notes}`;
}

interface InquiriesViewProps {
  showToast: (msg: string) => void;
  onInquiriesCountChange?: (count: number) => void;
  programs?: StuntProgram[];
}

export const InquiriesView: React.FC<InquiriesViewProps> = ({
  showToast,
  onInquiriesCountChange,
  programs = [],
}) => {
  const [inquiries, setInquiries] = useState<SiteInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'nouveau' | 'en_cours' | 'admis' | 'refuse' | 'archive'>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<SiteInquiry | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [currentChecklist, setCurrentChecklist] = useState<Record<string, boolean>>({});
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(RESPONSE_TEMPLATES[0].id);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    const data = await getInquiries();
    setInquiries(data);
    setLoading(false);
    const newCount = data.filter((i) => i.status === 'nouveau').length;
    onInquiriesCountChange?.(newCount);
  };

  useEffect(() => {
    let active = true;
    getInquiries().then((data) => {
      if (active) {
        setInquiries(data);
        setLoading(false);
        const newCount = data.filter((i) => i.status === 'nouveau').length;
        onInquiriesCountChange?.(newCount);
      }
    });
    return () => {
      active = false;
    };
  }, [onInquiriesCountChange]);

  const handleStatusChange = async (id: string, newStatus: SiteInquiry['status']) => {
    const res = await updateInquiryStatus(id, newStatus);
    if (res.success) {
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      showToast(`Statut mis à jour : ${newStatus.toUpperCase()}`);
      const newCount = inquiries
        .map((i) => (i.id === id ? { ...i, status: newStatus } : i))
        .filter((i) => i.status === 'nouveau').length;
      onInquiriesCountChange?.(newCount);
    } else {
      showToast(`Erreur : ${res.error}`);
    }
  };

  const handleSaveNotes = async (id: string) => {
    setIsSavingNotes(true);
    const serialized = serializeNotesAndChecklist(currentChecklist, editingNotes);
    const res = await updateInquiryNotes(id, serialized);
    setIsSavingNotes(false);
    if (res.success) {
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, admin_notes: serialized } : item))
      );
      if (selectedInquiry?.id === id) {
        setSelectedInquiry((prev) => (prev ? { ...prev, admin_notes: serialized } : null));
      }
      showToast('Note administrative enregistrée !');
    } else {
      showToast(`Erreur : ${res.error}`);
    }
  };

  const handleToggleChecklist = async (stepId: string) => {
    if (!selectedInquiry) return;
    const updatedChecklist = {
      ...currentChecklist,
      [stepId]: !currentChecklist[stepId],
    };
    setCurrentChecklist(updatedChecklist);
    const serialized = serializeNotesAndChecklist(updatedChecklist, editingNotes);
    const res = await updateInquiryNotes(selectedInquiry.id, serialized);
    if (res.success) {
      setInquiries((prev) =>
        prev.map((item) => (item.id === selectedInquiry.id ? { ...item, admin_notes: serialized } : item))
      );
      setSelectedInquiry((prev) => (prev ? { ...prev, admin_notes: serialized } : null));
      showToast('Suivi candidat mis à jour !');
    }
  };

  const openInquiryModal = (inq: SiteInquiry) => {
    const { checklist, notes } = parseNotesAndChecklist(inq.admin_notes || '');
    setSelectedInquiry(inq);
    setEditingNotes(notes);
    setCurrentChecklist(checklist);
    setSelectedTemplateId(RESPONSE_TEMPLATES[0].id);
    setCopiedTemplate(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette demande ?')) return;
    const res = await deleteInquiry(id);
    if (res.success) {
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
      showToast('Demande supprimée avec succès.');
      const newCount = inquiries.filter((i) => i.id !== id && i.status === 'nouveau').length;
      onInquiriesCountChange?.(newCount);
    } else {
      showToast(`Erreur : ${res.error}`);
    }
  };

  const exportToCSV = () => {
    if (inquiries.length === 0) {
      showToast('Aucune donnée à exporter.');
      return;
    }

    const headers = [
      'ID',
      'Date',
      'Nom & Prénom',
      'Email',
      'Téléphone',
      'Programme',
      'Âge',
      'Statut AFDAS',
      'Expérience',
      'Statut',
      'Notes Internes',
      'Message',
    ];

    const rows = inquiries.map((i) => [
      `"${i.id}"`,
      `"${new Date(i.created_at).toLocaleDateString('fr-FR')}"`,
      `"${i.full_name.replace(/"/g, '""')}"`,
      `"${i.email}"`,
      `"${i.phone}"`,
      `"${(i.program_title || i.program_id).replace(/"/g, '""')}"`,
      `"${i.age || ''}"`,
      `"${(i.afdas_status || '').replace(/"/g, '""')}"`,
      `"${(i.sport_background || '').replace(/"/g, '""')}"`,
      `"${i.status}"`,
      `"${(i.admin_notes || '').replace(/"/g, '""')}"`,
      `"${i.message.replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `cuc-candidatures-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Fichier CSV généré et téléchargé !');
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !searchQuery ||
        item.full_name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phone.toLowerCase().includes(q) ||
        (item.program_title && item.program_title.toLowerCase().includes(q)) ||
        (item.message && item.message.toLowerCase().includes(q));
      return matchesStatus && matchesQuery;
    });
  }, [inquiries, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: inquiries.length,
      nouveau: inquiries.filter((i) => i.status === 'nouveau').length,
      en_cours: inquiries.filter((i) => i.status === 'en_cours').length,
      admis: inquiries.filter((i) => i.status === 'admis').length,
    };
  }, [inquiries]);

  const getStatusBadge = (status: SiteInquiry['status']) => {
    switch (status) {
      case 'nouveau':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-[#FFE500] text-black shadow-xs">
            Nouveau
          </span>
        );
      case 'en_cours':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> En examen
          </span>
        );
      case 'admis':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Admis / Conclu
          </span>
        );
      case 'refuse':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-red-500/20 text-red-300 border border-red-500/30">
            <XCircle className="w-3 h-3" /> Refusé
          </span>
        );
      case 'archive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase font-bold bg-white/10 text-gray-400 border border-white/10">
            <Archive className="w-3 h-3" /> Archivé
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-white/10 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFE500] uppercase tracking-wider mb-1">
            <Inbox className="w-3.5 h-3.5" /> Pôle Admissions &amp; Relations Candidats
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase">
            Candidatures &amp; Demandes de Contact
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Gérez en temps réel les dossiers de sélection aux formations, inscriptions aux stages et devis d&apos;entreprises.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={exportToCSV}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#FFE500]" />
            <span>Exporter CSV</span>
          </button>
          <button
            type="button"
            onClick={fetchInquiries}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#FFE500]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Cartes KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
          <div className="text-[11px] font-mono text-gray-400 uppercase">Total Dossiers</div>
          <div className="text-2xl font-black text-white mt-1">{stats.total}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10 relative overflow-hidden">
          <div className="text-[11px] font-mono text-amber-400 uppercase font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FFE500] animate-pulse" /> À Traiter
          </div>
          <div className="text-2xl font-black text-[#FFE500] mt-1">{stats.nouveau}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
          <div className="text-[11px] font-mono text-gray-400 uppercase">En Examen / Contactés</div>
          <div className="text-2xl font-black text-white mt-1">{stats.en_cours}</div>
        </div>
        <div className="p-4 rounded-xl bg-[#0D0D12] border border-white/10">
          <div className="text-[11px] font-mono text-gray-400 uppercase">Admis / Conclus</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats.admis}</div>
        </div>
      </div>

      {/* Filtres & Recherche */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0D0D12] p-3 rounded-xl border border-white/10">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { id: 'all' as const, label: 'Toutes', count: stats.total },
              { id: 'nouveau' as const, label: 'Nouvelles', count: stats.nouveau },
              { id: 'en_cours' as const, label: 'En cours', count: stats.en_cours },
              { id: 'admis' as const, label: 'Admis', count: stats.admis },
              { id: 'refuse' as const, label: 'Refusées', count: undefined },
              { id: 'archive' as const, label: 'Archivées', count: undefined },
            ]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#FFE500] text-black font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id ? 'bg-black text-[#FFE500]' : 'bg-white/10 text-gray-300'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, email..."
            className="w-full bg-[#14141c] border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#FFE500] focus:outline-hidden"
          />
        </div>
      </div>

      {/* Liste des candidatures */}
      <div className="bg-[#0D0D12] border border-white/10 rounded-xl overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <Inbox className="w-8 h-8 mx-auto text-gray-600" />
            <p className="text-sm text-gray-400">Aucune demande trouvée.</p>
            <p className="text-xs">Les candidatures du site vitrine apparaîtront ici en temps réel.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredInquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-4 hover:bg-white/5 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer"
                onClick={() => openInquiryModal(inq)}
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-white hover:text-[#FFE500] transition-colors">
                      {inq.full_name}
                    </span>
                    {getStatusBadge(inq.status)}
                    <span className="text-[11px] font-mono text-gray-500">
                      {new Date(inq.created_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    <span className="font-medium text-gray-300">
                      {inq.program_title || inq.program_id}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Mail className="w-3 h-3 text-[#FFE500]" /> {inq.email}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Phone className="w-3 h-3 text-[#FFE500]" /> {inq.phone}
                    </span>
                  </div>

                  {inq.message && (
                    <p className="text-xs text-gray-400 line-clamp-1 italic mt-0.5">
                      &quot;{inq.message}&quot;
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openInquiryModal(inq);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    Détails du profil
                  </button>

                  <select
                    value={inq.status}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      handleStatusChange(inq.id, e.target.value as SiteInquiry['status'])
                    }
                    className="bg-[#14141c] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-300 focus:border-[#FFE500] focus:outline-hidden cursor-pointer"
                  >
                    <option value="nouveau">Nouveau</option>
                    <option value="en_cours">En examen</option>
                    <option value="admis">Admis</option>
                    <option value="refuse">Refusé</option>
                    <option value="archive">Archivé</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modale Profil Candidat & Prise de note */}
      {selectedInquiry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          onClick={() => setSelectedInquiry(null)}
        >
          <div
            className="bg-[#0D0D12] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {getStatusBadge(selectedInquiry.status)}
                  <span className="text-xs font-mono text-gray-400">
                    Reçu le {new Date(selectedInquiry.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <h2 className="text-xl font-black text-white">{selectedInquiry.full_name}</h2>
                <div className="text-xs text-[#FFE500] font-mono mt-0.5">
                  {selectedInquiry.program_title || selectedInquiry.program_id}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                <div className="text-gray-400 font-mono">Email de contact</div>
                <a href={`mailto:${selectedInquiry.email}`} className="text-white hover:text-[#FFE500] font-medium flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#FFE500]" /> {selectedInquiry.email}
                </a>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                <div className="text-gray-400 font-mono">Téléphone</div>
                <a href={`tel:${selectedInquiry.phone}`} className="text-white hover:text-[#FFE500] font-medium flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#FFE500]" /> {selectedInquiry.phone}
                </a>
              </div>
              {selectedInquiry.age && (
                <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                  <div className="text-gray-400 font-mono">Âge</div>
                  <div className="text-white font-medium">{selectedInquiry.age}</div>
                </div>
              )}
              {selectedInquiry.afdas_status && (
                <div className="p-3.5 rounded-xl bg-white/5 space-y-1">
                  <div className="text-gray-400 font-mono">Statut Financement / AFDAS</div>
                  <div className="text-white font-medium">{selectedInquiry.afdas_status}</div>
                </div>
              )}
              {/* Session CUC Assignée */}
              <div className="p-3.5 rounded-xl bg-white/5 space-y-2 col-span-full">
                <div className="flex items-center justify-between text-gray-400 font-mono">
                  <span className="flex items-center gap-1.5 text-[#FFE500]">
                    <Calendar className="w-3.5 h-3.5" /> Session &amp; Cursus Assigné
                  </span>
                  <span className="text-[11px] text-zinc-300 font-semibold">{selectedInquiry.session_date || 'Non assignée'}</span>
                </div>
                {programs && programs.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    <select
                      value={selectedInquiry.session_date || ''}
                      onChange={(e) => {
                        const newDate = e.target.value;
                        setSelectedInquiry({ ...selectedInquiry, session_date: newDate });
                        setInquiries((prev) =>
                          prev.map((it) => (it.id === selectedInquiry.id ? { ...it, session_date: newDate } : it))
                        );
                        showToast(`Session mise à jour : ${newDate || 'Aucune'}`);
                      }}
                      className="w-full bg-black/60 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#FFE500] cursor-pointer"
                    >
                      <option value="">Sélectionner ou réassigner à une date de session...</option>
                      {programs.flatMap((prog) =>
                        (prog.nextSessions || []).map((s, idx) => (
                          <option key={`${prog.id}-${idx}`} value={s.date}>
                            {prog.title} — {s.date} ({s.status})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {selectedInquiry.sport_background && (
              <div className="space-y-1.5">
                <div className="text-xs font-mono text-gray-400 uppercase">
                  Passé Sportif &amp; Artistique
                </div>
                <div className="p-3.5 rounded-xl bg-[#14141c] border border-white/5 text-xs text-gray-200">
                  {selectedInquiry.sport_background}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <div className="text-xs font-mono text-gray-400 uppercase">
                Message / Motivations
              </div>
              <div className="p-3.5 rounded-xl bg-[#14141c] border border-white/5 text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">
                {selectedInquiry.message || 'Aucun message particulier fourni.'}
              </div>
            </div>

            {/* Suivi Opérationnel & Checklist */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Suivi Opérationnel du Candidat
                </span>
                <span className="text-gray-400">
                  {CHECKLIST_STEPS.filter((s) => currentChecklist[s.id]).length} / {CHECKLIST_STEPS.length} validés
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CHECKLIST_STEPS.map((step) => {
                  const isChecked = !!currentChecklist[step.id];
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleToggleChecklist(step.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-lg text-left text-xs font-medium border transition-colors cursor-pointer ${
                        isChecked
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-500 shrink-0" />
                      )}
                      <span>{step.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modèles de réponse officielle par email */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Modèles de Réponses Officielles
                </span>
                <span className="text-gray-500">Génération automatique</span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {RESPONSE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => {
                      setSelectedTemplateId(tmpl.id);
                      setCopiedTemplate(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                      selectedTemplateId === tmpl.id
                        ? 'bg-white text-black font-bold'
                        : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <span>{tmpl.name}</span>
                  </button>
                ))}
              </div>

              {(() => {
                const currentTemplate =
                  RESPONSE_TEMPLATES.find((t) => t.id === selectedTemplateId) || RESPONSE_TEMPLATES[0];
                const subject = currentTemplate.subject(selectedInquiry);
                const body = currentTemplate.body(selectedInquiry);
                const mailtoUrl = `mailto:${selectedInquiry.email}?subject=${encodeURIComponent(
                  subject
                )}&body=${encodeURIComponent(body)}`;

                const handleCopyTemplate = () => {
                  navigator.clipboard.writeText(`${subject}\n\n${body}`);
                  setCopiedTemplate(true);
                  showToast('Modèle d\'email copié dans le presse-papier !');
                  setTimeout(() => setCopiedTemplate(false), 2500);
                };

                return (
                  <div className="p-3.5 rounded-xl bg-[#14141c] border border-white/10 space-y-2.5">
                    <div className="text-[11px] font-mono text-gray-400">
                      <span className="text-gray-500 font-semibold">Objet :</span> {subject}
                    </div>
                    <div className="text-xs text-gray-300 whitespace-pre-wrap font-mono text-[11px] bg-black/40 p-3 rounded-lg max-h-36 overflow-y-auto border border-white/5">
                      {body}
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCopyTemplate}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedTemplate ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copié !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#FFE500]" />
                            <span>Copier le texte</span>
                          </>
                        )}
                      </button>
                      <a
                        href={mailtoUrl}
                        className="px-3 py-1.5 rounded-lg bg-[#FFE500] text-black text-xs font-bold hover:bg-yellow-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Ouvrir client email</span>
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Notes administratives internes */}
            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#FFE500] uppercase font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> Notes Administratives Internes
                </span>
                <span className="text-gray-500">Visible uniquement par l&apos;équipe CUC</span>
              </div>
              <textarea
                value={editingNotes}
                onChange={(e) => setEditingNotes(e.target.value)}
                rows={3}
                placeholder="Ex: Convoqué pour l'audition du 14 octobre, dossier AFDAS validé..."
                className="w-full bg-[#14141c] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:border-[#FFE500] focus:outline-hidden"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleSaveNotes(selectedInquiry.id)}
                  disabled={isSavingNotes}
                  className="px-3 py-1.5 rounded-lg bg-[#FFE500] text-black text-xs font-bold hover:bg-yellow-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSavingNotes ? 'Enregistrement...' : 'Sauvegarder la note'}</span>
                </button>
              </div>
            </div>

            {/* Actions de clôture */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={() => handleDelete(selectedInquiry.id)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 px-2 py-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer la fiche</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedInquiry.id, 'en_cours')}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-200 border border-white/10 cursor-pointer"
                >
                  Marquer &quot;En examen&quot;
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange(selectedInquiry.id, 'admis')}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold cursor-pointer"
                >
                  Valider / Admis
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
