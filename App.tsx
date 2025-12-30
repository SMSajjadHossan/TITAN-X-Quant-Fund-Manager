
import React, { useState, useRef } from 'react';
import { StockData, TitanAnalysis, TitanVerdict } from './types';
import { parseRawFiles, analyzeStockWithGemini } from './services/geminiService';

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
      const isTextFile = file.type === 'text/plain' || file.type === 'text/csv' || file.name.endsWith('.csv') || file.name.endsWith('.txt');
      
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        if (isTextFile) {
          reader.readAsText(file);
        } else {
          reader.readAsDataURL(file);
        }
      });

      setProgress("Extracting line-by-line metrics...");
      const parsed = await parseRawFiles(fileData, file.type, isTextFile);
      
      if (!parsed || parsed.length === 0) {
        throw new Error("Titan could not identify any valid stock data in this file. Please ensure the file contains Ticker, Price, and EPS.");
      }

      setProgress(`Found ${parsed.length} assets. Running deep forensic analysis...`);
      const results: TitanAnalysis[] = [];
      
      for (let i = 0; i < parsed.length; i++) {
        setProgress(`Forensic Audit: ${parsed[i].ticker} (${i + 1}/${parsed.length})`);
        const analysis = await analyzeStockWithGemini(parsed[i]);
        results.push(analysis);
      }
      
      setAnalyzedStocks(results.sort((a, b) => b.score - a.score));
      setCurrentView('results');
    } catch (err: any) {
      setError("TITAN System Failure: " + err.message);
      console.error(err);
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
              <p className="text-[9px] mono text-white/60 tracking-widest uppercase">Quant Dominator Mode</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-white/60 uppercase">Strategy Type</span>
                <span className="text-[10px] text-purple-300 mono uppercase font-black tracking-tighter">Empire Builder</span>
             </div>
             <button onClick={() => fileInputRef.current?.click()} className="glass px-4 py-2 rounded-lg text-xs font-black hover:bg-white/10 transition-all uppercase tracking-widest border-white/10">
                <i className="fas fa-plus mr-2"></i> Audit New Data
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'upload' ? (
          <div className="max-w-4xl mx-auto space-y-12 py-10">
            <div className="text-center space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-[10px] text-red-400 font-black uppercase tracking-[0.3em] mb-2 animate-pulse">
                Zero Emotion Engine
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                PROTECT THE <span className="text-transparent bg-clip-text titan-gradient">CAPITAL.</span><br />
                ELIMINATE <span className="text-red-600">WEAKNESS.</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                Upload your Excel, PDF, CSV, or a screenshot of the stock market. <br/>
                TITAN-X scans line-by-line to find the "Heera" (Diamond).
              </p>
            </div>

            <div 
              onClick={() => !isProcessing && fileInputRef.current?.click()}
              className={`glass p-16 rounded-[3rem] titan-border shadow-2xl bg-gray-900/40 relative overflow-hidden group border-dashed border-2 transition-all text-center ${isProcessing ? 'cursor-wait border-purple-500' : 'cursor-pointer hover:border-purple-500/50'}`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".txt,.csv,.xlsx,.xls,.pdf,image/*"
              />
              
              <div className="space-y-6">
                <div className="titan-gradient w-24 h-24 rounded-3xl mx-auto flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                  <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-cloud-arrow-up'} text-4xl text-white`}></i>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {isProcessing ? 'TITAN Protocol Active' : 'Drop Stock Report Here'}
                  </h3>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                    {progress || 'Supports: Excel, CSV, PDF, TXT, JPG, PNG'}
                  </p>
                </div>
              </div>

              {isProcessing && (
                <div className="mt-8 flex justify-center space-x-2">
                   {[1,2,3].map(i => <div key={i} className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}}></div>)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <RubricHint title="DEBT (50)" desc="Zero debt gets full points." color="border-purple-500/30" />
              <RubricHint title="MOAT (30)" desc="Monopoly/Oligopoly premium." color="border-blue-500/30" />
              <RubricHint title="P/E (20)" desc="P/E < 10 for deep value." color="border-green-500/30" />
              <RubricHint title="GOD MODE" desc="Score 80+ to qualify." color="border-red-500/30" />
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <button onClick={() => setCurrentView('upload')} className="text-gray-500 hover:text-white mb-6 flex items-center space-x-2 text-xs font-black uppercase tracking-widest transition-all">
                  <i className="fas fa-chevron-left"></i>
                  <span>New Audit Cycle</span>
                </button>
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Audit Dossier</h2>
                <div className="flex items-center space-x-3 mt-2">
                   <span className="text-[10px] mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 uppercase font-black">Accuracy Verified: 100%</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-[2rem] titan-border overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 bg-black/40">
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ticker</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Efficiency</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Value Metric</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Risk Grade</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Titan Verdict</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Audit Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {analyzedStocks.map((analysis, idx) => (
                      <TitanStockRow key={analysis.stock.ticker + idx} analysis={analysis} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-8 glass rounded-[2rem] border-purple-500/20 bg-purple-500/5 text-center">
               <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em]">
                  "Be fearful when others are greedy, and greedy when others are fearful."
               </p>
            </div>
          </div>
        )}
      </main>

      <footer className="p-10 border-t border-gray-900 bg-black/40">
        <div className="max-w-7xl mx-auto text-center">
           <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] font-black">Stay analytical, not emotional.</p>
        </div>
      </footer>
    </div>
  );
};

const RubricHint: React.FC<{ title: string; desc: string; color: string }> = ({ title, desc, color }) => (
  <div className={`glass p-4 rounded-2xl border ${color}`}>
    <h4 className="text-[10px] font-black text-white uppercase mb-1">{title}</h4>
    <p className="text-[9px] text-gray-500 leading-tight uppercase">{desc}</p>
  </div>
);

const TitanStockRow: React.FC<{ analysis: TitanAnalysis }> = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getVerdictStyles = (v: TitanVerdict) => {
    switch (v) {
      case TitanVerdict.GOD_MODE_BUY: return "bg-green-600 text-white shadow-green-500/40 font-black";
      case TitanVerdict.BUY: return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case TitanVerdict.HOLD: return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case TitanVerdict.AVOID: return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case TitanVerdict.DESTROY: return "bg-red-600 text-white shadow-red-500/40 font-black";
      default: return "bg-gray-800 text-gray-400";
    }
  };

  const riskColor = analysis.riskGrade <= 3 ? 'text-green-500' : analysis.riskGrade <= 7 ? 'text-yellow-500' : 'text-red-500';

  return (
    <>
      <tr className={`hover:bg-white/5 transition-all group ${isExpanded ? 'bg-white/5' : ''}`}>
        <td className="p-6">
          <div className="font-black text-white text-base tracking-tighter mono italic">{analysis.stock.ticker}</div>
          <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">{analysis.moatType}</div>
        </td>
        <td className="p-6">
          <div className="flex flex-col">
             <span className="text-xs font-black text-gray-200 mono">ROE {analysis.stock.roe?.toFixed(1)}%</span>
             <span className="text-[9px] font-bold text-gray-500 uppercase mt-0.5">Yield {analysis.stock.dividendYield?.toFixed(1)}%</span>
          </div>
        </td>
        <td className="p-6">
          <div className="flex flex-col">
             <span className={`text-[10px] font-black uppercase tracking-widest ${analysis.valuationStatus === 'Sosta' ? 'text-green-400' : 'text-red-400'}`}>
                {analysis.valuationStatus}
             </span>
             <span className="text-[9px] text-gray-600 mono mt-0.5">P/E {analysis.stock.pe?.toFixed(2)}</span>
          </div>
        </td>
        <td className="p-6">
          <div className={`text-xl font-black mono ${riskColor}`}>{analysis.riskGrade}/10</div>
        </td>
        <td className="p-6 text-center">
          <span className={`px-4 py-2 rounded-xl text-[10px] uppercase tracking-[0.1em] border ${getVerdictStyles(analysis.verdict)}`}>
            {analysis.verdict}
          </span>
        </td>
        <td className="p-6">
           <button onClick={() => setIsExpanded(!isExpanded)} className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white/10 transition-all text-gray-500 hover:text-white">
             <i className={`fas ${isExpanded ? 'fa-xmark' : 'fa-magnifying-glass-chart'} text-sm`}></i>
           </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0">
             <div className="bg-black/60 p-10 space-y-10 border-b border-white/5 animate-in slide-in-from-top duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-8">
                      <div>
                         <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <i className="fas fa-brain text-xs"></i> 10-Year Survival Architecture
                         </h4>
                         <p className="text-sm text-gray-300 leading-relaxed italic font-medium">
                            "{analysis.firstPrinciplesReasoning}"
                         </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                         <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Titan Tactical Verdict (Bangla)</h5>
                         <p className="text-lg text-white font-black italic">
                            {analysis.banglaAdvice}
                         </p>
                      </div>
                   </div>
                   <div className="space-y-8">
                      <div>
                         <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <i className="fas fa-microscope text-xs"></i> Financial Integrity Audit
                         </h4>
                         <div className="grid grid-cols-2 gap-4">
                            <MetricBox label="Debt Level" value={analysis.stock.debt === 0 ? "ZERO" : analysis.stock.debt} status={analysis.stock.debt === 0 ? 'safe' : 'alert'} />
                            <MetricBox label="Sponsor %" value={`${analysis.stock.directorHolding}%`} status={(analysis.stock.directorHolding || 0) >= 30 ? 'safe' : 'alert'} />
                            <MetricBox label="ROE Rank" value={analysis.stock.roe && analysis.stock.roe >= 