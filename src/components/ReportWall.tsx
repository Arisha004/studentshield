import React, { useState, useEffect } from 'react';
import { MessageSquare, Flame, Clock, Filter, ThumbsUp, Shield, Trash2, Search, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScamReport {
  id: string;
  type: string;
  message: string;
  risk: 'Low' | 'Medium' | 'High';
  timestamp: number;
  votes: number;
}

const CATEGORIES = ['WhatsApp', 'Job Offer', 'Internship', 'Email Phish', 'University Portal', 'Other'];

export const ReportWall = () => {
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [isReporting, setIsReporting] = useState(false);
  const [newReport, setNewReport] = useState({ type: 'Job Offer', message: '', risk: 'High' as any });
  const [sortBy, setSortBy] = useState<'recent' | 'top' | 'risk'>('recent');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('studentShield_reports');
    if (saved) {
      setReports(JSON.parse(saved));
    } else {
      // Seed data
      const seed: ScamReport[] = [
        { id: '1', type: 'Job Offer', message: 'Got a text from a generic Gmail address promising $50/hr for personal assistant work. Asks to buy equipment via Zelle.', risk: 'High', timestamp: Date.now() - 3600000, votes: 42 },
        { id: '2', type: 'WhatsApp', message: 'Someone claiming to be from the Career Center messaged me on WhatsApp about a secret internship.', risk: 'High', timestamp: Date.now() - 7200000, votes: 24 },
        { id: '3', type: 'University Portal', message: 'Received a strange email about "Tuition Overdue" with a link to a site that doesn\'t look like my uni portal.', risk: 'Medium', timestamp: Date.now() - 10000000, votes: 15 }
      ];
      setReports(seed);
      localStorage.setItem('studentShield_reports', JSON.stringify(seed));
    }
  }, []);

  const saveReports = (newReports: ScamReport[]) => {
    setReports(newReports);
    localStorage.setItem('studentShield_reports', JSON.stringify(newReports));
  };

  const handleReport = () => {
    if (!newReport.message) return;
    const report: ScamReport = {
      id: Math.random().toString(36).substr(2, 9),
      type: newReport.type,
      message: newReport.message,
      risk: newReport.risk,
      timestamp: Date.now(),
      votes: 0
    };
    saveReports([report, ...reports]);
    setIsReporting(false);
    setNewReport({ type: 'Job Offer', message: '', risk: 'High' });
  };

  const voteReport = (id: string) => {
    const updated = reports.map(r => r.id === id ? { ...r, votes: r.votes + 1 } : r);
    saveReports(updated);
  };

  const deleteReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    saveReports(updated);
  };

  const sortedReports = [...reports]
    .filter(r => r.message.toLowerCase().includes(searchTerm.toLowerCase()) || r.type.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'top') return b.votes - a.votes;
      if (sortBy === 'risk') {
        const priority = { High: 3, Medium: 2, Low: 1 };
        return priority[b.risk] - priority[a.risk];
      }
      return b.timestamp - a.timestamp;
    });

  return (
    <div className="space-y-6" id="report-wall-component">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Scam Report Wall</h3>
          <p className="text-slate-500 text-sm font-medium">Anonymous community feed for trending threats</p>
        </div>
        <button
          onClick={() => setIsReporting(true)}
          className="px-8 py-3 bg-accent hover:bg-accent/90 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-purple-500/20"
        >
          <Send size={18} /> Report a Scam
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-center p-4 bg-slate-50 rounded-3xl border border-slate-200">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-2.5 text-slate-700 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setSortBy('recent')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'recent' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            <Clock size={14} className="inline mr-2" /> Recent
          </button>
          <button 
            onClick={() => setSortBy('top')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'top' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            <Flame size={14} className="inline mr-2" /> Top
          </button>
          <button 
            onClick={() => setSortBy('risk')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${sortBy === 'risk' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white text-slate-500 border border-slate-200'}`}
          >
            <Filter size={14} className="inline mr-2" /> High Risk
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isReporting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass-card p-8 border-purple-500/30 bg-purple-500/5 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <h4 className="text-xl font-black text-slate-900 uppercase italic tracking-tight">Submit Anonymous Report</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Type of Scam</label>
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                  className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-700 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none appearance-none"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Threat Level</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(r => (
                    <button
                      key={r}
                      onClick={() => setNewReport({ ...newReport, risk: r as any })}
                      className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${newReport.risk === r ? (r === 'High' ? 'bg-red-500 text-white' : r === 'Medium' ? 'bg-amber-500 text-white' : 'bg-green-500 text-white') : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Message / Experience</label>
              <textarea
                value={newReport.message}
                onChange={(e) => setNewReport({ ...newReport, message: e.target.value })}
                placeholder="Describe what happened or paste the suspicious text..."
                className="w-full h-32 bg-white border border-slate-200 rounded-2xl p-4 text-slate-900 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none"
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleReport}
                className="flex-1 py-4 bg-accent hover:bg-accent/90 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-purple-500/20"
              >
                Post Intelligence
              </button>
              <button
                onClick={() => setIsReporting(false)}
                className="px-8 py-4 bg-transparent hover:bg-slate-50 text-slate-500 rounded-2xl font-black uppercase tracking-widest transition-all border border-slate-200"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {sortedReports.map((report, i) => (
          <motion.div
            key={report.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-6 border-slate-200 bg-white hover:bg-slate-50 transition-all group relative"
          >
            <div className="flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${report.risk === 'High' ? 'bg-red-500/10 text-red-600' : report.risk === 'Medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'}`}>
                    <Shield size={20} />
                  </div>
                  <div>
                    <h5 className="text-base font-black text-slate-900 tracking-tight">{report.type}</h5>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      {new Date(report.timestamp).toLocaleDateString()} • {new Date(report.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {report.message}
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => voteReport(report.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl transition-all border border-purple-500/20 active:scale-95"
                  >
                    <ThumbsUp size={14} />
                    <span className="text-xs font-black uppercase tracking-widest">{report.votes} Confirmations</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-row md:flex-col justify-between items-end gap-4 shrink-0">
                <div className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${report.risk === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/30' : report.risk === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-green-500/10 text-green-500 border-green-500/30'}`}>
                  {report.risk} Risk
                </div>
                <button 
                  onClick={() => deleteReport(report.id)}
                  className="p-3 text-slate-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
