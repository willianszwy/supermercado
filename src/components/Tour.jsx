import { useState, useEffect } from 'react'
import RemoveIcon from './RemoveIcon'

const tourSteps = [
  {
    id: 'welcome',
    title: '👋 Bem-vindo ao SwipeCart!',
    content: 'Sua lista de compras inteligente com gestos. Vamos fazer um tour rápido para você aprender a usar.',
    target: null,
    position: 'center'
  },
  {
    id: 'add-button',
    title: '➕ Adicionar Produtos',
    content: 'Clique no botão verde flutuante para adicionar novos produtos à sua lista. Você pode digitar ou usar sua voz!',
    target: '[data-tour="add-button"]',
    position: 'top-center'
  },
  {
    id: 'drag-gesture',
    title: '👆 Gestos Inteligentes',
    content: 'Arraste os itens para direita (✅ comprado) ou esquerda (❌ em falta). É muito mais rápido que clicar!',
    target: '[data-tour="pending-section"]',
    position: 'bottom'
  },
  {
    id: 'collapse',
    title: '📊 Seções Colapsáveis',
    content: 'Clique nos títulos "Comprados" e "Em Falta" para recolher/expandir as seções. O número mostra quantos itens há.',
    target: '[data-tour="completed-section"]',
    position: 'top'
  },
  {
    id: 'delete',
    title: '🗑️ Remover Itens',
    content: 'Clique no × ao lado dos itens pendentes para removê-los, ou use "Limpar Lista" no final da página.',
    target: '[data-tour="pending-section"]',
    position: 'bottom'
  },
  {
    id: 'new-list',
    title: '📋 Nova Lista',
    content: 'Use "Nova Lista" para criar uma nova lista reutilizando produtos anteriores. Muito útil para compras recorrentes!',
    target: '[data-tour="new-list"]',
    position: 'bottom-right'
  },
  {
    id: 'finish',
    title: '🎉 Pronto!',
    content: 'Agora você já sabe usar o SwipeCart! Comece adicionando seus primeiros produtos. Boa compra! 🛒',
    target: null,
    position: 'center'
  }
]

function Tour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState(null)

  useEffect(() => {
    if (isOpen && currentStep < tourSteps.length) {
      const step = tourSteps[currentStep]
      if (step.target) {
        const element = document.querySelector(step.target)
        setTargetElement(element)
        
        // Scroll para o elemento se necessário
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      } else {
        setTargetElement(null)
      }
    }
  }, [isOpen, currentStep])

  if (!isOpen) return null

  const currentStepData = tourSteps[currentStep]
  const isLastStep = currentStep === tourSteps.length - 1

  const nextStep = () => {
    if (isLastStep) {
      onClose()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const skipTour = () => {
    onClose()
  }

  const getTooltipPosition = () => {
    if (!targetElement || currentStepData.position === 'center') {
      return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
    }

    return 'fixed'
  }

  const getTooltipStyles = () => {
    if (!targetElement || currentStepData.position === 'center') {
      return {}
    }

    const rect = targetElement.getBoundingClientRect()
    const tooltipWidth = window.innerWidth > 480 ? 320 : window.innerWidth - 40
    const tooltipHeight = 200
    const margin = 20

    // Para mobile, sempre posicionar no centro ou embaixo
    if (window.innerWidth <= 768) {
      // Se o elemento está na parte superior, mostra embaixo
      if (rect.top < window.innerHeight / 2) {
        return { 
          top: Math.min(rect.bottom + margin, window.innerHeight - tooltipHeight - margin),
          left: margin,
          right: margin
        }
      } else {
        // Se está na parte inferior, mostra em cima
        return { 
          bottom: window.innerHeight - rect.top + margin,
          left: margin,
          right: margin
        }
      }
    }

    // Lógica para desktop
    switch (currentStepData.position) {
      case 'top':
        return { 
          top: Math.max(margin, rect.top - tooltipHeight - margin), 
          left: Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, rect.left + (rect.width / 2) - tooltipWidth/2))
        }
      case 'top-center':
        return { 
          top: Math.max(margin, rect.top - tooltipHeight - margin), 
          left: Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, rect.left + (rect.width / 2) - tooltipWidth/2))
        }
      case 'bottom':
        return { 
          top: Math.min(rect.bottom + margin, window.innerHeight - tooltipHeight - margin), 
          left: Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, rect.left + (rect.width / 2) - tooltipWidth/2))
        }
      case 'top-left':
        return { 
          top: Math.max(margin, rect.top - tooltipHeight - margin), 
          left: Math.max(margin, rect.left - 100)
        }
      case 'bottom-right':
        return { 
          top: Math.min(rect.bottom + margin, window.innerHeight - tooltipHeight - margin), 
          left: Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, rect.right - tooltipWidth))
        }
      default:
        return {}
    }
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={skipTour} />
      
      {/* Highlight do elemento atual */}
      {targetElement && (
        <div
          className="fixed border-4 border-yellow-400 rounded-lg pointer-events-none z-50 animate-pulse"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={`${getTooltipPosition()} w-80 max-w-[calc(100vw-2.5rem)] md:max-w-sm bg-white rounded-lg shadow-xl z-50 p-4 md:p-6`}
        style={getTooltipStyles()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 pr-2">
            {currentStepData.title}
          </h3>
          <button
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-600 flex items-center justify-center"
          >
            <RemoveIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo */}
        <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 md:mb-6">
          {currentStepData.content}
        </p>

        {/* Progresso */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex space-x-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary-blue' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs md:text-sm text-gray-500">
            {currentStep + 1} de {tourSteps.length}
          </span>
        </div>

        {/* Botões */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Anterior
          </button>

          <div className="flex gap-2">
            <button
              onClick={skipTour}
              className="px-3 md:px-4 py-2 text-gray-600 rounded-lg text-sm md:text-base font-medium hover:bg-gray-100 transition-colors"
            >
              Pular
            </button>
            <button
              onClick={nextStep}
              className="px-3 md:px-4 py-2 bg-primary-blue text-white rounded-lg text-sm md:text-base font-medium hover:bg-primary-blue-dark transition-colors"
            >
              {isLastStep ? 'Finalizar' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Tour