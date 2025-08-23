import AcougueIcon from '../components/icons/AcougueIcon'
import HortifrutiIcon from '../components/icons/HortifrutiIcon'
import LaticiniosIcon from '../components/icons/LaticiniosIcon'
import PadariaIcon from '../components/icons/PadariaIcon'
import LimpezaIcon from '../components/icons/LimpezaIcon'
import HigieneIcon from '../components/icons/HigieneIcon'
import BebidasIcon from '../components/icons/BebidasIcon'
import CongeladosIcon from '../components/icons/CongeladosIcon'
import MerceariaIcon from '../components/icons/MerceariaIcon'
import BomboneriaIcon from '../components/icons/BomboneriaIcon'
import GeralIcon from '../components/icons/GeralIcon'

// Ordenação baseada no fluxo típico de supermercado
export const CATEGORIES = {
  hortifruti: {
    id: 'hortifruti',
    name: 'Hortifrúti',
    color: 'green',
    icon: HortifrutiIcon,
    order: 1,
    description: 'Frutas, verduras e legumes'
  },
  acougue: {
    id: 'acougue',
    name: 'Açougue',
    color: 'red',
    icon: AcougueIcon,
    order: 2,
    description: 'Carnes, aves e embutidos'
  },
  laticinios: {
    id: 'laticinios',
    name: 'Laticínios',
    color: 'blue',
    icon: LaticiniosIcon,
    order: 3,
    description: 'Leites, queijos e iogurtes'
  },
  congelados: {
    id: 'congelados',
    name: 'Congelados',
    color: 'indigo',
    icon: CongeladosIcon,
    order: 4,
    description: 'Produtos congelados'
  },
  padaria: {
    id: 'padaria',
    name: 'Padaria',
    color: 'orange',
    icon: PadariaIcon,
    order: 5,
    description: 'Pães, bolos e doces'
  },
  mercearia: {
    id: 'mercearia',
    name: 'Mercearia',
    color: 'amber',
    icon: MerceariaIcon,
    order: 6,
    description: 'Enlatados, grãos e temperos'
  },
  bebidas: {
    id: 'bebidas',
    name: 'Bebidas',
    color: 'cyan',
    icon: BebidasIcon,
    order: 7,
    description: 'Refrigerantes, sucos e águas'
  },
  bombonieria: {
    id: 'bombonieria',
    name: 'Bombonieria',
    color: 'pink',
    icon: BomboneriaIcon,
    order: 8,
    description: 'Doces, chocolates e guloseimas'
  },
  limpeza: {
    id: 'limpeza',
    name: 'Limpeza',
    color: 'purple',
    icon: LimpezaIcon,
    order: 9,
    description: 'Produtos de limpeza doméstica'
  },
  higiene: {
    id: 'higiene',
    name: 'Higiene',
    color: 'teal',
    icon: HigieneIcon,
    order: 10,
    description: 'Higiene pessoal e beleza'
  },
  geral: {
    id: 'geral',
    name: 'Geral',
    color: 'gray',
    icon: GeralIcon,
    order: 11,
    description: 'Outros produtos'
  }
}

export const getCategoryById = (categoryId) => {
  return CATEGORIES[categoryId] || CATEGORIES.geral
}

export const getCategoriesList = () => {
  return Object.values(CATEGORIES).sort((a, b) => a.order - b.order)
}

export const getCategoriesWithItems = (items) => {
  const categoriesWithItems = {}
  
  items.forEach(item => {
    const categoryId = item.category || 'geral'
    if (!categoriesWithItems[categoryId]) {
      categoriesWithItems[categoryId] = {
        ...getCategoryById(categoryId),
        items: []
      }
    }
    categoriesWithItems[categoryId].items.push(item)
  })
  
  // Ordenar por rota de compras
  return Object.values(categoriesWithItems).sort((a, b) => a.order - b.order)
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