import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const NetworkGraph = ({ data }) => {
    const containerRef = useRef();
    const [dimensions, setDimensions] = useState({ w: 800, h: 600 });

    useEffect(() => {
        if (containerRef.current) {
            setDimensions({
                w: containerRef.current.clientWidth,
                h: containerRef.current.clientHeight
            });
        }
    }, [containerRef]);

    if (!data || !data.nodes || data.nodes.length === 0) {
        return (
            <div className="card" style={{ height: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#64748b' }}>No network data available. Upload transactions to generate graph.</p>
            </div>
        );
    }

    return (
        <div className="card" style={{ height: '540px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Vendor Collusion Network</h3>
                <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Visualizing relationships between Vendors, Departments and Projects</p>
            </div>
            <div ref={containerRef} style={{ flex: 1, backgroundColor: '#f8fafc', borderRadius: '8px', overflow: 'hidden' }}>
                <ForceGraph2D
                    width={dimensions.w}
                    height={dimensions.h}
                    graphData={data}
                    nodeLabel="id"
                    nodeColor={node => {
                        if (node.type === 'department') return '#64748b'; // Gray for Dept
                        if (node.type === 'project') return '#f59e0b'; // Amber for Project
                        // Vendor color by risk
                        return node.risk > 0.5 ? '#dc2626' : '#2563eb'; // Red/Blue
                    }}
                    nodeVal={node => node.val}
                    linkColor={() => '#e2e8f0'}
                    linkWidth={link => Math.sqrt(link.value)}
                    bg_color="#ffffff"
                />
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#dc2626' }}></div>High Risk Vendor</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#2563eb' }}></div>Normal Vendor</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>Project</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#64748b' }}></div>Department</div>
            </div>
        </div>
    );
};

export default NetworkGraph;
