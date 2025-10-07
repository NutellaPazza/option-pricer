import Link from 'next/link'

export default function Page(){
  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Option Pricer</h1>
        <p className="text-xl text-gray-600">Scegli il tipo di analisi che preferisci</p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Link href="/simple" className="card p-8 block hover:shadow-lg transition-shadow group">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Analisi Semplice</h2>
            <p className="text-gray-600">
              Modello Black-Scholes con parametri essenziali. Perfetta per un check rapido con heatmap Call/Put e calcolo delle Greeks.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Black-Scholes Model
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Heatmap Call & Put
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Greeks (Δ, Γ, Θ, ν, ρ)
              </div>
            </div>
          </div>
        </Link>

        <Link href="/advanced" className="card p-8 block hover:shadow-lg transition-shadow group">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">Analisi Avanzata</h2>
            <p className="text-gray-600">
              Tutti i modelli di pricing, analisi P&L, upload dati storici per volatilità realizzata e logging completo.
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                5 Modelli (BSM, CRR, JR, MC, LSMC)
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Analisi P&L e Posizioni
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Upload CSV & σ realizzata
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Confronto Modelli
              </div>
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Come iniziare</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <strong>Per principianti:</strong> Inizia con l'analisi semplice per familiarizzare con i concetti base del pricing delle opzioni.
          </div>
          <div>
            <strong>Per esperti:</strong> Usa l'analisi avanzata per confronti dettagliati tra modelli e analisi sofisticate.
          </div>
        </div>
      </div>
    </main>
  )
}
