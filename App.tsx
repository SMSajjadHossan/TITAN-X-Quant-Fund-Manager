
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
    setProgress("Initializing TITAN-X Scanners...");
    
    try {
      const isText = file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.txt');
      
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        if (isText) reader.readAsText(file);
        else reader.readAsDataURL(file);
      });

      setProgress("Executing Line-by-Line Forensic Extraction...");
      const parsed = await parseRawFiles(fileData, file.type, isText);
      
      if (!parsed || parsed.length === 0) {
        throw new Error("No readable stock data found. Verify your file format.");
      }

      setProgress(`Auditing ${parsed.length} Assets in Batch Mode...`);
      const results = await analyzeStocksWithGemini(parsed);
      
      setAnalyzedStocks(results.sort((a, b) => b.score - a.score));
      setCurrentView('results');
    } catch (err: any) {
      if (err.message?.includes("429") || err.message?.includes("RESOURCE_EXHAUSTED")) {
        setError("TITAN OVERLOAD: Gemini API rate limit exceeded. Please wait 60 seconds and try again.");
      } else {
        setError("TITAN System Halt: " + err.message);
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
              <i className="fas fa-microchip text-xl text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic">TITAN-X</h1>
              <p className="text-[9px] mono text-white/60 tracking-widest uppercase">God-Mode Risk Management</p>
            </div>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="glass px-4 py-2 rounded-lg text-xs font-black hover:bg-white/10 transition-all uppercase tracking-widest border-white/10">
             <i className="fas fa-plus mr-2"></i> Audit New Dataset
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'upload' ? (
          <div className="max-w-3xl mx-auto space-y-12 py-10">
            <div className="text-center space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-[10px] text-green-400 font-black uppercase tracking-[0.3em] mb-2">
                Capital Preservation Protocol Active
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                DON'T GAMBLE.<br /><span className="text-transparent bg-clip-text titan-gradient">ENGINEER WEALTH.</span>
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                Analyze Line-by-Line. Identify Compounders. <br/>
                Eliminate Destroyers. Strictly Zero Emotion.
              </p>
            </div>

            <div 
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`glass p-16 rounded-[3rem] titan-border shadow-2xl bg-gray-900/40 relative group border-dashed border-2 transition-all text-center ${isProcessing ? 'cursor-wait border-purple-500' : 'cursor-pointer hover:border-purple-500/50'}`}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".txt,.csv,.xlsx,.xls,.pdf,image/*"/>
              <div className="space-y-6">
                <div className="titan-gradient w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <i className={`fas ${isProcessing ? 'fa-dna fa-spin' : 'fa-upload'} text-4xl text-white`}></i>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {isProcessing ? 'Analyzing Metrics...' : 'Upload Audit Files'}
                  </h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-2">
                    {progress || 'Excel, PDF, CSV, TXT, or Image Reports'}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-5 bg-red-600/10 border border-red-600/30 rounded-2xl text-red-500 text-xs font-black flex items-center space-x-3 uppercase tracking-widest">
                <i className="fas fa-triangle-exclamation"></i>
                <span>{error}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <button onClick={() => setCurrentView('upload')} className="text-gray-500 hover:text-white mb-6 flex items-center space-x-2 text-xs font-black uppercase tracking-widest transition-all">
                  <i className="fas fa-arrow-left"></i> <span>Reset Terminal</span>
                </button>
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Audit Report</h2>
                <p className="text-[10px] mono text-purple-400 uppercase mt-2">Protocol: Batch-Audit-Optimization v4.0</p>
              </div>
            </div>

            <div className="glass rounded-[2rem] titan-border overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 bg-black/40">
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ticker</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Safety Check</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Efficiency</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valuation</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Titan Verdict</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Forensics</th>
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
  const verdictStyle = v === TitanVerdict.GOD_MODE_BUY ? "bg-green-600 text-white shadow-green-500/30" :
                      v === TitanVerdict.BUY ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" :
                      v === TitanVerdict.DESTROY ? "bg-red-600 text-white shadow-red-500/30" : "bg-gray-800 text-gray-400";

  return (
    <>
      <tr className={`hover:bg-white/5 transition-all group ${expanded ? 'bg-white/5' : ''}`}>
        <td className="p-6">
          <div className="font-black text-white text-base tracking-tighter mono italic">{analysis.stock.ticker}</div>
          <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">{analysis.moatType}</div>
        </td>
        <td className="p-6">
          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${analysis.lossPreventionFirewall ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
            {analysis.lossPreventionFirewall ? 'Verified Safe' : 'TERMINAL RISK'}
          </span>
        </td>
        <td className="p-6">
          <div className="text-xs font-black text-gray-200 mono">ROE {analysis.stock.roe?.toFixed(1)}%</div>
          <div className="text-[9px] text-gray-500 uppercase mt-0.5">D/E {analysis.stock.debtToEquity?.toFixed(2)}</div>
        </td>
        <td className="p-6">
          <div className={`text-[10px] font-black uppercase ${analysis.valuationStatus === 'Sosta' ? 'text-green-400' : 'text-red-400'}`}>{analysis.valuationStatus}</div>
          <div className="text-[9px] text-gray-600 mono mt-0.5">P/E {analysis.stock.pe?.toFixed(2)}</div>
        </td>
        <td className="p-6 text-center">
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${verdictStyle}`}>
            {v}
          </span>
        </td>
        <td className="p-6">
           <button onClick={() => setExpanded(!expanded)} className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white/10 transition-all text-gray-500 hover:text-white">
             <i className={`fas ${expanded ? 'fa-eye-slash' : 'fa-dna'}`}></i>
           </button>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={6} className="p-0 border-none">
            <div className="bg-black/60 p-10 space-y-8 animate-in slide-in-from-top duration-500">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">First Principles Architecture</h4>
                      <p className="text-sm text-gray-300 leading-relaxed italic">"{analysis.firstPrinciplesReasoning}"</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                      <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Titan Tactical Advice (Bengali)</h5>
                      <p className="text-lg text-white font-black italic">{analysis.banglaAdvice}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-4">Forensic Red Flags</h4>
                    <div className="space-y-3">
                      {analysis.redFlags.map((flag, i) => (
                        <div key={i} className="flex items-center gap-3 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                          <i className="fas fa-skull text-red-500 text-xs"></i>
                          <span className="text-[11px] text-gray-400 font-bold uppercase">{flag}</span>
                        </div>
                      ))}
                      {analysis.redFlags.length === 0 && <div className="text-xs text-green-500 font-bold italic uppercase">Zero Vulnerabilities Detected.</div>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                       <Metric label="Titan Score" value={`${analysis.score}/100`} />
                       <Metric label="Risk Grade" value={`${analysis.riskGrade}/10`} />
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

const Metric: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="p-3 rounded-xl bg-black/40 border border-white/5">
     <div className="text-[9px] font-black text-gray-500 uppercase mb-1">{label}</div>
     <div className="text-xs font-black mono text-white">{value}</div>
  </div>
);

export default App;
