export const metadata = { title: 'Risk Scoring — HireProof' }
export default function Page() {
  return (
    <div>
      <h1 className="mb-4 text-4xl font-black tracking-tight">Risk Scoring</h1>
      <p className="mb-8 text-lg font-semibold text-muted">Deterministic, weighted scoring produces explainable verdicts.</p>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Score Calculation</h2>
        <p className="mb-4 text-sm font-semibold text-muted leading-6">Risk starts at a base score of 25. Red flags add penalties, green flags add bonuses. The final score is clamped between 0-100.</p>
        <div className="mb-6 overflow-hidden rounded-xl border border-border-soft">
          <table className="w-full text-xs"><thead><tr className="border-b border-border-soft bg-surface">
            <th className="px-4 py-2.5 text-left font-black text-muted">Red Flag Keyword</th><th className="px-4 py-2.5 text-left font-black text-muted">Weight</th>
          </tr></thead><tbody>
            {[['unrealistic', '+25'],['payment / fee', '+25'],['telegram', '+18'],['reputation', '+18'],['interview (missing)', '+15'],['company (unknown)', '+15'],['whatsapp', '+14'],['salary', '+12'],['pressure', '+12'],['local (missing)', '+10']].map(([k,v])=>(
              <tr key={k} className="border-b border-border-soft last:border-0"><td className="px-4 py-2 font-semibold">{k}</td><td className="px-4 py-2 font-black text-risk-text">{v}</td></tr>
            ))}
          </tbody></table>
        </div>
        <div className="overflow-hidden rounded-xl border border-border-soft">
          <table className="w-full text-xs"><thead><tr className="border-b border-border-soft bg-surface">
            <th className="px-4 py-2.5 text-left font-black text-muted">Green Flag Keyword</th><th className="px-4 py-2.5 text-left font-black text-muted">Weight</th>
          </tr></thead><tbody>
            {[['verified', '-18'],['legitimate', '-15'],['official', '-14'],['professional', '-12'],['standard', '-10'],['specific', '-8']].map(([k,v])=>(
              <tr key={k} className="border-b border-border-soft last:border-0"><td className="px-4 py-2 font-semibold">{k}</td><td className="px-4 py-2 font-black text-safe">{v}</td></tr>
            ))}
          </tbody></table>
        </div>
      </section>
      <section className="mb-10">
        <h2 className="mb-4 text-2xl font-black">Verdict Thresholds</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4 rounded-xl border border-safe-bg bg-safe-bg/30 p-4"><span className="text-2xl font-black text-safe">0-34</span><span className="text-sm font-black text-safe-text">✅ Safe</span></div>
          <div className="flex items-center gap-4 rounded-xl border border-caution-bg bg-caution-bg/30 p-4"><span className="text-2xl font-black text-caution">35-64</span><span className="text-sm font-black text-caution-text">⚠️ Caution</span></div>
          <div className="flex items-center gap-4 rounded-xl border border-risk-bg bg-risk-bg/30 p-4"><span className="text-2xl font-black text-high-risk">65-100</span><span className="text-sm font-black text-risk-text">🔴 High-Risk</span></div>
        </div>
      </section>
      <section>
        <h2 className="mb-4 text-2xl font-black">Radar Chart</h2>
        <p className="text-sm font-semibold text-muted leading-6">The risk score is decomposed into 5 visual dimensions in the result screen&apos;s interactive Radar Chart: <strong>Company Legitimacy</strong>, <strong>Reputation</strong>, <strong>Salary Realism</strong>, <strong>Local Presence</strong>, and <strong>Contact Safety</strong>. Each axis is scored independently from the same red/green flags and evidence data.</p>
      </section>
    </div>
  )
}
