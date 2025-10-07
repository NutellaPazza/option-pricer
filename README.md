# Option Pricer - Interactive Web Application

Un'applicazione web completa per il pricing di opzioni finanziarie con visualizzazioni interattive.

## 🚀 Caratteristiche

- **5 Modelli di Pricing**: Black-Scholes, Binomial CRR, Trinomial JR, Monte Carlo, LSMC American
- **Heatmap Interattive**: Visualizzazione della sensibilità del prezzo a Spot e Volatility
- **Calcolo Greeks**: Delta, Gamma, Theta, Vega, Rho
- **Confronto Modelli**: Comparazione side-by-side di tutti i modelli
- **Upload CSV**: Calcolo volatility realizzata da dati storici

## 🛠️ Tecnologie

### Backend
- **FastAPI** - Framework web moderno per Python
- **SQLAlchemy** - ORM per database
- **NumPy** - Calcoli matematici e finanziari
- **SQLite** - Database leggero

### Frontend
- **Next.js 14** - Framework React con TypeScript
- **Tailwind CSS** - Styling moderno
- **ECharts** - Visualizzazioni interattive
- **React Hooks** - Gestione dello stato

## 📦 Installazione

### Prerequisiti
- Python 3.11+
- Node.js 18+
- npm o yarn

### Setup Automatico (VS Code)
1. Apri il progetto in VS Code
2. Vai a **Terminal** → **Run Task**
3. Seleziona **"Setup all (one-time)"**

### Setup Manuale

#### Backend
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

#### Frontend
```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local
```

## 🚀 Avvio

### Automatico (VS Code Tasks)
- **"Start Backend"** - Avvia il server FastAPI
- **"Start Frontend"** - Avvia il server Next.js
- **"Open Apps"** - Apre entrambe le applicazioni nel browser

### Manuale

#### Backend
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

#### Frontend
```bash
cd frontend
npm run dev
```

## 📱 Utilizzo

1. Apri http://localhost:3000
2. Inserisci i parametri dell'opzione:
   - Strike Price, Spot Price, Volatility, ecc.
   - Scegli il modello di pricing
3. Clicca "Calcola" per generare:
   - Heatmap Call/Put
   - Greeks
   - Confronto tra modelli

## 📊 API Endpoints

- `POST /price` - Calcola il prezzo di un'opzione
- `POST /heatmap` - Genera dati per heatmap
- `POST /greeks` - Calcola i Greeks
- `POST /realized-vol` - Calcola volatility realizzata
- `GET /health` - Health check

## 🧮 Modelli Implementati

1. **Black-Scholes**: Modello classico per opzioni europee
2. **Binomial CRR**: Modello binomiale Cox-Ross-Rubinstein
3. **Trinomial JR**: Modello trinomiale Jarrow-Rudd
4. **Monte Carlo**: Simulazione Monte Carlo per opzioni europee
5. **LSMC American**: Least Squares Monte Carlo per opzioni americane

## 📁 Struttura Progetto

```
option-pricer/
├── backend/
│   ├── app/
│   │   ├── main.py          # API FastAPI
│   │   ├── pricing.py       # Algoritmi finanziari
│   │   ├── models.py        # Schemi Pydantic
│   │   └── db.py           # Configurazione database
│   └── requirements.txt
├── frontend/
│   ├── app/
│   │   ├── page.tsx        # Pagina principale
│   │   └── layout.tsx      # Layout applicazione
│   ├── components/
│   │   ├── Heatmap.tsx     # Componente heatmap
│   │   ├── InputPanel.tsx  # Form input
│   │   ├── GreeksCards.tsx # Visualizzazione Greeks
│   │   └── ...
│   └── lib/
│       └── api.ts          # Client API
└── .vscode/
    └── tasks.json          # Tasks automazione VS Code
```

## 🤝 Contributi

1. Fork il progetto
2. Crea un branch per la feature (`git checkout -b feature/AmazingFeature`)
3. Commit le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📄 Licenza

Distribuito sotto licenza MIT. Vedi `LICENSE` per maggiori informazioni.

## 📧 Contatti

Giovanni De Stasio - [@giovannidestasio](https://github.com/giovannidestasio)

Project Link: [https://github.com/giovannidestasio/option-pricer](https://github.com/giovannidestasio/option-pricer)