(() => {
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(console.error);
    });
  }

  if (isStandalone()) return;

  let deferredPrompt = null;
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = '📲 Uygulamayı yükle';
  button.setAttribute('aria-label', 'Linye Defteri uygulamasını telefona yükle');
  Object.assign(button.style, {
    position: 'fixed', right: '14px', bottom: '14px', zIndex: '2147483647',
    border: '0', borderRadius: '999px', padding: '12px 16px',
    font: '600 14px system-ui, sans-serif', background: '#147b69', color: '#fff',
    boxShadow: '0 6px 24px rgba(0,0,0,.22)', cursor: 'pointer', display: 'none'
  });
  document.body.appendChild(button);

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    button.style.display = 'block';
  });

  button.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { await deferredPrompt.userChoice; } catch (_) {}
      deferredPrompt = null;
      button.style.display = 'none';
    } else {
      alert('Chrome menüsünü (⋮) açıp “Uygulamayı yükle” veya “Ana ekrana ekle” seçeneğine dokun.');
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    button.style.display = 'none';
  });

  // Some Android browsers do not expose beforeinstallprompt immediately.
  setTimeout(() => {
    if (!isStandalone() && /Android/i.test(navigator.userAgent) && button.style.display === 'none') {
      button.style.display = 'block';
    }
  }, 2500);
})();
