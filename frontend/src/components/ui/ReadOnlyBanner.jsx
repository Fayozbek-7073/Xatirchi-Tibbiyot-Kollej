import { Eye } from 'lucide-react'

export default function ReadOnlyBanner() {
  return (
    <div className="flex items-center gap-2 bg-cyan-50 border border-cyan-200 text-cyan-700 rounded-lg px-4 py-2.5 text-sm font-medium mb-6">
      <Eye className="w-4 h-4 shrink-0" />
      Ko'rish rejimi — o'zgartirish mumkin emas
    </div>
  )
}
