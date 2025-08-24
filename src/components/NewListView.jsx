import { useState } from 'react'
import RemoveIcon from './RemoveIcon'
import TrashIcon from './TrashIcon'
import PlusIcon from './PlusIcon'
import SimplePlusIcon from './SimplePlusIcon'
import ImportIcon from './ImportIcon'
import WhatsAppIcon from './icons/WhatsAppIcon'
import { normalizeProductText } from '../utils/textUtils'
import { getCategoryById, CATEGORIES } from '../utils/categories'

function NewListView({ allProducts, onCreateList, onBack, onRemoveProduct }) {
  const [selectedProducts, setSelectedProducts] = useState(new Map())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showBulkImportModal, setShowBulkImportModal] = useState(false)
  const [showWhatsAppImportModal, setShowWhatsAppImportModal] = useState(false)

  const sortedProducts = [...allProducts].sort((a, b) => 
    new Date(b.lastUsed) - new Date(a.lastUsed)
  )

  const toggleProduct = (productName, lastQuantity, category) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      if (newMap.has(productName)) {
        newMap.delete(productName)
      } else {
        newMap.set(productName, { name: productName, quantity: lastQuantity, category })
      }
      return newMap
    })
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
    const productsArray = Array.from(selectedProducts.values())
    onCreateList(productsArray)
  }

  const removeProduct = (productName) => {
    onRemoveProduct(productName)
    // Remove from selected products if it was selected
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      newMap.delete(productName)
      return newMap
    })
  }

  const addNewProduct = (name, quantity) => {
    const normalizedName = normalizeProductText(name)
    if (!normalizedName) return

    // Add to selected products
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      newMap.set(normalizedName, { name: normalizedName, quantity })
      return newMap
    })

    setShowAddModal(false)
  }

  const handleBulkImport = (products) => {
    // Add all imported products to selected products
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      products.forEach(product => {
        newMap.set(product.name, product)
      })
      return newMap
    })
    
    setShowBulkImportModal(false)
  }

  const handleWhatsAppImport = (products) => {
    // Add all imported products to selected products
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      products.forEach(product => {
        newMap.set(product.name, product)
      })
      return newMap
    })
    
    setShowWhatsAppImportModal(false)
  }

  return (
    <>
      <header className="py-5 border-b-2 border-primary-blue mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-5">
            <button onClick={onBack} className="btn-secondary">
              ← Voltar
            </button>
            <h2 className="text-2xl font-bold text-primary-blue">
              Nova Lista
            </h2>
          </div>
          <button
            onClick={() => setShowBulkImportModal(true)}
            className="btn-secondary flex items-center gap-2"
            title="Importar lista avançada"
          >
            <ImportIcon className="w-4 h-4" />
            Avançado
          </button>
        </div>
        
        {/* Botão WhatsApp prominente */}
        <button
          onClick={() => setShowWhatsAppImportModal(true)}
          className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mt-3"
          title="Importar lista compartilhada pelo WhatsApp"
        >
          <WhatsAppIcon className="w-5 h-5" />
          Colar Lista do WhatsApp
        </button>
      </header>

      <main>
        <div className="mb-8">
        <h3 className="mb-4 text-lg font-semibold text-black">
          Produtos Anteriores
        </h3>
        
        <div className="grid gap-3">
          {sortedProducts.map(product => (
            <div
              key={product.name}
              className={`bg-white border-2 rounded-lg p-3 cursor-pointer transition-all duration-300 ${
                selectedProducts.has(product.name)
                  ? 'border-primary-green bg-green-50'
                  : 'border-gray-200 hover:border-primary-blue'
              }`}
              onClick={() => !selectedProducts.has(product.name) && toggleProduct(product.name, product.lastQuantity, product.category)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-white text-sm bg-slate-500 px-2 py-1 rounded-full font-semibold min-w-6 text-center shadow-sm">
                    {product.lastQuantity}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {selectedProducts.has(product.name) ? (
                    <>
                      <input
                        type="number"
                        min="1"
                        value={selectedProducts.get(product.name).quantity}
                        onChange={(e) => updateQuantity(product.name, parseInt(e.target.value) || 1)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-16 px-2 py-1 border border-gray-300 rounded bg-white text-black text-center text-sm"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleProduct(product.name)
                        }}
                        className="w-6 h-6 rounded bg-primary-red text-white text-sm font-bold hover:bg-primary-red-dark flex items-center justify-center"
                        title="Remover da seleção"
                      >
                        <RemoveIcon className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeProduct(product.name)
                      }}
                      className="w-6 h-6 rounded-full bg-red-100 text-red-500 hover:bg-red-200 hover:text-red-600 flex items-center justify-center text-sm transition-colors"
                      title="Remover produto permanentemente"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
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

      {/* Bulk Import Modal */}
      {showBulkImportModal && (
        <BulkImportModal
          onImport={handleBulkImport}
          onClose={() => setShowBulkImportModal(false)}
        />
      )}

      {/* WhatsApp Import Modal */}
      {showWhatsAppImportModal && (
        <WhatsAppImportModal
          onImport={handleWhatsAppImport}
          onClose={() => setShowWhatsAppImportModal(false)}
        />
      )}
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

// Bulk Import Modal Component
function BulkImportModal({ onImport, onClose }) {
  const [importText, setImportText] = useState('')
  const [importMode, setImportMode] = useState('text') // 'text' or 'csv'

  const parseCsvText = (text) => {
    const lines = text.trim().split('\n').filter(line => line.trim())
    const products = []

    for (const line of lines) {
      // Try CSV format first: "product name, quantity"
      const csvMatch = line.match(/^([^,]+),\s*(\d+)$/)
      if (csvMatch) {
        const name = normalizeProductText(csvMatch[1].trim())
        const quantity = parseInt(csvMatch[2]) || 1
        if (name) {
          products.push({ name, quantity })
        }
        continue
      }

      // Try simple format: "quantity product name" or just "product name"
      const simpleMatch = line.match(/^(\d+)?\s*(.+)$/)
      if (simpleMatch) {
        const quantity = parseInt(simpleMatch[1]) || 1
        const name = normalizeProductText(simpleMatch[2].trim())
        if (name) {
          products.push({ name, quantity })
        }
      }
    }

    return products
  }

  const handleImport = () => {
    if (!importText.trim()) return

    const products = parseCsvText(importText)
    if (products.length === 0) {
      alert('Nenhum produto válido encontrado. Verifique o formato dos dados.')
      return
    }

    onImport(products)
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target.result
      setImportText(text)
      setImportMode('csv')
    }
    reader.readAsText(file)
  }

  const exampleText = `Arroz, 2
Feijão, 1
Macarrão, 3
Açúcar, 1
Óleo de Soja, 2`

  const exampleSimple = `2 Arroz
1 Feijão  
3 Macarrão
Açúcar
2 Óleo de Soja`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg mx-auto shadow-xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Importar Lista em Massa
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <RemoveIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Import Mode Selection */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setImportMode('text')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                importMode === 'text'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Digitar Texto
            </button>
            <button
              onClick={() => setImportMode('csv')}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                importMode === 'csv'
                  ? 'bg-primary-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Carregar CSV
            </button>
          </div>

          {importMode === 'csv' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carregar arquivo CSV
              </label>
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue"
              />
            </div>
          )}

          {/* Text Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lista de produtos
            </label>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Cole ou digite sua lista aqui..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue h-32 resize-none"
            />
          </div>

          {/* Format Examples */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Formatos aceitos:</h4>
            
            <div className="space-y-3 text-xs">
              <div>
                <p className="font-medium text-gray-700 mb-1">Formato CSV (produto, quantidade):</p>
                <pre className="bg-white p-2 rounded text-gray-600 overflow-x-auto">
{exampleText}
                </pre>
              </div>
              
              <div>
                <p className="font-medium text-gray-700 mb-1">Formato simples (quantidade produto):</p>
                <pre className="bg-white p-2 rounded text-gray-600 overflow-x-auto">
{exampleSimple}
                </pre>
              </div>
            </div>
          </div>

          {/* Preview */}
          {importText.trim() && (
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                Produtos encontrados ({parseCsvText(importText).length}):
              </h4>
              <div className="bg-blue-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {parseCsvText(importText).map((product, index) => (
                  <div key={index} className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-800">{product.name}</span>
                    <span className="text-xs bg-blue-200 px-2 py-1 rounded text-blue-800">
                      {product.quantity}
                    </span>
                  </div>
                ))}
                {parseCsvText(importText).length === 0 && (
                  <p className="text-sm text-red-600">Nenhum produto válido encontrado</p>
                )}
              </div>
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
            disabled={!importText.trim() || parseCsvText(importText).length === 0}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              importText.trim() && parseCsvText(importText).length > 0
                ? 'bg-primary-green text-white hover:bg-primary-green-dark'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Importar ({parseCsvText(importText).length})
          </button>
        </div>
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

      // Ignorar linhas de cabeçalho/formatação do SwipeCart
      if (cleanLine.includes('Lista de Compras - SwipeCart') || 
          cleanLine.includes('Importe esta lista no SwipeCart') ||
          cleanLine.match(/^[📝✨🔹\*\-\s]*$/)) {
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
      if (cleanLine.match(/^[\s\*\-\=\_\~\`\#\+\.\!\?]*$/) ||
          cleanLine.match(/^[📝✨🔹🛒💚❤️🎉\s]*$/) ||
          cleanLine.length < 2) {
        continue
      }

      // Tenta diferentes formatos de produtos
      let name = null
      let quantity = 1

      // Remove bullet points e formatação
      cleanLine = cleanLine.replace(/^[-•*]\s*/, '').trim()

      // Se a linha não parece ser um produto, pular
      if (!cleanLine.match(/[a-záéíóúàèìòù]/i)) {
        continue
      }

      // Formato: "quantidade produto" (ex: "2 arroz", "3 kg carne")
      const quantityFirst = cleanLine.match(/^(\d+)\s*(?:kg|g|l|ml|un|unidades?)?\s+(.+)$/i)
      if (quantityFirst) {
        quantity = parseInt(quantityFirst[1]) || 1
        name = quantityFirst[2].trim()
      }
      
      // Formato: "produto, quantidade" (ex: "arroz, 2")
      else if (cleanLine.includes(',')) {
        const parts = cleanLine.split(',')
        if (parts.length >= 2) {
          name = parts[0].trim()
          const qtyStr = parts[1].trim()
          const qtyMatch = qtyStr.match(/(\d+)/)
          if (qtyMatch) {
            quantity = parseInt(qtyMatch[1]) || 1
          }
        }
      }
      
      // Formato: "produto - quantidade" (ex: "arroz - 2")
      else if (cleanLine.includes(' - ')) {
        const parts = cleanLine.split(' - ')
        if (parts.length >= 2) {
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
        if (name && name.length > 1) { // Evita nomes muito pequenos
          products.push({ name, quantity, category: currentCategory })
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
              <li>4. Clique em "Importar"</li>
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

Ou use qualquer formato:
• Banana, 6
• 2 kg Carne
• Arroz - 1 
• Leite"
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
                      <span className="text-sm text-gray-800">{product.name}</span>
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
            Importar {previewProducts.length > 0 ? `(${previewProducts.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}

export default NewListView