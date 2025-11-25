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
    const wsRef = useRef(null);

    useEffect(() => {
        const connectWebSocket = () => {
            // Use window.location.hostname for browser access, fallback to collector for Docker
            const wsHost = window.location.hostname === 'localhost' ? 'localhost' : 'collector';
            const ws = new WebSocket(`ws://${wsHost}:8000/ws`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
            };

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);

                switch (message.type) {
                    case 'INIT':
                        setNodeId(message.node_id);
                        setPeers(message.peers || {});
                        setAttacks(message.attacks || []);
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

                    default:
                        console.log('Unknown message type:', message.type);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected, reconnecting...');
                setIsConnected(false);
                setTimeout(connectWebSocket, 3000);
            };
        };

        connectWebSocket();

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const value = {
        nodeId,
        peers,
        attacks,
        isConnected,
    };

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
};
