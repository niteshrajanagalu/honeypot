import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, Trash2, Download, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimestamp } from '../utils/dateUtils';
import { useSocket } from '../context/SocketContext';

const STORAGE_KEY = 'severeThreatsArchive';

const SevereThreatsArchive = () => {
    const { attacks } = useSocket();
    const [archive, setArchive] = useState([]);
    const [filter, setFilter] = useState('all');

    // Track which IDs are already archived without causing re-render loops
    const archivedKeysRef = useRef(new Set());

    // Load archive from localStorage once on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                setArchive(parsed);
                // Populate the ref so we don't re-archive on reconnect
                parsed.forEach(t => {
                    archivedKeysRef.current.add(t.id || `${t.timestamp}::${t.topic}`);
                });
            } catch (e) {
                console.error('Failed to load archive:', e);
            }
        }
    }, []);

    // Monitor attacks — only depends on attacks, NOT archive (avoids infinite loop)
    useEffect(() => {
        const newOnes = attacks
            .filter(a => a.severity === 'High')
            .filter(a => {
                const key = a.id || `${a.timestamp}::${a.topic}`;
                return !archivedKeysRef.current.has(key);
            });

        if (newOnes.length === 0) return;

        // Mark as archived
        newOnes.forEach(a => {
            archivedKeysRef.current.add(a.id || `${a.timestamp}::${a.topic}`);
        });

        const toAdd = newOnes.map(a => ({ ...a, archivedAt: new Date().toISOString() }));

        setArchive(prev => {
            const updated = [...prev, ...toAdd];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, [attacks]);

    const clearArchive = useCallback(() => {
        if (window.confirm('Clear the entire severe threats archive? This cannot be undone.')) {
            archivedKeysRef.current.clear();
            setArchive([]);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, []);

    const exportArchive = useCallback(() => {
        const blob = new Blob([JSON.stringify(archive, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `severe-threats-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [archive]);

    const filteredArchive = archive.filter(threat => {
        if (filter === 'today') {
            const archivedAt = threat.archivedAt ? new Date(threat.archivedAt) : null;
            if (!archivedAt || isNaN(archivedAt.getTime())) return false;
            const now = new Date();
            return (
                archivedAt.getFullYear() === now.getFullYear() &&
                archivedAt.getMonth() === now.getMonth() &&
                archivedAt.getDate() === now.getDate()
            );
        }
        if (filter === 'week') {
            const archivedAt = threat.archivedAt ? new Date(threat.archivedAt) : null;
            if (!archivedAt || isNaN(archivedAt.getTime())) return false;
            return archivedAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        }
        return true;
    });

    // Display newest first without mutating state
    const displayArchive = [...filteredArchive].reverse();

    const thisWeekCount = archive.filter(t => {
        const at = t.archivedAt ? new Date(t.archivedAt) : null;
        return at && at >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    }).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-red-500" />
                        SEVERE THREATS ARCHIVE
                    </h2>
                    <p className="text-sm text-muted mt-1">Permanent storage of all high-severity incidents</p>
                </div>
                <div className="flex gap-2 items-center">
                    <select
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        className="bg-surface/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                    </select>
                    <button
                        onClick={exportArchive}
                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        title="Export as JSON"
                    >
                        <Download size={20} />
                    </button>
                    <button
                        onClick={clearArchive}
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        title="Clear Archive"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <GlassCard className="p-6 border-red-500/20">
                    <div className="text-xs text-muted uppercase tracking-wider font-bold mb-2">Total Archived</div>
                    <div className="text-3xl font-black text-red-500">{archive.length}</div>
                </GlassCard>
                <GlassCard className="p-6 border-amber-500/20">
                    <div className="text-xs text-muted uppercase tracking-wider font-bold mb-2">This Week</div>
                    <div className="text-3xl font-black text-amber-500">{thisWeekCount}</div>
                </GlassCard>
                <GlassCard className="p-6 border-emerald-500/20">
                    <div className="text-xs text-muted uppercase tracking-wider font-bold mb-2">Storage Used</div>
                    <div className="text-3xl font-black text-emerald-500">
                        {(JSON.stringify(archive).length / 1024).toFixed(1)} KB
                    </div>
                </GlassCard>
            </div>

            {/* Table */}
            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-surface/90 backdrop-blur-xl border-b border-white/10 z-10">
                            <tr>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap">Attack Time</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Topic</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Payload</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap">Archived At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {displayArchive.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-16 text-center text-muted">
                                            <ShieldAlert size={40} className="mx-auto mb-4 opacity-20" />
                                            <p className="font-medium">No severe threats archived</p>
                                            <p className="text-sm mt-1 opacity-60">High-severity events will appear here automatically</p>
                                        </td>
                                    </tr>
                                ) : (
                                    displayArchive.map((threat, index) => (
                                        <motion.tr
                                            key={threat.id || index}
                                            initial={{ opacity: 0, x: -16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: Math.min(index * 0.02, 0.3) }}
                                            className="hover:bg-red-500/5 transition-colors group"
                                        >
                                            <td className="p-4 text-sm text-muted font-mono whitespace-nowrap">
                                                {formatTimestamp(threat.timestamp)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle size={14} className="text-red-500 flex-shrink-0" />
                                                    <span className="text-sm text-white font-medium truncate max-w-[200px]">{threat.topic}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted font-mono max-w-sm truncate group-hover:whitespace-normal group-hover:break-all transition-all">
                                                {threat.payload || '—'}
                                            </td>
                                            <td className="p-4 text-xs text-muted font-mono whitespace-nowrap">
                                                {threat.archivedAt
                                                    ? new Date(threat.archivedAt).toLocaleString('en-US', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                                                    : '—'}
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
};

export default SevereThreatsArchive;
