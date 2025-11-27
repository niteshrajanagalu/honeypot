import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, Download, AlertTriangle } from 'lucide-react';
import { GlassCard } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimestamp } from '../utils/dateUtils';
import { useSocket } from '../context/SocketContext';

const SevereThreatsArchive = () => {
    const { attacks } = useSocket();
    const [archive, setArchive] = useState([]);
    const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'

    // Load archive from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('severeThreatsArchive');
        if (stored) {
            try {
                setArchive(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to load archive:', e);
            }
        }
    }, []);

    // Monitor for new high-severity attacks and archive them
    useEffect(() => {
        const highSeverityAttacks = attacks.filter(a => a.severity === 'High');

        highSeverityAttacks.forEach(attack => {
            // Check if already archived (by id or timestamp+topic combo)
            const exists = archive.some(
                archived => archived.id === attack.id ||
                    (archived.timestamp === attack.timestamp && archived.topic === attack.topic)
            );

            if (!exists) {
                const newArchive = [...archive, { ...attack, archivedAt: new Date().toISOString() }];
                setArchive(newArchive);
                localStorage.setItem('severeThreatsArchive', JSON.stringify(newArchive));
            }
        });
    }, [attacks, archive]);

    const clearArchive = () => {
        if (window.confirm('Are you sure you want to clear the entire severe threats archive? This cannot be undone.')) {
            setArchive([]);
            localStorage.removeItem('severeThreatsArchive');
        }
    };

    const exportArchive = () => {
        const dataStr = JSON.stringify(archive, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `severe-threats-archive-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const filteredArchive = archive.filter(threat => {
        const now = new Date();

        if (filter === 'today') {
            // For "today" filter, use archivedAt (when it was saved to archive)
            if (!threat.archivedAt) return false;

            const archivedDate = new Date(threat.archivedAt);
            const archivedDateOnly = new Date(archivedDate.getFullYear(), archivedDate.getMonth(), archivedDate.getDate());
            const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return archivedDateOnly.getTime() === nowDateOnly.getTime();
        } else if (filter === 'week') {
            // For "week" filter, use attack timestamp (when attack occurred)
            let threatDate;
            if (typeof threat.timestamp === 'string') {
                threatDate = new Date(threat.timestamp);
            } else if (typeof threat.timestamp === 'number') {
                threatDate = threat.timestamp < 1000000000000
                    ? new Date(threat.timestamp * 1000)
                    : new Date(threat.timestamp);
            } else {
                return false;
            }

            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return threatDate >= weekAgo;
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <ShieldAlert className="text-red-500" />
                        SEVERE THREATS ARCHIVE
                    </h2>
                    <p className="text-sm text-muted mt-1">Permanent storage of all high-severity security incidents</p>
                </div>
                <div className="flex gap-2 items-center">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-surface/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50"
                    >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">Last 7 Days</option>
                    </select>
                    <button
                        onClick={exportArchive}
                        className="p-2 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                        title="Export Archive"
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-6 border-red-500/20">
                    <div className="text-xs text-muted uppercase tracking-wider font-bold mb-2">Total Archived</div>
                    <div className="text-3xl font-black text-red-500">{archive.length}</div>
                </GlassCard>
                <GlassCard className="p-6 border-amber-500/20">
                    <div className="text-xs text-muted uppercase tracking-wider font-bold mb-2">This Week</div>
                    <div className="text-3xl font-black text-amber-500">
                        {archive.filter(t => {
                            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                            return new Date(t.timestamp) >= weekAgo;
                        }).length}
                    </div>
                </GlassCard>
                <GlassCard className="p-6 border-emerald-500/20">
                    <div className="text-xs text-muted uppercase tracking-wider font-bold mb-2">Storage Used</div>
                    <div className="text-3xl font-black text-emerald-500">
                        {(JSON.stringify(archive).length / 1024).toFixed(1)} KB
                    </div>
                </GlassCard>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 bg-surface/90 backdrop-blur-xl border-b border-white/10 z-10">
                            <tr>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Timestamp</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Topic</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Payload</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Archived</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredArchive.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-muted">
                                            <ShieldAlert size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>No severe threats archived yet</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredArchive.reverse().map((threat, index) => (
                                        <motion.tr
                                            key={threat.id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="hover:bg-red-500/5 transition-colors group"
                                        >
                                            <td className="p-4 text-sm text-muted font-mono whitespace-nowrap">
                                                {formatTimestamp(threat.timestamp)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <AlertTriangle size={16} className="text-red-500" />
                                                    <span className="text-sm text-white font-medium">{threat.topic}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-muted font-mono max-w-md truncate group-hover:whitespace-normal group-hover:break-all transition-all">
                                                {threat.payload}
                                            </td>
                                            <td className="p-4 text-xs text-muted font-mono whitespace-nowrap">
                                                {new Date(threat.archivedAt).toLocaleDateString()}
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
