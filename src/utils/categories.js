export const CATEGORIES = {
  geral: {
    id: 'geral',
    name: 'Geral',
    color: 'gray'
  },
  acougue: {
    id: 'acougue',
    name: 'Açougue',
    color: 'red'
  },
  padaria: {
    id: 'padaria',
    name: 'Padaria',
    color: 'orange'
  },
  hortifruti: {
    id: 'hortifruti',
    name: 'Hortifrúti',
    color: 'green'
  },
  laticinios: {
    id: 'laticinios',
    name: 'Laticínios',
    color: 'blue'
  },
  limpeza: {
    id: 'limpeza',
    name: 'Limpeza',
    color: 'purple'
  },
  higiene: {
    id: 'higiene',
    name: 'Higiene',
    color: 'teal'
  },
  bombonieria: {
    id: 'bombonieria',
    name: 'Bombonieria',
    color: 'pink'
  },
  mercearia: {
    id: 'mercearia',
    name: 'Mercearia',
    color: 'amber'
  },
  bebidas: {
    id: 'bebidas',
    name: 'Bebidas',
    color: 'cyan'
  },
  congelados: {
    id: 'congelados',
    name: 'Congelados',
    color: 'indigo'
  }
}

export const getCategoryById = (categoryId) => {
  return CATEGORIES[categoryId] || CATEGORIES.geral
}

export const getCategoriesList = () => {
  return Object.values(CATEGORIES)
}

export const getCategoryColor = (categoryId) => {
  const category = getCategoryById(categoryId)
  
  const colorMap = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    teal: 'bg-teal-500',
    pink: 'bg-pink-500',
    gray: 'bg-gray-500',
    cyan: 'bg-cyan-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500'
  }
  
  return colorMap[category.color] || 'bg-gray-500'
}

export const getCategoryLightColor = (categoryId) => {
  const category = getCategoryById(categoryId)
  
  const colorMap = {
    red: 'bg-red-50',
    orange: 'bg-orange-50',
    green: 'bg-green-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
    teal: 'bg-teal-50',
    pink: 'bg-pink-50',
    gray: 'bg-gray-50',
    cyan: 'bg-cyan-50',
    indigo: 'bg-indigo-50',
    amber: 'bg-amber-50'
  }
  
  return colorMap[category.color] || 'bg-gray-50'
}

export const getCategoryBorderColor = (categoryId) => {
  const category = getCategoryById(categoryId)
  
  const colorMap = {
    red: 'border-red-200',
    orange: 'border-orange-200',
    green: 'border-green-200',
    blue: 'border-blue-200',
    purple: 'border-purple-200',
    teal: 'border-teal-200',
    pink: 'border-pink-200',
    gray: 'border-gray-200',
    cyan: 'border-cyan-200',
    indigo: 'border-indigo-200',
    amber: 'border-amber-200'
  }
  
  return colorMap[category.color] || 'border-gray-200'
}