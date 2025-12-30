import React, { useState, useRef } from 'react';
import { TitanAnalysis, TitanVerdict, EmpireAudit } from './types';
import { parseRawFiles, analyzeStocksWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [empireAudit, setEmpireAudit] = useState<EmpireAudit | null>(null);
  const [analyzedStocks, setAnalyzedStocks] = useState<TitanAnalysis[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'audit' | 'dashboard'>('audit');
  const [peaceStatus, setPeaceStatus] = useState("PEACE Protocol: ARMED");
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
      setPeaceStatus("PEACE Protocol: DATA BREACH");
      return;
    }
    setEmpireAudit({
      liquidCash: Number(auditForm.liquidCash),
      monthlyBurn: Number(auditForm.monthlyBurn),
      oneSkill: auditForm.oneSkill,
      mentalBlock: auditForm.mentalBlock
    });
    setCurrentView('dashboard');
    setPeaceStatus("PEACE Protocol: SECURED");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setPeaceStatus("TITAN: SCANNING ASSETS...");

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
      setPeaceStatus("PEACE Protocol: AUDIT COMPLETE");
    } catch (err: any) {
      setError(err.message);
      setPeaceStatus("PEACE Protocol: EMERGENCY");
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
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xl border border-white/20 ring-4 ring-white/5">
              <i className="fas fa-crown text-xl text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic leading-none">TITAN-X</h1>
              <p className="text-[8px] mono text-white/60 tracking-widest uppercase font-bold">Empire Architect v10.0</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <div className="hidden sm:flex items-center space-x-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-[10px] mono text-white/80 uppercase">
               <span className={`w-2 h-2 rounded-full ${peaceStatus.includes('SECURED') ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 animate-pulse'}`}></span>
               <span>{peaceStatus}</span>
             </div>
             {currentView === 'dashboard' && (
               <button onClick={() => fileInputRef.current?.click()} className="glass px-5 py-2.5 rounded-xl text-xs font-black hover:bg-white/10 transition-all uppercase tracking-widest border-white/10 text-white shadow-2xl">
                 <i className="fas fa-microscope mr-2"></i> SCAN ASSETS
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'audit' ? (
          <div className="max-w-xl mx-auto py-12 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="text-center space-y-4">
              <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-400 font-black uppercase tracking-[0.3em] mb-2">
                Phase 1: Sovereignty initialization
              </div>
              <h2 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-[0.9]">
                Analyze <br/><span className="text-transparent bg-clip-text titan-gradient">The Truth.</span>
              </h2>
              <p className="text-gray-400 font-medium italic">"I don't play the stock market. I own the business."</p>
            </div>

            <form onSubmit={handleStartAudit} className="glass p-10 rounded-[3rem] space-y-8 titan-border shadow-[0_0_100px_rgba(124,58,237,0.1)] relative overflow-hidden">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 blur-[100px]"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex justify-between">
                    <span>Liquid Cash</span>
                    <span className="text-purple-400">Total</span>
                  </label>
                  <input 
                    type="number" 
                    value={auditForm.liquidCash}
                    onChange={e => setAuditForm({...auditForm, liquidCash: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-black focus:border-purple-500 outline-none transition-all"
                    placeholder="3,000,000"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest flex justify-between">
                    <span>Monthly Burn</span>
                    <span className="text-red-400">Survival</span>
                  </label>
                  <input 
                    type="number" 
                    value={auditForm.monthlyBurn}
                    onChange={e => setAuditForm({...auditForm, monthlyBurn: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-black focus:border-purple-500 outline-none transition-all"
                    placeholder="50,000"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">The Singular Leverage Skill</label>
                <input 
                  type="text" 
                  value={auditForm.oneSkill}
                  onChange={e => setAuditForm({...auditForm, oneSkill: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-black focus:border-purple-500 outline-none transition-all"
                  placeholder="Ex: Code, Sales, or Property"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Identify Your Terminal Block</label>
                <textarea 
                  value={auditForm.mentalBlock}
                  onChange={e => setAuditForm({...auditForm, mentalBlock: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-black focus:border-purple-500 outline-none transition-all h-24 resize-none"
                  placeholder="Fear of loss? Imposter syndrome? Inaction?"
                />
              </div>

              <button className="w-full titan-gradient py-5 rounded-2xl text-white font-black uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] transition-transform active:scale-[0.98]">
                ACTIVATE DOMINATOR MODE
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in zoom-in duration-500">
            {/* HUD DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <HudCard label="Empire Runway" value={`${Math.floor(empireAudit!.liquidCash / (empireAudit!.monthlyBurn || 1))} MO`} sub="Sovereign Shield" icon="fa-hourglass-start" />
              <HudCard label="Core Skill" value={empireAudit!.oneSkill} sub="The Monopoly" icon="fa-bolt-lightning" />
              <HudCard label="PEACE State" value="SECURED" sub="Zero Overthinking" icon="fa-brain-circuit" />
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="glass p-6 rounded-[2rem] titan-border cursor-pointer hover:bg-white/5 transition-all flex flex-col justify-center items-center text-center group border-dashed border-2 relative"
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <i className="fas fa-upload text-2xl text-purple-500 group-hover:scale-125 transition-transform mb-2"></i>
                <div className="text-[10px] font-black text-white uppercase tracking-widest">Audit Assets</div>
              </div>
            </div>

            {isProcessing && (
              <div className="py-24 text-center space-y-6">
                <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_60px_rgba(124,58,237,0.4)]"></div>
                <div className="space-y-2">
                   <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter animate-pulse">Running Forensic Scan...</h3>
                   <p className="text-[10px] mono text-gray-500 uppercase tracking-[0.4em]">Terminating Junk | Identifying Hira</p>
                </div>
              </div>
            )}

            {analyzedStocks.length > 0 && !isProcessing && (
              <div className="space-y-8">
                <div className="flex justify-between items-center px-6">
                  <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">Forensic Portfolio Audit</h3>
                  <div className="flex gap-4 text-[9px] mono text-gray-500 uppercase font-bold">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> 50% Debt</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-purple-500 rounded-full"></span> 30% Moat</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded-full"></span> 20% P/E</span>
                  </div>
                </div>
                
                <div className="glass rounded-[3rem] titan-border overflow-hidden shadow-2xl border-white/5 bg-gray-900/60">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                      <thead>
                        <tr className="bg-black/60 border-b border-white/10">
                          <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset</th>
                          <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Titan Score</th>
                          <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Financial Forensic</th>
                          <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valuation</th>
                          <th className="p-8 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Verdict</th>
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
              <div className="p-10 bg-red-600/10 border border-red-600/30 rounded-[2.5rem] text-red-500 flex items-center space-x-6 animate-bounce">
                <i className="fas fa-skull-crossbones text-4xl animate-pulse"></i>
                <div className="space-y-2">
                   <div className="text-lg font-black uppercase tracking-widest">Audit Failure Detected</div>
                   <div className="text-sm font-bold text-red-400 uppercase leading-tight">{error}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="p-10 text-center border-t border-white/5 bg-black/40">
        <p className="text-[10px] mono text-gray-600 uppercase tracking-[0.5em] font-bold">TITAN-X v10.0 | WORLD DOMINATION PROTOCOL | NO EMOTION, ONLY ACCURACY</p>
      </footer>
    </div>
  );
};

const TitanRow: React.FC<{ analysis: TitanAnalysis }> = ({ analysis }) => {
  const [expanded, setExpanded] = useState(false);
  const v = analysis.verdict;
  
  const verdictStyle = v === TitanVerdict.GOD_MODE_BUY ? "bg-green-600 text-white shadow-green-500/60 font-black border-transparent scale-110" :
                      v === TitanVerdict.BUY ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      v === TitanVerdict.DESTROY ? "bg-red-600 text-white shadow-red-500/60 font-black border-transparent" : "bg-gray-800 text-gray-500 border-white/10";

  const scoreColor = analysis.score >= 80 ? 'text-green-400' : analysis.score >= 60 ? 'text-blue-400' : 'text-gray-500';

  return (
    <>
      <tr className={`hover:bg-white/5 transition-all group cursor-pointer ${expanded ? 'bg-white/10' : ''}`} onClick={() => setExpanded(!expanded)}>
        <td className="p-8">
          <div className="flex items-center space-x-6">
             <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl ${analysis.stock.category === 'A' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
               {analysis.stock.category || 'A'}
             </div>
             <div>
               <div className="font-black text-white text-xl italic tracking-tighter leading-none">{analysis.stock.ticker}</div>
               <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1.5 flex items-center gap-2">
                  <span className="text-purple-500">{analysis.moatType}</span>
                  <span className="text-gray-700">• {analysis.stock.sector || 'Sector N/A'}</span>
               </div>
             </div>
          </div>
        </td>
        <td className="p-8">
          <div className={`text-3xl font-black mono ${scoreColor}`}>{analysis.score}<span className="text-xs text-gray-600 ml-1">/100</span></div>
          <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">Grade: {analysis.riskGrade}/10</div>
        </td>
        <td className="p-8">
          <div className={`text-base font-black mono ${analysis.stock.directorHolding >= 30 ? 'text-green-400' : 'text-red-400'}`}>
            {analysis.stock.directorHolding}% SPONSOR
          </div>
          <div className={`text-[10px] uppercase mt-1.5 font-bold ${analysis.stock.debtToEquity && analysis.stock.debtToEquity > 0.5 ? 'text-red-500' : 'text-gray-500'}`}>
            DEBT/EQ: {analysis.stock.debtToEquity?.toFixed(2) || '0.00'}
          </div>
        </td>
        <td className="p-8">
          <div className={`text-xs font-black uppercase ${analysis.valuationStatus === 'Sosta' ? 'text-green-400' : 'text-red-400'}`}>{analysis.valuationStatus}</div>
          <div className="text-[11px] text-gray-600 mono mt-1.5">P/E: {analysis.stock.pe?.toFixed(2)} | NAV: {analysis.stock.nav}</div>
        </td>
        <td className="p-8 text-center">
          <span className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all inline-block min-w-[160px] text-center shadow-lg ${verdictStyle}`}>
            {v}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="p-0 border-none">
            <div className="bg-black/95 p-16 space-y-16 animate-in slide-in-from-top-4 duration-700 border-t border-purple-500/20 shadow-inner relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30"></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-20 relative z-10">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-purple-400 uppercase tracking-[0.4em] flex items-center gap-3">
                        <i className="fas fa-brain"></i> First Principles reasoning
                      </h4>
                      <p className="text-lg text-gray-300 leading-relaxed italic border-l-4 border-purple-500/40 pl-8 font-medium">
                        "{analysis.firstPrinciplesReasoning}"
                      </p>
                    </div>
                    <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 shadow-2xl relative group">
                      <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Command (Bengali)</h5>
                      <p className="text-4xl text-white font-black italic leading-tight tracking-tight drop-shadow-lg">{analysis.banglaAdvice}</p>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6">
                       <Metric label="ENTRY" value={analysis.entryPrice?.toFixed(1) || 'N/A'} color="text-green-400" />
                       <Metric label="EXIT" value={analysis.exitPrice?.toFixed(1) || 'N/A'} color="text-red-400" />
                       <Metric label="STOP-LOSS" value={analysis.stopLoss?.toFixed(1) || 'N/A'} color="text-orange-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.4em] flex items-center gap-3">
                      <i className="fas fa-biohazard"></i> Terminal Risk Audit
                    </h4>
                    <div className="space-y-4">
                      {analysis.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-center gap-5 bg-red-500/10 p-6 rounded-[1.5rem] border border-red-500/20 group hover:bg-red-500/20 transition-colors">
                          <i className="fas fa-skull text-red-500 text-lg group-hover:scale-125 transition-transform"></i>
                          <span className="text-xs text-red-200 font-black uppercase leading-tight tracking-widest">{flag}</span>
                        </div>
                      ))}
                      {analysis.redFlags.length === 0 && (
                        <div className="text-base text-green-500 font-black italic uppercase tracking-[0.4em] flex items-center gap-4 bg-green-500/5 p-8 rounded-[2rem] border border-green-500/10">
                          <i className="fas fa-gem text-3xl"></i> NO EMOTION, NO RISK
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 pt-10">
                       <Metric label="ROE" value={`${analysis.stock.roe?.toFixed(1)}%`} color={analysis.stock.roe && analysis.stock.roe > 15 ? 'text-green-400' : 'text-red-400'} />
                       <Metric label="DIV YIELD" value={`${analysis.stock.dividendYield?.toFixed(1)}%`} color={analysis.stock.dividendYield && analysis.stock.dividendYield >= 7 ? 'text-green-400' : 'text-gray-400'} />
                       <Metric label="PB RATIO" value={analysis.stock.pbRatio?.toFixed(1) || '0.0'} color={analysis.stock.pbRatio && analysis.stock.pbRatio < 2 ? 'text-green-400' : 'text-gray-400'} />
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
  <div className="glass p-8 rounded-[3rem] titan-border shadow-2xl group hover:scale-[1.05] transition-all duration-500 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 blur-3xl group-hover:bg-purple-500/10 transition-colors"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="text-[11px] font-black text-gray-500 uppercase tracking-[0.3em]">{label}</div>
      <i className={`fas ${icon} text-purple-600 text-lg group-hover:rotate-12 transition-transform`}></i>
    </div>
    <div className="text-3xl font-black text-white italic tracking-tighter truncate relative z-10">{value}</div>
    <div className="text-[11px] mono text-purple-700 uppercase mt-3 tracking-[0.2em] font-bold relative z-10">{sub}</div>
  </div>
);

const Metric: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="p-6 rounded-[2rem] bg-black/70 border border-white/5 shadow-2xl">
     <div className="text-[10px] font-black text-gray-500 uppercase mb-4 tracking-widest">{label}</div>
     <div className={`text-xl font-black mono ${color || 'text-white'}`}>{value}</div>
  </div>
);

export default App;