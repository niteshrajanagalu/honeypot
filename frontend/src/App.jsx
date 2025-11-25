import React, { useState } from 'react';
import { Activity, Shield, Users, Settings, Menu, X } from 'lucide-react';
import { SocketProvider, useSocket } from './context/SocketContext';
import Dashboard from './pages/Dashboard';
import NetworkMap from './pages/NetworkMap';
import AttackLogs from './pages/AttackLogs';
import Peers from './pages/Peers';
import SettingsPage from './pages/SettingsPage';

function AppContent() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { nodeId, isConnected } = useSocket();

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'network': return <NetworkMap />;
            case 'logs': return <AttackLogs />;
            case 'peers': return <Peers />;
            case 'settings': return <SettingsPage />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-background text-text overflow-hidden">
            {/* Sidebar */}
            <aside className={`fixed md:relative z-20 h-full w-64 bg-surface border-r border-gray-800 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col`}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary" />
                        <h1 className="text-xl font-bold tracking-wider">HONEYPOT</h1>
                    </div>
                    <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="mt-6 px-4 space-y-2 flex-1">
                    <NavItem icon={<Activity />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                    <NavItem icon={<Shield />} label="Activity" active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} />
                    <NavItem icon={<Users />} label="Peers" active={activeTab === 'peers'} onClick={() => setActiveTab('peers')} />
                    <NavItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="w-full p-6 border-t border-gray-800 mt-auto">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                        {isConnected ? 'SYSTEM ONLINE' : 'CONNECTING...'}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Header */}
                <header className="h-16 bg-background/50 backdrop-blur border-b border-gray-800 flex items-center justify-between px-6">
                    <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="w-6 h-6" />
                    </button>
                    <div className="flex items-center gap-4 ml-auto">
                        <div className="text-sm text-gray-400">NODE ID: <span className="text-primary font-bold">{nodeId}</span></div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-6">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${active
            ? 'bg-primary/10 text-primary border-l-2 border-primary'
            : 'text-gray-400 hover:bg-surface hover:text-white'
            }`}
    >
        {React.cloneElement(icon, { size: 20 })}
        <span className="font-medium">{label}</span>
    </button>
);

function App() {
    return (
        <SocketProvider>
            <AppContent />
        </SocketProvider>
    );
}

export default App;
