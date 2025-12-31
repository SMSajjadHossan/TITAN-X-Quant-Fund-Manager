import React, { useState, useRef, useMemo } from 'react';
import { TitanAnalysis, TitanVerdict, EmpireAudit, PortfolioStrategy } from './types';
import { analyzeStocks, parseStockFile } from './services/geminiService';

const App: React.FC = () => {
  const [audit, setAudit] = useState<EmpireAudit | null>(null);
  const [results, setResults] = useState<TitanAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ liquidCash: "", monthlyBurn: "", oneSkill: "" });

  const strategy = useMemo<PortfolioStrategy | null>(() => {
    if (!results || results.length === 0) return null;
    const avgScore = results.reduce((acc, curr) => acc + (curr.score || 0), 0) / results.length;
    return {
      healthScore: Math.floor(avgScore),
      directive: avgScore > 65 ? "DEPLOY AGGRESSIVELY" : avgScore > 45 ? "STAY SELECTIVE" : "PRESERVE CAPITAL",
      stance: avgScore > 65 ? "Aggressive" : avgScore > 45 ? "Neutral" : "Defensive"
    };
  }, [results]);

  const handleAudit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.liquidCash) return;
    setAudit({ liquidCash: Number(form.liquidCash), monthlyBurn: Number(form.monthlyBurn) || 1, oneSkill: form.oneSkill || "Alpha" });
  };

  const onFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const isText = file.type.includes('text') || file.name.endsWith('.csv') || file.name.endsWith('.txt');
      const data = await new Promise<string>((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result as string);
        isText ? reader.readAsText(file) : reader.readAsDataURL(file);
      });
      const parsed = await parseStockFile(data, file.type, isText);
      const analyses = await analyzeStocks(parsed.slice(0, 50));
      setResults(analyses.sort((a, b) => b.score - a.score));
    } catch (err: any) {
      setError("Sync failed. Ensure CSV format is correct.");
    } finally {
      setLoading(false);
    }
  };

  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#030712]">
        <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-6xl font-black italic tracking-tighter uppercase text-white">
              TITAN-<span className="text-transparent bg-clip-text titan-gradient">X</span>
            </h1>
            <p className="text-gray-400 font-medium italic">Quantitative Sovereign Architect v11.0</p>
          </div>
          <form onSubmit={handleAudit} className="glass p-10 rounded-[2.5rem] space-y-8 shadow-2xl titan-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Capital Base</label>
                <input type="number" value={form.liquidCash} onChange={e => setForm({...form, liquidCash: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-purple-500 outline-none" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Monthly Burn</label>
                <input type="number" value={form.monthlyBurn} onChange={e => setForm({...form, monthlyBurn: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold focus:border-pink-500 outline-none" />
              </div>
            </div>
            <button className="w-full titan-gradient py-5 rounded-2xl text-white font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
              Initialize Command Center
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col">
      <header className="glass p-6 sticky top-0 z-40 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 titan-gradient rounded-xl flex items-center justify-center shadow-lg cursor-pointer" onClick={() => window.location.reload()}>
              <i className="fas fa-bolt text-white"></i>
            </div>
            <h1 className="text-xl font-black italic tracking-tight text-white uppercase">TITAN-X</h1>
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="glass px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-white border-white/10 hover:bg-white/5 transition-all">
            <i className="fas fa-upload mr-2"></i> Sync Dossier
          </button>
          <input type="file" ref={fileInputRef} onChange={onFileUpload} className="hidden" />
        </div>
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-[1400px] mx-auto w-full space-y-12">
        {loading && <div className="py-24 text-center text-white italic animate-pulse">Syncing Alpha Data...</div>}
        {error && <div className="p-8 bg-red-600/10 border border-red-600/30 rounded-3xl text-red-500 font-bold text-center">{error}</div>}

        {results.length > 0 && !loading && (
          <div className="glass rounded-[2rem] overflow-hidden border-white/5 shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-black/60 border-b border-white/10">
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Ticker</th>
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Price</th>
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">P/E</th>
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">ROE %</th>
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Debt Risk</th>
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">NAV</th>
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Yield</th>
                  <th className="p-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((res, i) => <TableRow key={i} res={res} />)}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

const TableRow: React.FC<{ res: TitanAnalysis }> = ({ res }) => {
  const [open, setOpen] = useState(false);
  const debtColor = res.debtRisk === "LOW" ? 'text-green-400' : res.debtRisk === "MEDIUM" ? 'text-yellow-400' : 'text-red-500';
  
  return (
    <>
      <tr onClick={() => setOpen(!open)} className="hover:bg-white/5 transition-all cursor-pointer group">
        <td className="p-6 font-black text-white italic">{res.stock.ticker}</td>
        <td className="p-6 mono text-sm">{res.stock.ltp.toFixed(2)}</td>
        <td className="p-6 mono text-sm">{res.metrics.pe.toFixed(2)}</td>
        <td className="p-6 mono text-sm text-blue-400">{res.metrics.roe.toFixed(1)}%</td>
        <td className={`p-6 text-[10px] font-black ${debtColor}`}>{res.debtRisk}</td>
        <td className="p-6 mono text-sm">{res.stock.nav.toFixed(2)}</td>
        <td className="p-6 mono text-sm text-pink-400">{res.yield.toFixed(1)}%</td>
        <td className="p-6 text-center">
          <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${res.verdict === TitanVerdict.GOD_MODE_BUY ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-400 border-white/10'}`}>
            {res.verdict}
          </span>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={8} className="p-0">
            <div className="bg-[#020617] p-12 space-y-12 animate-in slide-in-from-top-4 duration-500 shadow-inner">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="p-8 rounded-[2rem] glass titan-border bg-gradient-to-br from-purple-500/5 to-transparent">
                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-4">KENO? (LOGIC)</h4>
                    <p className="text-3xl font-black text-white italic drop-shadow-lg leading-tight">{res.banglaAdvice}</p>
                    <p className="mt-4 text-gray-400 italic text-sm">"{res.reasoning}"</p>
                  </div>
                  <div className="flex gap-4">
                     <Stat label="ALLOCATION" val={res.allocation} highlight="text-purple-400" />
                     <Stat label="BUCKET" val={res.bucket} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Stat label="SCORE" val={res.score.toString()} highlight={res.score > 70 ? 'text-green-400' : 'text-blue-400'} />
                  <Stat label="FAIR_VAL" val={res.fairValue.toFixed(2)} highlight="text-green-400" />
                  <Stat label="PRICE" val={res.stock.ltp.toFixed(2)} />
                  <Stat label="YIELD" val={`${res.yield.toFixed(1)}%`} color="text-pink-400" />
                  <Stat label="P/E" val={res.metrics.pe.toFixed(2)} />
                  <Stat label="ROE %" val={`${res.metrics.roe.toFixed(1)}%`} />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const Stat: React.FC<{ label: string, val: string, highlight?: string, color?: string }> = ({ label, val, highlight, color }) => (
  <div className="p-6 rounded-2xl bg-black/60 border border-white/5 flex flex-col justify-center flex-1">
    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-xl font-black mono italic tracking-tight ${highlight || color || 'text-white'}`}>{val}</span>
  </div>
);

export default App;