import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import { I18nProvider } from './i18n/provider.tsx'
import './index.css'

const hideBootSplash = () => {
  const splash = document.getElementById('boot-splash')
  if (!splash) return

  const removeSplash = () => {
    splash.remove()
  }

  splash.classList.add('is-hidden')
  splash.addEventListener('transitionend', removeSplash, { once: true })
  window.setTimeout(removeSplash, 450)
}

if ('serviceWorker' in navigator) {
  let hasReloaded = false
  registerSW({
    immediate: true,
    onRegisteredSW: (_swScriptUrl, registration) => {
      if (!registration) return

      const checkForUpdate = () => {
        void registration.update()
      }

      window.addEventListener('focus', checkForUpdate)
      window.addEventListener('pageshow', checkForUpdate)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkForUpdate()
        }
      })
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (hasReloaded) return
        hasReloaded = true
        window.location.reload()
      })
    },
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>,
)

window.requestAnimationFrame(() => {
  window.requestAnimationFrame(hideBootSplash)
})
