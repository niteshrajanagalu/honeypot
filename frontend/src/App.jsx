import React, { useState } from 'react';
import { LayoutDashboard, Shield, Share2, Settings, Activity, Menu, Globe, Archive, WifiOff } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import AttackLogs from './pages/AttackLogs';
import NetworkMap from './pages/NetworkMap';
import SettingsPage from './pages/SettingsPage';
import Peers from './pages/Peers';
import SevereThreatsArchive from './pages/SevereThreatsArchive';
import { SocketProvider, useSocket } from './context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center h-screen bg-[#0f172a] text-white">
                    <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl max-w-md text-center">
                        <h1 className="text-2xl font-bold text-red-500 mb-4">System Malfunction</h1>
                        <p className="text-muted mb-4">The interface encountered a critical error.</p>
                        <pre className="text-xs bg-black/50 p-4 rounded text-left overflow-auto mb-6 font-mono text-red-400">
                            {this.state.error && this.state.error.toString()}
                        </pre>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-bold transition-colors"
                        >
                            Reboot System
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

// Disconnection banner — reads socket state inside provider
const DisconnectBanner = () => {
    const { isConnected } = useSocket();
    return (
        <AnimatePresence>
            {!isConnected && (
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    className="absolute top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-red-500/90 backdrop-blur-md py-2 text-white text-sm font-bold tracking-wide shadow-lg"
                >
                    <WifiOff size={14} />
                    COLLECTOR OFFLINE — Attempting to reconnect…
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const App = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'logs': return <AttackLogs />;
            case 'archive': return <SevereThreatsArchive />;
            case 'peers': return <Peers />;
            case 'map': return <NetworkMap />;
            case 'settings': return <SettingsPage />;
            default: return <Dashboard />;
        }
    };

    const NavItem = ({ id, icon: Icon, label }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden',
                activeTab === id
                    ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(59,130,246,0.15)] border border-primary/20'
                    : 'text-muted hover:text-white hover:bg-white/5'
            )}
        >
            {activeTab === id && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
            )}
            <Icon
                size={20}
                className={cn(
                    'relative z-10 flex-shrink-0 transition-transform group-hover:scale-110',
                    activeTab === id && 'text-primary'
                )}
            />
            {/* Only hide label text, keep icon visible when collapsed */}
            <span className={cn('relative z-10 font-medium tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300', !isSidebarOpen && 'hidden')}>
                {label}
            </span>
            {activeTab === id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_10px_#3b82f6]" />
            )}
        </button>
    );

    return (
        <ErrorBoundary>
            <SocketProvider>
                <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden font-sans selection:bg-primary/30">
                    {/* Glassmorphic Sidebar */}
                    <motion.div
                        initial={false}
                        animate={{ width: isSidebarOpen ? 280 : 72 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="relative z-50 flex flex-col border-r border-white/5 bg-surface/30 backdrop-blur-xl shadow-2xl flex-shrink-0"
                    >
                        <div className="p-4 flex items-center justify-between gap-2 min-h-[72px]">
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="flex items-center gap-3 overflow-hidden"
                                    >
                                        <div className="p-2 bg-primary/20 rounded-lg border border-primary/30 flex-shrink-0">
                                            <Shield className="text-primary" size={20} />
                                        </div>
                                        <div className="overflow-hidden">
                                            <h1 className="font-black text-base tracking-tight text-white leading-none">
                                                SENTINEL<span className="text-primary">IoT</span>
                                            </h1>
                                            <p className="text-[10px] text-primary/80 font-mono tracking-wider mt-0.5">HONEYPOT SYSTEM</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={cn(
                                    'p-2 hover:bg-white/5 rounded-lg text-muted hover:text-white transition-colors flex-shrink-0',
                                    !isSidebarOpen && 'mx-auto'
                                )}
                                title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                            >
                                {isSidebarOpen ? <Menu size={20} /> : <Shield size={20} className="text-primary" />}
                            </button>
                        </div>

                        <nav className="flex-1 px-3 space-y-1 mt-2">
                            <NavItem id="dashboard" icon={LayoutDashboard} label="Command Center" />
                            <NavItem id="logs" icon={Activity} label="Activity Logs" />
                            <NavItem id="archive" icon={Archive} label="Threat Archive" />
                            <NavItem id="peers" icon={Globe} label="Network Nodes" />
                            <NavItem id="map" icon={Share2} label="Topology Map" />
                            <NavItem id="settings" icon={Settings} label="System Config" />
                        </nav>

                        <div className="p-3 border-t border-white/5">
                            <AnimatePresence>
                                {isSidebarOpen && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-white/5"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute inset-0" />
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 relative" />
                                            </div>
                                            <span className="text-xs font-bold text-emerald-500 tracking-wider">SYSTEM ONLINE</span>
                                        </div>
                                        <div className="text-[10px] text-muted font-mono">
                                            v2.4.0 — IIoT Honeypot
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Main Content Area */}
                    <main className="flex-1 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
                        <DisconnectBanner />
                        <div className="absolute inset-0 opacity-20 pointer-events-none"
                            style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E\")" }}
                        />
                        <div className="h-full overflow-y-auto p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="max-w-7xl mx-auto"
                                >
                                    {renderContent()}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </main>
                </div>
            </SocketProvider>
        </ErrorBoundary>
    );
};

export default App;
