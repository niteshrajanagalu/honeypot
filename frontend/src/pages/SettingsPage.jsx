import React from 'react';

const SettingsPage = () => {
    return (
        <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-bold text-white">SYSTEM SETTINGS</h2>

            <div className="bg-surface p-6 rounded-xl border border-gray-800 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">General Configuration</h3>
                    <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-gray-400">Node Identifier</label>
                            <input type="text" value="LOCAL-01" className="bg-background border border-gray-700 rounded px-3 py-2 text-white focus:border-primary outline-none" readOnly />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm text-gray-400">API Endpoint</label>
                            <input type="text" value="http://localhost:8000" className="bg-background border border-gray-700 rounded px-3 py-2 text-white focus:border-primary outline-none" />
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-800">
                    <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-background text-primary focus:ring-primary" defaultChecked />
                            <span className="text-gray-300">Email Alerts</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" className="w-4 h-4 rounded border-gray-700 bg-background text-primary focus:ring-primary" defaultChecked />
                            <span className="text-gray-300">Desktop Notifications</span>
                        </label>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-800">
                    <button className="px-4 py-2 bg-primary text-black font-bold rounded hover:bg-primary/90 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
