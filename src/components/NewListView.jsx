import { useState, useEffect } from 'react'
import RemoveIcon from './RemoveIcon'
import TrashIcon from './TrashIcon'
import PlusIcon from './PlusIcon'
import SimplePlusIcon from './SimplePlusIcon'
import WhatsAppIcon from './icons/WhatsAppIcon'
import HelpIcon from './HelpIcon'
import NewListTour from './NewListTour'
import NewListItem from './NewListItem'
import { normalizeProductText } from '../utils/textUtils'
import { getCategoryById, CATEGORIES } from '../utils/categories'
import { formatPrice, parsePrice } from '../utils/priceUtils'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useHapticFeedback } from '../hooks/useHapticFeedback'

function NewListView({ allProducts, onCreateList, onBack, onRemoveProduct }) {
  const [selectedProducts, setSelectedProducts] = useState(new Map())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showWhatsAppImportModal, setShowWhatsAppImportModal] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const [hasSeenNewListTour, setHasSeenNewListTour] = useLocalStorage('hasSeenNewListTour', false)
  const { onButtonPress, onSuccess } = useHapticFeedback()

  const sortedProducts = [...allProducts].sort((a, b) => 
    new Date(b.lastUsed) - new Date(a.lastUsed)
  )

  // Mostrar tour automaticamente na primeira visita se há produtos anteriores
  useEffect(() => {
    if (!hasSeenNewListTour && allProducts.length > 0) {
      const timer = setTimeout(() => {
        setShowTour(true)
      }, 1000) // Delay para carregar a tela
      return () => clearTimeout(timer)
    }
  }, [hasSeenNewListTour, allProducts.length])

  const addProduct = (productName, lastQuantity, category, suggestedPrice) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      if (!newMap.has(productName)) {
        newMap.set(productName, { name: productName, quantity: lastQuantity, category, price: suggestedPrice || 0 })
      }
      return newMap
    })
  }

  const removeFromSelection = (productName, fromSelection = false) => {
    if (fromSelection) {
      // Remove apenas da seleção atual
      setSelectedProducts(prev => {
        const newMap = new Map(prev)
        newMap.delete(productName)
        return newMap
      })
    } else {
      // Remove permanentemente
      onRemoveProduct(productName)
      setSelectedProducts(prev => {
        const newMap = new Map(prev)
        newMap.delete(productName)
        return newMap
      })
    }
  }

  const updateQuantity = (productName, quantity) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      if (newMap.has(productName)) {
        const existingProduct = newMap.get(productName)
        newMap.set(productName, { ...existingProduct, quantity })
      }
      return newMap
    })
  }

  const handleCreateList = () => {
    onSuccess()
    const productsArray = Array.from(selectedProducts.values())
    onCreateList(productsArray)
  }


  const addNewProduct = (name, quantity) => {
    const normalizedName = normalizeProductText(name)
    if (!normalizedName) return

    // Add to selected products
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      newMap.set(normalizedName, { name: normalizedName, quantity, category: 'geral', price: 0 })
      return newMap
    })

    setShowAddModal(false)
  }


  const handleWhatsAppImport = (products) => {
    // Create list directly with imported products
    onCreateList(products)
    setShowWhatsAppImportModal(false)
  }

  const handleShowTour = () => {
    setShowTour(true)
  }

  const handleCloseTour = () => {
    setShowTour(false)
    setHasSeenNewListTour(true)
  }

  return (
    <>
      <header className="py-5 border-b-2 border-primary-blue mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <button onClick={() => { onButtonPress(); onBack(); }} className="btn-secondary">
              ← Voltar
            </button>
            <h2 className="text-2xl font-bold text-primary-blue">
              Nova Lista
            </h2>
            <button
              onClick={() => { onButtonPress(); handleShowTour(); }}
              className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center text-sm transition-colors"
              title="Tutorial - Como criar listas"
            >
              <HelpIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Botão WhatsApp prominente */}
        <button
          onClick={() => { onButtonPress(); setShowWhatsAppImportModal(true); }}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-3"
          title="Criar lista rapidamente colando do WhatsApp"
        >
          <WhatsAppIcon className="w-5 h-5" />
          Criar Lista do WhatsApp
        </button>
      </header>

      <main>
        <div className="mb-8">
        <h3 className="mb-2 text-lg font-semibold text-black">
          Produtos Anteriores
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Toque para adicionar • Arraste → para lista rápida • Arraste ← para opções
        </p>
        
        <div className="grid gap-3">
          {sortedProducts.map(product => (
            <NewListItem
              key={product.name}
              product={product}
              isSelected={selectedProducts.has(product.name)}
              selectedQuantity={selectedProducts.get(product.name)?.quantity || product.lastQuantity}
              onAddProduct={addProduct}
              onRemoveProduct={removeFromSelection}
              onUpdateQuantity={updateQuantity}
            />
          ))}
          
          {sortedProducts.length === 0 && (
            <div className="text-center text-gray-500 italic py-8">
              Nenhum produto anterior encontrado
            </div>
          )}
        </div>
        </div>

        <button
        onClick={handleCreateList}
        disabled={selectedProducts.size === 0}
        className={`w-full py-4 text-lg font-bold rounded transition-all duration-300 ${
          selectedProducts.size > 0
            ? 'btn-primary'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Criar Lista ({selectedProducts.size} {selectedProducts.size === 1 ? 'item' : 'itens'})
        </button>
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary-blue text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50 hover:bg-primary-blue-dark"
        title="Adicionar novo produto"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal
          onAddProduct={addNewProduct}
          onClose={() => setShowAddModal(false)}
        />
      )}


      {/* WhatsApp Import Modal */}
      {showWhatsAppImportModal && (
        <WhatsAppImportModal
          onImport={handleWhatsAppImport}
          onClose={() => setShowWhatsAppImportModal(false)}
        />
      )}

      {/* Tour Guide */}
      <NewListTour 
        isOpen={showTour} 
        onClose={handleCloseTour} 
      />
    </>
  )
}

// Add Product Modal Component
function AddProductModal({ onAddProduct, onClose }) {
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleSubmit = (e) => {
    e.preventDefault()
    const normalizedName = normalizeProductText(productName)
    if (normalizedName) {
      onAddProduct(normalizedName, quantity)
    }
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Adicionar Produto
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <RemoveIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do produto
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Digite o nome..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
              autoFocus
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={decrementQuantity}
                className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition-colors"
              >
                −
              </button>
              <div className="w-16 h-10 bg-gray-50 rounded-lg flex items-center justify-center font-semibold text-lg">
                {quantity}
              </div>
              <button
                type="button"
                onClick={incrementQuantity}
                className="w-10 h-10 rounded-full bg-primary-green text-white flex items-center justify-center text-xl font-bold hover:bg-primary-green-dark transition-colors"
              >
                <SimplePlusIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!normalizeProductText(productName)}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                normalizeProductText(productName)
                  ? 'bg-primary-green text-white hover:bg-primary-green-dark'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


// WhatsApp Import Modal Component - Simplified for non-technical users
function WhatsAppImportModal({ onImport, onClose }) {
  const [importText, setImportText] = useState('')

  const parseWhatsAppText = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const products = []
    let currentCategory = 'geral'

    // Mapeamento de nomes de categorias para IDs
    const categoryMapping = {}
    Object.values(CATEGORIES).forEach(cat => {
      categoryMapping[cat.name.toLowerCase()] = cat.id
      // Adicionar variações comuns
      if (cat.id === 'hortifruti') {
        categoryMapping['frutas'] = cat.id
        categoryMapping['verduras'] = cat.id
        categoryMapping['legumes'] = cat.id
        categoryMapping['hortifrutti'] = cat.id
      }
      if (cat.id === 'acougue') {
        categoryMapping['açougue'] = cat.id
        categoryMapping['carnes'] = cat.id
        categoryMapping['carne'] = cat.id
      }
      if (cat.id === 'laticinios') {
        categoryMapping['laticínios'] = cat.id
        categoryMapping['queijos'] = cat.id
        categoryMapping['leite'] = cat.id
      }
    })

    for (const line of lines) {
      // Remove prefixos comuns de data/hora do WhatsApp
      let cleanLine = line.replace(/^\d{1,2}\/\d{1,2}\/\d{4}\s+\d{1,2}:\d{2}\s+[-–]\s+/, '')
        .replace(/^\[\d{1,2}:\d{2}\]\s+/, '')
        .replace(/^.*?:\s+/, '') // Remove "Nome: " do WhatsApp
        .trim()

      if (!cleanLine) continue

      // Ignorar linhas de cabeçalho/formatação do SwipeCart e outros textos comuns
      if (cleanLine.includes('Lista de Compras - SwipeCart') || 
          cleanLine.includes('Importe esta lista no SwipeCart') ||
          cleanLine.includes('Valores sugeridos para estimativa') ||
          cleanLine.includes('Estimativa Total') ||
          cleanLine.includes('Generated with') ||
          cleanLine.includes('Claude Code') ||
          cleanLine.match(/^[📝✨🔹💰*\-\s]*$/u) ||
          cleanLine.match(/^\*.*\*$/) ||  // Linhas entre asteriscos
          cleanLine.match(/^_.*_$/) ||    // Linhas entre underlines
          cleanLine.match(/^R\$\s*[\d,.]+ ?\*?$/) || // Apenas valores monetários
          cleanLine.match(/^Total:?/i) ||
          cleanLine.match(/^Estimativa/i)) {
        continue
      }

      // Verificar se é um cabeçalho de categoria (ex: "🔹 *Hortifrúti*" ou "Hortifrúti:")
      const categoryHeader = cleanLine.match(/^(?:🔹\s*\*?|#+\s*)?([^*\n]+?)(?:\*|\s*:)?\s*$/i)
      if (categoryHeader) {
        const possibleCategory = categoryHeader[1].trim().toLowerCase()
        if (categoryMapping[possibleCategory]) {
          currentCategory = categoryMapping[possibleCategory]
          continue
        }
      }

      // Verificar se parece com cabeçalho de categoria simples
      if (cleanLine.length < 20 && !cleanLine.includes(',') && !cleanLine.includes('•') && !cleanLine.match(/\d/)) {
        const possibleCategory = cleanLine.toLowerCase().replace(/[^\w\s]/g, '').trim()
        if (categoryMapping[possibleCategory]) {
          currentCategory = categoryMapping[possibleCategory]
          continue
        }
      }

      // Ignorar linhas que são só formatação/separadores
      if (cleanLine.match(/^[\s*\-=_~`#+.!?]*$/) ||
          /^[\u{1F4DD}\u{2728}\u{1F539}\u{1F6D2}\u{1F49A}\u{2764}\u{1F389}\u{1F4B0}\s]*$/u.test(cleanLine) ||
          cleanLine.length < 2 ||
          cleanLine.length > 50) { // Muito longo provavelmente não é produto
        continue
      }

      // Tenta diferentes formatos de produtos
      let name = null
      let quantity = 1
      let price = 0

      // Remove bullet points e formatação
      cleanLine = cleanLine.replace(/^[-•*]\s*/, '').trim()

      // Se a linha não parece ser um produto, pular
      if (!cleanLine.match(/[a-záéíóúàèìòù]/i)) {
        continue
      }
      
      // Verificações adicionais para evitar texto de formatação
      if (cleanLine.match(/^https?:\/\//i) || // URLs
          cleanLine.match(/^\d{4}-\d{2}-\d{2}/) || // Datas
          cleanLine.match(/^\d+:\d+/) || // Horários
          cleanLine.match(/^[A-Z\s]+:$/) || // Texto em maiúsculas seguido de ":"
          cleanLine.match(/^\d+\/\d+\/\d+/) || // Datas formato brasileiro
          cleanLine.match(/^\w+@\w+\.\w+/) || // Emails
          cleanLine.match(/^Co-Authored/i) || // Texto de commit
          cleanLine.split(' ').length > 8) { // Muitas palavras, provavelmente não é produto
        continue
      }

      // Formato: "quantidade produto" (ex: "2 arroz", "3 kg carne")
      const quantityFirst = cleanLine.match(/^(\d+)\s*(?:kg|g|l|ml|un|unidades?)?\s+(.+)$/i)
      if (quantityFirst) {
        quantity = parseInt(quantityFirst[1]) || 1
        name = quantityFirst[2].trim()
      }
      
      // Formato: "produto, quantidade - preço" (ex: "Ovo, 1 - R$ 25,00") - formato específico do SwipeCart
      else if (cleanLine.includes(',') && cleanLine.includes(' - ')) {
        const commaIndex = cleanLine.indexOf(',')
        const dashIndex = cleanLine.indexOf(' - ')
        
        if (commaIndex < dashIndex) {
          const afterDash = cleanLine.substring(dashIndex + 3).trim()
          // Verifica se após o " - " há um preço (contém R$, $ ou padrão numérico)
          if (afterDash.match(/R?\$?\s*[\d.,]+/) || afterDash.match(/^[\d.,]+$/)) {
            name = cleanLine.substring(0, commaIndex).trim()
            const qtyPart = cleanLine.substring(commaIndex + 1, dashIndex).trim()
            const pricePart = afterDash
            
            const qtyMatch = qtyPart.match(/(\d+)/)
            const priceMatch = pricePart.match(/R?\$?\s*([\d.,]+)/)
            
            if (qtyMatch) {
              quantity = parseInt(qtyMatch[1]) || 1
            }
            if (priceMatch) {
              price = parsePrice(priceMatch[1]) || 0
            }
          }
        }
      }
      // Formato: "produto, quantidade, preço" (ex: "arroz, 2, 5.50")
      else if (cleanLine.includes(',')) {
        const parts = cleanLine.split(',')
        if (parts.length >= 3) {
          name = parts[0].trim()
          const qtyStr = parts[1].trim()
          const priceStr = parts[2].trim()
          const qtyMatch = qtyStr.match(/(\d+)/)
          const priceMatch = priceStr.match(/R?\$?\s*([\d.,]+)/)
          if (qtyMatch) {
            quantity = parseInt(qtyMatch[1]) || 1
          }
          if (priceMatch) {
            price = parsePrice(priceMatch[1]) || 0
          }
        }
        // Formato: "produto, quantidade" (ex: "arroz, 2")
        else if (parts.length >= 2) {
          name = parts[0].trim()
          const qtyStr = parts[1].trim()
          const qtyMatch = qtyStr.match(/(\d+)/)
          if (qtyMatch) {
            quantity = parseInt(qtyMatch[1]) || 1
          }
        }
      }
      
      // Formato: "produto - quantidade - preço" (ex: "arroz - 2 - R$ 5,50")
      else if (cleanLine.includes(' - ')) {
        const parts = cleanLine.split(' - ')
        if (parts.length >= 3) {
          name = parts[0].trim()
          const qtyMatch = parts[1].match(/(\d+)/)
          const priceMatch = parts[2].match(/R?\$?\s*([\d.,]+)/)
          if (qtyMatch) {
            quantity = parseInt(qtyMatch[1]) || 1
          }
          if (priceMatch) {
            price = parsePrice(priceMatch[1]) || 0
          }
        }
        // Formato: "produto - quantidade" (ex: "arroz - 2")
        else if (parts.length >= 2) {
          name = parts[0].trim()
          const qtyMatch = parts[1].match(/(\d+)/)
          if (qtyMatch) {
            quantity = parseInt(qtyMatch[1]) || 1
          }
        }
      }
      
      // Formato simples: apenas o nome do produto (deve ter pelo menos uma letra)
      else if (cleanLine.match(/[a-záéíóúàèìòù]/i)) {
        name = cleanLine
      }

      // Limpa e normaliza o nome
      if (name) {
        name = normalizeProductText(name.trim())
        
        // Validações finais antes de adicionar o produto
        if (name && 
            name.length > 1 && 
            name.length < 40 && // Nome não pode ser muito longo
            !name.match(/^[0-9\s$.,]+$/) && // Não pode ser só números/símbolos
            !name.match(/^\d+[.,]\d+$/) && // Não pode ser só um número decimal
            name.split(' ').length <= 5) { // Máximo 5 palavras
          products.push({ name, quantity, category: currentCategory, price })
        }
      }
    }

    return products
  }

  const handleImport = () => {
    if (!importText.trim()) return

    const products = parseWhatsAppText(importText)
    if (products.length === 0) {
      alert('Não encontramos produtos válidos no texto. Certifique-se de colar uma lista de compras.')
      return
    }

    onImport(products)
  }

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      setImportText(text)
    } catch (err) {
      alert('Não conseguimos acessar a área de transferência. Por favor, cole o texto manualmente.')
    }
  }

  const previewProducts = importText.trim() ? parseWhatsAppText(importText) : []

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md mx-auto shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <WhatsAppIcon className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Importar do WhatsApp
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <RemoveIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-3">
            <h4 className="font-medium text-blue-800 mb-2">Como usar:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Copie a lista de compras do WhatsApp</li>
              <li>2. Cole aqui usando o botão ou Ctrl+V</li>
              <li>3. Confira os produtos encontrados</li>
              <li>4. Clique em &quot;Criar Lista&quot; (vai direto para a lista!)</li>
            </ol>
          </div>

          {/* Paste Button */}
          <div className="flex gap-2">
            <button
              onClick={handlePaste}
              className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Colar Automaticamente
            </button>
            <button
              onClick={() => setImportText('')}
              className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              title="Limpar texto"
            >
              <RemoveIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto da lista de compras:
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Cole sua lista compartilhada do SwipeCart aqui...

Formatos aceitos:
• Banana, 6, 2.50
• 2 Carne
• Arroz - 1 - R$ 8,50
• Leite
• Açúcar
• 3 Maçã"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue h-32 resize-none text-sm"
            />
          </div>

          {/* Preview */}
          {previewProducts.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                Produtos encontrados ({previewProducts.length}):
              </h4>
              <div className="bg-blue-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {previewProducts.map((product, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-800">{product.name}</span>
                        {product.price > 0 && (
                          <span className="text-xs text-gray-600">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      {product.category !== 'geral' && (
                        <span className="text-xs bg-gray-200 px-1 py-0.5 rounded text-gray-600">
                          {getCategoryById(product.category).name}
                        </span>
                      )}
                    </div>
                    <span className="text-xs bg-blue-200 px-2 py-1 rounded text-blue-800">
                      {product.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {importText.trim() && previewProducts.length === 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">
                Não encontramos produtos válidos no texto. Verifique se você colou uma lista de compras.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={previewProducts.length === 0}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              previewProducts.length > 0
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Criar Lista {previewProducts.length > 0 ? `(${previewProducts.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewListView