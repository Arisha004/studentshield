import React, { useState } from 'react';
import { Fingerprint, ShieldAlert, CheckCircle, Info, Mail, Loader2, AlertCircle, Calendar, Link2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Breach {
  site: string;
  date: string;
  data: string;
  severity: 'High' | 'Medium' | 'Low';
}

export const BreachWatch = () => {
  const [email, setEmail] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<Breach[] | null>(null);

  const checkBreaches = () => {
    if (!email.trim() || !email.includes('@')) return;

    setIsScanning(true);
    setResults(null);

    // Simulate Deep Web Leak Audit
    setTimeout(() => {
      const mockResults: Breach[] = [
        { site: 'EduConnect Student Portal', date: 'Oct 2025', data: 'Email, Password, University ID', severity: 'High' },
        { site: 'CampusFood Delivery', date: 'Jan 2024', data: 'Phone Number, Address, GPS Data', severity: 'Medium' }
      ];
      
      // If it's a "clean" looking email, return empty
      if (email.startsWith('safe')) {
        setResults([]);
      } else {
        setResults(mockResults);
      }
      setIsScanning(false);
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass-card p-6 md:p-10 border-slate-200 bg-white/50 relative overflow-hidden text-center max-w-3xl mx-auto">
        <div className="absolute top-0 left-0 w-64 h-64 bg-danger/5 rounded-full -ml-32 -mt-32 blur-3xl" />
        
        <div className="relative z-10 space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-danger/10 text-danger rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-red-500/10 animate-float">
              <Fingerprint size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black tracking-tighter uppercase text-slate-900 leading-none">BreachWatch Intelligence</h3>
              <p className="text-slate-400 text-sm font-medium">Scan the dark web for student identity leaks</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your student email..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-16 pr-6 py-5 text-slate-900 font-bold focus:outline-none focus:border-danger/40 transition-all shadow-sm text-lg placeholder:text-slate-300"
              />
            </div>
            <button 
              onClick={checkBreaches}
              disabled={isScanning || !email.trim() || !email.includes('@')}
              className="w-full py-5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-2xl disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {isScanning ? <Loader2 className="animate-spin" size={24} /> : <ShieldAlert size={24} className="group-hover:animate-pulse" />}
              <span>{isScanning ? 'Scanning Encrypted Archives...' : 'Initiate Identity Audit'}</span>
            </button>
          </div>
          
          <div className="flex justify-center gap-6 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">14.2B Records Checked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Military-Grade Encryption</span>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {results !== null && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {results.length === 0 ? (
              <div className="glass-card p-12 border-safe/20 bg-safe/5 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-20 h-20 bg-safe/10 text-safe rounded-full flex items-center justify-center">
                    <CheckCircle size={48} />
                  </div>
                </div>
                <h4 className="text-2xl font-black text-slate-900 uppercase">You are secure!</h4>
                <p className="text-slate-600 font-bold">No known leaks found for {email} in our current database.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between px-2">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                    <AlertCircle className="text-danger" size={16} /> Vulnerabilities Found
                  </h4>
                  <span className="text-[10px] font-black text-danger bg-danger/10 px-3 py-1 rounded-full uppercase tracking-widest">{results.length} Breaches Detected</span>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {results.map((breach, i) => (
                    <div key={i} className="glass-card p-8 border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6 group hover:border-danger/30 transition-all">
                      <div className="flex gap-6 items-start">
                        <div className={`p-4 rounded-2xl shrink-0 ${breach.severity === 'High' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
                          < Fingerprint size={28} />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xl font-black text-slate-900 group-hover:text-danger transition-colors">{breach.site}</h5>
                          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                            <span className="flex items-center gap-1"><Calendar size={12} /> {breach.date}</span>
                            <span className="flex items-center gap-1"><Link2 size={12} /> Data Leaked: {breach.data}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                          breach.severity === 'High' ? 'bg-danger/10 text-danger border-danger/20' : 'bg-warning/10 text-warning border-warning/20'
                        }`}>
                          Severity: {breach.severity}
                        </div>
                        <button className="px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">Resolve</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-8 bg-black rounded-[2.5rem] border border-white/10 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-danger/20 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />
                  <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="text-danger" size={24} />
                      <h4 className="text-xl font-black uppercase tracking-tight">Security Hardening Required</h4>
                    </div>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                      Your credentials have been compromised in a high-severity leak. We recommend changing your university portal password immediately and enabling 2FA (Two-Factor Authentication) if available.
                    </p>
                    <div className="flex gap-4">
                      <button className="px-8 py-3 bg-white text-black rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">Change Password Now</button>
                      <button className="px-8 py-3 bg-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-colors">See Fix Instructions</button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
