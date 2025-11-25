import { useSocket } from '../context/SocketContext';

const NetworkMap = () => {
    const { peers } = useSocket();
    const peerCount = Object.keys(peers).length;

    return (
        <div className="h-[calc(100vh-12rem)] bg-surface rounded-xl border border-gray-800 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-10">
                {Array.from({ length: 400 }).map((_, i) => (
                    <div key={i} className="border border-primary/20"></div>
                ))}
            </div>

            <div className="text-center z-10">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <div className="w-8 h-8 bg-primary rounded-full"></div>
                </div>
                <h3 className="text-xl font-bold text-white">Network Topology</h3>
                <p className="text-gray-500 mt-2">Visualizing {peerCount} active nodes...</p>
            </div>
        </div>
    );
};

export default NetworkMap;
