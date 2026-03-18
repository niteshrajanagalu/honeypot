import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const GlassCard = ({ children, className, ...props }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={cn(
            'bg-surface/40 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl overflow-hidden',
            className
        )}
        {...props}
    >
        {children}
    </motion.div>
);

// Each color entry: [gradientClasses, iconTextClass, iconBorderClass]
const COLOR_MAP = {
    blue:   ['from-blue-500/20 to-blue-600/5',   'text-blue-500',   'border-blue-500/20'],
    red:    ['from-red-500/20 to-red-600/5',      'text-red-500',    'border-red-500/20'],
    green:  ['from-emerald-500/20 to-emerald-600/5', 'text-emerald-500', 'border-emerald-500/20'],
    indigo: ['from-indigo-500/20 to-indigo-600/5', 'text-indigo-500', 'border-indigo-500/20'],
    amber:  ['from-amber-500/20 to-amber-600/5',  'text-amber-500',  'border-amber-500/20'],
};

export const AnimatedStat = ({ label, value, icon, trend, color = 'blue' }) => {
    const [gradient, textClass, borderClass] = COLOR_MAP[color] ?? COLOR_MAP.blue;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className={cn(
                'relative p-6 rounded-2xl border bg-gradient-to-br backdrop-blur-md overflow-hidden group',
                gradient,
                borderClass
            )}
        >
            {/* Background watermark icon */}
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                {React.cloneElement(icon, { size: 48 })}
            </div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className={cn('p-3 rounded-xl bg-background/50 border', textClass, borderClass)}>
                        {React.cloneElement(icon, { size: 20 })}
                    </div>
                    {trend && (
                        <span className={cn('text-xs font-bold px-2 py-1 rounded-full bg-background/50 border', textClass, borderClass)}>
                            {trend}
                        </span>
                    )}
                </div>
                <div className="text-4xl font-black text-white tracking-tight mb-1">
                    {value}
                </div>
                <div className={cn('text-sm font-medium uppercase tracking-wider', textClass)}>
                    {label}
                </div>
            </div>
        </motion.div>
    );
};

export const PulseBadge = ({ status, text }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/50 border border-white/5">
        <div className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
            )} />
            <span className={cn(
                'relative inline-flex rounded-full h-2.5 w-2.5',
                status === 'online' ? 'bg-emerald-500' : 'bg-red-500'
            )} />
        </div>
        <span className="text-xs font-bold tracking-wide text-white/80 whitespace-nowrap">{text}</span>
    </div>
);
