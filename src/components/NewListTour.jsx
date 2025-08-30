import { useState, useEffect } from 'react'
import RemoveIcon from './RemoveIcon'

const newListTourSteps = [
  {
    id: 'welcome',
    title: '📋 Bem-vindo à Nova Lista!',
    content: 'Agora criar listas ficou mais fácil! Use gestos intuitivos, importação rápida do WhatsApp e reutilize produtos anteriores. Vamos descobrir as novidades!',
    target: null,
    position: 'center'
  },
  {
    id: 'whatsapp-import',
    title: '⚡ Criar Lista do WhatsApp',
    content: 'Cole uma lista do WhatsApp e ela será criada instantaneamente! Não precisa mais selecionar produtos - vai direto para sua nova lista pronta para usar.',
    target: 'button[title="Criar lista rapidamente colando do WhatsApp"]',
    position: 'bottom'
  },
  {
    id: 'previous-products',
    title: '🗂️ Produtos Anteriores',
    content: 'Seus produtos mais recentes aparecem aqui. Agora você tem 3 formas de interagir: toque, arraste ou use gestos!',
    target: '.mb-8 h3',
    position: 'bottom'
  },
  {
    id: 'gesture-instructions',
    title: '👆 Gestos Intuitivos',
    content: '• **Toque** = adiciona à lista\n• **Arraste →** = adiciona rapidamente\n• **Arraste ←** = mostra opções (editar/excluir)\n\nO mesmo sistema de gestos da lista principal!',
    target: '.mb-8 p',
    position: 'bottom'
  },
  {
    id: 'product-interaction',
    title: '🎯 Interação Simplificada',
    content: 'Toque em qualquer produto para adicioná-lo à lista. Produtos selecionados ficam verdes e mostram a quantidade que você pode ajustar.',
    target: '.grid.gap-3 > div:first-child',
    position: 'right'
  },
  {
    id: 'swipe-gestures',
    title: '👈👉 Gestos de Arrastar',
    content: 'Arraste produtos para a **direita** para adicionar rapidamente, ou para a **esquerda** para ver opções de editar e excluir. Vai sentir vibração no celular!',
    target: '.grid.gap-3 > div:first-child',
    position: 'left'
  },
  {
    id: 'add-new-product',
    title: '➕ Adicionar Produto Novo',
    content: 'Produto não está na lista? Use o botão + para adicionar algo totalmente novo com categoria e preço estimado.',
    target: '.fixed.bottom-6.right-6',
    position: 'left'
  },
  {
    id: 'create-list',
    title: '🚀 Finalizar Lista',
    content: 'Com produtos selecionados, clique aqui para criar sua lista. Ela será aberta automaticamente na tela principal, pronta para usar!',
    target: 'main button.btn-primary, main button:not([disabled])',
    position: 'top'
  },
  {
    id: 'finish',
    title: '🎉 Interface Renovada!',
    content: 'Agora você tem:\n• ⚡ WhatsApp direto para lista\n• 👆 Gestos consistentes\n• 📱 Feedback háptico\n• 🎯 Fluxo simplificado\n\nSuas compras nunca foram tão eficientes! 🛒',
    target: null,
    position: 'center'
  }
]

function NewListTour({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [targetElement, setTargetElement] = useState(null)

  useEffect(() => {
    if (isOpen && currentStep < newListTourSteps.length) {
      const step = newListTourSteps[currentStep]
      if (step.target) {
        // Aguardar um pouco para os elementos estarem renderizados
        setTimeout(() => {
          const element = document.querySelector(step.target)
          setTargetElement(element)
          
          // Scroll para o elemento se necessário
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }, 100)
      } else {
        setTargetElement(null)
      }
    }
  }, [isOpen, currentStep])

  if (!isOpen) return null

  const currentStepData = newListTourSteps[currentStep]
  const isLastStep = currentStep === newListTourSteps.length - 1

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
      case 'bottom':
        return { 
          top: Math.min(rect.bottom + margin, window.innerHeight - tooltipHeight - margin), 
          left: Math.max(margin, Math.min(window.innerWidth - tooltipWidth - margin, rect.left + (rect.width / 2) - tooltipWidth/2))
        }
      case 'left':
        return { 
          top: Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, rect.top + (rect.height / 2) - tooltipHeight/2)),
          right: window.innerWidth - rect.left + margin
        }
      case 'right':
        return { 
          top: Math.max(margin, Math.min(window.innerHeight - tooltipHeight - margin, rect.top + (rect.height / 2) - tooltipHeight/2)),
          left: Math.min(rect.right + margin, window.innerWidth - tooltipWidth - margin)
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
        <div className="text-sm md:text-base text-gray-600 leading-relaxed mb-4 md:mb-6">
          {currentStepData.content.split('\n').map((line, index) => (
            <div key={index} className={index > 0 ? 'mt-2' : ''}>
              {line.includes('**') ? (
                <span dangerouslySetInnerHTML={{
                  __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800">$1</strong>')
                }} />
              ) : (
                line
              )}
            </div>
          ))}
        </div>

        {/* Progresso */}
        <div className="flex items-center justify-between mb-3 md:mb-4">
          <div className="flex space-x-1">
            {newListTourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-primary-blue' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs md:text-sm text-gray-500">
            {currentStep + 1} de {newListTourSteps.length}
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

export default NewListTour