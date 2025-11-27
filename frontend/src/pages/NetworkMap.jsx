import React, { useState } from 'react';
import { GlassCard } from '../components/UIComponents';
import { Share2, ZoomIn, ZoomOut, Maximize2, Info } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import TopologyGraph from '../components/TopologyGraph';
import { motion, AnimatePresence } from 'framer-motion';

const NetworkMap = () => {
    const { nodeId, peers, attacks, isConnected } = useSocket();
    const [showLegend, setShowLegend] = useState(true);

    const stats = {
        totalNodes: 1 + Object.keys(peers).length,
        attackers: new Set(attacks.filter(a => a.source_ip).map(a => a.source_ip)).size,
        connections: Object.keys(peers).length + attacks.filter(a => a.source_ip).length,
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                        <Share2 className="text-indigo-500" />
                        TOPOLOGY MAP
                    </h2>
                    <p className="text-muted">Visual representation of the honeypot mesh network</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        <span className="text-muted">{isConnected ? 'Live' : 'Disconnected'}</span>
                    </div>
                    <button
                        onClick={() => setShowLegend(!showLegend)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                    >
                        <Info size={20} className="text-white" />
                    </button>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-3 gap-4">
                <GlassCard className="p-4">
                    <div className="text-muted text-sm">Total Nodes</div>
                    <div className="text-2xl font-bold text-white mt-1">{stats.totalNodes}</div>
                </GlassCard>
                <GlassCard className="p-4">
                    <div className="text-muted text-sm">Active Attackers</div>
                    <div className="text-2xl font-bold text-red-500 mt-1">{stats.attackers}</div>
                </GlassCard>
                <GlassCard className="p-4">
                    <div className="text-muted text-sm">Total Connections</div>
                    <div className="text-2xl font-bold text-blue-500 mt-1">{stats.connections}</div>
                </GlassCard>
            </div>

            {/* Main Graph */}
            <GlassCard className="flex-1 relative overflow-hidden min-h-[600px]">
                {/* Background grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                {/* Radial gradient overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-50"></div>

                {/* Graph Container */}
                <div className="absolute inset-0">
                    <TopologyGraph
                        nodeId={nodeId}
                        peers={peers}
                        attacks={attacks}
                    />
                </div>

                {/* Legend */}
                <AnimatePresence>
                    {showLegend && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute top-4 right-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
                        >
                            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                <Info size={16} />
                                Legend
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-indigo-500 border-2 border-white"></div>
                                    <span className="text-xs text-muted">Local Honeypot</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-xs text-muted">Peer Nodes</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <span className="text-xs text-muted">High Severity</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                                    <span className="text-xs text-muted">Medium Severity</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                    <span className="text-xs text-muted">Low Severity</span>
                                </div>
                                <div className="pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-0.5 bg-blue-500/50"></div>
                                        <span className="text-xs text-muted">Mesh Link</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-0.5 bg-red-500/50 border-dashed"></div>
                                        <span className="text-xs text-muted">Attack Vector</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-white/10">
                                <p className="text-xs text-muted/70">
                                    • Click nodes to focus<br />
                                    • Drag to reposition<br />
                                    • Scroll to zoom<br />
                                    • Particles show attacks
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Controls Hint */}
                <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2">
                    <p className="text-xs text-muted flex items-center gap-2">
                        <Maximize2 size={14} />
                        Drag to pan • Scroll to zoom • Click nodes for details
                    </p>
                </div>
            </GlassCard>
        </div>
    );
};

export default NetworkMap;
