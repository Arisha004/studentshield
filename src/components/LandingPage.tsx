import React from "react";
import { ContainerScroll } from "./ui/container-scroll-animation";
import { motion } from "framer-motion";
import { Shield, Zap, Lock, Eye, Globe, UserCheck, ChevronRight, CheckCircle2, ShieldAlert, Fingerprint, Activity, MousePointer2 } from "lucide-react";

export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div className="flex flex-col bg-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
              <Shield className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">StudentShield</h1>
              <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mt-0.5">Scam Intelligence</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-bold text-slate-500 hover:text-purple-600 transition-colors"
            >
              Features
            </button>
            <button 
              onClick={() => document.getElementById('protocol')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-bold text-slate-500 hover:text-purple-600 transition-colors"
            >
              Protocol
            </button>
            <button 
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
            >
              Get Started
            </button>
          </div>
          
          <button onClick={onGetStarted} className="md:hidden p-2 text-purple-600 border border-purple-100 rounded-lg">
            <UserCheck size={20} />
          </button>
        </div>
      </nav>

      <div className="pt-20">
        <ContainerScroll
          titleComponent={
            <div className="px-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-full text-xs font-black uppercase tracking-widest mb-6"
              >
                <Activity size={14} className="animate-pulse" />
                <span>Next-Gen Security for students</span>
              </motion.div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 pb-2 md:pb-6 leading-[1.1] tracking-tight">
                Defend Your Digital Life <br className="hidden md:block" /> With Forensic AI.
              </h1>
              <h2 className="text-5xl md:text-[8rem] font-black leading-none text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 tracking-tighter mb-8 py-2">
                StudentShield
              </h2>
            </div>
          }
        >
          <div className="h-full w-full flex items-center justify-center bg-slate-50 p-6 md:p-12 relative overflow-hidden">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl">
                <div className="space-y-6 text-center md:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs md:sm font-bold">
                    <Zap size={14} className="md:w-4 md:h-4" />
                    <span>Powered by Gemini 1.5 Flash</span>
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                    Military-Grade <br className="hidden md:block" /> Audit Tech For <br className="hidden md:block" /> Every Student.
                  </h3>
                  <p className="text-slate-500 font-medium text-base md:text-lg max-w-md mx-auto md:mx-0">
                    Direct access to specialized LLM models trained to catch social engineering patterns that typical security software misses.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-6">
                    <button 
                      onClick={onGetStarted}
                      className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-xl shadow-purple-200 active:scale-95 whitespace-nowrap"
                    >
                      Enter Dashboard <ChevronRight size={20} />
                    </button>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex -space-x-3">
                        {[
                          "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=100",
                          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=100",
                          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100"
                        ].map((url, i) => (
                          <div key={i} className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                            <img src={url} alt="Student" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Joined by 2k+ Students</p>
                        <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Active Protection</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4 px-2 md:px-0">
                  <FeatureCard icon={Lock} title="Identity Protection" desc="OCR verification" />
                  <FeatureCard icon={Eye} title="Deep Analysis" desc="Heuristic scam detection" />
                  <FeatureCard icon={Globe} title="URL Forensics" desc="Redirect audit" />
                  <FeatureCard icon={UserCheck} title="HR Audit" desc="Profile verification" />
                </div>
             </div>
          </div>
        </ContainerScroll>
      </div>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="space-y-4 max-w-2xl">
              <p className="text-xs font-black text-purple-600 uppercase tracking-widest">Core Capabilities</p>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Technical Forensics <br /> for the Modern Web.</h2>
            </div>
            <button 
              onClick={onGetStarted}
              className="px-6 py-3 border-2 border-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all"
            >
              Learn More
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <DetailedFeature 
              icon={Shield} 
              title="Identity Scrutiny" 
              desc="We verify recruiter profiles against real-world HR data to ensure you aren't being ghost-hired for data harvesting."
            />
            <DetailedFeature 
              icon={Globe} 
              title="URL Deep-Scan" 
              desc="Our engine follows redirect chains and analyzes typosquatting patterns to detect malicious link spoofs before you click."
            />
            <DetailedFeature 
              icon={Zap} 
              title="SMS/Chat Heuristics" 
              desc="Scan WhatsApp, Discord, or SMS text using linguistic models trained to identify social engineering escalation."
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section id="protocol" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                <ShieldAlert size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                Why generic security <br /> fails students.
              </h2>
              <p className="text-slate-500 font-medium text-lg leading-relaxed">
                Most students use common email filters and basic antivirus. But scammers target the **human element**. StudentShield is built specifically for academic threats.
              </p>
              
              <div className="space-y-4">
                <ComparisonItem bad="Generic Filter" good="StudentShield AI" />
                <ComparisonItem bad="Manual Checking" good="Automated Hueristics" />
                <ComparisonItem bad="After-the-fact" good="Proactive Pre-Scanner" />
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 rounded-[40px] blur-3xl" />
              <div className="relative glass-card p-8 md:p-12 border-slate-200 bg-white/50 space-y-8 overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="text-purple-600" size={24} />
                    <span className="font-black uppercase tracking-widest text-xs">Analysis Engine v1.5</span>
                  </div>
                  <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black uppercase">Operational</div>
                </div>
                
                <div className="space-y-6">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-slate-50 rounded-2xl rounded-bl-none space-y-1 max-w-[85%]"
                  >
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Input Stream</p>
                    <p className="text-sm font-bold text-slate-700">"Congratulations! You've been selected for our high-paying remote tutor position. Deposit this check to start..."</p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8 }}
                    className="p-4 bg-purple-600 text-white rounded-2xl rounded-br-none space-y-1 ml-auto max-w-[85%] shadow-xl shadow-purple-200"
                  >
                    <div className="flex items-center gap-2">
                       <ShieldAlert size={14} className="text-purple-200" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-purple-200">System Verdict</p>
                    </div>
                    <p className="text-sm font-black italic">ALERT: Advanced Identity Harvesting & Check-Kit Fraud Signature Detected.</p>
                  </motion.div>
                </div>
                
                <div className="flex justify-center pt-4">
                  <Activity className="text-slate-200 animate-pulse" size={32} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-12 md:space-y-16">
          <div className="space-y-4">
            <h3 className="text-2xl md:text-3xl font-black text-slate-900">Protected over 2k+ Academic Sessions</h3>
            <p className="text-slate-400 md:text-slate-500 font-medium max-w-2xl mx-auto text-sm md:text-base">
              Deployed across campuses to identify and block targeted social engineering attacks.
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-12 opacity-40 grayscale transition-all">
             <div className="flex items-center justify-center gap-2 font-black text-sm md:text-xl text-slate-400">🛡️ SECURE.EDU</div>
             <div className="flex items-center justify-center gap-2 font-black text-sm md:text-xl text-slate-400">🎓 CAMPUS.AF</div>
             <div className="flex items-center justify-center gap-2 font-black text-sm md:text-xl text-slate-400">🔥 HACK.ATHON</div>
             <div className="flex items-center justify-center gap-2 font-black text-sm md:text-xl text-slate-400">⚡ QUICK.AI</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
                <h4 className="text-xl font-black tracking-tight">StudentShield</h4>
              </div>
              <p className="text-sm font-medium text-slate-400 text-center md:text-left max-w-xs">
                Empowering students to navigate the digital world safely through elite-grade AI intervention.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-12 text-center md:text-left">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Platform</p>
                <div className="flex flex-col gap-2 text-sm font-bold text-slate-400 underline underline-offset-4 decoration-slate-100">
                  <a href="#" onClick={(e) => { e.preventDefault(); onGetStarted(); }}>Dashboard</a>
                  <a href="#features" onClick={(e) => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Audit Engine</a>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Legal</p>
                <div className="flex flex-col gap-2 text-sm font-bold text-slate-400 underline underline-offset-4 decoration-slate-100">
                  <a href="#">Privacy</a>
                  <a href="#">Terms</a>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Project</p>
                <div className="flex flex-col gap-2 text-sm font-bold text-slate-400 underline underline-offset-4 decoration-slate-100">
                  <a href="#">Github</a>
                  <a href="#">Devpost</a>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-purple-600">Created For Hackathon</p>
              <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">AI-SEEKHO 2026</p>
            </div>
            
            <div className="space-y-2">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Developed By</p>
               <p className="text-sm font-black text-slate-900 italic">ARISHA MUMTAZ</p>
            </div>

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              © 2026 StudentShield Security Protocol
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center md:items-start text-center md:text-left gap-2 md:gap-4 group hover:border-purple-200 transition-all cursor-pointer">
    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 text-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
      <Icon size={20} className="md:w-6 md:h-6" />
    </div>
    <div className="space-y-1">
      <span className="font-bold text-slate-900 text-xs md:text-sm block">{title}</span>
      <span className="text-[10px] text-slate-400 font-medium block">{desc}</span>
    </div>
  </div>
);

const DetailedFeature = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/50 space-y-6">
    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
      <Icon size={28} />
    </div>
    <div className="space-y-3">
      <h4 className="text-xl font-black text-slate-900 tracking-tight">{title}</h4>
      <p className="text-sm font-medium text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ComparisonItem = ({ bad, good }: { bad: string; good: string }) => (
  <div className="flex items-center gap-4">
    <div className="p-2 bg-red-100 text-red-500 rounded-lg">
      <ShieldAlert size={16} />
    </div>
    <span className="text-sm font-bold text-slate-400">{bad}</span>
    <ChevronRight size={16} className="text-slate-200" />
    <div className="p-2 bg-green-100 text-green-500 rounded-lg">
      <CheckCircle2 size={16} />
    </div>
    <span className="text-sm font-bold text-slate-900">{good}</span>
  </div>
);
