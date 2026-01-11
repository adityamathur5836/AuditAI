import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, ComposedChart } from 'recharts';

const BenfordChart = ({ data }) => {
    if (!data || !data.valid) {
        return (
            <div className="card" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: '#64748b' }}>Insufficient data for Benford Analysis</p>
            </div>
        );
    }

    const chartData = data.distribution.map(d => ({
        digit: d.digit,
        Actual: d.actual,
        Expected: d.expected
    }));

    const isAnomaly = data.stats.is_anomalous;

    return (
        <div className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Benford's Law Analysis</h3>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Digital forensic test for data fabrication</p>
                </div>
                <div style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: isAnomaly ? '#fee2e2' : '#dcfce7',
                    color: isAnomaly ? '#dc2626' : '#16a34a'
                }}>
                    {isAnomaly ? 'DETECTED ANOMALY' : 'PASSED'}
                </div>
            </div>

            <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                        <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" />
                        <XAxis dataKey="digit" />
                        <YAxis label={{ value: 'Frequency (%)', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8' } }} />
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="Actual" fill={isAnomaly ? "#ef4444" : "#3b82f6"} barSize={20} radius={[4, 4, 0, 0]} />
                        <Line type="monotone" dataKey="Expected" stroke="#94a3b8" strokeWidth={2} dot={{ r: 4 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px', fontSize: '0.75rem', color: '#475569' }}>
                <p><strong>Conclusion:</strong> {data.stats.conclusion}</p>
                <p>Chi-Square: {data.stats.chi_square} (p-value: {data.stats.p_value})</p>
            </div>
        </div>
    );
};

export default BenfordChart;
