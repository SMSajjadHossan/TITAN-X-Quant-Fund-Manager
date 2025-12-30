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
    setPeaceStatus("TITAN: BOOTING ENSEMBLE CORE...");

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
      setPeaceStatus("TITAN: ENSEMBLE AUDIT COMPLETE");
    } catch (err: any) {
      setError(err.message);
      setPeaceStatus("TITAN: AUDIT FAILURE");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-pink-500/30">
      {/* COMMAND CENTER HEADER */}
      <header className="titan-gradient p-5 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xl border border-white/20 shadow-lg">
              <i className="fas fa-microchip text-xl text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic leading-none">TITAN-X</h1>
              <p className="text-[9px] mono text-white/60 tracking-widest uppercase font-bold">Ensemble Sniper v14.0</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
             <div className="hidden sm:flex items-center space-x-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 text-[10px] mono text-white/80 uppercase">
               <span className={`w-2 h-2 rounded-full ${peaceStatus.includes('SECURED') || peaceStatus.includes('COMPLETE') ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-pink-500 animate-pulse'}`}></span>
               <span>{peaceStatus}</span>
             </div>
             {currentView === 'dashboard' && (
               <button onClick={() => fileInputRef.current?.click()} className="glass px-5 py-2.5 rounded-xl text-xs font-black hover:bg-white/10 transition-all uppercase tracking-widest border-white/10 text-white shadow-2xl flex items-center">
                 <i className="fas fa-brain-circuit mr-2"></i> BOOT ENSEMBLE
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'audit' ? (
          <div className="max-w-2xl mx-auto py-8 md:py-16 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="text-center space-y-4">
              <div className="inline-block px-4 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-[10px] text-pink-400 font-black uppercase tracking-[0.4em] mb-2 shadow-lg">
                Sovereign Strategy Initialization
              </div>
              <h2 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-[0.85]">
                Ensemble <br/><span className="text-transparent bg-clip-text titan-gradient">Sniper.</span>
              </h2>
              <p className="text-gray-400 font-medium italic text-lg leading-relaxed">
                "Technical momentum is the fuel. Fundamental safety is the engine."
              </p>
            </div>

            <form onSubmit={handleStartAudit} className="glass p-10 rounded-[3.5rem] space-y-8 titan-border shadow-[0_0_120px_rgba(219,39,119,0.15)] relative overflow-hidden backdrop-blur-3xl">
              <div className="absolute -top-24 -right-24 w-56 h-56 bg-pink-500/20 blur-[120px]"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest flex justify-between">
                    <span>Cash Reserve</span>
                    <span className="text-pink-500 italic">Liquid</span>
                  </label>
                  <input 
                    type="number" 
                    value={auditForm.liquidCash}
                    onChange={e => setAuditForm({...auditForm, liquidCash: e.target.value})}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white font-black focus:border-pink-500 outline-none transition-all shadow-inner placeholder-gray-700"
                    placeholder="Total Fuel"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest flex justify-between">
                    <span>Monthly Burn</span>
                    <span className="text-red-500 italic">Loss</span>
                  </label>
                  <input 
                    type="number" 
                    value={auditForm.monthlyBurn}
                    onChange={e => setAuditForm({...auditForm, monthlyBurn: e.target.value})}
                    className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white font-black focus:border-pink-500 outline-none transition-all shadow-inner placeholder-gray-700"
                    placeholder="Survival Burn"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Sovereign Leverage Skill</label>
                <input 
                  type="text" 
                  value={auditForm.oneSkill}
                  onChange={e => setAuditForm({...auditForm, oneSkill: e.target.value})}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white font-black focus:border-pink-500 outline-none transition-all shadow-inner placeholder-gray-700"
                  placeholder="Ex: Ensemble Logic Design"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase text-gray-500 tracking-widest">Identify Your Fatal Mental Block</label>
                <textarea 
                  value={auditForm.mentalBlock}
                  onChange={e => setAuditForm({...auditForm, mentalBlock: e.target.value})}
                  className="w-full bg-black/60 border border-white/10 rounded-2xl p-5 text-white font-black focus:border-pink-500 outline-none transition-all h-28 resize-none shadow-inner placeholder-gray-700"
                  placeholder="Fear of Pullback? Fomo? Indecision?"
                />
              </div>

              <button className="w-full titan-gradient py-6 rounded-2xl text-white font-black uppercase tracking-[0.4em] shadow-2xl hover:scale-[1.03] transition-all active:scale-[0.98] border border-white/20">
                INITIATE ENSEMBLE SYNC
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-10 animate-in fade-in zoom-in duration-700">
            {/* HUD DASHBOARD */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <HudCard label="Empire Runway" value={`${Math.floor(empireAudit!.liquidCash / (empireAudit!.monthlyBurn || 1))} MO`} sub="System Stability" icon="fa-hourglass-half" />
              <HudCard label="Core Skill" value={empireAudit!.oneSkill} sub="The Monopoly" icon="fa-bolt-lightning" />
              <HudCard label="Sync Protocol" value="CALIBRATED" sub="Zero Overthinking" icon="fa-shield-halved" />
              <div 
                onClick={() => fileInputRef.current?.click()} 
                className="glass p-8 rounded-[3rem] titan-border cursor-pointer hover:bg-white/5 transition-all flex flex-col justify-center items-center text-center group border-dashed border-2 relative overflow-hidden"
              >
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <i className="fas fa-cloud-upload text-3xl text-pink-500 group-hover:scale-125 transition-transform mb-3"></i>
                <div className="text-[11px] font-black text-white uppercase tracking-widest">Feed Sniper Data</div>
              </div>
            </div>

            {isProcessing && (
              <div className="py-24 text-center space-y-8 animate-in fade-in zoom-in">
                <div className="w-24 h-24 border-4 border-pink-600 border-t-transparent rounded-full animate-spin mx-auto shadow-[0_0_80px_rgba(219,39,119,0.3)]"></div>
                <div className="space-y-3">
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter animate-pulse">Running Ensemble Forensic...</h3>
                   <p className="text-[11px] mono text-gray-500 uppercase tracking-[0.5em] font-bold">Classifying RSIs | SMA Trends | Ensemble Confidence</p>
                </div>
              </div>
            )}

            {analyzedStocks.length > 0 && !isProcessing && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6">
                  <div>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Sovereign Sniper Audit</h3>
                    <p className="text-[10px] text-gray-500 mono uppercase tracking-widest mt-2 font-bold">Random Forest Classification: ENABLED</p>
                  </div>
                </div>
                
                <div className="glass rounded-[3.5rem] titan-border overflow-hidden shadow-2xl border-white/5 bg-gray-900/60 backdrop-blur-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1200px]">
                      <thead>
                        <tr className="bg-black/60 border-b border-white/10">
                          <th className="p-8 text-[11px] font-black text-gray-500 uppercase tracking-widest">ASSET</th>
                          <th className="p-8 text-[11px] font-black text-gray-500 uppercase tracking-widest">ENSEMBLE CONFIDENCE</th>
                          <th className="p-8 text-[11px] font-black text-gray-500 uppercase tracking-widest">VALUATION</th>
                          <th className="p-8 text-[11px] font-black text-gray-500 uppercase tracking-widest">MOMENTUM</th>
                          <th className="p-8 text-[11px] font-black text-gray-500 uppercase tracking-widest text-center">VERDICT</th>
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
              <div className="p-12 bg-pink-600/10 border border-pink-600/30 rounded-[3rem] text-pink-500 flex items-center space-x-8 animate-in zoom-in">
                <i className="fas fa-skull text-5xl"></i>
                <div className="space-y-2">
                   <div className="text-xl font-black uppercase tracking-widest">Ensemble Logic Error</div>
                   <div className="text-sm font-bold text-pink-400 uppercase leading-tight tracking-wider">{error}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="p-12 text-center border-t border-white/5 bg-black/50">
        <p className="text-[11px] mono text-gray-600 uppercase tracking-[0.6em] font-black italic">"Accuracy over Ego. Precision over Hope. The Sniper always wins."</p>
      </footer>
    </div>
  );
};

const TitanRow: React.FC<{ analysis: TitanAnalysis }> = ({ analysis }) => {
  const [expanded, setExpanded] = useState(false);
  const v = analysis.verdict;
  
  const verdictStyle = v === TitanVerdict.GOD_MODE_BUY ? "bg-green-600 text-white shadow-[0_0_25px_rgba(34,197,94,0.5)] font-black border-transparent scale-110" :
                      v === TitanVerdict.BUY ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      v === TitanVerdict.DESTROY ? "bg-red-600 text-white shadow-[0_0_25px_rgba(220,38,38,0.5)] font-black border-transparent" : "bg-gray-800 text-gray-500 border-white/10";

  const confidenceColor = analysis.aiCore.ensembleConfidence >= 80 ? "text-green-400" :
                        analysis.aiCore.ensembleConfidence >= 60 ? "text-blue-400" : "text-gray-500";

  return (
    <>
      <tr className={`hover:bg-white/5 transition-all group cursor-pointer ${expanded ? 'bg-white/10' : ''}`} onClick={() => setExpanded(!expanded)}>
        <td className="p-8">
          <div className="flex items-center space-x-6">
             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm shadow-2xl ${analysis.stock.category === 'A' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
               {analysis.stock.category || 'A'}
             </div>
             <div>
               <div className="font-black text-white text-2xl italic tracking-tighter leading-none">{analysis.stock.ticker}</div>
               <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mt-2.5 flex items-center gap-3">
                  <span className="text-pink-500">{analysis.moatType}</span>
               </div>
             </div>
          </div>
        </td>
        <td className="p-8">
          <div className="space-y-1">
            <div className={`text-4xl font-black mono tracking-tighter ${confidenceColor}`}>{analysis.aiCore.ensembleConfidence}%</div>
            <div className="text-[10px] uppercase font-black tracking-widest text-gray-600">Precision: {(analysis.aiCore.precisionMetric * 100).toFixed(0)}%</div>
          </div>
        </td>
        <td className="p-8">
          <div className="space-y-1">
            <div className={`text-base font-black uppercase tracking-widest ${analysis.valuationStatus === 'Sosta' ? 'text-green-400' : 'text-red-400'}`}>{analysis.valuationStatus}</div>
            <div className="text-[11px] text-gray-500 mono font-bold">P/E: {analysis.stock.pe?.toFixed(2)} | NAV: {analysis.stock.nav}</div>
          </div>
        </td>
        <td className="p-8">
          <div className="flex items-center space-x-4">
            <div className={`text-xl font-black italic uppercase ${analysis.technicalStatus.rsi === "Oversold" ? "text-green-400" : analysis.technicalStatus.rsi === "Overbought" ? "text-red-500" : "text-gray-400"}`}>
              {analysis.technicalStatus.rsi}
            </div>
            <div className="text-[10px] text-gray-600 uppercase font-black tracking-widest">
               {analysis.technicalStatus.trend}
            </div>
          </div>
        </td>
        <td className="p-8 text-center">
          <span className={`px-8 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] border transition-all inline-block min-w-[200px] text-center shadow-2xl ${verdictStyle}`}>
            {v}
          </span>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="p-0 border-none">
            <div className="bg-black/95 p-16 space-y-12 animate-in slide-in-from-top-6 duration-700 border-t border-pink-500/20 shadow-inner relative overflow-hidden backdrop-blur-3xl">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-40"></div>
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 relative z-10">
                  <div className="space-y-10">
                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-pink-400 uppercase tracking-[0.5em] flex items-center gap-4">
                        <i className="fas fa-brain"></i> Sovereign Logic reasoning
                      </h4>
                      <p className="text-xl text-gray-300 leading-relaxed italic border-l-4 border-pink-500/40 pl-8 font-medium">
                        "{analysis.firstPrinciplesReasoning}"
                      </p>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-xs font-black text-green-500 uppercase tracking-[0.5em] flex items-center gap-4">
                        <i className="fas fa-chart-line"></i> Momentum Pulse (Last 10 Signals)
                      </h4>
                      <div className="flex gap-3 bg-black/50 p-6 rounded-2xl border border-white/5">
                         {analysis.aiCore.signals.map((sig, idx) => (
                           <div key={idx} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${sig === 1 ? 'bg-green-500 text-white shadow-[0_0_10px_#22c55e]' : 'bg-red-500/20 text-red-500 border border-red-500/30'}`}>
                             {sig === 1 ? '↑' : '•'}
                           </div>
                         ))}
                         <div className="ml-auto text-[10px] font-black text-gray-600 uppercase self-center tracking-widest">Random Forest Classification</div>
                      </div>
                    </div>

                    <div className="p-10 rounded-[3rem] bg-white/5 border border-white/10 shadow-inner relative group overflow-hidden">
                      <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 italic">Sovereign Command (Bengali)</h5>
                      <p className="text-4xl text-white font-black italic leading-tight tracking-tight drop-shadow-2xl">{analysis.banglaAdvice}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-10">
                    <h4 className="text-xs font-black text-red-500 uppercase tracking-[0.5em] flex items-center gap-4">
                      <i className="fas fa-biohazard"></i> Terminal Risk Audit
                    </h4>
                    <div className="space-y-5">
                      {analysis.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-center gap-6 bg-red-500/10 p-6 rounded-[1.5rem] border border-red-500/20 group hover:bg-red-500/20 transition-all">
                          <i className="fas fa-radiation text-red-500 text-xl animate-pulse"></i>
                          <span className="text-xs text-red-200 font-black uppercase leading-tight tracking-[0.1em]">{flag}</span>
                        </div>
                      ))}
                      {analysis.redFlags.length === 0 && (
                        <div className="text-lg text-green-500 font-black italic uppercase tracking-[0.5em] flex items-center gap-5 bg-green-500/5 p-10 rounded-[2.5rem] border border-green-500/10 shadow-[0_0_30px_rgba(34,197,94,0.1)]">
                          <i className="fas fa-gem text-4xl"></i> ZERO TRAP DETECTED
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 pt-10">
                       <Metric label="Sponsor %" value={`${analysis.stock.directorHolding}%`} color={analysis.stock.directorHolding >= 30 ? 'text-green-400' : 'text-red-400'} />
                       <Metric label="Confidence" value={analysis.aiCore.ensembleConfidence.toString() + "%"} color={analysis.aiCore.ensembleConfidence >= 80 ? 'text-green-400' : 'text-white'} />
                       <Metric label="Reliability" value={analysis.aiCore.precisionMetric.toFixed(2)} color={analysis.aiCore.precisionMetric > 0.7 ? 'text-green-400' : 'text-white'} />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-6 pt-6">
                       <Metric label="ENTRY ≤" value={analysis.entryPrice?.toFixed(1) || 'N/A'} color="text-green-400" />
                       <Metric label="EXIT ≥" value={analysis.exitPrice?.toFixed(1) || 'N/A'} color="text-red-400" />
                       <Metric label="STOP" value={analysis.stopLoss?.toFixed(1) || 'N/A'} color="text-pink-400" />
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
  <div className="glass p-10 rounded-[3.5rem] titan-border shadow-2xl group hover:scale-[1.05] transition-all duration-700 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/5 blur-3xl group-hover:bg-pink-500/10 transition-colors"></div>
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className="text-[12px] font-black text-gray-500 uppercase tracking-[0.4em]">{label}</div>
      <i className={`fas ${icon} text-pink-600 text-2xl group-hover:rotate-12 transition-transform`}></i>
    </div>
    <div className="text-4xl font-black text-white italic tracking-tighter truncate relative z-10">{value}</div>
    <div className="text-[12px] mono text-pink-700 uppercase mt-4 tracking-[0.3em] font-black relative z-10">{sub}</div>
  </div>
);

const Metric: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="p-8 rounded-[2.5rem] bg-black/80 border border-white/5 shadow-2xl backdrop-blur-md">
     <div className="text-[11px] font-black text-gray-500 uppercase mb-5 tracking-widest italic">{label}</div>
     <div className={`text-2xl font-black mono ${color || 'text-white'} tracking-tight`}>{value}</div>
  </div>
);

export default App;