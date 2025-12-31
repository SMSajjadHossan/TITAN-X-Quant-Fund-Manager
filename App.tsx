import React, { useState, useRef } from 'react';
import { TitanAnalysis, TitanVerdict, EmpireAudit } from './types';
import { analyzeStocks, parseStockFile } from './services/geminiService';

const App: React.FC = () => {
  const [audit, setAudit] = useState<EmpireAudit | null>(null);
  const [results, setResults] = useState<TitanAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({ liquidCash: "", monthlyBurn: "", oneSkill: "" });

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
      if (!parsed || parsed.length === 0) throw new Error("No valid data detected.");
      const analyses = await analyzeStocks(parsed.slice(0, 50));
      setResults(analyses.sort((a, b) => (b.score || 0) - (a.score || 0)));
    } catch (err: any) {
      setError(err.message || "Neural sync failure.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
            <p className="text-gray-400 font-medium italic">Sovereign Alpha Architect v11.2</p>
          </div>
          <form onSubmit={handleAudit} className="glass p-10 rounded-[2.5rem] space-y-8 shadow-2xl titan-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Asset Base</label>
                <input type="number" value={form.liquidCash} onChange={e => setForm({...form, liquidCash: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-purple-500 transition-all" required />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Core Strategy</label>
                <input type="text" value={form.oneSkill} onChange={e => setForm({...form, oneSkill: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-blue-500 transition-all" />
              </div>
            </div>
            <button className="w-full titan-gradient py-5 rounded-2xl text-white font-black uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">
              Initialize Neural Scan
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col">
      <header className="glass p-6 sticky top-0 z-40 border-b border-white/5 flex justify-between items-center">
        <h1 className="text-xl font-black italic tracking-tight text-white uppercase cursor-pointer" onClick={() => window.location.reload()}>TITAN-X QUANT</h1>
        <button onClick={() => fileInputRef.current?.click()} className="glass px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white border-white/10 hover:bg-white/5 transition-all">
          <i className="fas fa-microchip mr-2"></i> Inject Stock List
        </button>
        <input type="file" ref={fileInputRef} onChange={onFileUpload} className="hidden" />
      </header>

      <main className="flex-1 p-6 lg:p-12 max-w-[1400px] mx-auto w-full space-y-12">
        {loading && <div className="py-24 text-center text-white italic animate-pulse">Running Rule-Based Simulation...</div>}
        {error && <div className="p-8 bg-red-600/10 border border-red-600/30 rounded-3xl text-red-500 font-bold text-center">{error}</div>}
        
        {results.length > 0 && !loading && (
          <div className="glass rounded-[2rem] overflow-hidden border-white/5 shadow-2xl animate-in fade-in duration-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-black/60 border-b border-white/10 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <th className="p-6">TICKER</th>
                    <th className="p-6">PRICE</th>
                    <th className="p-6">NAV DISCOUNT (%)</th>
                    <th className="p-6">REAL P/E STATUS</th>
                    <th className="p-6 text-center">FINAL TITAN DECISION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {results.map((res, i) => <TableRow key={res.stock?.ticker || i} res={res} />)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && results.length === 0 && !error && (
          <div className="py-32 flex flex-col items-center opacity-30 text-gray-600">
            <i className="fas fa-chess-queen text-6xl mb-6"></i>
            <p className="font-black uppercase tracking-[0.6em] text-sm">System Ready for Alpha Extraction</p>
          </div>
        )}
      </main>
    </div>
  );
};

const TableRow: React.FC<{ res: TitanAnalysis }> = ({ res }) => {
  const [open, setOpen] = useState(false);
  const verdict = res.verdict || TitanVerdict.HOLD;
  const decisionColor = verdict === TitanVerdict.DEEP_VALUE ? 'bg-purple-600' : verdict === TitanVerdict.TRAP ? 'bg-orange-600' : verdict === TitanVerdict.GOD_MODE_BUY ? 'bg-green-600' : verdict === TitanVerdict.OVERVALUED ? 'bg-red-700' : 'bg-gray-800';

  const ltp = res.stock?.ltp ?? 0;
  const navDiscount = res.navDiscount ?? 0;

  return (
    <>
      <tr onClick={() => setOpen(!open)} className={`hover:bg-white/5 transition-all cursor-pointer group ${open ? 'bg-white/5' : ''}`}>
        <td className="p-6 font-black text-white italic text-lg">{res.stock?.ticker || 'N/A'}</td>
        <td className="p-6 mono text-sm font-bold text-gray-300">৳{ltp.toFixed(2)}</td>
        <td className={`p-6 mono text-sm font-bold ${navDiscount > 40 ? 'text-green-400' : 'text-gray-400'}`}>
          {navDiscount.toFixed(1)}%
        </td>
        <td className="p-6 italic text-xs text-blue-300/80 max-w-xs">{res.peStatus || 'Analyzed'}</td>
        <td className="p-6 text-center">
          <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl border border-white/10 transition-all ${decisionColor}`}>
            {verdict}
          </span>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={5} className="p-0">
            <div className="bg-[#020617] p-12 space-y-12 animate-in slide-in-from-top-4 duration-500 shadow-inner border-y border-white/5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="p-10 rounded-[2.5rem] glass titan-border bg-gradient-to-br from-blue-600/10 to-transparent shadow-2xl">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-6 flex items-center">
                       <i className="fas fa-brain mr-2"></i> KENO? (LOGIC)
                    </h4>
                    <p className="text-4xl font-black text-white italic leading-tight mb-6 drop-shadow-xl">{res.banglaAdvice || 'অপেক্ষা করুন।'}</p>
                    <div className="text-gray-400 italic text-sm border-l-2 border-white/10 pl-4 py-2 bg-black/20 rounded-r-xl">
                       <p className="text-xs opacity-70 leading-relaxed font-medium">"{res.reasoning}"</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <Stat label="ALLOCATION" val={res.allocation || "0%"} highlight="text-purple-400" />
                     <Stat label="ROE %" val={`${(res.metrics?.roe ?? 0).toFixed(1)}%`} highlight="text-blue-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <Stat label="TITAN SCORE" val={(res.score ?? 0).toString()} highlight={res.score > 75 ? 'text-green-400' : 'text-blue-400'} />
                  <Stat label="INTRINSIC VAL" val={`৳${(res.intrinsicValue ?? 0).toFixed(2)}`} highlight="text-green-400" />
                  <Stat label="YIELD" val={`${(res.yield ?? 0).toFixed(1)}%`} highlight="text-pink-400" />
                  <Stat label="BUCKET" val={res.bucket || 'Market'} />
                  <Stat label="P/E RATIO" val={(res.metrics?.pe ?? 0).toFixed(2)} />
                  <Stat label="DEBT RISK" val={res.debtRisk || 'LOW'} highlight={res.debtRisk === 'LOW' ? 'text-green-400' : 'text-red-500'} />
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const Stat: React.FC<{ label: string, val: string, highlight?: string }> = ({ label, val, highlight }) => (
  <div className="p-6 rounded-[2rem] bg-black/60 border border-white/5 flex flex-col justify-center flex-1 shadow-inner hover:border-white/10 transition-all group">
    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-1 group-hover:text-gray-400 transition-colors">{label}</span>
    <span className={`text-xl font-black mono italic tracking-tight ${highlight || 'text-white'}`}>{val}</span>
  </div>
);

export default App;