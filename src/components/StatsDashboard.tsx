import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';
import { LayoutDashboard, TrendingUp, Shield, ShieldAlert, Zap, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsDashboardProps {
  history: any[];
}

export const StatsDashboard = ({ history }: StatsDashboardProps) => {
  // 1. Process Day Data
  const dayData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = days.map(day => ({ name: day, scans: 0 }));
    
    history.forEach(h => {
      const date = new Date(h.date);
      const dayIdx = date.getDay();
      counts[dayIdx].scans += 1;
    });
    
    return counts;
  }, [history]);

  // 2. Process Type Data
  const typeData = useMemo(() => {
    const types: Record<string, number> = {};
    history.forEach(h => {
      types[h.type] = (types[h.type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  }, [history]);

  // 3. Stats Calculations
  const stats = useMemo(() => {
    const totalScans = history.length;
    const avgRisk = totalScans > 0 ? Math.round(history.reduce((a, b) => a + b.score, 0) / totalScans) : 0;
    const blocked = history.filter(h => h.risk === 'High').length;
    const peakThreat = totalScans > 0 ? Math.max(...history.map(h => h.score)) : 0;
    
    return { totalScans, avgRisk, blocked, peakThreat };
  }, [history]);

  const COLORS = ['var(--color-accent)', 'var(--color-safe)', 'var(--color-warning)', 'var(--color-danger)', '#3B82F6'];

  return (
    <div className="space-y-12" id="stats-dashboard-component">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Scans" value={stats.totalScans} icon={Activity} color="text-purple-600" bgColor="bg-purple-500/10" shadow="shadow-purple-500/10" />
        <StatCard label="Avg Risk Score" value={`${stats.avgRisk}%`} icon={Zap} color="text-amber-600" bgColor="bg-amber-500/10" shadow="shadow-amber-500/10" />
        <StatCard label="Threats Blocked" value={stats.blocked} icon={ShieldAlert} color="text-red-600" bgColor="bg-red-500/10" shadow="shadow-red-500/10" />
        <StatCard label="Peak Index" value={`${stats.peakThreat}%`} icon={Shield} color="text-green-600" bgColor="bg-green-500/10" shadow="shadow-green-500/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-8 border-slate-200 bg-white space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Security Activity</h4>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Scans Performed This Week</p>
            </div>
            <TrendingUp size={20} className="text-purple-600" />
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.8}/>
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="scans" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-8 border-slate-200 bg-white space-y-6 shadow-sm">
          <div>
            <h4 className="text-lg font-black text-slate-900 uppercase italic tracking-tight">Threat Vectors</h4>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Detection by Category</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {typeData.map((t, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-bold text-slate-500">{t.name}</span>
                </div>
                <span className="text-xs font-black text-slate-900">{t.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, bgColor, shadow }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-6 border-slate-200 bg-white relative overflow-hidden group hover:shadow-xl ${shadow} transition-all duration-500`}
    >
      <div className="relative z-10 flex flex-col gap-4">
        <div className={`w-12 h-12 rounded-2xl ${bgColor} ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
          <motion.h4 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className={`text-3xl font-black text-slate-900`}
          >
            {value}
          </motion.h4>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-24 h-24 bg-slate-900/5 rounded-full -mr-12 -mt-12 blur-2xl" />
    </motion.div>
  );
};
