'use client';

import { useEffect, useState } from 'react';
import { getAuditLogs, type AuditLogEntry } from '@/lib/data/site-service';

/** Charge les dernières entrées du journal d'audit pour le tableau de bord. */
export function useAuditLogs(): AuditLogEntry[] {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);

    useEffect(() => {
        getAuditLogs().then(setLogs);
    }, []);

    return logs;
}
