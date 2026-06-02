export default function StatCard({ icon: Icon, label, value, detail, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    purple: 'bg-violet-50 text-violet-700 ring-violet-100',
    orange: 'bg-orange-50 text-orange-700 ring-orange-100',
    slate: 'bg-slate-50 text-slate-700 ring-slate-100'
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card border border-slate-100">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
          {detail && <p className="mt-1 text-xs font-medium text-slate-400">{detail}</p>}
        </div>
        {Icon && (
          <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ring-1 ${tones[tone]}`}>
            <Icon size={26} />
          </div>
        )}
      </div>
    </div>
  )
}
