import { adsenseConfig } from './adsense-config.js';

const publisherIdPattern = /^ca-pub-\d{16}$/;
const adSlotPattern = /^\d+$/;

function isLocalPreview() {
  return (
    window.location.protocol === 'file:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
}

function showPreviewPlaceholders() {
  if (!isLocalPreview()) return;

  document.querySelectorAll('[data-ad-shell]').forEach(shell => {
    const position = shell.dataset.adShell;
    const slot = shell.querySelector('[data-ad-position]');
    shell.hidden = false;
    shell.classList.add('ad-shell-preview');
    slot.textContent = `${position === 'top' ? 'Top' : 'Bottom'} responsive ad preview`;
  });
}

function hasValidConfiguration() {
  return (
    publisherIdPattern.test(adsenseConfig.publisherId) &&
    adSlotPattern.test(adsenseConfig.adSlots.top) &&
    adSlotPattern.test(adsenseConfig.adSlots.bottom)
  );
}

function loadAdSenseScript() {
  const script = document.createElement('script');
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.src =
    'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js' +
    `?client=${encodeURIComponent(adsenseConfig.publisherId)}`;
  document.head.append(script);
}

function createResponsiveAd(container, slotId) {
  const ad = document.createElement('ins');
  ad.className = 'adsbygoogle';
  ad.style.display = 'block';
  ad.dataset.adClient = adsenseConfig.publisherId;
  ad.dataset.adSlot = slotId;
  ad.dataset.adFormat = 'auto';
  ad.dataset.fullWidthResponsive = 'true';
  container.append(ad);

  window.adsbygoogle = window.adsbygoogle || [];
  window.adsbygoogle.push({});
}

function initializeAds() {
  if (!hasValidConfiguration()) {
    showPreviewPlaceholders();
    return;
  }

  loadAdSenseScript();

  document.querySelectorAll('[data-ad-shell]').forEach(shell => {
    const position = shell.dataset.adShell;
    const slotId = adsenseConfig.adSlots[position];
    const container = shell.querySelector('[data-ad-position]');
    shell.hidden = false;
    createResponsiveAd(container, slotId);
  });
}

initializeAds();
