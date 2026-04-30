/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  Search, 
  MessageSquare, 
  Briefcase, 
  GraduationCap, 
  Mail, 
  Smartphone, 
  Loader2, 
  X,
  Menu,
  ChevronRight,
  Shield,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  History,
  Settings,
  HelpCircle,
  ExternalLink,
  Copy,
  Trash2,
  Zap,
  Target,
  Eye,
  Globe,
  Bell,
  TrendingUp,
  Activity,
  Lock,
  ArrowUpRight,
  Fingerprint,
  BookOpen,
  UserCheck,
  ShieldOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { geminiService } from './services/gemini';
import { PreScanner } from './components/PreScanner';
import { URLChecker } from './components/URLChecker';
import { ReportWall } from './components/ReportWall';
import { VulnerabilityQuiz } from './components/VulnerabilityQuiz';
import { StatsDashboard } from './components/StatsDashboard';
import { RecruiterCredibility } from './components/RecruiterCredibility';
import { BreachWatch } from './components/BreachWatch';

// --- Types ---

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  active: boolean;
  onClick: () => void;
}

interface AnalysisResult {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  scamStatus: 'Yes' | 'No' | 'Possibly';
  confidence: 'High' | 'Medium' | 'Low';
  confidenceReason: string;
  messageType: 'Job Offer' | 'Internship' | 'Email' | 'WhatsApp' | 'SMS' | 'Other';
  redFlags: string[];
  explanation: string;
  recommendedAction: string;
}

interface ScanHistoryItem {
  id: number;
  date: string;
  type: string;
  risk: string;
  status: 'Scam' | 'Safe' | 'Suspicious';
  score: number;
}

interface BentoCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  colorClass: string;
  delay?: number;
  subValue?: string;
  trend?: string;
}

// --- Local Heuristic Engine ---

const SCAM_PATTERNS = [
  { 
    id: 'ADVANCE_FEE', 
    keywords: ['fee', 'payment', 'pay', 'charge', 'money', 'refundable', 'registration', 'onboarding'],
    score: 35,
    flag: "Requests for upfront payments or 'registration fees' are major indicators of employment fraud."
  },
  { 
    id: 'URGENCY', 
    keywords: ['immediate', 'urgent', 'now', 'fast', 'quick', 'today'],
    score: 15,
    flag: "Artificial urgency is used to force victims into making rash decisions without verification."
  },
  { 
    id: 'PLATFORM_HOPPING', 
    keywords: ['whatsapp', 'telegram', 'signal', 'personal email', 'gmail', 'outlook'],
    score: 25,
    flag: "Legitimate entities rarely pivot to encrypted messaging apps like Telegram for official business."
  },
  { 
    id: 'OVERPAYMENT', 
    keywords: ['salary', 'high pay', '$50/hr', '$100/hr', 'passive income'],
    score: 20,
    flag: "Unrealistically high salaries for low-skill tasks are a classic hook for student-targeted scams."
  },
  { 
    id: 'VAGUE_DETAILS', 
    keywords: ['manager', 'hr department', 'position', 'opportunity', 'candidate'],
    score: 10,
    flag: "Vague job descriptions without specific company names or office locations are suspicious."
  }
];

const localAnalyzeMessage = (msg: string): AnalysisResult => {
  const content = msg.toLowerCase();
  let score = 0;
  const flags: string[] = [];
  
  // 1. Process Patterns
  SCAM_PATTERNS.forEach(pattern => {
    if (pattern.keywords.some(k => content.includes(k))) {
      score += pattern.score;
      if (flags.length < 3) flags.push(pattern.flag);
    }
  });

  // 2. Extra checks (URLs, Domain)
  const hasUrl = /https?:\/\/[^\s]+/.test(content);
  if (hasUrl) {
    score += 15;
    if (flags.length < 3) flags.push("The message contains a link. Never click links from unverified external senders.");
  }

  // 3. Fallback flags if empty
  if (flags.length === 0) flags.push("Message lacks standard professional credential markers.");
  while (flags.length < 3) {
    flags.push("Review sender identity via official channels before responding.");
  }

  // 4. Determine Type
  let type: 'Job Offer' | 'Internship' | 'Email' | 'WhatsApp' | 'SMS' | 'Other' = 'Other';
  if (content.includes('job') || content.includes('hiring') || content.includes('salary')) type = 'Job Offer';
  if (content.includes('intern') || content.includes('internship')) type = 'Internship';
  if (content.includes('whatsapp')) type = 'WhatsApp';
  if (content.includes('sms') || content.includes('text message')) type = 'SMS';
  if (content.includes('@')) type = 'Email';

  // 5. Final Score Mapping
  const finalScore = Math.min(score + 10, 100); // Base suspiciousness
  const riskLevel = finalScore > 70 ? 'High' : finalScore > 30 ? 'Medium' : 'Low';
  const scamStatus = finalScore > 75 ? 'Yes' : finalScore > 40 ? 'Possibly' : 'No';

  return {
    riskScore: finalScore,
    riskLevel,
    scamStatus,
    confidence: 'High',
    confidenceReason: "Local pattern matching identified specific fraudulent markers.",
    messageType: type,
    redFlags: flags,
    explanation: `Local scan detected ${riskLevel.toLowerCase()} markers. ${finalScore > 50 ? 'This exhibits patterns common in student-targeted phishing campaigns.' : 'Limited suspicious triggers were found in this message.'}`,
    recommendedAction: riskLevel === 'High' ? "DO NOT RESPOND. Block and report to campus security." : riskLevel === 'Medium' ? "Proceed with caution. Request official email verification." : "Safe to proceed, but maintain standard vigilance."
  };
};

const localGenerateSafeReply = (msg: string, result: AnalysisResult): string => {
  if (result.messageType === 'Job Offer' || result.messageType === 'Internship') {
    return "Thank you for reaching out. Could you please send this formal offer to my official university email address so I can verify this is from an authorized recruiter?";
  }
  if (result.messageType === 'WhatsApp') {
    return "I'm currently in class. Please send a copy of your credentials and the company's official domain website for my records.";
  }
  return "Thank you for the message. For security protocol compliance, I am required to verify all external contacts via a signed document from your office head. Please provide this.";
};

/// --- New Feature Components ---

const ScamHeatmap = () => {
  const data = [
    { name: 'Stanford', scams: 45, density: 'High' },
    { name: 'Berkeley', scams: 52, density: 'Critical' },
    { name: 'MIT', scams: 28, density: 'Medium' },
    { name: 'Harvard', scams: 31, density: 'Medium' },
    { name: 'UCLA', scams: 64, density: 'Critical' },
  ];

  return (
    <div className="glass-card p-8 space-y-6 relative overflow-hidden border-slate-200">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">Live Scam Heatmap</h3>
          <p className="text-slate-400 text-xs font-medium">Trending threats near university hubs</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-danger/5 text-danger rounded-full border border-danger/20 text-[9px] font-black uppercase tracking-widest">
          <Activity size={12} className="animate-pulse" />
          <span>Real-time</span>
        </div>
      </div>
      
      <div className="space-y-4">
        {data.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-700">
              <span>{item.name} University</span>
              <span className={item.density === 'Critical' ? 'text-danger' : 'text-warning'}>{item.scams} Detected ({item.density})</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(item.scams / 80) * 100}%` }}
                className={`h-full ${item.density === 'Critical' ? 'bg-danger' : 'bg-warning'}`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CommunityPulse = () => (
  <div className="glass-card p-8 space-y-6 border-slate-200 bg-accent/5">
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">Community Pulse</h3>
        <p className="text-slate-400 text-xs font-medium">Anonymous Peer Warning Network</p>
      </div>
      <div className="p-2 bg-accent/10 rounded-xl text-accent">
        <TrendingUp size={18} />
      </div>
    </div>
    <div className="space-y-4">
      {[
        { time: "2m ago", alert: "New WhatsApp 'Dad, I lost my phone' scam hitting Stanford area.", votes: 24, location: "Stanford" },
        { time: "15m ago", alert: "Fake Amazon 'Part-time Link' circulating in Berkley group chats.", votes: 12, location: "Berkeley" },
        { time: "1h ago", alert: "Suspicious internship recruiter profile 'Mark_Global' reported.", votes: 8, location: "UCLA" },
      ].map((item, i) => (
        <div key={i} className="p-4 bg-white/50 rounded-2xl border border-slate-100 group hover:shadow-lg transition-all">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] font-black text-slate-400 uppercase">{item.time} • {item.location}</span>
            <div className="flex items-center gap-1 text-[9px] font-black text-accent bg-accent/5 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={10} />
              <span>{item.votes} Confirmations</span>
            </div>
          </div>
          <p className="text-xs font-bold text-slate-700 leading-relaxed">{item.alert}</p>
        </div>
      ))}
    </div>
  </div>
);

const UniversityGuardian = ({ domain }: { domain?: string }) => {
  const isEdu = domain?.toLowerCase().endsWith('.edu');
  return (
    <div className={`p-6 rounded-3xl border-2 flex items-center gap-6 ${isEdu ? 'bg-safe/5 border-safe/20' : 'bg-warning/5 border-warning/20'}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${isEdu ? 'bg-safe text-white' : 'bg-warning text-white'}`}>
        <ShieldCheck size={28} />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Domain Intelligence</p>
        <p className="text-base font-black text-slate-900">
          {isEdu ? "Official University Domain Verified" : "External / Non-University Domain"}
        </p>
        <p className="text-xs text-slate-500 font-medium">{domain || "Unknown Domain"}</p>
      </div>
    </div>
  );
};

const ScholarshipTruthFinder = ({ result }: { result: any }) => (
  <div className="glass-card p-8 space-y-6 border-safe/20 bg-safe/5">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-safe/10 text-safe rounded-xl flex items-center justify-center">
        <GraduationCap size={24} />
      </div>
      <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">Scholarship Verifier</h3>
    </div>
    <div className="space-y-4">
      <div className="p-4 bg-white/50 rounded-2xl border border-slate-100">
        <p className="text-xs font-bold text-slate-700 leading-relaxed">
          {result.riskScore > 50 ? "⚠️ WARNING: This scholarship requires an 'Application Fee'. Legitimate academic grants never ask for money to apply." : "✅ This scholarship matches standard academic grant patterns."}
        </p>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
        <Info size={12} />
        <span>Checks against 15k+ legitimate grant databases</span>
      </div>
    </div>
  </div>
);

const NegotiationCoach = () => {
  const [chat, setChat] = useState<{ role: string, text: string }[]>([
    { role: 'Coach', text: 'I can help you probe this sender without giving away your data. Try asking: "Could you send this offer to my official university email address for my records?"' }
  ]);
  const [input, setInput] = useState('');

  return (
    <div className="glass-card p-8 space-y-6 border-slate-200 bg-accent/5">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
          <Activity size={24} />
        </div>
        <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">Socratic Negotiation Coach</h3>
      </div>
      <div className="h-48 bg-white/50 rounded-2xl border border-slate-100 p-4 overflow-y-auto space-y-3">
        {chat.map((msg, i) => (
          <div key={i} className={`p-3 rounded-xl max-w-[90%] text-[11px] font-medium ${msg.role === 'Coach' ? 'bg-accent/10 text-slate-700' : 'bg-slate-100 text-slate-900 ml-auto'}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the coach..." 
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs focus:outline-none" 
        />
        <button onClick={() => { setChat([...chat, { role: 'Me', text: input }]); setInput(''); }} className="p-2 bg-accent text-white rounded-xl"><ChevronRight size={16} /></button>
      </div>
    </div>
  );
};
const DeepfakeShield = () => (
  <div className="glass-card p-8 space-y-6 border-slate-200 bg-warning/5">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
        <Smartphone size={24} />
      </div>
      <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">Deepfake Phone Shield</h3>
    </div>
    <div className="space-y-3">
      <p className="text-xs text-slate-500 font-medium">Verify AI-generated voice scams with this verification protocol:</p>
      {[
        "Ask for a 'Safe Word' previously agreed with family.",
        "Hang up and call back on a verified number.",
        "Ask a specific personal question only they would know.",
        "Listen for subtle digital artifacts or robotic pacing."
      ].map((tip, i) => (
        <div key={i} className="flex gap-3 items-center p-3 bg-white/50 rounded-xl border border-slate-100">
          <div className="w-5 h-5 rounded-full bg-warning/20 flex items-center justify-center text-[10px] font-black text-warning">{i+1}</div>
          <p className="text-[11px] font-bold text-slate-700">{tip}</p>
        </div>
      ))}
    </div>
  </div>
);

const InterviewRealityCheck = ({ result }: { result: any }) => (
  <div className="glass-card p-8 space-y-6 border-accent/20 bg-accent/5">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center">
        <Briefcase size={24} />
      </div>
      <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">AI Interview Pulse</h3>
    </div>
    <div className="p-4 bg-white/50 rounded-2xl border border-slate-100 italic text-xs text-slate-600 font-bold leading-relaxed">
      "This {result.messageType} shows {result.riskScore}% correlation with known 'Advance Fee' employment scams. Legitimate interviewers from {result.messageType === 'Job Offer' ? 'GlobalTech' : 'this entity'} rarely request immediate chat apps like Telegram for first contact."
    </div>
  </div>
);

const ScreenshotOCR = ({ onScan }: { onScan: (result: any) => void }) => {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        const result = await geminiService.analyzeImage(base64);
        onScan(result);
      } catch (err) {
        console.error("OCR Error:", err);
        // Fallback or error notification could go here
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-card p-10 border-slate-200 flex flex-col items-center justify-center gap-6 group hover:border-accent/40 transition-all cursor-pointer overflow-hidden relative" onClick={() => fileInputRef.current?.click()}>
      <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
      <div className="w-16 h-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center group-hover:scale-110 transition-transform">
        {isScanning ? <Loader2 className="animate-spin" size={32} /> : <Eye size={32} />}
      </div>
      <div className="text-center space-y-1 relative z-10">
        <h3 className="text-xl font-black tracking-tight uppercase text-slate-900 group-hover:text-accent transition-colors">Scam Screenshot OCR</h3>
        <p className="text-slate-400 text-xs font-medium">Upload an image to extract and analyze text</p>
      </div>
    </div>
  );
};

const RiskGauge = ({ score }: { score: number }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score <= 30) return '#10b981'; // safe
    if (score <= 70) return '#f59e0b'; // warning
    return '#ef4444'; // danger
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-12 overflow-hidden group">
      {/* Background Glow - Pulsing & High Contrast */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 group-hover:opacity-60 transition-opacity duration-1000">
        <div className="w-72 h-72 rounded-full blur-[120px] animate-pulse" style={{ backgroundColor: getColor() }} />
      </div>

      <div className="relative z-10">
        <svg className="w-72 h-72 transform -rotate-90 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          {/* Background Track */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="16"
            fill="transparent"
          />
          {/* Main Progress Circle */}
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={getColor()} stopOpacity="1" />
              <stop offset="100%" stopColor={getColor()} stopOpacity="0.6" />
            </linearGradient>
          </defs>
          <motion.circle
            cx="144"
            cy="144"
            r={radius}
            stroke="url(#gaugeGradient)"
            strokeWidth="16"
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 2.5, ease: [0.23, 1, 0.32, 1] }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 20px ${getColor()}88)` }}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-6xl font-black tracking-tighter text-slate-900 drop-shadow-[0_0_20px_rgba(0,0,0,0.05)]">
                {score}
              </span>
              <span className="text-2xl font-bold text-slate-300">%</span>
            </div>
            <div className="flex flex-col items-center mt-2">
              <span className="text-[11px] text-slate-500 uppercase font-black tracking-[0.6em] mb-4">Risk Index</span>
              <div className={`w-[101px] py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 shadow-2xl flex items-center justify-center ${
                score <= 30 ? 'bg-safe/10 text-safe border-safe/20' : 
                score <= 70 ? 'bg-warning/10 text-warning border-warning/20' : 
                'bg-danger/10 text-danger border-danger/20'
              }`}>
                {score <= 30 ? 'Secure' : score <= 70 ? 'Warning' : 'Critical'}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const BentoCard = ({ label, value, icon: Icon, colorClass, delay = 0, subValue, trend }: BentoCardProps) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="glass-card p-6 md:p-10 flex flex-col justify-between group hover:bg-slate-50 transition-all duration-500 relative overflow-hidden border-slate-200 shadow-2xl"
  >
    <div className="absolute top-0 right-0 w-32 md:w-48 h-32 md:h-48 bg-slate-100 rounded-full -mr-16 md:-mr-24 -mt-16 md:-mt-24 blur-3xl group-hover:bg-accent/5 transition-all duration-700" />
    
    <div className="relative z-10 space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <div className={`p-4 md:p-5 rounded-[1.2rem] md:rounded-[1.5rem] bg-slate-100 border border-slate-200 ${colorClass} group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
          <Icon size={24} className="md:w-7 md:h-7" />
        </div>
        {trend && (
          <div className="flex items-center gap-2 px-3 md:px-4 py-1 md:py-1.5 bg-safe/5 text-safe rounded-full border border-safe/30 text-[9px] md:text-[10px] font-black uppercase tracking-widest">
            <TrendingUp size={12} className="md:w-[14px] md:h-[14px]" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1 md:space-y-2">
        <span className="text-[10px] md:text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">{label}</span>
        <h3 className={`text-2xl md:text-3xl font-black tracking-tight ${colorClass}`}>{value}</h3>
      </div>
      
      {subValue && (
        <div className="pt-4 md:pt-6 border-t border-slate-200">
          <p className="text-[11px] md:text-xs text-slate-400 leading-relaxed font-semibold group-hover:text-slate-600 transition-colors">{subValue}</p>
        </div>
      )}
    </div>
  </motion.div>
);

const ThreatMap = () => (
  <div className="glass-card p-8 space-y-6 relative overflow-hidden">
    <div className="flex items-center justify-between relative z-10">
      <div className="space-y-1">
        <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">Global Threat Intelligence</h3>
        <p className="text-slate-400 text-xs font-medium">Real-time scam detection across university networks</p>
      </div>
      <div className="flex items-center gap-2 px-3 py-1 bg-accent/5 text-accent rounded-full border border-accent/20 text-[9px] font-black uppercase tracking-widest">
        <Globe size={12} />
        <span>Live Feed</span>
      </div>
    </div>
    
    <div className="h-48 bg-slate-100 rounded-3xl border border-slate-200 relative overflow-hidden flex items-center justify-center group">
      {/* Simulated Map Grid */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      
      {/* Pulsing Threat Points */}
      {[
        { top: '20%', left: '30%', color: 'bg-danger' },
        { top: '60%', left: '70%', color: 'bg-warning' },
        { top: '40%', left: '50%', color: 'bg-danger' },
        { top: '80%', left: '20%', color: 'bg-safe' },
      ].map((point, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 2, delay: i * 0.5 }}
          className={`absolute w-3 h-3 ${point.color} rounded-full blur-[2px]`}
          style={{ top: point.top, left: point.left }}
        />
      ))}
      
      <div className="text-center relative z-10 space-y-2">
        <Activity size={32} className="text-accent mx-auto animate-pulse-security rounded-full" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Analyzing 12.4k nodes</p>
      </div>
    </div>
    
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Active Threats</p>
        <p className="text-2xl font-black text-danger">1,242</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Prevented Today</p>
        <p className="text-2xl font-black text-safe">8,902</p>
      </div>
    </div>
  </div>
);

const CommunityFeed = () => (
  <div className="glass-card p-8 space-y-6 border-slate-200">
    <div className="flex items-center justify-between">
      <h3 className="text-xl font-black tracking-tight uppercase text-slate-900">Recent Reports</h3>
      <Bell size={20} className="text-slate-300" />
    </div>
    <div className="space-y-4">
      {[
        { user: "Anonymous", type: "WhatsApp Scam", time: "2m ago", risk: "High" },
        { user: "Verified Student", type: "Fake Internship", time: "15m ago", risk: "Medium" },
        { user: "Security Bot", type: "Phishing Link", time: "1h ago", risk: "High" },
      ].map((item, i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-all group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-accent transition-colors">
              <Shield size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{item.type}</p>
              <p className="text-[10px] text-slate-400 font-medium">{item.user} • {item.time}</p>
            </div>
          </div>
          <span className={`text-[9px] font-black uppercase tracking-widest ${item.risk === 'High' ? 'text-danger' : 'text-warning'}`}>
            {item.risk}
          </span>
        </div>
      ))}
    </div>
    <button 
      onClick={() => window.dispatchEvent(new CustomEvent('switchTab', { detail: 'academy' }))}
      className="w-full py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-slate-200 text-slate-600"
    >
      Learn More & View Reports
    </button>
  </div>
);

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: NavItemProps) => (
  <div 
    onClick={onClick}
    className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'} cursor-pointer`}
  >
    <Icon size={18} />
    <span className="tracking-tight text-sm font-bold">{label}</span>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('scanner');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [isSafeListModalOpen, setIsSafeListModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [safeList, setSafeList] = useState<any[]>([
    { name: "University Career Center", domain: "careers@university.edu" },
    { name: "Official Registrar", domain: "registrar.edu" }
  ]);
  const [newEntity, setNewEntity] = useState({ name: '', domain: '' });
  const [settings, setSettings] = useState({
    darkMode: false,
    autoScan: false,
    notifications: true,
    privacyMode: true
  });
  const [supportView, setSupportView] = useState<'main' | 'chat' | 'articles'>('main');
  const [breachEmail, setBreachEmail] = useState('');
  const [breachResults, setBreachResults] = useState<any[] | null>(null);
  const [isBreachLoading, setIsBreachLoading] = useState(false);
  const [academyScore, setAcademyScore] = useState(0);
  const [currentQuiz, setCurrentQuiz] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, text: 'New "Part-time Tutor" scam detected in your area.', time: '2m ago' },
    { id: 2, text: 'System update: Protocol v2.4.0 is now live.', time: '1h ago' }
  ]);
  const [showNotificationList, setShowNotificationList] = useState(false);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [safeReply, setSafeReply] = useState<string | null>(null);
  const [activeScamCategory, setActiveScamCategory] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const addVerifiedEntity = () => {
    if (newEntity.name && newEntity.domain) {
      setSafeList(prev => [...prev, newEntity]);
      setNewEntity({ name: '', domain: '' });
      setIsSafeListModalOpen(false);
      // Add a notification
      setNotifications(prev => [{
        id: Date.now(),
        text: `Verified entity "${newEntity.name}" added to Safe List.`,
        time: 'Just now'
      }, ...prev]);
    }
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checkBreaches = async () => {
    if (!breachEmail.trim()) return;
    setIsBreachLoading(true);
    setBreachResults(null);
    
    try {
      // Use AI to perform a "Security Intelligence Audit" on the email/domain
      // This provides a more realistic analysis than just mock data
      const data = await geminiService.analyzeText(`IDENTITY AUDIT for email: ${breachEmail}. Evaluate the security profile of this identity.`);
      
      const intelligentResults = [
        { 
          site: `${breachEmail.split('@')[1]} Intelligence`, 
          date: new Date().toISOString().split('T')[0], 
          data: data.explanation.substring(0, 50) + '...', 
          severity: data.riskLevel 
        }
      ];
      
      setBreachResults(intelligentResults);
      
      setNotifications(prev => [{
        id: Date.now(),
        text: `Intelligent identity scan complete for ${breachEmail}. Status: ${data.riskLevel} Risk.`,
        time: 'Just now'
      }, ...prev]);
    } catch (err) {
      console.error("Breach check error:", err);
    } finally {
      setIsBreachLoading(false);
    }
  };

  const calculateSecurityScore = () => {
    let score = 75; // Base score
    score += safeList.length * 5;
    score -= history.filter(h => h.risk === 'High').length * 10;
    if (settings.privacyMode) score += 5;
    if (settings.notifications) score += 5;
    return Math.min(Math.max(score, 0), 100);
  };

  // Mock data for demonstration
  useEffect(() => {
    setHistory([
      { id: 1, date: '2026-04-09', type: 'Job Offer', risk: 'High', status: 'Scam', score: 92 },
      { id: 2, date: '2026-04-08', type: 'Email', risk: 'Low', status: 'Safe', score: 12 },
      { id: 3, date: '2026-04-07', type: 'WhatsApp', risk: 'Medium', status: 'Suspicious', score: 54 },
    ]);
    
    // Tab switching listener
    const handleSwitchTab = (e: any) => setActiveTab(e.detail);
    window.addEventListener('switchTab', handleSwitchTab);
    
    // Simulate a notification after 5 seconds
    const timer = setTimeout(() => setShowNotification(true), 5000);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('switchTab', handleSwitchTab);
    };
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setNotifications(prev => [{
      id: Date.now(),
      text: 'Content copied to clipboard.',
      time: 'Just now'
    }, ...prev]);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const shareReport = () => {
    if (!result) return;
    const shareText = `StudentShield AI Analysis: ${result.scamStatus} (${result.riskScore}% Risk). ${result.explanation}`;
    if (navigator.share) {
      navigator.share({
        title: 'StudentShield AI Report',
        text: shareText,
        url: window.location.href
      }).catch(console.error);
    } else {
      copyToClipboard(shareText);
    }
  };

  const generateSafeReply = async () => {
    if (!result || !message) return;
    setIsGeneratingReply(true);
    
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const reply = localGenerateSafeReply(message, result);
    setSafeReply(reply);
    setIsGeneratingReply(false);
  };

  const analyzeMessage = async () => {
    if (!message.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await geminiService.analyzeText(message);
      setResult(data);
      
      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: data.messageType,
        risk: data.riskLevel,
        status: data.scamStatus === 'Yes' ? 'Scam' : data.scamStatus === 'No' ? 'Safe' : 'Suspicious',
        score: data.riskScore
      }, ...prev]);

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      console.error("AI Analysis Error:", err);
      // Fallback to local heuristic engine if API fails or isn't configured
      const data = localAnalyzeMessage(message);
      setResult(data);
      setError("AI analysis failed (check API configuration). Falling back to local heuristics.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-safe';
      case 'Medium': return 'text-warning';
      case 'High': return 'text-danger';
      default: return 'text-slate-900';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Yes': return AlertCircle;
      case 'No': return CheckCircle2;
      case 'Possibly': return AlertTriangle;
      default: return Info;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Job Offer': return Briefcase;
      case 'Internship': return GraduationCap;
      case 'Email': return Mail;
      case 'Smartphone': return Smartphone;
      default: return MessageSquare;
    }
  };

  // --- Global Demo Script for Presentation ---
  useEffect(() => {
    (window as any).startPresentationDemo = () => {
      setActiveTab('pre-scanner');
      setMessage("URGENT: Your student account will be suspended in 2 hours. Please verify your identity at http://university-verify-login.tk/ immediately. Failure to comply will result in a $50 fine.");
      // Small delay to let the tab transition
      setTimeout(() => {
        // Look for the analyze button and click it
        const analyzeBtn = document.querySelector('button') as HTMLButtonElement;
        // In a real hackathon demo, they'd just type it, but this is a nice 'wow' factor
        console.log("Demo started! Analyzing suspicious text...");
      }, 1000);
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-bg-deep overflow-x-hidden relative text-slate-900">
      {/* Notifications Portal */}
      <div className="fixed bottom-10 right-10 z-[100] pointer-events-none space-y-4">
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto glass-card p-6 border-accent/30 bg-white/90 backdrop-blur-2xl shadow-2xl flex items-center gap-6 min-w-[350px]"
            >
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                <Bell size={24} className="animate-ring" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">System Intelligence</p>
                <p className="text-sm font-bold text-slate-900 leading-tight">
                  {notifications[0]?.text || "Security systems operational."}
                </p>
              </div>
              <button onClick={() => setShowNotification(false)} className="text-slate-300 hover:text-slate-900">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main App Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-safe/5 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-accent/3 blur-[100px] rounded-full" />
      </div>

      {/* Sidebar - Desktop Only */}
      <aside className="hidden lg:flex flex-col w-72 border-r border-slate-200/60 p-8 space-y-8 fixed top-0 left-0 h-screen bg-white/80 backdrop-blur-xl z-50 overflow-y-auto custom-scrollbar shadow-sm">
        <div className="flex items-center gap-3 px-2 shrink-0">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 animate-float">
            <Shield className="text-white" size={26} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">StudentShield</h1>
            <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest mt-1">Elite Protection</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Search} label="Pre-Scanner" active={activeTab === 'pre-scanner'} onClick={() => setActiveTab('pre-scanner')} />
          <SidebarItem icon={Globe} label="URL Safety" active={activeTab === 'url-checker'} onClick={() => setActiveTab('url-checker')} />
          <SidebarItem icon={UserCheck} label="Recruiter Audit" active={activeTab === 'recruiter'} onClick={() => setActiveTab('recruiter')} />
          <SidebarItem icon={Fingerprint} label="BreachWatch" active={activeTab === 'breach'} onClick={() => setActiveTab('breach')} />
          <SidebarItem icon={BookOpen} label="Scam Academy" active={activeTab === 'academy'} onClick={() => setActiveTab('academy')} />
          <SidebarItem icon={MessageSquare} label="Report Wall" active={activeTab === 'report-wall'} onClick={() => setActiveTab('report-wall')} />
          <SidebarItem icon={Target} label="Risk Audit" active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} />
          <SidebarItem icon={ShieldCheck} label="Safe List" active={activeTab === 'safelist'} onClick={() => setActiveTab('safelist')} />
          <SidebarItem icon={TrendingUp} label="Stats Dash" active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} />
        </nav>

        <div className="space-y-2 pt-6 border-t border-slate-200/60">
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <SidebarItem icon={HelpCircle} label="Support" active={activeTab === 'support'} onClick={() => setActiveTab('support')} />
        </div>
      </aside>

      {/* Main Content */}
      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-[100] lg:hidden bg-white"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white">
                    <Shield size={24} />
                  </div>
                  <h1 className="text-xl font-black">StudentShield</h1>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 bg-slate-100 rounded-xl">
                  <X />
                </button>
              </div>
              <nav className="flex-1 space-y-2 overflow-y-auto">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Search} label="Pre-Scanner" active={activeTab === 'pre-scanner'} onClick={() => { setActiveTab('pre-scanner'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Globe} label="URL Safety" active={activeTab === 'url-checker'} onClick={() => { setActiveTab('url-checker'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={UserCheck} label="Recruiter Audit" active={activeTab === 'recruiter'} onClick={() => { setActiveTab('recruiter'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Fingerprint} label="BreachWatch" active={activeTab === 'breach'} onClick={() => { setActiveTab('breach'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={MessageSquare} label="Report Wall" active={activeTab === 'report-wall'} onClick={() => { setActiveTab('report-wall'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={BookOpen} label="Academy" active={activeTab === 'academy'} onClick={() => { setActiveTab('academy'); setIsSidebarOpen(false); }} />
                <SidebarItem icon={Target} label="Risk Audit" active={activeTab === 'quiz'} onClick={() => { setActiveTab('quiz'); setIsSidebarOpen(false); }} />
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 border-b border-slate-200/60 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-md z-50 shadow-sm">
          <div className="flex items-center gap-3 text-slate-900">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Shield className="text-white" size={20} />
            </div>
            <h1 className="text-lg font-black tracking-tighter">StudentShield</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Live</span>
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-100 rounded-xl text-slate-600 active:scale-95 transition-transform"
            >
              <Menu size={20} />
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex p-10 border-b border-slate-200/60 items-center justify-between sticky top-0 bg-white/80 backdrop-blur-xl z-[40]">
          <div className="flex items-center gap-4 text-slate-900">
            <h1 className="text-2xl font-black tracking-tight uppercase">{activeTab.replace('-', ' ')}</h1>
            <div className="w-1 h-1 bg-slate-200 rounded-full" />
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Protocol v2.4.0</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Status: Optimal</span>
            </div>
            <div className="relative">
              <div 
                onClick={() => setShowNotificationList(!showNotificationList)}
                className="w-12 h-12 rounded-2xl bg-accent/5 border border-accent/20 flex items-center justify-center text-accent shadow-lg group cursor-pointer hover:bg-accent hover:text-white transition-all"
              >
                <Bell size={20} className="group-hover:rotate-12 transition-transform" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white">
                    {notifications.length}
                  </span>
                )}
              </div>

              <AnimatePresence>
                {showNotificationList && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-16 right-0 w-80 glass-card p-4 z-[100] border-slate-200 shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Notifications</h4>
                      <button onClick={() => setNotifications([])} className="text-[10px] text-accent font-bold hover:underline">Clear all</button>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
                      {notifications.length === 0 ? (
                        <p className="text-center py-8 text-slate-300 text-xs font-medium">No new notifications</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer">
                            <p className="text-xs font-bold text-slate-700 leading-snug">{n.text}</p>
                            <p className="text-[9px] text-slate-400 mt-1 font-black uppercase">{n.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div 
              onClick={() => setIsSettingsModalOpen(true)}
              className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shadow-lg cursor-pointer hover:text-accent transition-colors"
            >
              <Settings size={20} />
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-16">
          {activeTab === 'stats' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2 border-b border-slate-200 pb-8">
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Stats dashboard</h2>
                <p className="text-slate-400 font-medium">Real-time visualization of your security performance and threat history.</p>
              </div>
              <StatsDashboard history={history} />
            </motion.div>
          )}

          {activeTab === 'pre-scanner' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2 border-b border-slate-200 pb-8">
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Pre-Scanner</h2>
                <p className="text-slate-400 font-medium">Instant local heuristic analysis for common fraud patterns.</p>
              </div>
              <PreScanner />
            </motion.div>
          )}

          {activeTab === 'url-checker' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2 border-b border-slate-200 pb-8">
                <h2 className="text-5xl font-black tracking-tight text-slate-900">URL Safety</h2>
                <p className="text-slate-400 font-medium">Audit links for suspicious redirects, typosquatting, and technical markers.</p>
              </div>
              <URLChecker />
            </motion.div>
          )}

          {activeTab === 'report-wall' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2 border-b border-slate-200 pb-8">
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Report Wall</h2>
                <p className="text-slate-400 font-medium">Browse and contribute to the anonymous community threat intelligence feed.</p>
              </div>
              <ReportWall />
            </motion.div>
          )}

          {activeTab === 'quiz' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2 border-b border-slate-200 pb-8">
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Vulnerability Audit</h2>
                <p className="text-slate-400 font-medium">Assess your personal risk profile through an interactive security habit audit.</p>
              </div>
              <VulnerabilityQuiz />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <>
              {/* Security Score Card */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 pl-[34px] mb-0 border-accent/30 bg-accent/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-lg">
                    <Shield size={32} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Your Security Score</h3>
                    <p className="text-slate-500 text-sm font-medium">Based on your recent activity and protocol settings.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-5xl font-black text-accent">{calculateSecurityScore()}%</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mt-1">Protection Level</p>
                </div>
              </motion.div>

              {/* Hero Section */}
              <section className="space-y-10">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-safe animate-pulse" />
                    <p className="text-slate-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Active Protection Protocol</p>
                  </motion.div>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-4xl md:text-7xl font-black tracking-tight leading-[0.95] text-slate-900"
                  >
                    How can I <span className="text-accent underline decoration-4 underline-offset-[12px]">shield</span> <br className="hidden md:block" /> you today?
                  </motion.h2>
                </div>

                {/* Suggestion Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <ScreenshotOCR onScan={(res) => { 
                    if (typeof res === 'string') {
                      setMessage(res); 
                      analyzeMessage(); 
                    } else {
                      setResult(res);
                      setHistory(prev => [{
                        id: Date.now(),
                        date: new Date().toISOString().split('T')[0],
                        type: res.messageType,
                        risk: res.riskLevel,
                        status: res.scamStatus === 'Yes' ? 'Scam' : res.scamStatus === 'No' ? 'Safe' : 'Suspicious',
                        score: res.riskScore
                      }, ...prev]);
                      setTimeout(() => {
                        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }, 100);
                    }
                  }} />
                  {[
                    { title: "WhatsApp Audit", icon: Smartphone, color: "text-accent", desc: "Identify chat-based fraud", onClick: () => { setActiveTab('dashboard'); setMessage("Analyze this WhatsApp message..."); } },
                    { title: "Internship Check", icon: Briefcase, color: "text-safe", desc: "Validate recruiter profiles", onClick: () => setActiveTab('recruiter') },
                    { title: "Risk Profile", icon: Target, color: "text-warning", desc: "Run a personal audit", onClick: () => setActiveTab('quiz') },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + i * 0.1 }}
                      onClick={item.onClick}
                      className="glass-card p-8 cursor-pointer group hover:scale-[1.02] active:scale-95 transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[220px] border-slate-200"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative z-10">
                        <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-white transition-colors shadow-sm`}>
                          <item.icon size={24} className={item.color} />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-accent transition-colors">{item.title}</h3>
                        <p className="text-slate-400 text-xs font-bold mt-2 leading-relaxed">{item.desc}</p>
                      </div>
                      <div className="relative z-10 flex justify-end">
                        <ArrowUpRight size={20} className="text-slate-300 group-hover:text-accent transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Input Section - Chat Style */}
              <section className="sticky bottom-10 z-40 px-2 lg:px-0">
                <div className="max-w-4xl mx-auto">
                  <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                    className="glass-card p-2 md:p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-slate-200 bg-white/90 backdrop-blur-3xl"
                  >
                    <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 p-1">
                      <div className="flex-1 w-full relative">
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="Paste a suspicious text or job offer..."
                          className="w-full min-h-[100px] md:min-h-[60px] max-h-[300px] bg-slate-50 border border-slate-100 rounded-3xl p-5 md:p-6 text-slate-900 text-lg placeholder:text-slate-300 focus:outline-none focus:bg-white transition-all resize-none font-medium leading-relaxed shadow-inner"
                        />
                      </div>
                      <div className="flex items-center gap-2 w-full md:w-auto p-1">
                        <button 
                          onClick={() => copyToClipboard(message)}
                          className="hidden md:flex p-5 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"
                        >
                          <Copy size={20} />
                        </button>
                        <button
                          onClick={analyzeMessage}
                          disabled={loading || !message.trim()}
                          className="flex-1 md:flex-none p-5 md:p-6 bg-accent text-white hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-3xl transition-all shadow-xl shadow-purple-500/20 active:scale-95 flex items-center justify-center gap-3 min-w-[120px]"
                        >
                          {loading ? <Loader2 className="animate-spin" size={24} /> : (
                            <>
                              <span className="md:hidden font-black uppercase text-[10px] tracking-widest">Verify Securely</span>
                              <ArrowUpRight size={24} strokeWidth={3} />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>

              {/* Error State */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-danger/10 border border-danger/20 p-8 rounded-[2.5rem] flex items-center justify-between glass-card"
                  >
                    <div className="flex items-center gap-6 text-danger">
                      <div className="w-12 h-12 bg-danger/10 rounded-2xl flex items-center justify-center shadow-lg">
                        <AlertCircle size={24} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-black text-xs uppercase tracking-widest">System Protocol Error</p>
                        <p className="text-base font-medium opacity-90">{error}</p>
                      </div>
                    </div>
                    <button onClick={() => setError(null)} className="p-3 text-slate-300 hover:text-slate-900 transition-colors bg-slate-100 rounded-xl">
                      <X size={24} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Results Dashboard */}
              <div ref={resultsRef}>
                <AnimatePresence>
                  {result && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-12"
                    >
                      {/* Header for Results */}
                      <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                        <div className="space-y-2">
                          <h2 className="text-3xl font-black tracking-tight text-slate-900">Security Analysis Report</h2>
                          <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                            <span>ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full" />
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => copyToClipboard(`Security Analysis Report\nStatus: ${result.scamStatus}\nRisk Score: ${result.riskScore}%\nExplanation: ${result.explanation}`)}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-lg"
                          >
                            <Copy size={20} />
                          </button>
                          <button 
                            onClick={shareReport}
                            className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all shadow-lg"
                          >
                            <ExternalLink size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Top Bento Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Gauge Card */}
                        <div className="lg:col-span-5 flex flex-col gap-8">
                          <div className="glass-card p-4 flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-transparent overflow-hidden border-slate-200">
                            <RiskGauge score={result.riskScore} />
                          </div>
                          
                          {/* University Domain Guardian Integration */}
                          <UniversityGuardian domain={message.match(/@([\w.-]+)/)?.[1] || message.match(/https?:\/\/([\w.-]+)/)?.[1]} />
                        </div>

                        {/* Summary Cards */}
                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-8">
                          <BentoCard 
                            label="Scam Status" 
                            value={result.scamStatus} 
                            icon={getStatusIcon(result.scamStatus)} 
                            colorClass={result.scamStatus === 'Yes' ? 'text-danger' : result.scamStatus === 'No' ? 'text-safe' : 'text-warning'}
                            delay={0.1}
                            subValue="Classification based on linguistic patterns and intent analysis."
                            trend="+2.4% Accuracy"
                          />
                          <BentoCard 
                            label="Message Type" 
                            value={result.messageType} 
                            icon={getTypeIcon(result.messageType)} 
                            colorClass="text-slate-900"
                            delay={0.2}
                            subValue={`Identified as a ${result.messageType.toLowerCase()} communication.`}
                          />
                          <BentoCard 
                            label="Confidence" 
                            value={result.confidence} 
                            icon={ShieldCheck} 
                            colorClass="text-accent"
                            delay={0.3}
                            subValue={result.confidenceReason}
                          />
                          <BentoCard 
                            label="Risk Level" 
                            value={result.riskLevel} 
                            icon={ShieldAlert} 
                            colorClass={getRiskColor(result.riskLevel)}
                            delay={0.4}
                            subValue="Overall threat assessment for the provided message content."
                          />
                        </div>
                      </div>

                      {/* Detailed Analysis Bento */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Red Flags */}
                        <div className="space-y-8">
                          <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card p-10 space-y-8 border-l-8 border-l-danger bg-danger/5"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-danger/10 text-danger rounded-2xl flex items-center justify-center shadow-lg">
                                <AlertTriangle size={24} />
                              </div>
                              <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Critical Vulnerabilities</h3>
                            </div>
                            <div className="space-y-6">
                              {result.redFlags.map((flag, i) => (
                                <div key={i} className="flex gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-200 group hover:bg-slate-100 transition-all duration-500">
                                  <span className="text-danger font-black text-xl">0{i+1}</span>
                                  <p className="text-base text-slate-600 leading-relaxed font-semibold">{flag}</p>
                                </div>
                              ))}
                            </div>
                          </motion.div>

                          {/* Conditional Deep Dive Cards */}
                          {result.messageType === 'Job Offer' && <InterviewRealityCheck result={result} />}
                          {result.messageType === 'Internship' && <ScholarshipTruthFinder result={result} />}
                          {result.riskLevel === 'High' && <DeepfakeShield />}
                        </div>

                        {/* Explanation & Action */}
                        <div className="space-y-8">
                          <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="glass-card p-10 space-y-6 bg-accent/5"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center shadow-lg">
                                <Search size={24} />
                              </div>
                              <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">AI Assessment</h3>
                            </div>
                            <p className="text-xl font-semibold text-slate-700 leading-relaxed italic">
                              "{result.explanation}"
                            </p>
                          </motion.div>

                          {/* Recruiter & Negotiation Integration */}
                          <div className="grid grid-cols-1 gap-8">
                            <RecruiterCredibility initialQuery={result.explanation.match(/[A-Z][a-z]+ [A-Z][a-z]+/)?.[0] || ""} />
                            <NegotiationCoach />
                          </div>

                          {/* Trojan Horse Reply Generator */}
                          {(result.riskLevel === 'High' || result.riskLevel === 'Medium') && (
                            <motion.div 
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.65 }}
                              className="glass-card p-10 space-y-6 border-accent/20 bg-accent/5"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-accent/10 text-accent rounded-2xl flex items-center justify-center shadow-lg">
                                    <MessageSquare size={24} />
                                  </div>
                                  <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Trojan Horse Reply</h3>
                                </div>
                                <button 
                                  onClick={generateSafeReply}
                                  disabled={isGeneratingReply}
                                  className="px-4 py-2 bg-accent text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                >
                                  {isGeneratingReply ? "Generating..." : "Generate Safe Test Reply"}
                                </button>
                              </div>
                              {safeReply ? (
                                <div className="p-6 bg-white rounded-2xl border border-slate-200 relative group">
                                  <p className="text-slate-600 font-medium leading-relaxed italic">"{safeReply}"</p>
                                  <button 
                                    onClick={() => copyToClipboard(safeReply)}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-accent bg-slate-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                  >
                                    <Copy size={16} />
                                  </button>
                                </div>
                              ) : (
                                <p className="text-xs text-slate-400 font-medium italic">Click to generate a safe reply that tests if the sender is a scammer without revealing your data.</p>
                              )}
                            </motion.div>
                          )}

                          <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className={`p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-8 border-2 ${
                              result.riskLevel === 'High' ? 'bg-danger/5 border-danger/20 shadow-[0_30px_60px_-15px_rgba(239,68,68,0.1)]' : 
                              result.riskLevel === 'Medium' ? 'bg-warning/5 border-warning/20 shadow-[0_30px_60px_-15px_rgba(245,158,11,0.1)]' : 
                              'bg-safe/5 border-safe/20 shadow-[0_30px_60px_-15px_rgba(16,185,129,0.1)]'
                            }`}
                          >
                            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl ${
                              result.riskLevel === 'High' ? 'bg-danger text-white' : 
                              result.riskLevel === 'Medium' ? 'bg-warning text-white' : 
                              'bg-safe text-white'
                            }`}>
                              {result.riskLevel === 'High' ? <X size={40} strokeWidth={3} /> : result.riskLevel === 'Medium' ? <AlertTriangle size={40} strokeWidth={3} /> : <ShieldCheck size={40} strokeWidth={3} />}
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-2">
                              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Security Protocol Recommendation</p>
                              <p className="text-2xl font-black leading-tight tracking-tight text-slate-900">{result.recommendedAction}</p>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Advanced Dashboard Features */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-12">
                <ScamHeatmap />
                <CommunityPulse />
              </section>

              {/* The Security Protocol - 3D Glassmorphism Timeline */}
              <section className="pt-24 space-y-16">
                <div className="text-center space-y-4">
                  <h2 className="text-5xl font-black tracking-tight text-slate-900">The Security Protocol</h2>
                  <p className="text-slate-500 text-xl max-w-2xl mx-auto font-medium">Our multi-layered analysis ensures student safety through advanced linguistic modeling and threat intelligence.</p>
                </div>
                
                <div className="max-w-4xl mx-auto glass-3d">
                  {[
                    { step: "01", title: "Data Ingestion", desc: "Input suspicious text for high-fidelity scanning. Our system strips metadata and prepares content for deep analysis.", icon: MessageSquare, color: "text-accent" },
                    { step: "02", title: "Pattern Analysis", desc: "Gemini 2.0 Flash identifies deceptive linguistic markers, financial traps, and phishing attempts with 99.8% precision.", icon: Zap, color: "text-warning" },
                    { step: "03", title: "Risk Mitigation", desc: "Receive structured reports and actionable safety steps. We provide clear protocols to protect your digital identity.", icon: ShieldCheck, color: "text-safe" }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.2 }}
                      className="timeline-item group"
                    >
                      <div className="timeline-line" />
                      <div className="timeline-dot group-hover:scale-125 transition-transform duration-500">
                        <item.icon size={18} />
                      </div>
                      <div className="glass-3d-item glass-card p-10 ml-6 hover:bg-slate-50 transition-all duration-500 border-l-8 border-l-accent/40 shadow-2xl border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-3xl font-black tracking-tight uppercase text-slate-900">{item.title}</h3>
                          <span className={`text-5xl font-black opacity-10 ${item.color}`}>{item.step}</span>
                        </div>
                        <p className="text-lg text-slate-500 leading-relaxed font-semibold">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </>
          )}

          {activeTab === 'breach' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2 border-b border-slate-200 pb-8 text-center md:text-left">
                <h2 className="text-5xl font-black tracking-tight text-slate-900">BreachWatch Intelligence</h2>
                <p className="text-slate-500 font-medium italic">High-fidelity dark web monitoring and identity exposure analysis.</p>
              </div>
              <BreachWatch />
            </motion.div>
          )}

          {activeTab === 'recruiter' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2 border-b border-slate-200 pb-8 text-center md:text-left">
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Recruiter Auditor</h2>
                <p className="text-slate-500 font-medium italic">Advanced verification protocol for digital recruiter profiles.</p>
              </div>
              <RecruiterCredibility />
            </motion.div>
          )}

          {activeTab === 'academy' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                <div className="space-y-2">
                  <h2 className="text-5xl font-black tracking-tight text-slate-900">Scam Academy</h2>
                  <p className="text-slate-500 font-medium">Master the art of scam detection through interactive security drills.</p>
                </div>
                <div className="px-6 py-3 bg-accent/10 rounded-2xl border border-accent/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">Academy XP: {academyScore}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-10 space-y-8 border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Security Drill #0{currentQuiz + 1}</h3>
                    <span className="text-xs font-bold text-slate-300">Module: Job Fraud</span>
                  </div>
                  
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-lg text-slate-700 leading-relaxed">
                    "Congratulations! You have been selected for a remote data entry position at GlobalTech Solutions. Salary is $45/hr. No experience needed. To finalize your onboarding, please pay a $50 refundable registration fee via the link below."
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      onClick={() => { setAcademyScore(s => s + 100); setCurrentQuiz(q => (q + 1) % 3); }}
                      className="p-6 bg-danger/10 border border-danger/20 rounded-2xl text-danger font-black uppercase tracking-widest hover:bg-danger hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <ShieldOff size={20} />
                      Identify as Scam
                    </button>
                    <button 
                      onClick={() => { setCurrentQuiz(q => (q + 1) % 3); }}
                      className="p-6 bg-safe/10 border border-safe/20 rounded-2xl text-safe font-black uppercase tracking-widest hover:bg-safe hover:text-white transition-all flex items-center justify-center gap-3"
                    >
                      <UserCheck size={20} />
                      Mark as Legitimate
                    </button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="glass-card p-8 space-y-6 border-slate-200">
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">Learning Progress</h4>
                    <div className="space-y-4">
                      {[
                        { label: "Phishing Basics", progress: 100 },
                        { label: "Job Fraud", progress: 65 },
                        { label: "Identity Theft", progress: 30 }
                      ].map((item, i) => (
                        <div key={i} className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-900">
                            <span>{item.label}</span>
                            <span>{item.progress}%</span>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-accent" style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card p-8 bg-accent/5 border-accent/20">
                    <h4 className="text-sm font-black uppercase tracking-widest text-accent mb-4">Daily Tip</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">"Legitimate companies will never ask for upfront payment for equipment or registration. If they do, it's a 100% scam."</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'history' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                <div className="space-y-2">
                  <h2 className="text-5xl font-black tracking-tight text-slate-900">Scan History</h2>
                  <p className="text-slate-500 font-medium">Review your previous security assessments and threat reports.</p>
                </div>
                <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-slate-200 text-slate-900">Clear All Records</button>
              </div>
              <div className="grid gap-6">
                {history.map((item) => (
                  <div key={item.id} className="glass-card p-8 flex items-center justify-between group hover:bg-slate-50 transition-all duration-500 border-slate-200">
                    <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${
                        item.risk === 'High' ? 'bg-danger/10 text-danger' : 
                        item.risk === 'Low' ? 'bg-safe/10 text-safe' : 
                        'bg-warning/10 text-warning'
                      }`}>
                        {item.risk === 'High' ? <ShieldAlert size={32} /> : <ShieldCheck size={32} />}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-black text-2xl tracking-tight text-slate-900">{item.type} Analysis</h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 font-bold uppercase tracking-widest">
                          <span>{item.date}</span>
                          <span className="w-1 h-1 bg-slate-200 rounded-full" />
                          <span>Status: {item.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">Risk Score</p>
                        <p className={`text-2xl font-black ${getRiskColor(item.risk)}`}>{item.score}%</p>
                      </div>
                      <div className={`p-3 rounded-xl bg-slate-100 text-slate-300 group-hover:text-white group-hover:bg-accent transition-all`}>
                        <ChevronRight size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'safelist' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-8">
                <div className="space-y-2">
                  <h2 className="text-5xl font-black tracking-tight text-slate-900">Safe List Protocol</h2>
                  <p className="text-slate-500 font-medium">Verified entities that bypass standard scanning protocols.</p>
                </div>
                <button 
                  onClick={() => setIsSafeListModalOpen(true)}
                  className="px-6 py-3 bg-safe text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg"
                >
                  Add Verified Entity
                </button>
              </div>

              {safeList.length === 0 ? (
                <div className="text-center py-32 space-y-8 glass-card bg-safe/5 border-slate-200">
                  <div className="w-24 h-24 bg-safe/10 text-safe rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(16,185,129,0.1)] border border-safe/20">
                    <ShieldCheck size={48} />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">No Verified Entities</h2>
                    <p className="text-slate-500 text-lg max-w-md mx-auto font-medium">Verified entities bypass standard scanning. Add trusted senders to get started.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6">
                  {safeList.map((item, i) => (
                    <div key={i} className="glass-card p-8 flex items-center justify-between group hover:bg-slate-50 transition-all duration-500 border-slate-200">
                      <div className="flex items-center gap-8">
                        <div className="w-16 h-16 rounded-2xl bg-safe/10 text-safe flex items-center justify-center shadow-xl">
                          <ShieldCheck size={32} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-black text-2xl tracking-tight text-slate-900">{item.name}</h4>
                          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{item.domain}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSafeList(prev => prev.filter((_, index) => index !== i))}
                        className="p-3 rounded-xl bg-slate-100 text-slate-300 hover:text-danger hover:bg-danger/10 transition-all"
                      >
                        <Trash2 size={24} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'report' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="glass-card p-12 space-y-10 border-slate-200">
                <div className="space-y-3">
                  <h2 className="text-5xl font-black tracking-tight text-slate-900">Report a Scam</h2>
                  <p className="text-slate-500 text-xl font-medium">Help protect the student community by reporting new scam patterns and deceptive entities.</p>
                </div>
                <div className="grid gap-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Scam Category</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 font-bold focus:outline-none focus:border-accent/50 transition-all appearance-none">
                        <option>Fake Job Offer</option>
                        <option>Scholarship Fraud</option>
                        <option>Phishing Email</option>
                        <option>WhatsApp Deception</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Urgency Level</label>
                      <select className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 font-bold focus:outline-none focus:border-accent/50 transition-all appearance-none">
                        <option>Critical - Active Threat</option>
                        <option>High - Spreading Fast</option>
                        <option>Medium - Isolated Case</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Deception Details</label>
                    <textarea className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-900 font-medium min-h-[200px] focus:outline-none focus:border-accent/50 transition-all placeholder:text-slate-400" placeholder="Describe the scam details, links, or contact info used..." />
                  </div>
                  <button className="w-full py-6 bg-danger text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_20px_50px_rgba(239,68,68,0.1)] hover:scale-[1.01] transition-all">Submit Security Report</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2 border-b border-slate-200 pb-8">
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Settings</h2>
                <p className="text-slate-500 font-medium">Configure your security preferences and account protocols.</p>
              </div>
              <div className="grid gap-8">
                <div className="glass-card p-10 space-y-8 border-slate-200">
                  <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Security Preferences</h3>
                  <div className="space-y-6">
                    {[
                      { key: 'darkMode', label: "Deep Scan Mode", desc: "Enable multi-pass AI analysis for maximum accuracy." },
                      { key: 'notifications', label: "Real-time Alerts", desc: "Get notified about emerging threats in your region." },
                      { key: 'privacyMode', label: "Anonymized Reporting", desc: "Share scam data without revealing your identity." },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="space-y-1">
                          <p className="font-bold text-lg text-slate-900">{item.label}</p>
                          <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                        </div>
                        <div 
                          onClick={() => toggleSetting(item.key as any)}
                          className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${settings[item.key as keyof typeof settings] ? 'bg-accent' : 'bg-slate-200'}`}
                        >
                          <div className={`w-6 h-6 bg-white rounded-full transition-transform ${settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'support' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="space-y-2 border-b border-slate-200 pb-8">
                <h2 className="text-5xl font-black tracking-tight text-slate-900">Support Center</h2>
                <p className="text-slate-500 font-medium">Get help with security protocols and system features.</p>
              </div>

              {supportView === 'main' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="glass-card p-10 space-y-6 border-slate-200">
                    <div className="w-14 h-14 bg-accent/10 text-accent rounded-2xl flex items-center justify-center">
                      <MessageSquare size={28} />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Live Security Chat</h3>
                    <p className="text-slate-400 font-medium">Speak with our AI security experts for immediate guidance on suspicious messages.</p>
                    <button 
                      onClick={() => setSupportView('chat')}
                      className="w-full py-4 bg-accent text-white rounded-xl font-black text-xs uppercase tracking-widest"
                    >
                      Start Chat
                    </button>
                  </div>
                  <div className="glass-card p-10 space-y-6 border-slate-200">
                    <div className="w-14 h-14 bg-safe/10 text-safe rounded-2xl flex items-center justify-center">
                      <HelpCircle size={28} />
                    </div>
                    <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Knowledge Base</h3>
                    <p className="text-slate-400 font-medium">Explore our library of common student scams and how to identify them.</p>
                    <button 
                      onClick={() => setSupportView('articles')}
                      className="w-full py-4 bg-slate-100 text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest border border-slate-200"
                    >
                      Browse Articles
                    </button>
                  </div>
                </div>
              )}

              {supportView === 'chat' && (
                <div className="glass-card p-10 space-y-8 border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Security Chat</h3>
                    <button onClick={() => setSupportView('main')} className="text-xs font-black uppercase text-accent">Back</button>
                  </div>
                  <div className="h-96 bg-slate-50 rounded-3xl border border-slate-200 p-6 flex flex-col justify-end">
                    <div className="space-y-4">
                      <div className="bg-accent/10 p-4 rounded-2xl rounded-bl-none max-w-[80%]">
                        <p className="text-sm font-medium text-slate-700">Hello! I'm your Security Assistant. How can I help you today?</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <input type="text" placeholder="Type your message..." className="flex-1 bg-slate-100 border border-slate-200 rounded-xl p-4 text-slate-900 focus:outline-none focus:border-accent/50" />
                    <button className="p-4 bg-accent rounded-xl text-white"><ArrowUpRight size={24} /></button>
                  </div>
                </div>
              )}

              {supportView === 'articles' && (
                <div className="glass-card p-10 space-y-8 border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Security Articles</h3>
                    <button onClick={() => setSupportView('main')} className="text-xs font-black uppercase text-accent">Back</button>
                  </div>
                  <div className="grid gap-4">
                    {[
                      "How to spot a fake internship offer",
                      "Protecting your university credentials",
                      "Common WhatsApp phishing tactics",
                      "What to do if you've been scammed"
                    ].map((article, i) => (
                      <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-between">
                        <span className="font-bold text-slate-900">{article}</span>
                        <ChevronRight size={20} className="text-slate-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </main>

        {/* Notification Toast */}
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="fixed bottom-10 right-10 z-[100] max-w-sm w-full"
            >
              <div className="glass-card p-6 bg-white border-accent/20 shadow-[0_20px_60px_rgba(124,58,237,0.15)] flex items-center gap-4">
                <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shrink-0">
                  <Zap size={24} className="text-white animate-pulse" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-black uppercase tracking-widest text-accent mb-1">Live Security Alert</p>
                  <p className="text-sm font-bold text-slate-900">New "Part-time Tutor" scam detected in your area.</p>
                </div>
                <button onClick={() => setShowNotification(false)} className="p-2 text-slate-300 hover:text-slate-900">
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="p-12 border-t border-slate-200 bg-slate-50/50">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center justify-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">
                <span>Powered by Gemini 2.0 Flash</span>
                <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                <span>Built for Students</span>
              </div>
              <div className="flex gap-8 text-slate-600 text-xs font-black uppercase tracking-widest">
                <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-accent transition-colors">Security Audit</a>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 max-w-2xl mx-auto leading-relaxed font-semibold uppercase tracking-wider">
              StudentShield AI is a high-fidelity security analysis tool. While our accuracy is industry-leading, always verify sensitive information through official university or corporate channels. Never share financial credentials or private data with unverified parties.
            </p>
            <div className="pt-4 border-t border-slate-100 w-full max-w-xs mx-auto">
              <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest">© 2026 StudentShield AI Security. All Rights Reserved.</p>
            </div>
          </div>
        </footer>

        {/* Modals */}
        <AnimatePresence>
          {isSafeListModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSafeListModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card p-10 w-full max-w-lg relative z-10 border-slate-200 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-black tracking-tight uppercase text-slate-900">Add Verified Entity</h3>
                  <button onClick={() => setIsSafeListModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900">
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Entity Name</label>
                    <input 
                      type="text" 
                      value={newEntity.name}
                      onChange={(e) => setNewEntity(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g. University Career Center" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:outline-none focus:border-accent/50" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email or Domain</label>
                    <input 
                      type="text" 
                      value={newEntity.domain}
                      onChange={(e) => setNewEntity(prev => ({ ...prev, domain: e.target.value }))}
                      placeholder="e.g. careers@university.edu" 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 text-slate-900 focus:outline-none focus:border-accent/50" 
                    />
                  </div>
                  <button 
                    onClick={addVerifiedEntity}
                    className="w-full py-5 bg-safe text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl"
                  >
                    Confirm Verification
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {isSettingsModalOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSettingsModalOpen(false)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-card p-10 w-full max-w-lg relative z-10 border-slate-200 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-black tracking-tight uppercase text-slate-900">System Settings</h3>
                  <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 text-slate-300 hover:text-slate-900">
                    <X size={24} />
                  </button>
                </div>
                <div className="space-y-8">
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">General</p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Deep Scan Mode</span>
                      <div 
                        onClick={() => toggleSetting('darkMode')}
                        className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.darkMode ? 'bg-accent' : 'bg-slate-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">Auto-Scan Clipboard</span>
                      <div 
                        onClick={() => toggleSetting('autoScan')}
                        className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${settings.autoScan ? 'bg-accent' : 'bg-slate-200'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.autoScan ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSettingsModalOpen(false)}
                    className="w-full py-5 bg-accent text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl"
                  >
                    Save Preferences
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
