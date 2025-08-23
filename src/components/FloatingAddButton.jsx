import { useState } from 'react'
import { normalizeProductText } from '../utils/textUtils'
import MicrophoneIcon from './MicrophoneIcon'
import PlusIcon from './PlusIcon'
import RemoveIcon from './RemoveIcon'

function FloatingAddButton({ onAddProduct }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const handleAddProduct = (name, quantity) => {
    onAddProduct(name, quantity)
    closeModal()
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={openModal}
        className="fixed bottom-6 right-6 w-16 h-16 bg-primary-green text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-2xl font-bold z-50 hover:bg-primary-green-dark"
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
  const [isListening, setIsListening] = useState(false)

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

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Seu navegador não suporta reconhecimento de voz')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'pt-BR'
    recognition.continuous = false
    recognition.interimResults = false

    setIsListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      const normalizedTranscript = normalizeProductText(transcript)
      setProductName(normalizedTranscript)
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
      alert('Erro no reconhecimento de voz')
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
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
            <div className="flex gap-2">
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Digite o nome..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-blue focus:ring-1 focus:ring-primary-blue"
                autoFocus
              />
              <button
                type="button"
                onClick={startVoiceInput}
                disabled={isListening}
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isListening 
                    ? 'border-red-400 bg-red-50 text-red-600' 
                    : 'border-primary-blue bg-transparent text-primary-blue hover:bg-primary-blue hover:text-white'
                }`}
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            </div>
            {isListening && (
              <p className="text-sm text-red-600 mt-1 animate-pulse">
                Ouvindo... fale agora
              </p>
            )}
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
                <PlusIcon className="w-5 h-5" />
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

export default FloatingAddButton