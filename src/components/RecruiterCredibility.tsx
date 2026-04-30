import React, { useState } from 'react';
import { UserCheck, AlertTriangle, CheckCircle, Info, Shield, Globe, ExternalLink, ShieldAlert, Loader2, Search, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { geminiService } from '../services/gemini';

interface RecruiterResult {
  score: number;
  level: 'High' | 'Medium' | 'Low';
  flags: string[];
  recommendation: string;
  checks: {
    label: string;
    status: 'pass' | 'fail' | 'warn';
    detail: string;
  }[];
}

export const RecruiterCredibility = ({ initialQuery = '' }: { initialQuery?: string }) => {
  const [profileUrl, setProfileUrl] = useState(initialQuery);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<RecruiterResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-scan if initialQuery is provided
  React.useEffect(() => {
    if (initialQuery) {
      setProfileUrl(initialQuery);
      performCheck(initialQuery);
    }
  }, [initialQuery]);

  const performCheck = async (query?: string) => {
    const target = query || profileUrl;
    if (!target.trim()) return;

    setIsScanning(true);
    setResult(null);
    setError(null);

    try {
      const data = await geminiService.analyzeRecruiter(target);
      setResult(data as RecruiterResult);
    } catch (err) {
      setError("AI analysis failed. Please check your connection.");
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass-card p-10 border-slate-200 bg-white/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full -mr-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/10">
              <UserCheck size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tighter uppercase text-slate-900">Recruiter Credibility Audit</h3>
              <p className="text-slate-400 text-sm font-medium">Verify the legitimacy of recruiters targeting your profile</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input 
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              placeholder="Paste LinkedIn URL or Recruiter Name..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:outline-none focus:border-accent/40 placeholder:text-slate-300 transition-all shadow-sm"
            />
            <button 
              onClick={performCheck}
              disabled={isScanning || !profileUrl.trim()}
              className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isScanning ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              <span>{isScanning ? 'Auditing...' : 'Audit Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* Left: Score & Risk */}
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-8 border-slate-200 text-center space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Credibility Index</p>
                <div className="relative flex items-center justify-center">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="rgba(0,0,0,0.05)" strokeWidth="12" fill="transparent" />
                    <motion.circle 
                      cx="96" cy="96" r="80" 
                      stroke={result.score > 70 ? '#10B981' : result.score > 40 ? '#F59E0B' : '#EF4444'} 
                      strokeWidth="12" fill="transparent"
                      strokeDasharray={2 * Math.PI * 80}
                      initial={{ strokeDashoffset: 2 * Math.PI * 80 }}
                      animate={{ strokeDashoffset: (2 * Math.PI * 80) * (1 - result.score / 100) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-5xl font-black text-slate-900">{result.score}</span>
                    <span className="text-[10px] font-black text-slate-300 uppercase">Points</span>
                  </div>
                </div>
                <div className={`py-2 rounded-xl text-xs font-black uppercase tracking-widest border ${
                  result.level === 'Low' ? 'bg-safe/10 text-safe border-safe/20' : 
                  result.level === 'Medium' ? 'bg-warning/10 text-warning border-warning/20' : 
                  'bg-danger/10 text-danger border-danger/20'
                }`}>
                  Risk Level: {result.level}
                </div>
              </div>

              <div className="glass-card p-6 border-slate-200 bg-accent/5">
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="text-accent" size={18} />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900">Verified Recruiter Tip</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  Legitimate recruiters from major firms will ALWAYS have an official e-mail address linked to the company's website (e.g., name@google.com).
                </p>
              </div>
            </div>

            {/* Right: Detailed Checks & Recommendation */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-card p-8 border-slate-200 space-y-6">
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                  <Shield className="text-accent" size={16} /> Forensic Analysis Results
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.checks.map((check, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{check.label}</span>
                        {check.status === 'pass' ? <CheckCircle size={14} className="text-safe" /> : 
                         check.status === 'warn' ? <AlertTriangle size={14} className="text-warning" /> : 
                         <ShieldAlert size={14} className="text-danger" />}
                      </div>
                      <p className="text-xs font-bold text-slate-700">{check.detail}</p>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-slate-900 rounded-3xl space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">Strategic Recommendation</p>
                  <p className="text-sm font-bold text-white leading-relaxed z-10 relative">
                    {result.recommendation}
                  </p>
                </div>

                <div className="space-y-3">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Detected Red Flags</h5>
                  {result.flags.map((flag, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-danger/5 rounded-xl border border-danger/10">
                      <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                      <p className="text-xs font-bold text-danger leading-relaxed">{flag}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-8 border-slate-200 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer hover:border-accent/30 transition-all">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Globe size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Check Company Domain</h4>
            <p className="text-xs text-slate-400 font-medium">Verify the official website of the hiring company</p>
          </div>
        </div>
        <div className="glass-card p-8 border-slate-200 flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer hover:border-accent/30 transition-all">
          <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ExternalLink size={24} />
          </div>
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-slate-900">Report Fake Recruiter</h4>
            <p className="text-xs text-slate-400 font-medium">Add to our community intelligence database</p>
          </div>
        </div>
      </div>
    </div>
  );
};
