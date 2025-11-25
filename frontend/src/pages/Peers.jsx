import React from 'react';
import { Server, Wifi, WifiOff } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const Peers = () => {
    const { peers } = useSocket();
    const peerArray = Object.entries(peers).map(([id, data]) => ({
        id: data.node_id || id,
        status: data.status || 'offline',
        ip: data.ip || 'Unknown',
        timestamp: data.timestamp || Date.now()
    }));

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">NETWORK PEERS</h2>

            {peerArray.length === 0 && (
                <div className="bg-surface p-12 rounded-xl border border-gray-800 text-center">
                    <p className="text-gray-500">No peers discovered yet. Waiting for peer announcements...</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {peerArray.map((peer) => (
                    <div key={peer.id} className="bg-surface p-6 rounded-xl border border-gray-800 relative overflow-hidden group hover:border-primary/50 transition-colors">
                        <div className={`absolute top-0 right-0 p-2 ${peer.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                            {peer.status === 'online' ? <Wifi size={20} /> : <WifiOff size={20} />}
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-background rounded-lg border border-gray-800 group-hover:border-primary/30 transition-colors">
                                <Server className="text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div>
                                <div className="font-bold text-lg text-white">{peer.id}</div>
                                <div className="text-xs text-gray-500 font-mono">{peer.ip}</div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-sm border-t border-gray-800 pt-4 mt-2">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-medium ${peer.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                                {peer.status.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mt-2">
                            <span className="text-gray-500">Last Seen</span>
                            <span className="text-gray-300 font-mono text-xs">{new Date(peer.timestamp * 1000).toLocaleTimeString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Peers;
