import { useState } from 'react'

function NewListView({ allProducts, onCreateList, onBack }) {
  const [selectedProducts, setSelectedProducts] = useState(new Map())

  const sortedProducts = [...allProducts].sort((a, b) => 
    new Date(b.lastUsed) - new Date(a.lastUsed)
  )

  const toggleProduct = (productName, lastQuantity) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      if (newMap.has(productName)) {
        newMap.delete(productName)
      } else {
        newMap.set(productName, { name: productName, quantity: lastQuantity })
      }
      return newMap
    })
  }

  const updateQuantity = (productName, quantity) => {
    setSelectedProducts(prev => {
      const newMap = new Map(prev)
      if (newMap.has(productName)) {
        newMap.set(productName, { name: productName, quantity })
      }
      return newMap
    })
  }

  const handleCreateList = () => {
    const productsArray = Array.from(selectedProducts.values())
    onCreateList(productsArray)
  }

  return (
    <>
      <header className="py-5 flex items-center gap-5 mb-5 border-b-2 border-primary-blue">
        <button onClick={onBack} className="btn-secondary">
          ← Voltar
        </button>
        <h2 className="text-2xl font-bold text-primary-blue">
          Nova Lista
        </h2>
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
              onClick={() => !selectedProducts.has(product.name) && toggleProduct(product.name, product.lastQuantity)}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded">
                    Última: {product.lastQuantity}
                  </div>
                </div>
                
                {selectedProducts.has(product.name) && (
                  <div className="flex items-center gap-2">
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
                      className="w-6 h-6 rounded bg-primary-red text-white text-sm font-bold hover:bg-primary-red-dark"
                    >
                      ×
                    </button>
                  </div>
                )}
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
    </>
  )
}

export default NewListView