import React, { useState, useMemo } from 'react';
import { IndianRupee, TrendingUp, Info, ArrowUpRight, ShieldCheck } from 'lucide-react';

const App = () => {
  const [loanAmount, setLoanAmount] = useState(600000);
  const [tenure, setTenure] = useState(36);
  const [loanRate, setLoanRate] = useState(9.5);
  const [fdAmount, setFdAmount] = useState(600000);
  const [fdRate, setFdRate] = useState(7.5);

  const data = useMemo(() => {
    const monthlyLoanRate = loanRate / 12 / 100;
    const monthlyFdRate = fdRate / 12 / 100;
    const emi = (loanAmount * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, tenure)) / 
                (Math.pow(1 + monthlyLoanRate, tenure) - 1);

    let schedule = [];
    let remainingPrincipal = loanAmount;
    let currentFdBalance = fdAmount;
    let totalLoanInterest = 0;
    let totalFdInterest = 0;

    for (let m = 1; m <= tenure; m++) {
      const interestComponent = remainingPrincipal * monthlyLoanRate;
      const principalComponent = emi - interestComponent;
      remainingPrincipal -= principalComponent;
      const fdInterestEarned = currentFdBalance * monthlyFdRate;
      currentFdBalance += fdInterestEarned;
      totalLoanInterest += interestComponent;
      totalFdInterest += fdInterestEarned;

      schedule.push({
        month: m,
        emi: Math.round(emi),
        interest: Math.round(interestComponent),
        fdInterest: Math.round(fdInterestEarned),
        net: Math.round(fdInterestEarned - interestComponent),
        balance: Math.round(currentFdBalance)
      });
    }
    return { schedule, emi, totalLoanInterest, totalFdInterest };
  }, [loanAmount, tenure, loanRate, fdAmount, fdRate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-12">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <TrendingUp size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">SmartFinance <span className="text-indigo-600">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <ShieldCheck size={16} className="text-emerald-500" />
            Verified Calculation Engine
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                Loan Configuration
              </h2>
              
              <InputBlock label="Loan Amount" value={loanAmount} min={100000} max={2000000} step={10000} unit="₹" onChange={setLoanAmount} />
              <InputBlock label="Tenure (Months)" value={tenure} min={12} max={84} step={1} unit="" onChange={setTenure} />
              <InputBlock label="Interest Rate" value={loanRate} min={5} max={18} step={0.1} unit="%" onChange={setLoanRate} />
              
              <div className="my-8 border-t border-dashed border-slate-200"></div>
              
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-slate-800">
                FD Asset Settings
              </h2>
              <InputBlock label="FD Principal" value={fdAmount} min={100000} max={2000000} step={10000} unit="₹" onChange={setFdAmount} />
              <InputBlock label="FD Interest Rate" value={fdRate} min={3} max={12} step={0.1} unit="%" onChange={setFdRate} />
            </section>

            <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100">
              <div className="flex gap-3">
                <Info className="text-indigo-600 shrink-0" size={20} />
                <p className="text-sm text-indigo-900 leading-relaxed">
                  <strong>Why this works:</strong> Even if the FD rate is lower than the loan rate, your FD grows on the <b>entire amount</b> while the loan interest is charged only on the <b>remaining balance</b>.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ResultCard label="Monthly EMI" value={data.emi} color="indigo" />
              <ResultCard label="Total Interest Cost" value={data.totalLoanInterest} color="red" />
              <ResultCard label="Net FD Earnings" value={data.totalFdInterest} color="emerald" />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-lg">Amortization & Growth Insight</h3>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Breakdown</div>
              </div>
              <div className="overflow-x-auto max-h-[600px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Month</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Loan Interest</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">FD Interest</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Net Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.schedule.map((row) => (
                      <tr key={row.month} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-500">#{row.month}</td>
                        <td className="px-6 py-4 text-right text-rose-500 font-medium">₹{row.interest.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right text-emerald-600 font-medium">₹{row.fdInterest.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${row.net >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {row.net >= 0 ? <ArrowUpRight size={12} /> : null}
                            ₹{Math.abs(row.net).toLocaleString()} {row.net >= 0 ? 'Profit' : 'Cost'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const InputBlock = ({ label, value, min, max, step, unit, onChange }) => (
  <div className="mb-6 group">
    <div className="flex justify-between items-end mb-3">
      <label className="text-sm font-semibold text-slate-600">{label}</label>
      <div className="text-lg font-bold text-indigo-600 tabular-nums">
        {unit === '₹' && '₹'}{Number(value).toLocaleString()}{unit === '%' && '%'}
      </div>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700 transition-all"
    />
  </div>
);

const ResultCard = ({ label, value, color }) => {
  const colors = {
    indigo: "bg-indigo-600 text-white shadow-indigo-100",
    red: "bg-white text-slate-900 border-slate-200",
    emerald: "bg-white text-slate-900 border-slate-200"
  };
  
  const valueColors = {
    indigo: "text-white",
    red: "text-rose-500",
    emerald: "text-emerald-600"
  };

  return (
    <div className={`${colors[color]} p-6 rounded-2xl shadow-sm border ${color === 'indigo' ? 'border-transparent' : ''}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.1em] mb-2 ${color === 'indigo' ? 'text-indigo-100' : 'text-slate-400'}`}>
        {label}
      </p>
      <h4 className={`text-2xl font-black tabular-nums ${valueColors[color]}`}>
        ₹{Math.round(value).toLocaleString()}
      </h4>
    </div>
  );
};

export default App;