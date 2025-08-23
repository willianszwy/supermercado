import { useState } from 'react'
import { normalizeProductText } from '../utils/textUtils'
import { getCategoriesList, CATEGORIES, getCategoryLightColor, getCategoryBorderColor, getCategoryColor } from '../utils/categories'
import PlusIcon from './PlusIcon'
import SimplePlusIcon from './SimplePlusIcon'
import RemoveIcon from './RemoveIcon'

function FloatingAddButton({ onAddProduct }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleAddProduct = (name, quantity, category) => {
    onAddProduct(name, quantity, category)
    closeModal()
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={openModal}
        className="fab-optimized bg-primary-green text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-2xl font-bold hover:bg-primary-green-dark touch-target-expanded"
        data-tour="add-button"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {/* Modal */}
      {isModalOpen && (
        <AddProductModal
          onAddProduct={handleAddProduct}
          onClose={closeModal}
        />
      )}
    </>
  )
}

function AddProductModal({ onAddProduct, onClose }) {
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [step, setStep] = useState(1) // 1: produto e quantidade, 2: categoria

  const handleFirstStep = (e) => {
    e.preventDefault()
    const normalizedName = normalizeProductText(productName)
    if (normalizedName) {
      setStep(2)
    }
  }

  const handleCategorySelect = (categoryId) => {
    onAddProduct(productName, quantity, categoryId)
  }

  const goBackToProduct = () => {
    setStep(1)
  }

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }


  const categories = getCategoriesList()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm mx-auto shadow-xl">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            {step === 2 && (
              <button
                onClick={goBackToProduct}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                ←
              </button>
            )}
            <h3 className="text-lg font-semibold text-gray-800">
              {step === 1 ? 'Adicionar Produto' : 'Escolher Categoria'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <RemoveIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {step === 1 ? (
          /* Step 1: Product and Quantity */
          <form onSubmit={handleFirstStep} className="p-4 space-y-4">
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
                    ? 'bg-primary-blue text-white hover:bg-primary-blue-dark'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Próximo
              </button>
            </div>
          </form>
        ) : (
          /* Step 2: Category Selection */
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Produto: <strong>{productName}</strong> (Qtd: {quantity})
            </p>
            
            <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`p-4 rounded-lg border-2 text-center transition-all hover:scale-105 ${
                    getCategoryLightColor(category.id)
                  } ${
                    getCategoryBorderColor(category.id)
                  } hover:shadow-md`}
                >
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${getCategoryColor(category.id)}`}></div>
                  <div className="text-sm font-medium text-gray-800">
                    {category.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FloatingAddButton