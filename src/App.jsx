import React, { useState, useMemo } from 'react';
import { TrendingUp, Landmark, ReceiptText, PieChart, ArrowUpRight } from 'lucide-react';

const App = () => {
  const [loanAmount, setLoanAmount] = useState(600000);
  const [tenure, setTenure] = useState(36);
  const [loanRate, setLoanRate] = useState(9.5);
  const [fdAmount, setFdAmount] = useState(600000);
  const [fdRate, setFdRate] = useState(7.5);
  const [salary, setSalary] = useState(2400000);

  const data = useMemo(() => {
    const monthlyLoanRate = loanRate / 12 / 100;
    const monthlyFdRate = fdRate / 12 / 100;
    const emi = (loanAmount * monthlyLoanRate * Math.pow(1 + monthlyLoanRate, tenure)) / 
                (Math.pow(1 + monthlyLoanRate, tenure) - 1);

    // Marginal Tax Logic (simplified for HNI brackets)
    const getTaxRate = (income, regime) => {
      if (income > 1500000) return 0.312; // 30% + 4% Cess
      return 0.208; // Simplified for this demo
    };

    const taxOld = getTaxRate(salary, 'old');
    const taxNew = getTaxRate(salary, 'new');
    
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
        loanInterest: Math.round(interestComponent),
        fdInterest: Math.round(fdInterestEarned),
        netBeforeTax: Math.round(fdInterestEarned - interestComponent)
      });
    }

    return { 
      schedule, emi, totalLoanInterest, totalFdInterest,
      fdAfterTaxOld: totalFdInterest * (1 - taxOld),
      fdAfterTaxNew: totalFdInterest * (1 - taxNew),
      benefitOld: (totalFdInterest * (1 - taxOld)) - totalLoanInterest,
      benefitNew: (totalFdInterest * (1 - taxNew)) - totalLoanInterest,
      totalNetBenefit: totalFdInterest - totalLoanInterest
    };
  }, [salary, loanAmount, tenure, loanRate, fdAmount, fdRate]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans pb-12">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 mb-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><Landmark size={22} /></div>
            <span className="text-xl font-bold tracking-tight">SmartFinance <span className="text-indigo-600">Pro</span></span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* INPUTS SECTION */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black uppercase text-indigo-600 mb-6 tracking-widest border-b pb-2">1. Loan Configuration</h3>
            <InputBlock label="Loan Amount" value={loanAmount} min={100000} max={2000000} step={10000} unit="₹" onChange={setLoanAmount} />
            <InputBlock label="Tenure (Months)" value={tenure} min={12} max={84} step={1} unit="" onChange={setTenure} />
            <InputBlock label="Interest Rate" value={loanRate} min={5} max={18} step={0.1} unit="%" onChange={setLoanRate} />

            <h3 className="text-[10px] font-black uppercase text-emerald-600 mb-6 mt-8 tracking-widest border-b pb-2">2. FD Configuration</h3>
            <InputBlock label="FD Principal" value={fdAmount} min={100000} max={2000000} step={10000} unit="₹" onChange={setFdAmount} />
            <InputBlock label="FD Interest Rate" value={fdRate} min={3} max={12} step={0.1} unit="%" onChange={setFdRate} />

            <h3 className="text-[10px] font-black uppercase text-amber-600 mb-6 mt-8 tracking-widest border-b pb-2">3. Tax Profile</h3>
            <InputBlock label="Annual Salary" value={salary} min={500000} max={10000000} step={50000} unit="₹" onChange={setSalary} />
          </section>
        </div>

        {/* RESULTS SECTION */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ResultCard label="Monthly EMI" value={data.emi} color="indigo" />
            <ResultCard label="Total Loan Interest" value={data.totalLoanInterest} color="red" />
            
            {/* FD INTEREST CARD */}
            <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Total FD Interest (Gross)</p>
              <h4 className="text-2xl font-black text-emerald-600 mb-4">₹{Math.round(data.totalFdInterest).toLocaleString()}</h4>
              <div className="space-y-2 pt-3 border-t border-slate-50">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Post-Tax (New Regime)</span>
                  <span className="text-slate-800">₹{Math.round(data.fdAfterTaxNew).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Post-Tax (Old Regime)</span>
                  <span className="text-slate-800">₹{Math.round(data.fdAfterTaxOld).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* NET BENEFIT CARD */}
            <div className="p-6 rounded-3xl border-2 border-amber-100 bg-amber-50 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Total Net Benefit</p>
              <h4 className="text-2xl font-black text-amber-900 mb-4">₹{Math.round(data.totalNetBenefit).toLocaleString()}</h4>
              <div className="space-y-2 pt-3 border-t border-amber-200/30">
                <div className="flex justify-between text-[11px] font-bold text-amber-800/70">
                  <span>After Tax (New)</span>
                  <span className={data.benefitNew >= 0 ? 'text-emerald-700' : 'text-rose-700'}>₹{Math.round(data.benefitNew).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-amber-800/70">
                  <span>After Tax (Old)</span>
                  <span className={data.benefitOld >= 0 ? 'text-emerald-700' : 'text-rose-700'}>₹{Math.round(data.benefitOld).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* MONTHLY TABLE */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monthly Breakdown (Pre-Tax)</h4>
            </div>
            <div className="overflow-x-auto max-h-[350px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white sticky top-0">
                  <tr className="text-[10px] text-slate-400 uppercase font-black">
                    <th className="p-4">Month</th>
                    <th className="p-4 text-right">Loan Interest</th>
                    <th className="p-4 text-right">FD Interest</th>
                    <th className="p-4 text-right">Net P/L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.schedule.map(row => (
                    <tr key={row.month} className="hover:bg-slate-50">
                      <td className="p-4 text-slate-400 font-mono text-xs">#{row.month}</td>
                      <td className="p-4 text-right text-rose-500 font-medium">₹{row.loanInterest.toLocaleString()}</td>
                      <td className="p-4 text-right text-emerald-600 font-medium">₹{row.fdInterest.toLocaleString()}</td>
                      <td className={`p-4 text-right font-bold ${row.netBeforeTax >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                        {row.netBeforeTax >= 0 ? '+' : ''}₹{row.netBeforeTax.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* VERDICT */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-400" /> Strategy Verdict
              </h3>
              <p className="text-slate-400 text-sm max-w-lg">
                {data.benefitNew > 0 
                  ? "Mathematically Optimized: Keeping your capital in the FD generates more value than the interest cost of the loan, even after considering the 31.2% tax impact."
                  : "Caution: The post-tax FD growth is lower than the loan interest cost. However, consider the 'Liquidity Value' of having cash available for emergencies."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const InputBlock = ({ label, value, min, max, step, unit, onChange }) => (
  <div className="mb-6 last:mb-0">
    <div className="flex justify-between items-center mb-2">
      <label className="text-[11px] font-bold text-slate-500">{label}</label>
      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
        <span className="text-slate-400 text-[10px] mr-1">{unit === '₹' ? '₹' : ''}</span>
        <input 
          type="number" value={value} onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 bg-transparent text-right font-bold text-slate-700 focus:outline-none text-xs"
        />
        <span className="ml-1 text-[10px] text-slate-400">{unit === '%' ? '%' : ''}</span>
      </div>
    </div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
  </div>
);

const ResultCard = ({ label, value, color }) => {
  const styles = {
    indigo: "bg-indigo-600 text-white shadow-indigo-100 border-transparent",
    red: "bg-white border-slate-200 text-slate-800 shadow-sm",
  };
  return (
    <div className={`p-6 rounded-3xl border ${styles[color]}`}>
      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${color === 'indigo' ? 'text-indigo-200' : 'text-slate-400'}`}>{label}</p>
      <h4 className={`text-2xl font-black ${color === 'red' ? 'text-rose-500' : ''}`}>₹{Math.round(value).toLocaleString()}</h4>
    </div>
  );
};

export default App;