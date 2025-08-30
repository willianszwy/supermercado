import { useState } from 'react'
import ListItem from './ListItem'

function ListSection({ title, items, onUpdateStatus, onEdit, statusType, isEmpty = false, dataTour, hideTitle = false }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  // Só permite colapsar as seções "Comprados" e "Em Falta"
  const canCollapse = statusType === 'completed' || statusType === 'missing'
  
  return (
    <div className="list-section" data-tour={dataTour}>
      {!hideTitle && (
        <div 
          className={`mb-3 flex items-center justify-between ${canCollapse ? 'cursor-pointer' : ''}`}
          onClick={canCollapse ? () => setIsCollapsed(!isCollapsed) : undefined}
        >
          <h3 className="text-xl font-semibold uppercase tracking-wide flex items-center gap-2">
            {title}
            <span className="text-sm bg-slate-500 text-white px-2 py-1 rounded-full font-medium">
              {items.length}
            </span>
          </h3>
          {canCollapse && items.length > 0 && (
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              {isCollapsed ? '▼' : '▲'}
            </button>
          )}
        </div>
      )}
      {(hideTitle || !canCollapse || !isCollapsed) && (
        <div className={hideTitle ? "" : "min-h-12 border-2 border-dashed border-gray-300 rounded p-3"}>
          {isEmpty ? (
            <div className="text-center text-gray-500 italic py-5">
              Adicione produtos à sua lista
            </div>
          ) : items.length === 0 ? null : (
            <ul className="list-none">
              {items.map(item => (
                <ListItem
                  key={item.id}
                  item={item}
                  onUpdateStatus={onUpdateStatus}
                  onEdit={onEdit}
                  statusType={statusType}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

export default ListSection