import ListItem from './ListItem'

function ListSection({ title, items, onUpdateStatus, statusType, isEmpty = false }) {
  return (
    <div className="list-section">
      <h3 className="mb-3 text-xl font-semibold uppercase tracking-wide">
        {title}
      </h3>
      <div className="min-h-12 border-2 border-dashed border-gray-300 rounded p-3">
        {isEmpty ? (
          <div className="text-center text-gray-500 italic py-5">
            Adicione produtos à sua lista
          </div>
        ) : items.length === 0 && title === 'Pendentes' ? (
          <div className="text-center text-gray-500 italic py-5">
            Arraste itens para direita (✓) ou esquerda (✗)
          </div>
        ) : items.length === 0 ? null : (
          <ul className="list-none space-y-0">
            {items.map(item => (
              <ListItem
                key={item.id}
                item={item}
                onUpdateStatus={onUpdateStatus}
                statusType={statusType}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ListSection