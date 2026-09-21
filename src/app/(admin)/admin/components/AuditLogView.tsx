'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Activity,
    Search,
    Download,
    RefreshCw,
    Filter,
    User,
    Clock,
    FileText,
    Image as ImageIcon,
    Users,
    Film,
    Calendar,
    Handshake,
    Settings,
    Sparkles,
    Database,
    Layers,
    MapPin,
    Inbox,
    ShieldCheck,
} from 'lucide-react';
import {
    AuditLogEntry,
    getAuditLogsExtended,
} from '@/lib/data/site-service';
import {
    CockpitViewHeader,
    CockpitCard,
    CockpitButton,
    CockpitBadge,
    CockpitEmptyState,
    CockpitSkeletonList,
    CockpitLoadMore,
    useProgressiveList,
} from './ui';

interface AuditLogViewProps {
    showToast: (msg: string) => void;
}

type RangeFilter = 'all' | '24h' | '7d' | '30d';

const RANGE_LABELS: Record<RangeFilter, string> = {
    all: 'Tout l’historique',
    '24h': 'Dernières 24 h',
    '7d': '7 derniers jours',
    '30d': '30 derniers jours',
};

const RANGE_MS: Record<Exclude<RangeFilter, 'all'>, number> = {
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
};

/**
 * Associe une action d'audit à une icône et une tonalité sobres.
 * Aucun libellé marketing : uniquement la nature technique de l'action.
 */
function resolveActionVisual(action: string): {
    icon: React.ComponentType<{ className?: string }>;
    tone: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
} {
    const a = action.toLowerCase();
    if (a.includes('suppress') || a.includes('delete') || a.includes('remove')) {
        return { icon: Database, tone: 'danger' };
    }
    if (a.includes('publi') || a.includes('publish')) {
        return { icon: ShieldCheck, tone: 'success' };
    }
    if (a.includes('restaur') || a.includes('restore')) {
        return { icon: RefreshCw, tone: 'warning' };
    }
    if (a.includes('connexion') || a.includes('login') || a.includes('auth')) {
        return { icon: User, tone: 'accent' };
    }
    if (a.includes('création') || a.includes('creation') || a.includes('ajout')) {
        return { icon: Sparkles, tone: 'accent' };
    }
    if (a.includes('modif') || a.includes('update') || a.includes('édition')) {
        return { icon: FileText, tone: 'neutral' };
    }
    return { icon: Activity, tone: 'neutral' };
}

/**
 * Associe une entité d'audit à une icône de domaine.
 */
function resolveEntityIcon(entity: string): React.ComponentType<{ className?: string }> {
    const e = entity.toLowerCase();
    if (e.includes('page')) return FileText;
    if (e.includes('média') || e.includes('media') || e.includes('image')) return ImageIcon;
    if (e.includes('équipe') || e.includes('equipe') || e.includes('team') || e.includes('coach')) return Users;
    if (e.includes('film')) return Film;
    if (e.includes('session')) return Calendar;
    if (e.includes('partenaire') || e.includes('partner')) return Handshake;
    if (e.includes('discipline')) return Layers;
    if (e.includes('campus') || e.includes('zone') || e.includes('poi')) return MapPin;
    if (e.includes('candidature') || e.includes('inquiry') || e.includes('lead')) return Inbox;
    if (e.includes('param') || e.includes('setting') || e.includes('navigation') || e.includes('footer')) return Settings;
    return Activity;
}

function formatFullDate(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function formatDayLabel(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Date inconnue';
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const sameDay = (a: Date, b: Date) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

    if (sameDay(d, today)) return 'Aujourd’hui';
    if (sameDay(d, yesterday)) return 'Hier';
    return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function dayKey(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'unknown';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ showToast }) => {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [actionFilter, setActionFilter] = useState<string>('all');
    const [entityFilter, setEntityFilter] = useState<string>('all');
    const [rangeFilter, setRangeFilter] = useState<RangeFilter>('all');

    // Horodatage de référence : figé au montage puis rafraîchi à chaque
    // rechargement. Évite d'appeler `Date.now()` (impur) pendant le rendu.
    const [now, setNow] = useState(() => Date.now());

    const load = useCallback(async (showSpinner = false) => {
        if (showSpinner) setRefreshing(true);
        const data = await getAuditLogsExtended(500);
        setLogs(data);
        setNow(Date.now());
        setLoading(false);
        setRefreshing(false);
    }, []);

    useEffect(() => {
        // Chargement initial du journal d'audit (synchronisation avec la source
        // distante : le setState est intentionnel).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void load();
    }, [load]);

    const actionOptions = useMemo(() => {
        const set = new Set<string>();
        logs.forEach((l) => l.action && set.add(l.action));
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    }, [logs]);

    const entityOptions = useMemo(() => {
        const set = new Set<string>();
        logs.forEach((l) => l.entity && set.add(l.entity));
        return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
    }, [logs]);

    const filteredLogs = useMemo(() => {
        const threshold =
            rangeFilter === 'all' ? null : now - RANGE_MS[rangeFilter];
        const q = searchQuery.trim().toLowerCase();

        return logs.filter((log) => {
            if (actionFilter !== 'all' && log.action !== actionFilter) return false;
            if (entityFilter !== 'all' && log.entity !== entityFilter) return false;

            if (threshold !== null) {
                const t = new Date(log.created_at).getTime();
                if (Number.isNaN(t) || t < threshold) return false;
            }

            if (q) {
                const haystack = [
                    log.action,
                    log.entity,
                    log.details || '',
                    log.user_name || '',
                ]
                    .join(' ')
                    .toLowerCase();
                if (!haystack.includes(q)) return false;
            }

            return true;
        });
    }, [logs, actionFilter, entityFilter, rangeFilter, searchQuery, now]);

    const {
        visibleItems: visibleLogs,
        visibleCount,
        total,
        hasMore,
        loadMore,
    } = useProgressiveList(filteredLogs, {
        step: 40,
        initial: 40,
        resetKey: `${actionFilter}|${entityFilter}|${rangeFilter}|${searchQuery}`,
    });

    const groupedLogs = useMemo(() => {
        const groups: { key: string; label: string; entries: AuditLogEntry[] }[] = [];
        const index = new Map<string, number>();

        visibleLogs.forEach((log) => {
            const key = dayKey(log.created_at);
            let pos = index.get(key);
            if (pos === undefined) {
                pos = groups.length;
                index.set(key, pos);
                groups.push({ key, label: formatDayLabel(log.created_at), entries: [] });
            }
            groups[pos].entries.push(log);
        });

        return groups;
    }, [visibleLogs]);

    const stats = useMemo(() => {
        const last24h = logs.filter((l) => {
            const t = new Date(l.created_at).getTime();
            return !Number.isNaN(t) && now - t <= RANGE_MS['24h'];
        }).length;
        const authors = new Set(logs.map((l) => l.user_name).filter(Boolean)).size;
        return { total: logs.length, last24h, authors };
    }, [logs, now]);

    const handleExportCsv = () => {
        if (filteredLogs.length === 0) {
            showToast('Aucune entrée à exporter avec les filtres actuels.');
            return;
        }

        const escape = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
        const header = ['Date', 'Auteur', 'Action', 'Entité', 'Détails'];
        const rows = filteredLogs.map((l) => [
            formatFullDate(l.created_at),
            l.user_name || '',
            l.action || '',
            l.entity || '',
            l.details || '',
        ]);

        const csv = [header, ...rows]
            .map((row) => row.map(escape).join(';'))
            .join('\r\n');

        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cuc-journal-audit-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        showToast(`${filteredLogs.length} entrée(s) exportée(s) au format CSV.`);
    };

    const hasActiveFilters =
        actionFilter !== 'all' ||
        entityFilter !== 'all' ||
        rangeFilter !== 'all' ||
        searchQuery.trim().length > 0;

    const resetFilters = () => {
        setActionFilter('all');
        setEntityFilter('all');
        setRangeFilter('all');
        setSearchQuery('');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            <CockpitViewHeader
                icon={Activity}
                eyebrow="Traçabilité des Actions"
                title="Journal d’Audit"
                description="Historique horodaté des modifications effectuées dans le Cockpit : création, édition, publication, suppression et restauration."
                actions={
                    <div className="flex items-center gap-2">
                        <CockpitButton
                            variant="secondary"
                            size="sm"
                            icon={RefreshCw}
                            loading={refreshing}
                            onClick={() => load(true)}
                        >
                            Actualiser
                        </CockpitButton>
                        <CockpitButton
                            variant="primary"
                            size="sm"
                            icon={Download}
                            onClick={handleExportCsv}
                        >
                            Exporter CSV
                        </CockpitButton>
                    </div>
                }
            />

            {/* Indicateurs synthétiques */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <CockpitCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-[#FFE500]/10 text-[#FFE500]">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">{stats.total}</div>
                            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                                Entrées conservées
                            </div>
                        </div>
                    </div>
                </CockpitCard>

                <CockpitCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            <Clock className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">{stats.last24h}</div>
                            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                                Dernières 24 h
                            </div>
                        </div>
                    </div>
                </CockpitCard>

                <CockpitCard className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                            <User className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-white">{stats.authors}</div>
                            <div className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                                Auteurs distincts
                            </div>
                        </div>
                    </div>
                </CockpitCard>
            </div>

            {/* Barre de filtres */}
            <CockpitCard className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                    <Filter className="w-3.5 h-3.5" /> Filtres
                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="ml-auto text-[10px] font-mono text-[#FFE500] hover:underline cursor-pointer"
                        >
                            Réinitialiser
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher une action, un auteur, un détail…"
                            className="w-full bg-black/60 border border-white/20 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#FFE500]"
                        />
                    </div>

                    <select
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    >
                        <option value="all">Toutes les actions</option>
                        {actionOptions.map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>

                    <select
                        value={entityFilter}
                        onChange={(e) => setEntityFilter(e.target.value)}
                        className="w-full bg-black/60 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#FFE500]"
                    >
                        <option value="all">Toutes les entités</option>
                        {entityOptions.map((e) => (
                            <option key={e} value={e}>
                                {e}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {(Object.keys(RANGE_LABELS) as RangeFilter[]).map((range) => (
                        <button
                            key={range}
                            type="button"
                            onClick={() => setRangeFilter(range)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-mono uppercase tracking-wider border transition-colors cursor-pointer ${rangeFilter === range
                                ? 'bg-[#FFE500] text-black border-[#FFE500]'
                                : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10'
                                }`}
                        >
                            {RANGE_LABELS[range]}
                        </button>
                    ))}
                    <span className="ml-auto text-[11px] font-mono text-zinc-500">
                        {filteredLogs.length} entrée(s) affichée(s)
                    </span>
                </div>
            </CockpitCard>

            {/* Liste chronologique */}
            {loading ? (
                <CockpitSkeletonList rows={6} />
            ) : filteredLogs.length === 0 ? (
                <CockpitEmptyState
                    icon={Activity}
                    title="Aucune entrée d’audit"
                    description={
                        hasActiveFilters
                            ? 'Aucune action ne correspond aux filtres sélectionnés. Élargissez la période ou réinitialisez les filtres.'
                            : 'Les actions réalisées dans le Cockpit apparaîtront ici automatiquement.'
                    }
                />
            ) : (
                <div className="space-y-6">
                    {groupedLogs.map((group) => (
                        <div key={group.key} className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] font-mono text-[#FFE500] uppercase tracking-wider">
                                    {group.label}
                                </span>
                                <span className="flex-1 h-px bg-white/10" />
                                <span className="text-[10px] font-mono text-zinc-500">
                                    {group.entries.length}
                                </span>
                            </div>

                            <div className="space-y-2">
                                {group.entries.map((log) => {
                                    const visual = resolveActionVisual(log.action);
                                    const ActionIcon = visual.icon;
                                    const EntityIcon = resolveEntityIcon(log.entity);

                                    return (
                                        <CockpitCard key={log.id} className="p-3.5">
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-white/5 text-zinc-300 shrink-0 mt-0.5">
                                                    <ActionIcon className="w-4 h-4" />
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="text-sm font-semibold text-white">
                                                            {log.action}
                                                        </span>
                                                        <CockpitBadge tone={visual.tone}>
                                                            <span className="inline-flex items-center gap-1">
                                                                <EntityIcon className="w-3 h-3" />
                                                                {log.entity}
                                                            </span>
                                                        </CockpitBadge>
                                                    </div>

                                                    {log.details && (
                                                        <p className="text-xs text-zinc-400 leading-relaxed break-words">
                                                            {log.details}
                                                        </p>
                                                    )}

                                                    <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-zinc-500">
                                                        <span className="inline-flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {log.user_name || 'Administrateur'}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatFullDate(log.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CockpitCard>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <CockpitLoadMore
                        visibleCount={visibleCount}
                        total={total}
                        onLoadMore={loadMore}
                        label="Afficher plus d’entrées"
                    />
                </div>
            )}
        </div>
    );
};
