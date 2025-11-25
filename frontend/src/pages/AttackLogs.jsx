import React, { useState } from 'react';
import { Search, Filter, Download, Trash2 } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const AttackLogs = () => {
    const { attacks } = useSocket();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAttacks = attacks.filter(attack =>
        attack.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attack.payload.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearLogs = () => {
        if (window.confirm('Clear all activity logs? This will only clear the frontend display, not the backend.')) {
            window.location.reload();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">MQTT ACTIVITY LOGS</h2>
                    <p className="text-sm text-gray-500 mt-1">All MQTT messages captured by the honeypot</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-surface border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary w-full md:w-64"
                        />
                    </div>
                    <button className="p-2 bg-surface border border-gray-800 rounded-lg hover:bg-gray-800 text-gray-400">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 text-primary">
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={clearLogs} className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-red-500" title="Clear logs">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-background/50 text-gray-400 uppercase text-xs">
                            <tr>
                                <th className="px-6 py-4 font-medium">Timestamp</th>
                                <th className="px-6 py-4 font-medium">Topic</th>
                                <th className="px-6 py-4 font-medium">Payload</th>
                                <th className="px-6 py-4 font-medium">Source</th>
                                <th className="px-6 py-4 font-medium">Type</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {filteredAttacks.map((log) => (
                                <tr key={log.id} className="hover:bg-background/50 transition-colors">
                                    <td className="px-6 py-4 text-gray-300 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-blue-400">{log.topic}</td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-xs max-w-xs truncate">{log.payload}</td>
                                    <td className="px-6 py-4 text-gray-300 font-mono text-xs">{log.node_id || 'External'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${log.payload.includes('heartbeat')
                                                ? 'bg-blue-500/10 text-blue-500'
                                                : log.severity === 'High'
                                                    ? 'bg-red-500/10 text-red-500'
                                                    : 'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                            {log.payload.includes('heartbeat') ? 'TEST' : log.severity.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredAttacks.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        {searchTerm ? 'No matching messages found' : 'No MQTT messages captured yet'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AttackLogs;

