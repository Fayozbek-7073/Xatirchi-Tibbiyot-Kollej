export default function SkeletonRow({ cols = 4 }) {
  return (
    <tr className="border-b border-gray-100 animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  )
}
