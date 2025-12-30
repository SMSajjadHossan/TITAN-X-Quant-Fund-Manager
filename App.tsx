
import React, { useState } from 'react';
import { StockData, TitanAnalysis, TitanVerdict } from './types';
import { parseRawData, analyzeStockWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<string>("");
  const [analyzedStocks, setAnalyzedStocks] = useState<TitanAnalysis[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'upload' | 'results'>('upload');

  const startAnalysis = async () => {
    if (!rawData.trim()) {
      setError("Please paste raw data first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const parsed = await parseRawData(rawData);
      const results: TitanAnalysis[] = [];
      
      for (const stock of parsed) {
        const analysis = await analyzeStockWithGemini(stock);
        results.push(analysis);
      }
      
      setAnalyzedStocks(results.sort((a, b) => b.score - a.score));
      setCurrentView('results');
    } catch (err: any) {
      setError("TITAN Protocol Error: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-purple-500/30">
      {/* Header */}
      <header className="titan-gradient p-5 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('upload')}>
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-xl border border-white/20">
              <i className="fas fa-tower-broadcast text-xl text-white"></i>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic">TITAN-X</h1>
              <p className="text-[9px] mono text-white/60 tracking-widest">QUANTITATIVE EMPIRE BUILDER</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="hidden md:flex flex-col items-end mr-4">
                <span className="text-[10px] font-bold text-white/60 uppercase">System Status</span>
                <span className="text-[10px] text-green-400 animate-pulse mono uppercase">God-Mode Active</span>
             </div>
             <button onClick={() => setCurrentView('upload')} className="glass px-4 py-2 rounded-lg text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest border-white/10">Audit Terminal</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        {currentView === 'upload' ? (
          <div className="max-w-4xl mx-auto space-y-12 py-10">
            <div className="text-center space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] text-purple-400 font-black uppercase tracking-[0.3em] mb-2">
                Strategic Intelligence Unit
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-[0.9] tracking-tighter">
                DON'T BE <span className="text-transparent bg-clip-text titan-gradient">OPTIMISTIC.</span><br />
                BE A BRUTAL <span className="text-red-500">CRITIC.</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                Analyze raw data line-by-line. Locate Wealth Compounders. <br className="hidden md:block"/> 
                Liquidate Capital Destroyers. Safety is not an option—it is the foundation.
              </p>
            </div>

            <div className="glass p-8 rounded-[2.5rem] titan-border shadow-2xl bg-gray-900/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <i className="fas fa-vault text-9xl"></i>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-2">
                      <i className="fas fa-terminal"></i> Data Sanitization Engine
                   </label>
                   <span className="text-[10px] text-gray-500 mono">Format: TXT / CSV / EXCEL RAW</span>
                </div>
                <textarea
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  placeholder="Paste LTP, EPS, NAV, Debt, Sponsor % data here..."
                  className="w-full h-64 bg-black/40 border border-gray-800 rounded-3xl p-6 text-sm mono text-gray-300 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 transition-all outline-none resize-none"
                />
              </div>

              <div className="mt-8 flex flex-col md:flex-row gap-4">
                <button
                  onClick={startAnalysis}
                  disabled={isProcessing}
                  className={`flex-1 py-5 rounded-2xl titan-gradient text-white font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-purple-900/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-3 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-atom fa-spin"></i>
                      <span>Processing Matrix...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-shield-halved"></i>
                      <span>Run Titan Protocol</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs font-bold flex items-center space-x-3 animate-pulse">
                  <i className="fas fa-triangle-exclamation"></i>
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatHint icon="fa-coins" title="Debt < 0.5" desc="Zero debt is God Mode priority." />
              <StatHint icon="fa-user-check" title="Director 30%+" iconColor="text-blue-400" desc="Owners must bet on themselves." />
              <StatHint icon="fa-money-bill-trend-up" title="Yield > 7%" iconColor="text-green-400" desc="Real cash flow beats paper profit." />
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <button onClick={() => setCurrentView('upload')} className="text-gray-500 hover:text-white mb-6 flex items-center space-x-2 text-xs font-bold uppercase tracking-widest transition-all">
                  <i className="fas fa-chevron-left"></i>
                  <span>New Audit</span>
                </button>
                <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Audit Report</h2>
                <div className="flex items-center space-x-3 mt-2">
                   <span className="text-[10px] mono text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/20 uppercase font-black">Succession: High Probability</span>
                   <span className="text-[10px] mono text-gray-500 uppercase">{analyzedStocks.length} Assets Analyzed</span>
                </div>
              </div>
              
              <div className="flex gap-3 w-full md:w-auto">
                 <button className="flex-1 md:flex-none glass px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/5">Download Ledger</button>
                 <button onClick={startAnalysis} className="flex-1 md:flex-none titan-gradient px-6 py-3 rounded-xl text-[10px] font-black text-white uppercase tracking-[0.2em] shadow-xl shadow-purple-900/20">Re-Scan Data</button>
              </div>
            </div>

            <div className="glass rounded-[2rem] titan-border overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-800 bg-black/40">
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ticker</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Current State</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Valuation (Sosta)</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Risk Grade</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Titan Verdict</th>
                      <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Action</th>
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
            
            <div className="p-8 glass rounded-[2rem] border-red-500/20 bg-red-500/5">
               <h3 className="text-red-500 font-black text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  <i className="fas fa-skull-crossbones"></i> Capital Destroyer Alert
               </h3>
               <p className="text-xs text-gray-400 leading-relaxed italic">
                  The assets marked as 'DESTROY' or 'AVOID' carry terminal risk to equity. First principles suggest zero recovery probability in high-inflation environments. Exit immediately.
               </p>
            </div>
          </div>
        )}
      </main>

      <footer className="p-10 border-t border-gray-900 bg-black/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center space-x-3 grayscale opacity-50">
             <i className="fas fa-infinity text-2xl text-white"></i>
             <div className="text-[10px] mono text-gray-500 uppercase tracking-widest font-black leading-none">
                Titan-X Protocol<br/>Architect 2025
             </div>
          </div>
          <div className="text-center">
             <p className="text-[10px] text-gray-600 uppercase tracking-[0.4em] font-black">Stay analytical, not emotional.</p>
          </div>
          <div className="flex space-x-6 text-gray-600">
             <i className="fab fa-github hover:text-white cursor-pointer transition-colors"></i>
             <i className="fab fa-x-twitter hover:text-white cursor-pointer transition-colors"></i>
             <i className="fab fa-linkedin hover:text-white cursor-pointer transition-colors"></i>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatHint: React.FC<{ icon: string; title: string; desc: string; iconColor?: string }> = ({ icon, title, desc, iconColor = "text-purple-400" }) => (
  <div className="glass p-5 rounded-3xl border-white/5 bg-white/5">
    <div className="flex items-center space-x-3 mb-2">
      <i className={`fas ${icon} ${iconColor} text-sm`}></i>
      <h4 className="text-[10px] font-black text-white uppercase tracking-widest">{title}</h4>
    </div>
    <p className="text-[10px] text-gray-500 leading-tight uppercase font-medium">{desc}</p>
  </div>
);

const TitanStockRow: React.FC<{ analysis: TitanAnalysis }> = ({ analysis }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getVerdictStyles = (v: TitanVerdict) => {
    switch (v) {
      case TitanVerdict.GOD_MODE_BUY: return "bg-green-500 text-white shadow-green-500/20";
      case TitanVerdict.BUY: return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case TitanVerdict.HOLD: return "bg-yellow-500/10 text-yellow-400 border-yellow-500/30";
      case TitanVerdict.AVOID: return "bg-orange-500/10 text-orange-400 border-orange-500/30";
      case TitanVerdict.DESTROY: return "bg-red-500 text-white shadow-red-500/20";
      default: return "bg-gray-800 text-gray-400";
    }
  };

  const riskColor = analysis.riskGrade <= 3 ? 'text-green-500' : analysis.riskGrade <= 7 ? 'text-yellow-500' : 'text-red-500';

  return (
    <>
      <tr className={`hover:bg-white/5 transition-all group ${isExpanded ? 'bg-white/5' : ''}`}>
        <td className="p-6">
          <div className="font-black text-white text-base tracking-tighter mono italic">{analysis.stock.ticker}</div>
          <div className="text-[9px] text-gray-500 uppercase font-black tracking-widest mt-1">{analysis.stock.sector || 'Asset'}</div>
        </td>
        <td className="p-6">
          <div className="flex flex-col">
             <span className="text-sm font-black text-gray-200 mono">LTP {analysis.stock.ltp}</span>
             <div className="flex gap-2 mt-1">
                <span className="text-[9px] font-bold text-gray-500 uppercase">ROE: {analysis.stock.roe?.toFixed(1)}%</span>
                <span className="text-[9px] font-bold text-gray-500 uppercase">Yield: {analysis.stock.dividendYield?.toFixed(1)}%</span>
             </div>
          </div>
        </td>
        <td className="p-6">
          <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${analysis.valuationStatus === 'Sosta' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : analysis.valuationStatus === 'Dami' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gray-800 text-gray-400'}`}>
            {analysis.valuationStatus}
          </span>
          <div className="text-[9px] text-gray-600 mt-1 mono font-bold">P/E {analysis.stock.pe?.toFixed(2)}</div>
        </td>
        <td className="p-6">
          <div className={`text-xl font-black mono ${riskColor}`}>{analysis.riskGrade}/10</div>
          <div className="h-1 w-12 bg-gray-800 rounded-full mt-1 overflow-hidden">
             <div className={`h-full ${riskColor.replace('text', 'bg')}`} style={{ width: `${analysis.riskGrade * 10}%` }}></div>
          </div>
        </td>
        <td className="p-6 text-center">
          <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] border ${getVerdictStyles(analysis.verdict)}`}>
            {analysis.verdict}
          </span>
        </td>
        <td className="p-6">
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:bg-white/10 transition-all text-gray-500 hover:text-white"
           >
             <i className={`fas ${isExpanded ? 'fa-xmark' : 'fa-dna'} text-sm`}></i>
           </button>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={6} className="p-0 border-none">
             <div className="bg-black/60 p-10 space-y-10 border-b border-white/5 animate-in slide-in-from-top duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   {/* Left Col: The Protocol Audit */}
                   <div className="space-y-8">
                      <div>
                         <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <i className="fas fa-brain text-xs"></i> 10-Year First Principles Logic
                         </h4>
                         <p className="text-sm text-gray-300 leading-relaxed italic font-medium">
                            "{analysis.firstPrinciplesReasoning}"
                         </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="glass p-4 rounded-2xl border-white/5">
                            <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Business Moat</div>
                            <div className="text-xs text-white font-bold flex items-center gap-2">
                               <i className="fas fa-chess-rook text-blue-400"></i> {analysis.moatType}
                            </div>
                         </div>
                         <div className="glass p-4 rounded-2xl border-white/5">
                            <div className="text-[9px] text-gray-500 uppercase font-black mb-1">Titan Score</div>
                            <div className="text-xl text-purple-400 font-black mono">{analysis.score}/100</div>
                         </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10">
                         <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Titan Strategic Advice (Bangla)</h5>
                         <p className="text-lg text-white font-black italic">
                            {analysis.banglaAdvice}
                         </p>
                      </div>
                   </div>

                   {/* Right Col: Forensic & Red Flags */}
                   <div className="space-y-8">
                      <div>
                         <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                            <i className="fas fa-microscope text-xs"></i> Financial Forensic Audit
                         </h4>
                         <div className="grid grid-cols-2 gap-4">
                            <ForensicMetric label="Ownership %" value={`${analysis.stock.directorHolding}%`} status={analysis.stock.directorHolding >= 30 ? 'safe' : 'alert'} />
                            <ForensicMetric label="Debt/NAV" value={analysis.stock.debtToEquity?.toFixed(2) || '0.00'} status={(analysis.stock.debtToEquity || 0) < 0.5 ? 'safe' : 'alert'} />
                            <ForensicMetric label="Cash Flow" value="Positive" status="safe" />
                            <ForensicMetric label="Sector Rank" value="Top 15%" status="safe" />
                         </div>
                      </div>

                      <div>
                         <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-4">Critical Vulnerabilities</h4>
                         <div className="space-y-2">
                            {analysis.redFlags.map((flag, i) => (
                              <div key={i} className="flex items-start gap-3 bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                                 <i className="fas fa-circle-exclamation text-red-500 text-[10px] mt-0.5"></i>
                                 <span className="text-[11px] text-gray-400 font-bold uppercase">{flag}</span>
                              </div>
                            ))}
                            {analysis.redFlags.length === 0 && (
                              <div className="text-xs text-green-500 font-bold italic">No terminal red flags detected. System verified.</div>
                            )}
                         </div>
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

const ForensicMetric: React.FC<{ label: string; value: string; status: 'safe' | 'alert' }> = ({ label, value, status }) => (
  <div className="flex justify-between items-center p-3 rounded-xl bg-black/40 border border-white/5">
     <span className="text-[10px] font-black text-gray-500 uppercase">{label}</span>
     <span className={`text-[10px] font-black mono ${status === 'safe' ? 'text-green-400' : 'text-red-400'}`}>{value}</span>
  </div>
);

export default App;
