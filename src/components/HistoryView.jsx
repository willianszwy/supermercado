import { useState } from 'react'
import CartIcon from './CartIcon'

function HistoryView({ cartHistory, onBack, onRestoreCart }) {
  const [selectedCart, setSelectedCart] = useState(null)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCartSummary = (cart) => {
    const total = cart.items.length
    const completed = cart.items.filter(item => item.status === 'completed').length
    const missing = cart.items.filter(item => item.status === 'missing').length
    return { total, completed, missing }
  }

  // Agrupar carrinhos por data
  const groupedHistory = cartHistory.reduce((groups, cart) => {
    const date = new Date(cart.finishedAt).toLocaleDateString('pt-BR')
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(cart)
    return groups
  }, {})

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => {
    return new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-'))
  })

  return (
    <>
      <header className="py-5 flex items-center gap-5 mb-5 border-b-2 border-primary-blue">
        <button onClick={onBack} className="btn-secondary">
          ← Voltar
        </button>
        <h2 className="text-2xl font-bold text-primary-blue">
          Histórico
        </h2>
      </header>

      <main>
        {cartHistory.length === 0 ? (
          <div className="text-center text-gray-500 italic py-12">
            <div className="text-4xl mb-4">📋</div>
            <p>Nenhum carrinho finalizado ainda.</p>
            <p className="text-sm mt-2">Finalize suas compras para ver o histórico aqui!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date}>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-1">
                  {date}
                </h3>
                <div className="space-y-3">
                  {groupedHistory[date]
                    .sort((a, b) => new Date(b.finishedAt) - new Date(a.finishedAt))
                    .map(cart => {
                      const summary = getCartSummary(cart)
                      return (
                        <div
                          key={cart.id}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedCart(selectedCart === cart.id ? null : cart.id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-gray-800 flex items-center gap-2">
                                  <CartIcon className="w-4 h-4" />
                                  Compras {formatTime(cart.finishedAt)}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-white text-xs bg-slate-500 px-2 py-1 rounded-full font-semibold">
                                    {summary.total}
                                  </span>
                                  {summary.completed > 0 && (
                                    <span className="text-primary-green text-xs bg-green-100 px-2 py-1 rounded-full font-semibold">
                                      ✓ {summary.completed}
                                    </span>
                                  )}
                                  {summary.missing > 0 && (
                                    <span className="text-primary-red text-xs bg-red-100 px-2 py-1 rounded-full font-semibold">
                                      ✗ {summary.missing}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                Finalizado às {formatTime(cart.finishedAt)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onRestoreCart(cart)
                                }}
                                className="text-xs px-3 py-1 bg-primary-blue text-white rounded-full hover:bg-primary-blue-dark transition-colors"
                              >
                                Restaurar
                              </button>
                              <span className="text-gray-400">
                                {selectedCart === cart.id ? '▲' : '▼'}
                              </span>
                            </div>
                          </div>

                          {selectedCart === cart.id && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <h4 className="text-sm font-medium text-gray-700 mb-3">
                                Itens do carrinho:
                              </h4>
                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {cart.items.map(item => (
                                  <div
                                    key={item.id}
                                    className={`flex justify-between items-center p-2 rounded text-sm ${
                                      item.status === 'completed' 
                                        ? 'bg-green-50 border-l-2 border-primary-green' 
                                        : item.status === 'missing'
                                        ? 'bg-red-50 border-l-2 border-primary-red'
                                        : 'bg-gray-50'
                                    }`}
                                  >
                                    <span className="font-medium">{item.name}</span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-600 text-xs bg-slate-200 px-2 py-1 rounded-full">
                                        {item.quantity}
                                      </span>
                                      {item.status === 'completed' && (
                                        <span className="text-primary-green text-xs">✓</span>
                                      )}
                                      {item.status === 'missing' && (
                                        <span className="text-primary-red text-xs">✗</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}

export default HistoryView