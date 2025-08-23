import { useState } from 'react'

function ProductInput({ onAddProduct }) {
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState(1)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (productName.trim()) {
      onAddProduct(productName.trim(), quantity)
      setProductName('')
      setQuantity(1)
    }
  }

  return (
    <section className="mb-8">
      <form onSubmit={handleSubmit} className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Nome do produto"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="input-field"
        />
        <input
          type="number"
          placeholder="Qtd"
          min="1"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="input-field w-20"
        />
        <button
          type="submit"
          className="flex items-center justify-center w-12 h-12 rounded border-2 border-primary-green bg-transparent text-primary-green text-xl font-bold transition-all duration-300 hover:bg-primary-green hover:text-white hover:shadow-primary-green leading-none"
          style={{ padding: '0' }}
        >
          <span className="block">+</span>
        </button>
      </form>
    </section>
  )
}

export default ProductInput