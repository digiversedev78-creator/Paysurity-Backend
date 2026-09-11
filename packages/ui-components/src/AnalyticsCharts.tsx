'use client';

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export const RevenueVelocityChart = ({ data, height = 320 }: { data: any[], height?: number }) => {
  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="date" stroke="#71717a" tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={false} />
          <YAxis stroke="#71717a" tickFormatter={(v: number) => `$${v/1000}k`} tick={{fill: '#a1a1aa', fontSize: 12}} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <Line type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={3} dot={{r: 4, fill: '#09090b', stroke: '#a855f7'}} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DistributionMatrixChart = ({ data, height = 280 }: { data: any[], height?: number }) => {
  const chartData = Object.entries(data || {}).map(([name, value], index) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }));

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={5} dataKey="value">
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', border: '1px solid rgba(255,255,255,0.1)' }} />
          <Legend wrapperStyle={{ paddingTop: '20px', color: '#a1a1aa' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
