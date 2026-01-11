import React, { useEffect, useState, useRef } from 'react';
import { fetchNetworkGraph } from '../api';
import { ZoomIn, ZoomOut, RefreshCw, Info } from 'lucide-react';

const NetworkGraph = ({ data: initialData }) => {
    const [data, setData] = useState(initialData || { nodes: [], links: [] });
    const [loading, setLoading] = useState(!initialData);
    const svgRef = useRef(null);

    useEffect(() => {
        if (initialData) {
            setData(initialData);
            setLoading(false);
        } else {
            loadGraph();
        }
    }, [initialData]);

    const loadGraph = async () => {
        setLoading(true);
        const graphData = await fetchNetworkGraph();
        if (graphData) {
            setData(graphData);
        }
        setLoading(false);
    };

    // Calculate positions (Simple circular layout for prototype)
    const getNodesWithPositions = () => {
        const { nodes } = data;
        const centerX = 400;
        const centerY = 300;
        const radius = 200;

        return nodes.map((node, i) => {
            const angle = (i / nodes.length) * 2 * Math.PI;
            return {
                ...node,
                x: centerX + radius * Math.cos(angle),
                y: centerY + radius * Math.sin(angle)
            };
        });
    };

    const nodesWithPos = getNodesWithPositions();

    return (
        <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cross-Entity Linkage Network</h3>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Visualizing hidden relationships between Vendors and Departments.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" onClick={loadGraph}><RefreshCw size={16} /></button>
                </div>
            </div>

            <div style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <span style={{ color: '#94a3b8' }}>Loading Network Topology...</span>
                    </div>
                ) : (
                    <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600">
                        {/* Links */}
                        {data.links.map((link, i) => {
                            const source = nodesWithPos.find(n => n.id === link.source);
                            const target = nodesWithPos.find(n => n.id === link.target);
                            if (!source || !target) return null;

                            return (
                                <line
                                    key={i}
                                    x1={source.x} y1={source.y}
                                    x2={target.x} y2={target.y}
                                    stroke={link.risk > 0.6 ? "#ef4444" : "#cbd5e1"}
                                    strokeWidth={link.risk > 0.6 ? 2 : 1}
                                    opacity={0.6}
                                />
                            );
                        })}

                        {/* Nodes */}
                        {nodesWithPos.map((node, i) => (
                            <g key={i}>
                                <circle
                                    cx={node.x} cy={node.y}
                                    r={node.type === 'department' ? 15 : 8}
                                    fill={node.type === 'department' ? '#3b82f6' : (node.risk > 0.6 ? '#dc2626' : '#64748b')}
                                    stroke="white"
                                    strokeWidth="2"
                                />
                                <text
                                    x={node.x} y={node.y + 25}
                                    textAnchor="middle"
                                    fontSize="10"
                                    fill="#475569"
                                    fontWeight="600"
                                >
                                    {node.id.length > 10 ? node.id.substring(0, 8) + '..' : node.id}
                                </text>
                            </g>
                        ))}
                    </svg>
                )}

                {/* Legend */}
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6' }}></div> Department
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#64748b' }}></div> Vendor (Low Risk)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626' }}></div> Vendor (High Risk)
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetworkGraph;
