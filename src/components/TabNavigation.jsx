import CheckmarkIcon from './CheckmarkIcon'

function TabNavigation({ activeTab, onTabChange, pendingCount, completedCount, missingCount }) {
  const tabs = [
    {
      id: 'pending',
      label: 'Pendentes',
      count: pendingCount,
      icon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'blue'
    },
    {
      id: 'completed',
      label: 'Comprados',
      count: completedCount,
      icon: CheckmarkIcon,
      color: 'green'
    },
    {
      id: 'missing',
      label: 'Em Falta',
      count: missingCount,
      icon: () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      color: 'red'
    }
  ]

  return (
    <div className="tab-navigation bg-white border-b-2 border-gray-100 sticky top-0 z-30">
      <div className="flex justify-center">
        <div className="flex bg-gray-100 rounded-lg p-1 m-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                tab-button relative flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-md font-semibold transition-all duration-200
                ${activeTab === tab.id 
                  ? `bg-white text-${tab.color}-700 shadow-sm` 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }
              `}
            >
              {/* Ícone */}
              <tab.icon className={`tab-icon w-4 h-4 sm:w-4 sm:h-4 ${activeTab === tab.id ? `text-${tab.color}-600` : 'text-gray-500'}`} />
              
              {/* Label - oculto em mobile */}
              <span className="tab-label text-sm font-medium hidden sm:inline">{tab.label}</span>
              
              {/* Badge com contador */}
              {tab.count > 0 && (
                <span className={`
                  inline-flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full
                  ${activeTab === tab.id 
                    ? tab.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      tab.color === 'green' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
              
              {/* Indicador ativo */}
              {activeTab === tab.id && (
                <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-${tab.color}-500`} />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TabNavigation