import React, { useMemo, useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { motion } from 'framer-motion';

const TopologyGraph = ({ nodeId, peers, attacks }) => {
    const graphRef = useRef();

    // Transform data into graph structure
    const graphData = useMemo(() => {
        const nodes = [];
        const links = [];
        const attackerMap = new Map();

        // Add central honeypot node
        nodes.push({
            id: nodeId,
            type: 'honeypot',
            label: nodeId,
            size: 12,
            color: '#6366f1', // indigo-500
        });

        // Add peer nodes
        Object.entries(peers).forEach(([peerId, peerData]) => {
            nodes.push({
                id: peerId,
                type: 'peer',
                label: peerId,
                size: 8,
                color: '#3b82f6', // blue-500
            });

            // Add mesh connection
            links.push({
                source: nodeId,
                target: peerId,
                type: 'mesh',
                color: '#3b82f680',
                width: 2,
            });
        });

        // Process attacks to create attacker nodes - ONLY if they have real source IPs
        attacks.slice(0, 50).forEach((attack) => {
            // Only create attacker nodes if there's a real source IP (not topic-based)
            if (!attack.source_ip) {
                return; // Skip attacks without real source IPs
            }

            const attackerId = attack.source_ip;

            if (!attackerMap.has(attackerId)) {
                // Determine color based on severity
                let color;
                let size;
                switch (attack.severity) {
                    case 'High':
                        color = '#ef4444'; // red-500
                        size = 10;
                        break;
                    case 'Medium':
                        color = '#f59e0b'; // amber-500
                        size = 7;
                        break;
                    default:
                        color = '#10b981'; // green-500
                        size = 5;
                }

                nodes.push({
                    id: attackerId,
                    type: 'attacker',
                    label: attackerId,
                    severity: attack.severity,
                    size,
                    color,
                    attackCount: 1,
                });

                attackerMap.set(attackerId, { color, severity: attack.severity, count: 1 });
            } else {
                // Increment attack count
                const attacker = attackerMap.get(attackerId);
                attacker.count++;
                const node = nodes.find(n => n.id === attackerId);
                if (node) {
                    node.attackCount = attacker.count;
                    node.size = Math.min(15, node.size + 0.5);
                }
            }

            // Add attack vector link
            const existingLink = links.find(
                l => l.source === attackerId && l.target === nodeId
            );

            if (!existingLink) {
                const attackerData = attackerMap.get(attackerId);
                links.push({
                    source: attackerId,
                    target: nodeId,
                    type: 'attack',
                    severity: attack.severity,
                    color: attackerData.color + '60',
                    width: 1.5,
                });
            }
        });

        return { nodes, links };
    }, [nodeId, peers, attacks]);

    // Custom node rendering
    const nodeCanvasObject = useCallback((node, ctx, globalScale) => {
        // Check if coordinates are valid
        if (!isFinite(node.x) || !isFinite(node.y)) {
            return;
        }

        const label = node.label;
        const fontSize = 12 / globalScale;
        ctx.font = `${fontSize}px Inter, sans-serif`;

        // Draw node circle with glow effect
        const radius = node.size;

        // Glow effect
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 2);
        gradient.addColorStop(0, node.color + '40');
        gradient.addColorStop(1, node.color + '00');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 2, 0, 2 * Math.PI);
        ctx.fill();

        // Main node circle
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
        ctx.fill();

        // Border for honeypot nodes
        if (node.type === 'honeypot') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2 / globalScale;
            ctx.stroke();
        }

        // Draw label
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(label, node.x, node.y + radius + fontSize + 2);

        // Draw attack count badge for attackers
        if (node.type === 'attacker' && node.attackCount > 1) {
            const badgeRadius = 4;
            ctx.fillStyle = '#dc2626';
            ctx.beginPath();
            ctx.arc(node.x + radius, node.y - radius, badgeRadius, 0, 2 * Math.PI);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${8 / globalScale}px Inter, sans-serif`;
            ctx.fillText(node.attackCount, node.x + radius, node.y - radius);
        }
    }, []);

    // Custom link rendering
    const linkCanvasObject = useCallback((link, ctx) => {
        const start = link.source;
        const end = link.target;

        // Check if coordinates are valid (nodes might not be positioned yet)
        if (!start || !end ||
            !isFinite(start.x) || !isFinite(start.y) ||
            !isFinite(end.x) || !isFinite(end.y)) {
            return;
        }

        // Draw link with gradient
        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, link.color);
        gradient.addColorStop(1, link.color + '20');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = link.width;

        // Dashed line for attack vectors
        if (link.type === 'attack') {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
        ctx.setLineDash([]);
    }, []);

    // Node click handler
    const handleNodeClick = useCallback((node) => {
        // Center on node
        if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 1000);
            graphRef.current.zoom(2, 1000);
        }
    }, []);

    return (
        <div className="w-full h-full relative">
            <ForceGraph2D
                ref={graphRef}
                graphData={graphData}
                nodeCanvasObject={nodeCanvasObject}
                linkCanvasObject={linkCanvasObject}
                onNodeClick={handleNodeClick}
                nodeRelSize={1}
                linkDirectionalParticles={2}
                linkDirectionalParticleWidth={link => link.type === 'attack' ? 2 : 0}
                linkDirectionalParticleSpeed={0.005}
                backgroundColor="transparent"
                enableNodeDrag={true}
                enableZoomInteraction={true}
                enablePanInteraction={true}
                cooldownTime={3000}
                d3AlphaDecay={0.02}
                d3VelocityDecay={0.3}
                warmupTicks={100}
                cooldownTicks={0}
            />
        </div>
    );
};

export default TopologyGraph;
