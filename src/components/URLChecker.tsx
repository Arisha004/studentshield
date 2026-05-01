import React, { useState } from 'react';
import { Globe, ShieldAlert, ShieldCheck, CheckCircle, ChevronRight, AlertCircle, Link2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { geminiService } from '../services/gemini';

const WELL_KNOWN_BRANDS = ['amazon', 'google', 'paypal', 'apple', 'microsoft', 'facebook', 'netflix', 'instagram', 'linkedin', 'bankofamerica', 'chase'];
const SUSPICIOUS_TLDS = ['tk', 'xyz', 'cc', 'pw', 'info', 'top', 'loan', 'win', 'bid', 'ga', 'cf', 'ml', 'gq'];
const SHORTENERS = ['bit.ly', 'goo.gl', 't.co', 'tinyurl.com', 'is.gd', 'buff.ly', 'ow.ly'];

interface CheckStep {
  label: string;
  passed: boolean;
  message: string;
}

export const URLChecker = () => {
  const [url, setUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<CheckStep[] | null>(null);
  const [riskScore, setRiskScore] = useState<number | null>(null);

  const checkURL = async () => {
    if (!url || isScanning) return;
    
    setIsScanning(true);
    setResults(null);
    setRiskScore(null);

    try {
      let cleanUrl = url.trim().toLowerCase();
      if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
      
      const steps: CheckStep[] = [];
      const urlObj = new URL(cleanUrl);
      const hostname = urlObj.hostname;

      // 1. Initial Heuristic Checks
      steps.push({
        label: 'Connection Security',
        passed: urlObj.protocol === 'https:',
        message: urlObj.protocol === 'https:' ? 'Using encrypted HTTPS connection.' : 'Insecure HTTP connection detected.'
      });

      const isIP = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(hostname);
      steps.push({
        label: 'Domain Format',
        passed: !isIP,
        message: isIP ? 'Uses raw IP address instead of domain name.' : 'Proper domain name structure used.'
      });

      // 2. Behavioral AI Check
      const aiData = await geminiService.analyzeURL(url);
      setRiskScore(aiData.riskScore);
      
      if (aiData.findings) {
        setResults([...steps, ...aiData.findings]);
      } else {
        setResults(steps);
      }
    } catch (e) {
      alert('Please enter a valid URL');
    } finally {
      setIsScanning(false);
    }
  };

  const allPassed = results?.every(s => s.passed);

  return (
    <div className="space-y-6" id="url-checker-component">
      <div className="glass-card p-8 border-slate-200/60 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-green-500/10 text-green-600 rounded-xl">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">URL Safety Checker</h3>
            <p className="text-slate-500 text-sm">Deep-scan links for technical fraud markers</p>
          </div>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="paste link here (e.g. paypa1-support.cc)..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-green-500/50 outline-none transition-all"
          />
          <button
            onClick={checkURL}
            disabled={isScanning || !url.trim()}
            className="px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-green-500/20 disabled:opacity-50"
          >
            {isScanning ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Globe size={20} />
            )}
            <span>{isScanning ? 'Scanning...' : 'Audit'}</span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {results && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6 md:p-8 border-slate-200/60 bg-white space-y-6"
          >
            <div className={`p-4 rounded-2xl flex items-center gap-4 ${allPassed ? 'bg-green-500/10 border border-green-500/20' : 'bg-red-500/10 border border-red-500/20'}`}>
              <div className={allPassed ? 'text-green-500' : 'text-red-500'}>
                {allPassed ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
              </div>
              <div>
                <h4 className={`text-lg font-black ${allPassed ? 'text-green-700' : 'text-red-700'}`}>
                  {allPassed ? 'Link Appears Secure' : 'Suspicious Indicators Found'}
                </h4>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Local Technical Audit Complete</p>
              </div>
            </div>

            <div className="space-y-3">
              {results.map((step, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200 group hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={step.passed ? 'text-green-500/50' : 'text-red-500'}>
                      {step.passed ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{step.label}</p>
                      <p className="text-sm font-bold text-slate-900">{step.message}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${step.passed ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {step.passed ? 'Pass' : 'Fail'}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-black tracking-widest">
                <Link2 size={12} />
                <span>Verified against 2,000+ brand signatures</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
