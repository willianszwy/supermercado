function CategoryHeader({ category, itemCount, completedCount, isCollapsed, onToggle }) {
  const IconComponent = category.icon
  const progress = itemCount > 0 ? (completedCount / itemCount) * 100 : 0
  
  return (
    <button
      onClick={onToggle}
      className="category-header w-full px-4 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-all duration-200 rounded-t-lg border-b border-gray-100"
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Ícone da categoria com cor de fundo */}
        <div className={`category-icon w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${getCategoryLightColor(category.id)} ${getCategoryBorderColor(category.id)} border-2 flex-shrink-0`}>
          <IconComponent className={`w-6 h-6 sm:w-7 sm:h-7 ${getCategoryTextColor(category.id)}`} />
        </div>
        
        {/* Info da categoria */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
            <h3 className="category-title text-lg sm:text-xl font-bold text-gray-900 uppercase tracking-wide truncate">
              {category.name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-gray-100 text-gray-700 text-xs sm:text-sm px-2 sm:px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </span>
              {completedCount > 0 && (
                <span className="bg-green-100 text-green-700 text-xs sm:text-sm px-2 sm:px-2.5 py-1 rounded-full font-semibold whitespace-nowrap">
                  {completedCount} ✓
                </span>
              )}
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="flex items-center gap-3 mb-1">
            <div className="progress-bar flex-1 bg-gray-200 rounded-full h-2 sm:h-2.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  progress === 100 ? 'bg-green-500' : getCategoryProgressColor(category.id)
                }`}
                style={{ width: `${Math.max(progress, 2)}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm text-gray-600 font-medium min-w-fit">
              {Math.round(progress)}%
            </span>
          </div>
          
          {/* Descrição da categoria */}
          <p className="text-xs sm:text-sm text-gray-500 truncate">
            {category.description}
          </p>
        </div>
      </div>
      
      {/* Seta de colapso */}
      <div className="ml-4 flex-shrink-0">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </button>
  )
}

// Helper function para cores de progresso
function getCategoryProgressColor(categoryId) {
  const colorMap = {
    red: 'bg-red-400',
    orange: 'bg-orange-400',
    green: 'bg-green-400',
    blue: 'bg-blue-400',
    purple: 'bg-purple-400',
    teal: 'bg-teal-400',
    pink: 'bg-pink-400',
    gray: 'bg-gray-400',
    cyan: 'bg-cyan-400',
    indigo: 'bg-indigo-400',
    amber: 'bg-amber-400'
  }
  
  const category = getCategoryById(categoryId)
  return colorMap[category.color] || 'bg-gray-400'
}

// Helper function para cores de texto
function getCategoryTextColor(categoryId) {
  const colorMap = {
    red: 'text-red-700',
    orange: 'text-orange-700',
    green: 'text-green-700',
    blue: 'text-blue-700',
    purple: 'text-purple-700',
    teal: 'text-teal-700',
    pink: 'text-pink-700',
    gray: 'text-gray-700',
    cyan: 'text-cyan-700',
    indigo: 'text-indigo-700',
    amber: 'text-amber-700'
  }
  
  const category = getCategoryById(categoryId)
  return colorMap[category.color] || 'text-gray-700'
}

// Importar as funções necessárias
import { getCategoryById, getCategoryLightColor, getCategoryBorderColor } from '../utils/categories'

export default CategoryHeader