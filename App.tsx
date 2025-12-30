
import React, { useState, useRef } from 'react';
import { TitanAnalysis, TitanVerdict, EmpireAudit } from './types';
import { parseRawFiles, analyzeStocksWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [empireAudit, setEmpireAudit] = useState<EmpireAudit | null>(null);
  const [analyzedStocks, setAnalyzedStocks] = useState<TitanAnalysis[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'audit' | 'dashboard'>('audit');
  const [peaceStatus, setPeaceStatus] = useState("PEACE Protocol: ACTIVE");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Empire Audit Form State
  const [auditForm, setAuditForm] = useState({
    liquidCash: "",
    monthlyBurn: "",
    oneSkill: "",
    mentalBlock: ""
  });

  const handleStartAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditForm.liquidCash || !auditForm.oneSkill) {
      setPeaceStatus("PEACE Protocol: INCOMPLETE DATA");
      return;
    }
    setEmpireAudit({
      liquidCash: Number(auditForm.liquidCash),
      monthlyBurn: Number(auditForm.monthlyBurn),
      oneSkill: auditForm.oneSkill,
      mentalBlock: auditForm.mentalBlock
    });
    setCurrentView('dashboard');
    setPeaceStatus("PEACE Protocol: EMPIRE LOCK-IN");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setPeaceStatus("TITAN: SCANNING VULNERABILITIES...");

    try {
      const isText = file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt');
      const fileData = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        if (isText) reader.readAsText(file); else reader.readAsDataURL(file);
      });

      const parsed = await parseRawFiles(fileData, file.type, isText);
      const results = await analyzeStocksWithGemini(parsed);
      setAnalyzedStocks(results.sort((a, b) => b.score - a.score));
      setPeaceStatus("PEACE Protocol: ASSETS AUDITED");
    } catch (err: any) {
      setError(err.message);
      setPeaceStatus("PEACE Protocol: SYSTEM FAULT");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-purple-500/30">
      {/* COMMAND CENTER HEADER */}
      <header className="titan-gradient p-5 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xl border border-white/20">
              <i className="fas fa-crown text-xl text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic leading-none">TITAN</h1>
              <p className="text-[8px] mono text-white/60 tracking-widest uppercase">Universal Dominator Mode</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-[10px] mono text-white/80 uppercase animate-pulse">
               {peaceStatus}
             </div>
             {currentView === 'dashboard' && (
               <button onClick={() => fileInputRef.current?.click()} className="glass px-4 py-2 rounded-lg text-xs font-black hover:bg-white/10 transition-all uppercase tracking-widest border-white/10 text-white shadow-xl">
                 <i className="fas fa-microscope mr-2"></i> Scan Assets
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'audit' ? (
          <div className="max-w-xl mx-auto py-12 space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="text-center space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-400 font-black uppercase tracking-[0.3em] mb-2">
                Empire Architecture Initialization
              </div>
              <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                Absolute <br/><span className="text-transparent bg-clip-text titan-gradient">Transparency.</span>
              </h2>
              <p className="text-gray-400 font-medium">Identify your truths before building your empire.</p>
            </div>

            <form onSubmit={handleStartAudit} className="glass p-10 rounded-[2.5rem] space-y-8 titan-border shadow-2xl relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/10 blur-[100px]"></div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Liquid Cash Reserve (Total Assets)</label>
                <input 
                  type="number" 
                  value={auditForm.liquidCash}
                  onChange={e => setAuditForm({...auditForm, liquidCash: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-purple-500 outline-none transition-all shadow-inner"
                  placeholder="3,000,000 BDT/USD"
                />
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Monthly Burn Rate (Survival Cost)</label>
                <input 
                  type="number" 
                  value={auditForm.monthlyBurn}
                  onChange={e => setAuditForm({...auditForm, monthlyBurn: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-purple-500 outline-none transition-all shadow-inner"
                  placeholder="50,000 BDT/USD"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">The One Leverage Skill (Monopoly Skill)</label>
                <input 
                  type="text" 
                  value={auditForm.oneSkill}
                  onChange={e => setAuditForm({...auditForm, oneSkill: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-purple-500 outline-none transition-all shadow-inner"
                  placeholder="Ex: Scalable Code, Media Agency, Land Trading"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">The Terminal Mental Block</label>
                <textarea 
                  value={auditForm.mentalBlock}
                  onChange={e => setAuditForm({...auditForm, mentalBlock: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-bold focus:border-purple-500 outline-none transition-all h-24 resize-none shadow-inner"
                  placeholder="What holds you back? Fear? Ego? Inaction?"
                />
              </div>

              <button className="w-full titan-gradient py-5 rounded-2xl text-white font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-transform active:scale-[0.98]">
                ACTIVATE DOMINATOR MODE
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            {/* EMPIRE HUD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <HudCard label="Financial Runway" value={`${Math.floor(empireAudit!.liquidCash / (empireAudit!.monthlyBurn || 1))} MONTHS`} sub="Sovereign Safety" icon="fa-hourglass-half" />
              <HudCard label="Empire Asset" value={empireAudit!.oneSkill} sub="Active Leverage" icon="fa-fire" />
              <HudCard label="Mental Protocol" value="PEACE: SECURED" sub="Zero Overthinking" icon="fa-brain" />
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="glass p-6 rounded-3xl titan-border cursor-pointer hover:bg-white/5 transition-all flex flex-col justify-center items-center text-center group border-dashed border-2"
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <i className="fas fa-upload text-2xl text-purple-500 group-hover:scale-110 transition-transform mb-2"></i>
                <div className="text-[10px] font-black text-white uppercase tracking-widest">Audit Market Data</div>
              </div>
            </div>

            {isProcessing && (
              <div className="py-24 text-center space-y-6">
                <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_50px_rgba(168,85,247,0.3)]"></div>
                <div className="space-y-2">
                   <h3 className="text-xl font-black text-white uppercase italic tracking-tighter animate-pulse">Running Forensic Analysis...</h3>
                   <p className="text-[10px] mono text-gray-500 uppercase tracking-widest">Terminating Garbage Assets | Protecting Capital</p>
                </div>
              </div>
            )}

            {analyzedStocks.length > 0 && !isProcessing && (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                  <h3 className="text-xl font-black text-white italic tracking-tighter uppercase">Market Audit Dossier</h3>
                  <p className="text-[10px] text-gray-500 mono uppercase tracking-widest">Weight: 50% Debt | 30% Moat | 20% P/E</p>
                </div>
                
                <div className="glass rounded-[2rem] titan-border overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-black/50 border-b border-white/10">
                          <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Identification</th>
                          <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Titan Score</th>
                          <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Forensic Check</th>
                          <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valuation</th>
                          <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">TITAN Verdict</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {analyzedStocks.map((res, i) => (
                          <TitanRow key={res.stock.ticker + i} analysis={res} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-8 bg-red-600/10 border border-red-600/30 rounded-3xl text-red-500 flex items-center space-x-4">
                <i className="fas fa-skull-crossbones text-2xl"></i>
                <div className="space-y-1">
                   <div className="text-sm font-black uppercase tracking-widest">System Breach: Audit Failed</div>
                   <div className="text-[11px] font-bold text-red-400 uppercase leading-tight">{error}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="p-8 text-center border-t border-white/5">
        <p className="text-[9px] mono text-gray-600 uppercase tracking-widest">© TITAN SOVEREIGN SYSTEMS | EMPIRE ARCHITECT v8.0 | PROTECT THE FUTURE</p>
      </footer>
    </div>
  );
};

const TitanRow: React.FC<{ analysis: TitanAnalysis }> = ({ analysis }) => {
  const [expanded, setExpanded] = useState(false);
  const v = analysis.verdict;
  
  const verdictStyle = v === TitanVerdict.GOD_MODE_BUY ? "bg-green-600 text-white shadow-green-500/50 font-black border-transparent scale-105" :
                      v === TitanVerdict.BUY ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      v === TitanVerdict.DESTROY ? "bg-red-600 text-white shadow-red-500/50 font-black border-transparent" : "bg-gray-800 text-gray-400 border-white/10";

  const scoreColor = analysis.score >= 80 ? 'text-green-400' : analysis.score >= 50 ? 'text-blue-400' : 'text-gray-500';

  return (
    <>
      <tr className={`hover:bg-white/5 transition-all group cursor-pointer ${expanded ? 'bg-white/10' : ''}`} onClick={() => setExpanded(!expanded)}>
        <td className="p-6">
          <div className="flex items-center space-x-4">
             <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${analysis.stock.category === 'A' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
               {analysis.stock.category || 'A'}
             </div>
             <div>
               <div className="font-black text-white text-lg italic tracking-tighter">{analysis.stock.ticker}</div>
               <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-0.5">{analysis.moatType}</div>
             </div>
          </div>
        </td>
        <td className="p-6">
          <div className={`text-2xl font-black mono ${scoreColor}`}>{analysis.score}<span className="text-xs text-gray-600 ml-1">/100</span></div>
          <div className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-0.5">Risk Grade: {analysis.riskGrade}/10</div>
        </td>
        <td className="p-6">
          <div className={`text-sm font-black mono ${analysis.stock.directorHolding >= 30 ? 'text-green-400' : 'text-red-400'}`}>
            {analysis.stock.directorHolding}% SPONSOR
          </div>
          <div className={`text-[9px] uppercase mt-1 font-bold ${analysis.stock.debtToEquity && analysis.stock.debtToEquity > 0.5 ? 'text-red-500' : 'text-gray-500'}`}>
            DEBT/EQ: {analysis.stock.debtToEquity?.toFixed(2) || '0.00'}
          </div>
        </td>
        <td className="p-6">
          <div className={`text-[11px] font-black uppercase ${analysis.valuationStatus === 'Sosta' ? 'text-green-400' : 'text-red-400'}`}>{analysis.valuationStatus}</div>
          <div className="text-[10px] text-gray-600 mono mt-1">P/E: {analysis.stock.pe?.toFixed(2)}</div>
        </td>
        <td className="p-6 text-center">
          <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all inline-block min-w-[140px] ${verdictStyle}`}>
            {v}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="p-0 border-none">
            <div className="bg-black/90 p-12 space-y-12 animate-in slide-in-from-top duration-500 border-t border-purple-500/20 shadow-inner">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                        <i className="fas fa-brain"></i> Survival Thesis (First Principles)
                      </h4>
                      <p className="text-base text-gray-300 leading-relaxed italic border-l-4 border-purple-500/30 pl-6 font-medium">
                        "{analysis.firstPrinciplesReasoning}"
                      </p>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-inner relative">
                      <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Tactical Instruction (Bengali)</h5>
                      <p className="text-3xl text-white font-black italic leading-tight tracking-tight">{analysis.banglaAdvice}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <h4 className="text-[11px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                      <i className="fas fa-biohazard"></i> Terminal Risk Audit
                    </h4>
                    <div className="space-y-4">
                      {analysis.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-center gap-4 bg-red-500/5 p-5 rounded-2xl border border-red-500/10">
                          <i className="fas fa-exclamation-triangle text-red-500 text-sm"></i>
                          <span className="text-[11px] text-red-200 font-bold uppercase leading-tight tracking-wide">{flag}</span>
                        </div>
                      ))}
                      {analysis.redFlags.length === 0 && (
                        <div className="text-sm text-green-500 font-black italic uppercase tracking-[0.3em] flex items-center gap-3 bg-green-500/5 p-6 rounded-2xl border border-green-500/10">
                          <i className="fas fa-check-double text-xl"></i> PURE WEALTH COMPOUNDER
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 pt-6">
                       <Metric label="ROE (Efficiency)" value={`${analysis.stock.roe?.toFixed(1)}%`} color={analysis.stock.roe && analysis.stock.roe > 15 ? 'text-green-400' : 'text-red-400'} />
                       <Metric label="Div Yield" value={`${analysis.stock.dividendYield?.toFixed(1)}%`} color={analysis.stock.dividendYield && analysis.stock.dividendYield >= 7 ? 'text-green-400' : 'text-gray-400'} />
                       <Metric label="NOCFPS (Cash)" value={analysis.stock.nocfps?.toString() || '0.00'} color={analysis.stock.nocfps && analysis.stock.nocfps > 0 ? 'text-green-400' : 'text-red-500'} />
                    </div>
                  </div>
               </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const HudCard: React.FC<{ label: string; value: string; sub: string; icon: string }> = ({ label, value, sub, icon }) => (
  <div className="glass p-6 rounded-[2rem] titan-border shadow-xl group hover:scale-[1.02] transition-transform">
    <div className="flex justify-between items-start mb-3">
      <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{label}</div>
      <i className={`fas ${icon} text-purple-500 text-sm group-hover:animate-pulse`}></i>
    </div>
    <div className="text-2xl font-black text-white italic tracking-tighter truncate">{value}</div>
    <div className="text-[10px] mono text-purple-600 uppercase mt-2 tracking-widest">{sub}</div>
  </div>
);

const Metric: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="p-5 rounded-3xl bg-black/60 border border-white/5 shadow-2xl">
     <div className="text-[9px] font-black text-gray-500 uppercase mb-3 tracking-widest">{label}</div>
     <div className={`text-base font-black mono ${color || 'text-white'}`}>{value}</div>
  </div>
);

export default App;
