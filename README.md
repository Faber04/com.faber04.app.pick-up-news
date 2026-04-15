# <img src="public/vite.svg" width="36" height="36" align="absmiddle" /> PickUpNews

**Un'applicazione web per leggere feed RSS in un'unica interfaccia elegante e intuitiva.**

🌐 **Demo live**: [www.faber04.com/app/pick-up-news](https://www.faber04.com/app/pick-up-news/)

PickUpNews ti permette di aggregare e leggere facilmente tutti i tuoi feed RSS preferiti. Aggiungi manualmente i tuoi feed RSS, visualizza le news in ordine cronologico o raggruppate per sito, e leggi gli articoli completi con un semplice click.

## ✨ Caratteristiche Principali

- **📡 Gestione Feed RSS**: Aggiungi e rimuovi facilmente feed RSS manualmente
- **📅 Visualizzazione Cronologica**: Vedi tutte le news ordinate per data (più recenti prima)
- **🏷️ Visualizzazione per Sito**: Raggruppa le news per fonte/testata
- **📱 Design Responsivo**: Perfetto su desktop, tablet e mobile
- **💾 Persistenza Locale**: I tuoi feed vengono salvati automaticamente nel browser
- **🔍 Anteprima Intelligente**: Descrizioni troncate a 120 caratteri per una lettura veloce
- **📖 Lettura Completa**: Modal con articolo completo e link originale
- **⚡ Performance**: Caricamento veloce grazie a Vite e ottimizzazioni React

## 🛠️ Tecnologie Utilizzate

- **Frontend Framework**: React 18 con TypeScript
- **Build Tool**: Vite 4 (sviluppo rapido e build ottimizzato)
- **Styling**: Tailwind CSS 3 (utility-first CSS framework)
- **RSS Parsing**: Parser XML personalizzato via `DOMParser` nativo del browser (supporta RSS 2.0 e Atom)
- **Routing**: React Router DOM (per future espansioni)
- **State Management**: React Hooks + localStorage
- **Type Checking**: TypeScript 5 (type safety completa)

## 🌐 Architettura RSS e gestione CORS

I feed RSS vengono letti direttamente dal browser usando una catena di proxy/fallback a 3 livelli per massimizzare la disponibilità:

| Livello | Servizio | Metodo | Limite item |
|---------|----------|--------|-------------|
| 1° (primario) | [api.allorigins.win](https://api.allorigins.win) | Restituisce XML raw → parse con `DOMParser` | Tutti gli item del feed |
| 2° (fallback) | [corsproxy.io](https://corsproxy.io) | Restituisce XML raw → parse con `DOMParser` | Tutti gli item del feed |
| 3° (fallback finale) | [rss2json.com](https://rss2json.com) | Restituisce JSON pre-parsato | Max 10 item (tier gratuito) |

Ogni chiamata è protetta da un timeout di **10 secondi** tramite `AbortController`: se un proxy non risponde entro il limite, si passa automaticamente al successivo. Gli item vengono sempre ordinati per data decrescente (più recenti prima) con normalizzazione cross-browser del formato data.

## 📋 Prerequisiti

- **Node.js**: Versione 18.0.0 o superiore
- **npm**: Versione 8.0.0 o superiore (viene con Node.js)

## 🚀 Installazione e Avvio

### 1. Clona il Repository
```bash
git clone https://github.com/Faber04/com.faber04.pick-up-news.git
cd com.faber04.pick-up-news
```

### 2. Installa le Dipendenze
```bash
npm install
```

### 3. Avvia il Server di Sviluppo
```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173/`

### 3. Build per la Produzione
```bash
npm run build
```

I file ottimizzati saranno nella cartella `dist/`

### 4. Deployment Online
L'applicazione sarà disponibile su: `https://www.faber04.com/app/pick-up-news/`

## 📖 Come Usare PickUpNews

### Aggiungere un Feed RSS
1. Clicca sul pulsante **"+ Aggiungi Feed RSS"**
2. Inserisci il nome del feed (es. "Corriere della Sera")
3. Inserisci l'URL del feed RSS
4. Clicca **"Aggiungi Feed"**

### Visualizzare le News
- **Cronologico**: Vedi tutte le news ordinate per data
- **Per Sito**: Raggruppa le news per testata/fonte

### Leggere gli Articoli
- Clicca su qualsiasi notizia per aprire il modal con il contenuto completo
- Usa il pulsante "Leggi l'articolo completo" per andare al sito originale

## 📁 Struttura del Progetto

```
com.faber04.pick-up-news/
├── public/                 # File statici
├── src/
│   ├── components/         # Componenti React riutilizzabili
│   │   ├── AddFeedForm.tsx # Form per aggiungere feed
│   │   ├── FeedList.tsx    # Lista dei feed configurati
│   │   ├── NewsList.tsx    # Lista delle news
│   │   ├── ViewControls.tsx # Controlli vista (cronologico/per sito)
│   │   └── NewsDetailModal.tsx # Modal dettaglio notizia
│   ├── hooks/              # Custom React hooks
│   │   └── useAppState.ts  # Hook gestione stato app
│   ├── services/           # Servizi e API
│   │   └── rss.ts          # Servizio parsing RSS
│   ├── types/              # Definizioni TypeScript
│   │   └── index.ts        # Tipi per RSS e stato app
│   └── utils/              # Utilità helper
├── pick-up-news-docs/      # Documentazione progetto
│   ├── AGENT_INSTRUCTIONS.md
│   ├── DEVELOPMENT_LOG.md
│   ├── ERROR_LOG.md
│   ├── PROJECT_STATE.md
│   └── SESSION_TEMPLATE.md
└── README.md
```

## 🔧 Script Disponibili

- `npm run dev` - Avvia server di sviluppo
- `npm run build` - Build per produzione
- `npm run preview` - Anteprima build produzione
- `npm run lint` - Esegue ESLint per controllo codice

## 🤝 Contributi

Questo progetto è sviluppato da @Faber04. Sentiti libero di aprire issue per segnalare bug o suggerire miglioramenti!

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT.

---

**Sviluppato da @Faber04**
