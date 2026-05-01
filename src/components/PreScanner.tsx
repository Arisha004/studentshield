import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Search, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SUSPICIOUS_DOMAINS = ['.tk', '.xyz', '.cc', '.xyz', '.pw', '.info', '.top', '.loan', '.win', '.bid'];
const URGENCY_WORDS = ['urgent', 'immediate', 'asap', 'within 24 hours', 'hurry', 'final notice', 'suspended', 'limited time'];
const PAYMENT_WORDS = ['western union', 'moneygram', 'gift card', 'wire transfer', 'zelle', 'cash app', 'crypto', 'bitcoin', 'processing fee'];
const PERSONAL_INFO_WORDS = ['ssn', 'social security', 'password', 'mother\'s maiden name', 'driver license', 'student id', 'bank account', 'credit card'];

interface MatchResult {
  word: string;
  category: string;
}

export const PreScanner = () => {
  const [text, setText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{ score: number, matches: MatchResult[] } | null>(null);

  const scanText = () => {
    if (!text.trim() || isScanning) return;

    setIsScanning(true);
    setResult(null);

    // Simulate deep heuristic audit
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      const matches: MatchResult[] = [];
      let score = 0;

      URGENCY_WORDS.forEach(word => {
        if (lowerText.includes(word)) {
          matches.push({ word, category: 'Urgency' });
          score += 15;
        }
      });

      PAYMENT_WORDS.forEach(word => {
        if (lowerText.includes(word)) {
          matches.push({ word, category: 'Suspicious Payment' });
          score += 25;
        }
      });

      PERSONAL_INFO_WORDS.forEach(word => {
        if (lowerText.includes(word)) {
          matches.push({ word, category: 'Identity Request' });
          score += 20;
        }
      });

      SUSPICIOUS_DOMAINS.forEach(domain => {
        if (lowerText.includes(domain)) {
          matches.push({ word: domain, category: 'High-Risk Domain' });
          score += 30;
        }
      });

      setResult({
        score: Math.min(score, 100),
        matches: matches.slice(0, 5) // Limit to top 5
      });
      setIsScanning(false);
    }, 1200);
  };

  const highlightText = (content: string) => {
    if (!result) return content;
    let highlighted = content;
    result.matches.forEach(match => {
      const regex = new RegExp(`(${match.word})`, 'gi');
      highlighted = highlighted.replace(regex, '<span class="bg-red-500/20 text-red-700 font-bold px-1 rounded">$1</span>');
    });
    return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
  };

  return (
    <div className="space-y-6" id="pre-scanner-component">
      <div className="glass-card p-8 border-slate-200/60 bg-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl">
            <Search size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Rule-Based Pre-Scanner</h3>
            <p className="text-slate-500 text-sm">Instant pattern matching for known fraud markers</p>
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste message here to check for obvious red flags..."
            className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none"
          />
          <button
            onClick={scanText}
            disabled={isScanning || !text.trim()}
            className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            {isScanning ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Auditing Patterns...</span>
              </>
            ) : (
              <>
                <Search size={20} className="group-hover:scale-125 transition-transform" />
                <span>Deploy Pre-Scanner</span>
              </>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8 border-slate-200/60 bg-white space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-full ${result.score > 70 ? 'bg-red-500/10 text-red-500' : result.score > 30 ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                  {result.score > 50 ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{result.score}% Risk Score</h4>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-black">Initial Heuristic Analysis</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                {highlightText(text)}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Matched Red Flags</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.matches.length > 0 ? (
                  result.matches.map((match, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                      <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-red-400 tracking-tighter">{match.category}</p>
                        <p className="text-sm font-bold text-slate-900">"{match.word}"</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-4 text-center text-slate-500 text-sm italic">
                    No obvious patterns detected. Still proceed with caution.
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 p-4 bg-purple-500/5 rounded-2xl border border-purple-500/10">
              <Info size={16} className="text-purple-600 shrink-0" />
              <p className="text-[11px] text-purple-700 font-medium">This is a local pattern match. It does not catch sophisticated AI-driven scams.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
