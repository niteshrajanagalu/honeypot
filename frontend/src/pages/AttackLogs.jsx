import React, { useState } from 'react';
import { Search, AlertTriangle, Info, Activity } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { GlassCard } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTimestamp } from '../utils/dateUtils';

const AttackLogs = () => {
    const { attacks } = useSocket();
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');

    const filteredAttacks = attacks.filter(attack => {
        const matchesSearch =
            attack.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attack.payload?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            attack.node_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity =
            severityFilter === 'all' || attack.severity === severityFilter;
        return matchesSearch && matchesSeverity;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Activity className="text-blue-500" />
                        ACTIVITY LOGS
                    </h2>
                    <p className="text-sm text-muted mt-1">
                        Comprehensive audit trail — {filteredAttacks.length} of {attacks.length} events
                    </p>
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                    {/* Severity filter */}
                    <select
                        value={severityFilter}
                        onChange={e => setSeverityFilter(e.target.value)}
                        className="bg-surface/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                    >
                        <option value="all">All Severity</option>
                        <option value="High">High</option>
                        <option value="Low">Low</option>
                    </select>
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={15} />
                        <input
                            type="text"
                            placeholder="Search topic, payload, node…"
                            className="bg-surface/50 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors w-56"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <GlassCard className="p-0 overflow-hidden">
                <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-surface/90 backdrop-blur-xl">
                            <tr className="border-b border-white/10">
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap">Timestamp</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Severity</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Topic</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider">Payload</th>
                                <th className="p-4 text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap">Source Node</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <AnimatePresence>
                                {filteredAttacks.map((attack, index) => (
                                    <motion.tr
                                        key={attack.id || index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="p-4 text-sm text-muted font-mono whitespace-nowrap">
                                            {formatTimestamp(attack.timestamp)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                                attack.severity === 'High'
                                                    ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                                {attack.severity === 'High'
                                                    ? <AlertTriangle size={11} />
                                                    : <Info size={11} />}
                                                {attack.severity}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-white font-medium max-w-[160px] truncate">
                                            {attack.topic}
                                        </td>
                                        <td className="p-4 text-sm text-muted font-mono max-w-sm truncate group-hover:whitespace-normal group-hover:break-all transition-all">
                                            {attack.payload || '—'}
                                        </td>
                                        <td className="p-4 text-sm text-muted font-mono">
                                            {attack.node_id || '—'}
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredAttacks.length === 0 && (
                        <div className="p-16 text-center text-muted">
                            <Search size={40} className="mx-auto mb-4 opacity-20" />
                            <p className="font-medium">No events match your filters</p>
                            <p className="text-sm mt-1 opacity-60">Try adjusting your search or severity filter</p>
                        </div>
                    )}
                </div>
            </GlassCard>
        </div>
    );
};

export default AttackLogs;
