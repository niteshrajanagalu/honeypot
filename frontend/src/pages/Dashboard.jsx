import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ShieldAlert, Activity, Server, Globe } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const Dashboard = () => {
    const { attacks, peers } = useSocket();

    // Generate chart data from attacks
    const chartData = useMemo(() => {
        const now = new Date();
        const hours = Array.from({ length: 24 }, (_, i) => {
            const hour = new Date(now);
            hour.setHours(now.getHours() - (23 - i), 0, 0, 0);
            return {
                name: hour.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                attacks: 0,
                timestamp: hour.getTime()
            };
        });

        attacks.forEach(attack => {
            const attackTime = new Date(attack.timestamp).getTime();
            const bucket = hours.find(h => {
                const nextHour = h.timestamp + 3600000;
                return attackTime >= h.timestamp && attackTime < nextHour;
            });
            if (bucket) bucket.attacks++;
        });

        return hours;
    }, [attacks]);

    const stats = useMemo(() => {
        const highSeverity = attacks.filter(a => a.severity === 'High').length;
        const testMessages = attacks.filter(a => a.payload.includes('heartbeat')).length;
        return {
            totalMessages: attacks.length,
            highSeverity: highSeverity,
            testMessages: testMessages,
            realAttacks: attacks.length - testMessages,
            peersCount: Object.keys(peers).length
        };
    }, [attacks, peers]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">SYSTEM OVERVIEW</h2>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<ShieldAlert className="text-secondary" />} label="Total Messages" value={stats.totalMessages} />
                <StatCard icon={<Activity className="text-primary" />} label="High Severity" value={stats.highSeverity} />
                <StatCard icon={<Server className="text-blue-500" />} label="Test Messages" value={stats.testMessages} />
                <StatCard icon={<Globe className="text-green-500" />} label="Active Peers" value={stats.peersCount} />
            </div>

            {/* Main Chart */}
            <div className="bg-surface p-6 rounded-xl border border-gray-800 shadow-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-300">MQTT Activity (24h)</h3>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D32F2F" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#D32F2F" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" vertical={false} />
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1E1E1E', borderColor: '#333', color: '#E0E0E0' }}
                                itemStyle={{ color: '#FFB300' }}
                            />
                            <Area type="monotone" dataKey="attacks" stroke="#D32F2F" fillOpacity={1} fill="url(#colorAttacks)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-surface p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-semibold mb-4 text-gray-300">Recent Messages</h3>
                    <div className="space-y-4">
                        {attacks.slice(0, 5).map((attack, i) => (
                            <div key={attack.id || i} className="flex items-center justify-between p-3 bg-background/50 rounded border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${attack.payload.includes('heartbeat') ? 'bg-blue-500' :
                                            attack.severity === 'High' ? 'bg-secondary' : 'bg-yellow-500'
                                        }`}></div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{attack.topic}</div>
                                        <div className="text-xs text-gray-500">{attack.payload.substring(0, 40)}...</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">{new Date(attack.timestamp).toLocaleTimeString()}</div>
                            </div>
                        ))}
                        {attacks.length === 0 && (
                            <div className="text-center text-gray-500 py-4">No messages captured yet</div>
                        )}
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-gray-800">
                    <h3 className="text-lg font-semibold mb-4 text-gray-300">Active Peers</h3>
                    <div className="space-y-3">
                        {Object.entries(peers).map(([id, peer]) => (
                            <div key={id} className="flex items-center justify-between p-3 bg-background/50 rounded border border-gray-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <div>
                                        <div className="text-sm font-medium text-white">{peer.node_id || id}</div>
                                        <div className="text-xs text-gray-500">{peer.ip || 'Unknown IP'}</div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {peer.timestamp ? new Date(peer.timestamp * 1000).toLocaleTimeString() : 'N/A'}
                                </div>
                            </div>
                        ))}
                        {Object.keys(peers).length === 0 && (
                            <div className="text-center text-gray-500 py-4">No peers discovered yet</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, label, value }) => (
    <div className="bg-surface p-5 rounded-xl border border-gray-800 hover:border-gray-700 transition-colors">
        <div className="flex justify-between items-start mb-2">
            <div className="p-2 bg-background rounded-lg">{icon}</div>
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
    </div>
);

export default Dashboard;
