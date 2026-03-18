import React, { useState, useMemo } from 'react';
import { GlassCard } from '../components/UIComponents';
import { Share2, Maximize2, Info } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import TopologyGraph from '../components/TopologyGraph';
import { motion, AnimatePresence } from 'framer-motion';

const NetworkMap = () => {
    const { nodeId, peers, attacks, isConnected } = useSocket();
    const [showLegend, setShowLegend] = useState(true);

    const stats = useMemo(() => {
        const peerCount = Object.keys(peers).length;
        // Unique attacker IPs (only attacks that have a source_ip)
        const uniqueAttackers = new Set(
            attacks.filter(a => a.source_ip).map(a => a.source_ip)
        ).size;
        // Unique connections: each peer is 1, each unique attacker IP is 1
        const totalConnections = peerCount + uniqueAttackers;
        return {
            totalNodes: 1 + peerCount,
            attackers: uniqueAttackers,
            connections: totalConnections,
        };
    }, [peers, attacks]);

    return (
        <div className="h-full flex flex-col space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Share2 className="text-indigo-500" />
                        TOPOLOGY MAP
                    </h2>
                    <p className="text-muted">Visual representation of the honeypot mesh network</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-muted">{isConnected ? 'Live' : 'Disconnected'}</span>
                    </div>
                    <button
                        onClick={() => setShowLegend(v => !v)}
                        className={`p-2 rounded-xl border transition-colors ${showLegend ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}
                        title="Toggle legend"
                    >
                        <Info size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-4 text-center">
                    <div className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Total Nodes</div>
                    <div className="text-2xl font-black text-white">{stats.totalNodes}</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                    <div className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Active Attackers</div>
                    <div className="text-2xl font-black text-red-500">{stats.attackers}</div>
                </GlassCard>
                <GlassCard className="p-4 text-center">
                    <div className="text-xs text-muted uppercase tracking-wider font-bold mb-1">Unique Connections</div>
                    <div className="text-2xl font-black text-blue-500">{stats.connections}</div>
                </GlassCard>
            </div>

            {/* Main Graph */}
            <GlassCard className="flex-1 relative overflow-hidden min-h-[540px]">
                {/* Background grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
                {/* Radial glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50 pointer-events-none" />

                {/* Graph */}
                <div className="absolute inset-0">
                    <TopologyGraph nodeId={nodeId} peers={peers} attacks={attacks} />
                </div>

                {/* Legend */}
                <AnimatePresence>
                    {showLegend && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute top-4 right-4 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl w-48"
                        >
                            <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <Info size={13} />
                                Legend
                            </h3>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white flex-shrink-0" />
                                    <span className="text-xs text-muted">Local Honeypot</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                                    <span className="text-xs text-muted">Peer Nodes</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                                    <span className="text-xs text-muted">High Severity</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" />
                                    <span className="text-xs text-muted">Medium Severity</span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                                    <span className="text-xs text-muted">Low Severity</span>
                                </div>
                                <div className="pt-2.5 border-t border-white/10 space-y-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 h-0.5 bg-blue-500/50 flex-shrink-0" />
                                        <span className="text-xs text-muted">Mesh Link</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-6 border-t border-dashed border-red-500/50 flex-shrink-0" />
                                        <span className="text-xs text-muted">Attack Vector</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-muted/60 leading-relaxed">
                                Click node to focus<br />
                                Drag to reposition<br />
                                Scroll to zoom
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Controls hint */}
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2">
                    <p className="text-xs text-muted flex items-center gap-2">
                        <Maximize2 size={12} />
                        Drag · Scroll to zoom · Click to focus
                    </p>
                </div>
            </GlassCard>
        </div>
    );
};

export default NetworkMap;
