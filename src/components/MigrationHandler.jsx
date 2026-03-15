import { useState, useEffect } from 'react'
import { migrateFromLocalStorage, needsMigration } from '../hooks/useIndexedDB'

function MigrationHandler({ children, onMigrationComplete }) {
  const [migrationState, setMigrationState] = useState('checking')

  useEffect(() => {
    async function handleMigration() {
      try {
        if (needsMigration()) {
          setMigrationState('migrating')
          console.log('Starting migration from localStorage to IndexedDB...')
          
          const results = await migrateFromLocalStorage()
          
          const migratedCount = results.filter(r => r.status === 'migrated').length
          console.log(`Migration completed: ${migratedCount} items migrated`)
          
          setMigrationState('completed')
          onMigrationComplete?.(results)
        } else {
          setMigrationState('not_needed')
          onMigrationComplete?.([])
        }
      } catch (error) {
        console.error('Migration failed:', error)
        setMigrationState('error')
        onMigrationComplete?.(null)
      }
    }

    handleMigration()
  }, [onMigrationComplete])

  if (migrationState === 'checking') {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando dados...</p>
        </div>
      </div>
    )
  }

  if (migrationState === 'migrating') {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Atualizando aplicativo</h2>
          <p className="text-gray-600 mb-4">
            Estamos migrando seus dados para um sistema de armazenamento mais eficiente. 
            Isso pode levar alguns segundos...
          </p>
          <div className="text-sm text-gray-500">
            Por favor, não feche o aplicativo durante este processo.
          </div>
        </div>
      </div>
    )
  }

  if (migrationState === 'error') {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Erro na migração</h2>
          <p className="text-gray-600 mb-4">
            Houve um problema ao atualizar o sistema de armazenamento. 
            O aplicativo continuará funcionando normalmente.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  // Migration completed or not needed - render children
  return children
}

export default MigrationHandler