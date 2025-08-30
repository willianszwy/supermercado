import { getCategoryColor } from '../utils/categories'

function CategoryHeader({ category, itemCount, isCollapsed, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-lg"
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Círculo colorido da categoria */}
        <div className={`w-4 h-4 rounded-full ${getCategoryColor(category.id)} flex-shrink-0`}></div>
        
        {/* Nome da categoria */}
        <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide">
          {category.name}
        </h3>
        
        {/* Contador de itens */}
        <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full font-medium">
          {itemCount}
        </span>
      </div>
      
      {/* Seta de colapso */}
      <div className={`transition-transform duration-200 ${isCollapsed ? 'rotate-0' : 'rotate-180'}`}>
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </button>
  )
}

export default CategoryHeader