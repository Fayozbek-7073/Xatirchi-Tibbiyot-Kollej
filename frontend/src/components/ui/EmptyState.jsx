import { Plus } from 'lucide-react'

export default function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <tr>
      <td colSpan={100}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
            {Icon && <Icon className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-500 mb-4">{description}</p>
          {action && (
            <button
              onClick={onAction}
              className="flex items-center gap-2 bg-[#1A4A8A] hover:bg-[#153D75] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              {action}
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
