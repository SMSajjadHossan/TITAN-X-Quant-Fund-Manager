
import React, { useState, useRef } from 'react';
import { StockData, TitanAnalysis, TitanVerdict } from './types';
import { parseRawData, analyzeStockWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [rawData, setRawData] = useState<string>("");
  const [analyzedStocks, setAnalyzedStocks] = useState<TitanAnalysis[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'upload' | 'results'>('upload');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawData(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const startAnalysis = async () => {
    if (!rawData.trim()) {
      setError("Please provide raw data or upload a file first.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    try {
      const parsed = await parseRawData(rawData);
      const results: TitanAnalysis[] = [];
      
      // Process each stock (concurrency limited to avoid rate limits)
      for (const stock of parsed) {
        const analysis = await analyzeStockWithGemini(stock);
        results.push(analysis);
      }
      
      setAnalyzedStocks(results.sort((a, b) => b.score - a.score));
      setCurrentView('results');
    } catch (err: any) {
      setError("Analysis failed: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="titan-gradient p-6 shadow-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md border border-white/30">
              <i className="fas fa-microchip text-2xl text-white"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase">TITAN-X</h1>
              <p className="text-[10px] mono text-white/70 uppercase tracking-widest">Empire Architect Protocol v2.5</p>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-6 text-sm font-medium text-white/80">
            <button onClick={() => setCurrentView('upload')} className="hover:text-white transition-colors">Audit Terminal</button>
            <button className="hover:text-white transition-colors">Portfolio Guard</button>
            <button className="hover:text-white transition-colors">Risk Firewall</button>
          </nav>

          <div className="flex items-center space-x-4">
             <span className="text-[10px] mono px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">SYSTEM ONLINE</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {currentView === 'upload' ? (
          <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Identify <span className="text-transparent bg-clip-text titan-gradient">Wealth Compounders</span>,<br />
                Destroy Capital Destroyers.
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto text-sm leading-relaxed">
                Applying First Principles to the Bangladesh and Global stock markets. Zero emotion. 100% quantitative logic.
              </p>
            </div>

            <div className="glass p-8 rounded-3xl titan-border space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Raw Data Input</label>
                <textarea
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  placeholder="Paste LTP, EPS, NAV, Debt data from txt/excel here..."
                  className="w-full h-48 bg-gray-900/50 border border-gray-700 rounded-2xl p-4 text-sm mono focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-full">
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center space-x-2 w-full p-4 border-2 border-dashed border-gray-700 rounded-2xl cursor-pointer hover:border-purple-500/50 transition-colors bg-gray-900/30"
                  >
                    <i className="fas fa-file-upload text-gray-500"></i>
                    <span className="text-sm font-medium text-gray-400">Upload CSV / TXT / Portfolio Data</span>
                  </label>
                </div>
                
                <button
                  onClick={startAnalysis}
                  disabled={isProcessing}
                  className={`w-full md:w-auto px-10 py-4 rounded-2xl titan-gradient text-white font-bold text-sm uppercase tracking-widest shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                >
                  {isProcessing ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-bolt"></i>
                      <span>Execute Audit</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs mono flex items-center space-x-2">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard icon="fa-shield-halved" title="Safety First" desc="Strict Debt/Equity < 0.5 filtering." />
              <FeatureCard icon="fa-chart-pie" title="Moat Audit" desc="Monopoly vs Oligopoly verification." />
              <FeatureCard icon="fa-brain" title="1st Principles" desc="Survivor reasoning for next 10 years." />
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                <button onClick={() => setCurrentView('upload')} className="text-gray-400 hover:text-white mb-4 flex items-center space-x-2 text-sm">
                  <i className="fas fa-arrow-left"></i>
                  <span>Back to Audit Terminal</span>
                </button>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Analysis Results</h2>
                <p className="text-gray-400 text-sm">{analyzedStocks.length} Securities Processed Through TITAN-X Logic</p>
              </div>
              
              <div className="flex space-x-2">
                <button className="px-4 py-2 glass rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors uppercase tracking-widest">Export XLSX</button>
                <button className="px-4 py-2 titan-gradient rounded-lg text-xs font-bold text-white uppercase tracking-widest shadow-lg shadow-purple-900/20">Sync to Cloud</button>
              </div>
            </div>

            <div className="overflow-x-auto glass rounded-3xl titan-border">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800 bg-gray-900/50">
                    <th className="p-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ticker</th>
                    <th className="p-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">State</th>
                    <th className="p-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Valuation</th>
                    <th className="p-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Score</th>
                    <th className="p-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Risk</th>
                    <th className="p-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center">Verdict</th>
                    <th className="p-5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {analyzedStocks.map((analysis, idx) => (
                    <StockRow key={analysis.stock.ticker + idx} analysis={analysis} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-8 border-t border-gray-800 bg-gray-900/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h4 className="text-sm font-bold text-white uppercase">TITAN-X Protocol</h4>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Wealth preservation is the ultimate victory.</p>
          </div>
          <div className="flex space-x-6">
            <SocialIcon icon="fa-github" />
            <SocialIcon icon="fa-x-twitter" />
            <SocialIcon icon="fa-linkedin" />
          </div>
          <div className="text-[10px] mono text-gray-600 uppercase">
            © 2025 EMP-QUANT | ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="glass p-6 rounded-2xl titan-border hover:bg-gray-800/40 transition-all group">
    <div className="titan-gradient w-10 h-10 rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-purple-900/20">
      <i className={`fas ${icon} text-white`}></i>
    </div>
    <h3 className="font-bold text-white mb-1">{title}</h3>
    <p className="text-xs text-gray-400">{desc}</p>
  </div>
);

const SocialIcon: React.FC<{ icon: string }> = ({ icon }) => (
  <a href="#" className="text-gray-500 hover:text-purple-500 transition-colors">
    <i className={`fab ${icon} text-xl`}></i>
  </a>
);

const StockRow: React.FC<{ analysis: TitanAnalysis }> = ({ analysis }) => {
  const [showDetails, setShowDetails] = useState(false);
  const verdictColor = analysis.verdict === TitanVerdict.GOD_MODE_BUY ? 'text-green-400 bg-green-500/10 border-green-500/30' :
                       analysis.verdict === TitanVerdict.BUY ? 'text-blue-400 bg-blue-500/10 border-blue-500/30' :
                       analysis.verdict === TitanVerdict.HOLD ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' :
                       'text-red-400 bg-red-500/10 border-red-500/30';

  const riskColor = analysis.riskGrade <= 3 ? 'text-green-500' : analysis.riskGrade <= 6 ? 'text-yellow-500' : 'text-red-500';

  return (
    <>
      <tr className="hover:bg-gray-800/20 transition-colors group">
        <td className="p-5">
          <div className="font-black text-white mono">{analysis.stock.ticker}</div>
          <div className="text-[10px] text-gray-500 uppercase">{analysis.stock.sector || 'Industrial'}</div>
        </td>
        <td className="p-5">
          <div className="text-sm font-medium text-gray-300">LTP: <span className="mono">{analysis.stock.ltp}</span></div>
          <div className="text-[10px] text-gray-500 mono">P/E: {analysis.stock.pe?.toFixed(1)} | ROE: {analysis.stock.roe?.toFixed(1)}%</div>
        </td>
        <td className="p-5">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${analysis.valuationStatus === 'Sosta' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {analysis.valuationStatus}
          </span>
        </td>
        <td className="p-5">
          <div className="w-12 h-12 rounded-full border-2 border-gray-700 flex items-center justify-center relative">
            <span className="text-xs font-black mono text-purple-400">{analysis.score}</span>
            <svg className="absolute -inset-0.5 w-[50px] h-[50px] transform -rotate-90">
              <circle
                cx="25" cy="25" r="23"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={145}
                strokeDashoffset={145 - (145 * analysis.score) / 100}
                className="text-purple-600 transition-all duration-1000"
              />
            </svg>
          </div>
        </td>
        <td className="p-5">
          <div className={`text-xl font-black mono ${riskColor}`}>{analysis.riskGrade}</div>
          <div className="text-[9px] text-gray-500 uppercase tracking-widest">Risk Grade</div>
        </td>
        <td className="p-5 text-center">
          <span className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest shadow-lg ${verdictColor}`}>
            {analysis.verdict}
          </span>
        </td>
        <td className="p-5">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-gray-700 transition-colors"
          >
            <i className={`fas ${showDetails ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-400`}></i>
          </button>
        </td>
      </tr>
      {showDetails && (
        <tr>
          <td colSpan={7} className="p-0 border-none">
            <div className="bg-gray-900/60 p-8 animate-in slide-in-from-top duration-300 border-t border-gray-800">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <h5 className="text-xs font-bold text-purple-400 uppercase tracking-[0.2em] mb-4">First Principles Reasoning</h5>
                    <p className="text-sm text-gray-300 leading-relaxed italic">
                      "{analysis.firstPrinciplesReasoning}"
                    </p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Governance & Moat</h5>
                    <div className="flex flex-wrap gap-2">
                      <Tag label={`Moat: ${analysis.moatType}`} icon="fa-chess-rook" />
                      <Tag label={`Director: ${analysis.stock.directorHolding}%`} icon="fa-user-tie" />
                      <Tag label={`Debt/Eq: ${analysis.stock.debtToEquity?.toFixed(2)}`} icon="fa-balance-scale" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h5 className="text-xs font-bold text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <i className="fas fa-biohazard"></i> Red Flag Analysis
                    </h5>
                    <ul className="space-y-2">
                      {analysis.redFlags.map((flag, i) => (
                        <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                          <i className="fas fa-circle-exclamation text-red-500/50 mt-1"></i>
                          <span>{flag}</span>
                        </li>
                      ))}
                      {analysis.redFlags.length === 0 && <li className="text-xs text-gray-500">Zero immediate critical flags detected.</li>}
                    </ul>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">TITAN Final Verdict</div>
                    <div className="text-lg font-black text-white uppercase tracking-tighter">
                      {analysis.verdict === TitanVerdict.DESTROY ? "Terminate Holding" : "Retain & Scale Position"}
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

const Tag: React.FC<{ label: string; icon: string }> = ({ label, icon }) => (
  <span className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-[10px] text-gray-300 flex items-center gap-2">
    <i className={`fas ${icon} text-purple-400`}></i>
    {label}
  </span>
);

export default App;
