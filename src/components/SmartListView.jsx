import { useState, useMemo } from 'react'
import { computeSmartList, getScoreReason } from '../utils/smartListUtils'
import { getCategoryColor, getCategoryById } from '../utils/categories'
import { formatPrice } from '../utils/priceUtils'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

function SmartListView({ cartHistory, onCreateList, onBack }) {
  const { onButtonPress, onSuccess } = useHapticFeedback()

  const predictions = useMemo(() => computeSmartList(cartHistory), [cartHistory])

  // Começa com todos selecionados
  const [selected, setSelected] = useState(() => new Set(predictions.map(p => p.name)))
  const [quantities, setQuantities] = useState(() => {
    const map = {}
    predictions.forEach(p => { map[p.name] = p.quantity })
    return map
  })

  const toggleProduct = (name) => {
    onButtonPress()
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const updateQty = (name, delta) => {
    setQuantities(prev => ({
      ...prev,
      [name]: Math.min(999, Math.max(1, (prev[name] || 1) + delta))
    }))
  }

  const handleCreate = () => {
    onSuccess()
    const products = predictions
      .filter(p => selected.has(p.name))
      .map(p => ({ name: p.name, quantity: quantities[p.name] || p.quantity, category: p.category, price: p.price }))
    onCreateList(products)
  }

  const selectedCount = selected.size

  // Sem histórico suficiente
  if (predictions.length === 0) {
    return (
      <>
        <header className="py-5 flex items-center gap-5 mb-5 border-b-2 border-primary-blue">
          <button onClick={() => { onButtonPress(); onBack() }} className="btn-secondary">
            ← Voltar
          </button>
          <h2 className="text-2xl font-bold text-primary-blue">Lista Inteligente</h2>
        </header>
        <div className="text-center py-16 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="font-medium text-gray-700 mb-2">Ainda aprendendo seus hábitos</p>
          <p className="text-sm max-w-xs mx-auto">Finalize pelo menos uma compra para que eu possa prever o que você precisará na próxima vez.</p>
        </div>
      </>
    )
  }

  // Agrupar por faixa de confiança
  const high   = predictions.filter(p => p.confidence >= 65)
  const medium = predictions.filter(p => p.confidence >= 35 && p.confidence < 65)
  const low    = predictions.filter(p => p.confidence < 35)

  return (
    <>
      <header className="py-5 border-b-2 border-primary-blue mb-5">
        <div className="flex items-center gap-3 mb-1">
          <button onClick={() => { onButtonPress(); onBack() }} className="btn-secondary">
            ← Voltar
          </button>
          <h2 className="text-2xl font-bold text-primary-blue">Lista Inteligente</h2>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Baseada em {cartHistory.length} compra{cartHistory.length !== 1 ? 's' : ''} anteriores.
          Desmarque o que não precisa.
        </p>
      </header>

      <main className="pb-28">
        {high.length > 0 && (
          <Section title="Provavelmente precisa" predictions={high} selected={selected} quantities={quantities} onToggle={toggleProduct} onQty={updateQty} />
        )}
        {medium.length > 0 && (
          <Section title="Talvez precise" predictions={medium} selected={selected} quantities={quantities} onToggle={toggleProduct} onQty={updateQty} />
        )}
        {low.length > 0 && (
          <Section title="Pode precisar" predictions={low} selected={selected} quantities={quantities} onToggle={toggleProduct} onQty={updateQty} />
        )}
      </main>

      {/* Botão fixo no fundo */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleCreate}
            disabled={selectedCount === 0}
            className={`w-full py-4 text-lg font-bold rounded-lg transition-all ${
              selectedCount > 0
                ? 'bg-primary-blue text-white hover:bg-primary-blue-dark'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Criar Lista ({selectedCount} {selectedCount === 1 ? 'item' : 'itens'})
          </button>
        </div>
      </div>
    </>
  )
}

function Section({ title, predictions, selected, quantities, onToggle, onQty }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 px-1">
        {title}
      </h3>
      <div className="space-y-2">
        {predictions.map(p => (
          <ProductRow
            key={p.name}
            product={p}
            isSelected={selected.has(p.name)}
            quantity={quantities[p.name] || p.quantity}
            onToggle={onToggle}
            onQty={onQty}
          />
        ))}
      </div>
    </div>
  )
}

function ProductRow({ product, isSelected, quantity, onToggle, onQty }) {
  const cat = getCategoryById(product.category)
  const dotColor = getCategoryColor(product.category)
  const reason = getScoreReason(product)
  const conf = product.confidence

  // Cor da barra de confiança
  const barColor = conf >= 65 ? 'bg-green-500' : conf >= 35 ? 'bg-yellow-400' : 'bg-gray-300'

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-primary-blue bg-blue-50'
          : 'border-gray-100 bg-white opacity-50'
      }`}
      onClick={() => onToggle(product.name)}
    >
      {/* Checkbox */}
      <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${
        isSelected ? 'bg-primary-blue border-primary-blue' : 'border-gray-300 bg-white'
      }`}>
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Dot de categoria */}
      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dotColor}`} title={cat.name} />

      {/* Info do produto */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-gray-800 truncate">{product.name}</span>
          {product.price > 0 && (
            <span className="text-xs text-gray-400 flex-shrink-0">{formatPrice(product.price)}</span>
          )}
        </div>
        {/* Barra de confiança */}
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${conf}%` }} />
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0 w-8 text-right">{conf}%</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{reason}</p>
      </div>

      {/* Controle de quantidade */}
      {isSelected && (
        <div
          className="flex items-center gap-1 flex-shrink-0"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => onQty(product.name, -1)}
            className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold hover:bg-gray-200 transition-colors text-sm"
          >
            −
          </button>
          <span className="w-6 text-center font-semibold text-sm">{quantity}</span>
          <button
            onClick={() => onQty(product.name, +1)}
            className="w-7 h-7 rounded-full bg-primary-blue text-white flex items-center justify-center font-bold hover:bg-primary-blue-dark transition-colors text-sm"
          >
            +
          </button>
        </div>
      )}
    </div>
  )
}

export default SmartListView
