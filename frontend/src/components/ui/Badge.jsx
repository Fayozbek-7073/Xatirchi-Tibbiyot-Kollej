export function DebtBadge({ paid, total }) {
  if (!total || total === 0) return null

  const debt = total - paid
  const ratio = paid / total

  if (debt <= 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-600">
        To'langan
      </span>
    )
  }
  if (ratio >= 0.5) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-600">
        Qisman
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
      Qarzdor
    </span>
  )
}

export function RoleBadge({ role }) {
  if (role === 'director') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-600">
        Direktor
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
      Admin
    </span>
  )
}
