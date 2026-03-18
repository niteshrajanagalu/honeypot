import React, { createContext, useContext, useEffect, useState, useRef } from 'react';

const SocketContext = createContext();

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within SocketProvider');
    }
    return context;
};

export const SocketProvider = ({ children }) => {
    const [nodeId, setNodeId] = useState('LOCAL-01');
    const [peers, setPeers] = useState({});
    const [attacks, setAttacks] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [startTime, setStartTime] = useState(null);
    const wsRef = useRef(null);
    const isMountedRef = useRef(true);
    const reconnectTimerRef = useRef(null);

    useEffect(() => {
        isMountedRef.current = true;

        const connectWebSocket = () => {
            if (!isMountedRef.current) return;

            // Always connect via the browser's current host (works for localhost dev and Docker port-forwarding)
            const wsHost = window.location.hostname || 'localhost';
            const ws = new WebSocket(`ws://${wsHost}:8000/ws`);
            wsRef.current = ws;

            ws.onopen = () => {
                if (!isMountedRef.current) return;
                console.log('WebSocket connected');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                if (!isMountedRef.current) return;
                try {
                    const message = JSON.parse(event.data);

                    switch (message.type) {
                        case 'INIT':
                            setNodeId(message.node_id);
                            setPeers(message.peers || {});
                            setAttacks(message.attacks || []);
                            if (message.start_time) {
                                setStartTime(message.start_time * 1000);
                            }
                            break;

                        case 'NEW_ATTACK':
                            setAttacks(prev => [message.data, ...prev].slice(0, 100));
                            break;

                        case 'PEER_UPDATE':
                            setPeers(prev => ({
                                ...prev,
                                [message.peer_id]: message.data
                            }));
                            break;

                        case 'PEER_REMOVED':
                            setPeers(prev => {
                                const next = { ...prev };
                                delete next[message.peer_id];
                                return next;
                            });
                            break;

                        default:
                            console.log('Unknown message type:', message.type);
                    }
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };

            ws.onerror = () => {
                if (!isMountedRef.current) return;
                setIsConnected(false);
            };

            ws.onclose = () => {
                if (!isMountedRef.current) return;
                console.log('WebSocket disconnected, reconnecting in 3s...');
                setIsConnected(false);
                reconnectTimerRef.current = setTimeout(connectWebSocket, 3000);
            };
        };

        connectWebSocket();

        return () => {
            isMountedRef.current = false;
            clearTimeout(reconnectTimerRef.current);
            if (wsRef.current) {
                wsRef.current.onclose = null; // prevent reconnect trigger on intentional close
                wsRef.current.close();
            }
        };
    }, []);

    const value = {
        nodeId,
        peers,
        attacks,
        isConnected,
        startTime,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
