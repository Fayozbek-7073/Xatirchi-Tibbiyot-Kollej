export default function StatCard({ icon: Icon, label, value, subLabel, iconBg = 'bg-blue-100', iconColor = 'text-blue-700' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className={`w-12 h-12 rounded-lg ${iconBg} ${iconColor} flex items-center justify-center mb-4`}>
        <Icon className="w-6 h-6" />
      </div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {subLabel && <p className="text-sm text-gray-500 mt-1">{subLabel}</p>}
    </div>
  )
}
