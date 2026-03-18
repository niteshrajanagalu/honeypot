import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ShieldAlert, Activity, Server, Globe, Zap, Shield, Wifi, Clock } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { GlassCard, AnimatedStat, PulseBadge } from '../components/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';

const truncate = (str, len = 50) => {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '…' : str;
};

const Dashboard = () => {
    const { attacks, peers, startTime } = useSocket();
    const [uptime, setUptime] = useState('--:--:--');

    // Live uptime counter
    useEffect(() => {
        if (!startTime) return;

        const tick = () => {
            const diff = Date.now() - startTime;
            const h = Math.floor(diff / 3_600_000);
            const m = Math.floor((diff % 3_600_000) / 60_000);
            const s = Math.floor((diff % 60_000) / 1_000);
            setUptime(
                `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
            );
        };

        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    // 24-hour traffic chart
    const chartData = useMemo(() => {
        const now = new Date();
        const hours = Array.from({ length: 24 }, (_, i) => {
            const hour = new Date(now);
            hour.setHours(now.getHours() - (23 - i), 0, 0, 0);
            return {
                name: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
                attacks: 0,
                high: 0,
                timestamp: hour.getTime(),
            };
        });

        attacks.forEach(attack => {
            const attackTime = new Date(attack.timestamp).getTime();
            const bucket = hours.find(h => attackTime >= h.timestamp && attackTime < h.timestamp + 3_600_000);
            if (bucket) {
                bucket.attacks++;
                if (attack.severity === 'High') bucket.high++;
            }
        });

        return hours;
    }, [attacks]);

    const stats = useMemo(() => {
        const highSeverity = attacks.filter(a => a.severity === 'High').length;
        const heartbeats = attacks.filter(a => a.payload?.includes('heartbeat')).length;
        return {
            totalMessages: attacks.length,
            highSeverity,
            heartbeats,
            peersCount: Object.keys(peers).length,
        };
    }, [attacks, peers]);

    const highThreats = attacks.filter(a => a.severity === 'High').slice(0, 5);
    const liveTraffic = attacks.filter(a => a.severity !== 'High').slice(0, 5);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">COMMAND CENTER</h2>
                    <p className="text-muted">Real-time Threat Intelligence & Mesh Monitoring</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <Clock size={16} className="text-blue-400" />
                        <span className="text-blue-100 font-mono font-bold">{uptime}</span>
                    </div>
                    <PulseBadge status="online" text="SYSTEM ACTIVE" />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatedStat icon={<ShieldAlert />} label="Total Interceptions" value={stats.totalMessages} trend="+12%" color="blue" />
                <AnimatedStat icon={<Zap />} label="Critical Threats" value={stats.highSeverity} trend="+5%" color="red" />
                <AnimatedStat icon={<Server />} label="Heartbeats" value={stats.heartbeats} color="indigo" />
                <AnimatedStat icon={<Globe />} label="Active Nodes" value={stats.peersCount} color="green" />
            </div>

            {/* Traffic Chart */}
            <GlassCard className="p-8">
                <div className="mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Activity className="text-blue-500" />
                        24h Traffic Analysis
                    </h3>
                    <p className="text-sm text-muted mt-1">All intercepted MQTT events over the last 24 hours</p>
                </div>
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="gradAll" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="gradHigh" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                            <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} interval={3} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '12px' }}
                                itemStyle={{ color: '#94a3b8' }}
                            />
                            <Area type="monotone" dataKey="attacks" name="All Events" stroke="#3b82f6" strokeWidth={2} fill="url(#gradAll)" />
                            <Area type="monotone" dataKey="high" name="High Severity" stroke="#ef4444" strokeWidth={2} fill="url(#gradHigh)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* High Priority Threats */}
                <GlassCard className="p-0 border-red-500/20 flex flex-col">
                    <div className="p-6 border-b border-white/5 bg-red-500/5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="text-red-500" />
                            Active Threats
                            {highThreats.length > 0 && (
                                <span className="ml-auto text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                                    {stats.highSeverity}
                                </span>
                            )}
                        </h3>
                    </div>
                    <div className="p-6 space-y-3 flex-1">
                        <AnimatePresence mode="popLayout">
                            {highThreats.map((attack, i) => (
                                <motion.div
                                    key={attack.id || i}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 16 }}
                                    layout
                                    className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/20"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="p-2 bg-red-500/20 rounded-xl text-red-500 flex-shrink-0">
                                            <ShieldAlert size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-bold text-red-200 truncate">{attack.topic}</div>
                                            <div className="text-xs text-red-400/80 font-mono mt-0.5 truncate">
                                                {truncate(attack.payload, 45)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full flex-shrink-0 ml-2">
                                        {new Date(attack.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {highThreats.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-muted">
                                <Shield size={40} className="mb-3 opacity-20" />
                                <p className="text-sm">No active threats detected</p>
                            </div>
                        )}
                    </div>
                </GlassCard>

                {/* Live Traffic */}
                <GlassCard className="p-0 flex flex-col">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Wifi className="text-blue-500" />
                            Live Traffic
                        </h3>
                    </div>
                    <div className="p-6 space-y-3 flex-1">
                        <AnimatePresence mode="popLayout">
                            {liveTraffic.map((attack, i) => (
                                <motion.div
                                    key={attack.id || i}
                                    initial={{ opacity: 0, x: -16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    layout
                                    className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/8 transition-colors"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${attack.payload?.includes('heartbeat') ? 'bg-indigo-500' : 'bg-amber-500'}`} />
                                        <div className="min-w-0">
                                            <div className="font-semibold text-white truncate">{attack.topic}</div>
                                            <div className="text-xs text-muted font-mono mt-0.5 truncate">
                                                {truncate(attack.payload, 45)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted font-medium flex-shrink-0 ml-2">
                                        {new Date(attack.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {liveTraffic.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-muted">
                                <Wifi size={40} className="mb-3 opacity-20" />
                                <p className="text-sm">No traffic yet — waiting for events</p>
                            </div>
                        )}
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default Dashboard;
