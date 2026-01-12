import React, { useEffect, useRef } from 'react';

const NetworkGraph = ({ data }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const nodesRef = useRef([]);
    const linksRef = useRef([]);

    useEffect(() => {
        if (!data || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const width = canvas.width = canvas.offsetWidth * 2; // Retina
        const height = canvas.height = canvas.offsetHeight * 2;
        ctx.scale(2, 2);

        // Enhanced spider-web physics
        const nodes = [];
        const links = [];
        const centerX = width / 4;
        const centerY = height / 4;

        // Process backend data format
        const departments = data.nodes?.filter(n => n.type === 'department') || [];
        const vendors = data.nodes?.filter(n => n.type === 'vendor') || [];

        // Create central hub node
        const centerNode = {
            id: 'center',
            label: 'Transaction Hub',
            x: centerX,
            y: centerY,
            vx: 0,
            vy: 0,
            radius: 20,
            type: 'hub',
            fixed: true
        };
        nodes.push(centerNode);

        // Create department nodes in inner ring
        const deptNodes = departments.map((dept, i) => {
            const angle = (i / departments.length) * Math.PI * 2;
            const radius = 80;
            return {
                id: dept.id,
                label: dept.id,
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                radius: 12,
                type: 'department',
                riskScore: dept.risk || 0,
                connections: 0
            };
        });

        // Create vendor nodes in outer ring
        const vendorNodes = vendors.map((vendor, i) => {
            const angle = (i / vendors.length) * Math.PI * 2;
            const radius = 150;
            return {
                id: vendor.id,
                label: vendor.id.substring(0, 10),
                x: centerX + Math.cos(angle) * radius,
                y: centerY + Math.sin(angle) * radius,
                vx: 0,
                vy: 0,
                radius: 8,
                type: 'vendor',
                riskScore: vendor.risk || 0,
                connections: 0
            };
        });

        nodes.push(...deptNodes, ...vendorNodes);

        // Create spider-web links
        // Hub to departments
        deptNodes.forEach(dept => {
            links.push({ source: centerNode, target: dept, strength: 0.8, suspicious: false });
        });

        // Process backend links (vendor to department connections)
        data.links?.forEach(link => {
            const source = nodes.find(n => n.id === link.source);
            const target = nodes.find(n => n.id === link.target);
            if (source && target) {
                links.push({
                    source,
                    target,
                    strength: 0.5,
                    suspicious: link.risk > 0.7
                });
            }
        });

        nodesRef.current = nodes;
        linksRef.current = links;

        // Force-directed simulation
        const simulation = () => {
            const alpha = 0.1;
            const linkStrength = 0.3;
            const repulsion = 800;

            // Apply link forces (spring attraction)
            links.forEach(link => {
                const dx = link.target.x - link.source.x;
                const dy = link.target.y - link.source.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (dist - 80) * linkStrength * link.strength;

                if (!link.source.fixed) {
                    link.source.vx += (dx / dist) * force;
                    link.source.vy += (dy / dist) * force;
                }
                if (!link.target.fixed) {
                    link.target.vx -= (dx / dist) * force;
                    link.target.vy -= (dy / dist) * force;
                }
            });

            // Apply repulsion forces between nodes
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[j].x - nodes[i].x;
                    const dy = nodes[j].y - nodes[i].y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                    const force = repulsion / (dist * dist);

                    if (!nodes[i].fixed) {
                        nodes[i].vx -= (dx / dist) * force;
                        nodes[i].vy -= (dy / dist) * force;
                    }
                    if (!nodes[j].fixed) {
                        nodes[j].vx += (dx / dist) * force;
                        nodes[j].vy += (dy / dist) * force;
                    }
                }
            }

            // Update positions
            nodes.forEach(node => {
                if (!node.fixed) {
                    node.vx *= 0.9; // Damping
                    node.vy *= 0.9;
                    node.x += node.vx * alpha;
                    node.y += node.vy * alpha;

                    // Keep in bounds
                    node.x = Math.max(20, Math.min(width / 2 - 20, node.x));
                    node.y = Math.max(20, Math.min(height / 2 - 20, node.y));
                }
            });
        };

        // Render function
        const render = () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width / 2, height / 2);

            // Draw links
            links.forEach(link => {
                ctx.beginPath();
                ctx.moveTo(link.source.x, link.source.y);
                ctx.lineTo(link.target.x, link.target.y);

                // Color based on suspicion
                if (link.suspicious) {
                    ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)';
                    ctx.lineWidth = 2;
                } else {
                    ctx.strokeStyle = `rgba(148, 163, 184, ${link.strength * 0.3})`;
                    ctx.lineWidth = 1;
                }
                ctx.stroke();
            });

            // Draw nodes
            nodes.forEach(node => {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);

                // Color based on type and risk
                if (node.type === 'hub') {
                    ctx.fillStyle = '#3b82f6';
                } else if (node.type === 'department') {
                    const risk = node.riskScore;
                    ctx.fillStyle = risk > 0.7 ? '#dc2626' : risk > 0.4 ? '#f97316' : '#10b981';
                } else {
                    const risk = node.riskScore;
                    ctx.fillStyle = risk > 0.7 ? '#ef4444' : risk > 0.4 ? '#fb923c' : '#4ade80';
                }

                ctx.fill();
                ctx.strokeStyle = 'white';
                ctx.lineWidth = 2;
                ctx.stroke();

                // Draw label for larger nodes
                if (node.radius >= 12) {
                    ctx.fillStyle = '#1e293b';
                    ctx.font = '10px Inter, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.fillText(node.label.substring(0, 15), node.x, node.y - node.radius - 5);
                }
            });
        };

        // Animation loop
        let ticks = 0;
        const animate = () => {
            if (ticks < 300) { // Run simulation for 300 ticks
                simulation();
                ticks++;
            }
            render();
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [data]);

    if (!data || !data.nodes || data.nodes.length === 0) {
        return (
            <div style={{
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                fontSize: '0.875rem'
            }}>
                Loading network data...
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: '400px', background: 'white', borderRadius: '12px' }}>
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '12px'
                }}
            />

            {/* Legend */}
            <div style={{
                position: 'absolute',
                bottom: '1rem',
                right: '1rem',
                background: 'rgba(255, 255, 255, 0.95)',
                padding: '0.75rem',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                fontSize: '0.75rem'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3b82f6' }}></div>
                        <span>Hub</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10b981' }}></div>
                        <span>Department (Low Risk)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }}></div>
                        <span>Vendor (Low Risk)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#dc2626' }}></div>
                        <span>High Risk Entity</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkGraph;
