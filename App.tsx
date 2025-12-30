
import React, { useState, useRef } from 'react';
import { TitanAnalysis, TitanVerdict } from './types';
import { parseRawFiles, analyzeStocksWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [analyzedStocks, setAnalyzedStocks] = useState<TitanAnalysis[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'upload' | 'results'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setProgress("Initializing TITAN-X Sovereign Protocol...");
    
    try {
      const isText = file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.txt');
      
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        if (isText) reader.readAsText(file);
        else reader.readAsDataURL(file);
      });

      setProgress("Executing Multi-Metric Forensic Extraction...");
      const parsed = await parseRawFiles(fileData, file.type, isText);
      
      if (!parsed || parsed.length === 0) {
        throw new Error("Zero readable stock data detected. Check your source file.");
      }

      setProgress(`Auditing ${parsed.length} Assets with 100% Zero-Emotion...`);
      const results = await analyzeStocksWithGemini(parsed);
      
      setAnalyzedStocks(results.sort((a, b) => b.score - a.score));
      setCurrentView('results');
    } catch (err: any) {
      if (err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED")) {
        setError("TITAN OVERLOAD: API limit hit. Wait 60s for thermal cool-down.");
      } else {
        setError("SYSTEM HALT: " + err.message);
      }
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-purple-500/30">
      <header className="titan-gradient p-5 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('upload')}>
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xl border border-white/20">
              <i className="fas fa-shield-halved text-xl text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic leading-none">TITAN-X</h1>
              <p className="text-[8px] mono text-white/60 tracking-widest uppercase">Wealth Preservation v7.0</p>
            </div>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="glass px-4 py-2 rounded-lg text-xs font-black hover:bg-white/10 transition-all uppercase tracking-widest border-white/10 text-white shadow-xl">
             <i className="fas fa-plus mr-2"></i> Audit New Dataset
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'upload' ? (
          <div className="max-w-3xl mx-auto space-y-12 py-10">
            <div className="text-center space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em] mb-2 animate-pulse">
                Capital Protection: Level 5 Active
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                DON'T BE A <br /><span className="text-transparent bg-clip-text titan-gradient">BLIND GAMBLER.</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed font-medium">
                Sovereign analysis for life-savings preservation. We scanning line-by-line using 50-30-20 weightage to find "Hira" (Gems) and Terminate "Junk".
              </p>
            </div>

            <div 
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`glass p-16 rounded-[3rem] titan-border shadow-2xl bg-gray-900/40 relative group border-dashed border-2 transition-all text-center ${isProcessing ? 'cursor-wait border-purple-500' : 'cursor-pointer hover:border-purple-500/50 shadow-purple-500/10'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv,.xlsx,.xls,.pdf,image/*"/>
              <div className="space-y-6">
                <div className="titan-gradient w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform ring-4 ring-white/10">
                  <i className={`fas ${isProcessing ? 'fa-dna fa-spin' : 'fa-upload'} text-4xl text-white`}></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {isProcessing ? 'Running Forensic Scan...' : 'Audit Data Source'}
                  </h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
                    {progress || 'Supports ds30.txt, ds5.txt, Portfolios'}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-5 bg-red-600/10 border border-red-600/30 rounded-2xl text-red-500 text-xs font-black flex items-center space-x-3 uppercase tracking-widest">
                <i className="fas fa-skull"></i>
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <button onClick={() => setCurrentView('upload')} className="text-gray-500 hover:text-white mb-6 flex items-center space-x-2 text-xs font-black uppercase tracking-widest transition-all">
                  <i className="fas fa-chevron-left"></i> <span>Initialize New Audit</span>
                </button>
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Forensic Report</h2>
                <p className="text-[10px] mono text-purple-400 uppercase mt-2">DSE Standard Audit | 50-30-20 Priority</p>
              </div>
            </div>

            <div className="glass rounded-[2rem] titan-border overflow-hidden shadow-2xl bg-gray-900/40 border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-gray-800 bg-black/60">
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Asset Identification</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Titan Score</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ownership Matrix</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valuation Metrics</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Titan Verdict</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Forensics</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {analyzedStocks.map((analysis, idx) => (
                      <TitanRow key={analysis.stock.ticker + idx} analysis={analysis} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const TitanRow: React.FC<{ analysis: TitanAnalysis }> = ({ analysis }) => {
  const [expanded, setExpanded] = useState(false);
  const v = analysis.verdict;
  
  const verdictStyle = v === TitanVerdict.GOD_MODE_BUY ? "bg-green-600 text-white shadow-green-500/60 font-black border-transparent scale-105" :
                      v === TitanVerdict.BUY ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      v === TitanVerdict.DESTROY ? "bg-red-600 text-white shadow-red-500/60 font-black border-transparent" : "bg-gray-800 text-gray-400 border-white/5";

  const scoreColor = analysis.score >= 80 ? 'text-green-400' : analysis.score >= 50 ? 'text-blue-400' : 'text-gray-500';

  return (
    <>
      <tr className={`hover:bg-white/5 transition-all group ${expanded ? 'bg-white/5' : ''}`}>
        <td className="p-6">
          <div className="flex items-center gap-3">
             <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${analysis.stock.category === 'A' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
               {analysis.stock.category}
             </div>
             <div>
               <div className="font-black text-white text-base tracking-tighter mono italic">{analysis.stock.ticker}</div>
               <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-0.5 flex items-center gap-2">
                 <span className="text-purple-400">{analysis.moatType}</span>
                 <span className="text-gray-600">• LTP {analysis.stock.ltp}</span>
               </div>
             </div>
          </div>
        </td>
        <td className="p-6">
          <div className={`text-xl font-black mono ${scoreColor}`}>{analysis.score}<span className="text-[10px] text-gray-600 ml-1">/100</span></div>
          <div className="text-[9px] text-gray-500 uppercase mt-0.5 font-bold">Risk Grade: {analysis.riskGrade}/10</div>
        </td>
        <td className="p-6">
          <div className={`text-xs font-black mono ${analysis.stock.directorHolding >= 30 ? 'text-green-400' : 'text-red-400'}`}>
            {analysis.stock.directorHolding}% Sponsor
          </div>
          <div className="text-[9px] text-gray-500 uppercase mt-0.5 flex gap-2">
             <span>INST {analysis.stock.instituteHolding || 0}%</span>
             <span>FOR {analysis.stock.foreignHolding || 0}%</span>
          </div>
        </td>
        <td className="p-6">
          <div className={`text-[10px] font-black uppercase ${analysis.valuationStatus === 'Sosta' ? 'text-green-400' : 'text-red-400'}`}>{analysis.valuationStatus}</div>
          <div className="text-[9px] text-gray-600 mono mt-0.5">P/E {analysis.stock.pe?.toFixed(2)} | P/B {(analysis.stock.ltp / analysis.stock.nav).toFixed(1)}</div>
        </td>
        <td className="p-6 text-center">
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all inline-block min-w-[120px] ${verdictStyle}`}>
            {v}
          </span>
        </td>
        <td className="p-6 text-right">
           <button onClick={() => setExpanded(!expanded)} className="w-10 h-10 rounded-full border border-gray-800 inline-flex items-center justify-center hover:bg-white/10 transition-all text-gray-500 hover:text-white shadow-lg">
             <i className={`fas ${expanded ? 'fa-eye-slash' : 'fa-magnifying-glass-chart'} text-sm`}></i>
           </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="p-0 border-none">
            <div className="bg-black/90 p-10 space-y-10 animate-in slide-in-from-top duration-500 border-t border-purple-500/20">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <i className="fas fa-brain"></i> First Principles Survival Thesis
                      </h4>
                      <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-purple-500/40 pl-5 font-medium">
                        "{analysis.firstPrinciplesReasoning}"
                      </p>
                    </div>
                    <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                         <i className="fas fa-quote-right text-4xl"></i>
                      </div>
                      <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Tactical Instruction (Bengali)</h5>
                      <p className="text-2xl text-white font-black italic leading-tight">{analysis.banglaAdvice}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <i className="fas fa-radiation"></i> Capital Destruction Risk Audit
                    </h4>
                    <div className="space-y-3">
                      {analysis.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-start gap-4 bg-red-500/10 p-5 rounded-2xl border border-red-500/20">
                          <i className="fas fa-biohazard text-red-500 text-sm mt-0.5"></i>
                          <span className="text-[11px] text-red-100 font-bold uppercase tracking-wide leading-normal">{flag}</span>
                        </div>
                      ))}
                      {analysis.redFlags.length === 0 && (
                        <div className="text-xs text-green-500 font-black italic uppercase tracking-[0.3em] flex items-center gap-3 bg-green-500/5 p-5 rounded-2xl border border-green-500/10">
                          <i className="fas fa-check-circle text-lg"></i> Pure Wealth Compounder Detected
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-6">
                       <Metric label="ROE" value={`${analysis.stock.roe?.toFixed(1)}%`} color={analysis.stock.roe && analysis.stock.roe > 15 ? 'text-green-400' : 'text-red-400'} />
                       <Metric label="Yield" value={`${analysis.stock.dividendYield?.toFixed(1)}%`} color={analysis.stock.dividendYield && analysis.stock.dividendYield >= 7 ? 'text-green-400' : 'text-gray-400'} />
                       <Metric label="D/E Ratio" value={analysis.stock.debtToEquity?.toFixed(2) || '0.00'} color={analysis.stock.debtToEquity && analysis.stock.debtToEquity > 0.5 ? 'text-red-500' : 'text-green-400'} />
                       <Metric label="Reserve (M)" value={analysis.stock.reserveSurplus?.toString() || '0'} />
                       <Metric label="Cash (M)" value={analysis.stock.nocfps?.toString() || '0.00'} color={analysis.stock.nocfps && analysis.stock.nocfps > 0 ? 'text-green-400' : 'text-red-400'} />
                       <Metric label="Free Float" value={analysis.stock.freeFloat?.toString() || '0'} />
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

const Metric: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="p-4 rounded-2xl bg-black/60 border border-white/5 shadow-2xl">
     <div className="text-[8px] font-black text-gray-500 uppercase mb-2 tracking-widest">{label}</div>
     <div className={`text-sm font-black mono ${color || 'text-white'}`}>{value}</div>
  </div>
);

export default App;
