const PopupSystem = {
  shown: {},
  activePopup: null,
  queue: [],
  initialized: false,
  allowPopups: true,
  timeouts: {},
  bodyScrollPos: 0,
};

function initializePopupSystem() {
  if (PopupSystem.initialized) return;

  const overlay = document.createElement('div');
  overlay.id = 'popup-overlay';
  overlay.className = 'popup-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.addEventListener('click', (e) => e.target === overlay && hideActivePopup());
  document.body.appendChild(overlay);

  const container = document.createElement('div');
  container.id = 'popup-container';
  container.className = 'popup-container';
  document.body.appendChild(container);

  createWelcomePopup();
  createDealPopup();
  createPromotionPopup();

  const visitedBefore = localStorage.getItem('visited') === 'true';
  const lastPopupShown = parseInt(localStorage.getItem('lastPopupShown'), 10) || 0;
  const now = Date.now();

  if (!visitedBefore) {
    setTimeout(() => showPopup('welcome'), 500);
    localStorage.setItem('visited', 'true');
    localStorage.setItem('lastPopupShown', now.toString());
  } else if ((now - lastPopupShown) > 86400000) {
    setTimeout(() => showPopup('promotion'), 1000);
    localStorage.setItem('lastPopupShown', now.toString());
  } else {
    let scrollTriggered = false;
    const onScroll = () => {
      if (!scrollTriggered && window.scrollY > 300) {
        scrollTriggered = true;
        setTimeout(() => showPopup('deal'), 500);
        window.removeEventListener('scroll', onScroll);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  PopupSystem.initialized = true;

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && PopupSystem.activePopup) hideActivePopup();
  }, { passive: true });
}

function createWelcomePopup() {
  const welcomePopup = document.createElement('div');
  welcomePopup.id = 'welcome-popup';
  welcomePopup.className = 'popup welcome-popup';
  welcomePopup.setAttribute('role', 'dialog');
  welcomePopup.setAttribute('aria-labelledby', 'welcome-popup-title');
  welcomePopup.innerHTML = `
    <div class="popup-content">
      <button class="popup-close" data-popup="welcome" aria-label="Đóng popup">×</button>
      <div class="welcome-header">
        <img src="assets/logo/logo.png" alt="Anh Em Rọt Store" class="welcome-logo">
        <h2 id="welcome-popup-title">Chào mừng đến với <span class="highlight">Anh Em Rọt Store</span></h2>
      </div>
      <div class="welcome-body">
        <p>Đăng ký để nhận:</p>
        <ul class="benefits-list">
          <li><i class="fas fa-check-circle"></i> Voucher 100.000₫</li>
          <li><i class="fas fa-check-circle"></i> Miễn phí vận chuyển</li>
          <li><i class="fas fa-check-circle"></i> Ưu đãi đặc biệt</li>
        </ul>
        <div class="subscribe-form">
          <input type="email" placeholder="Email" class="email-input" aria-label="Nhập email">
          <button class="subscribe-btn">Đăng ký</button>
        </div>
        <a href="#" class="close-popup" data-popup="welcome">Để sau</a>
      </div>
    </div>
  `;
  document.getElementById('popup-container').appendChild(welcomePopup);

  welcomePopup.querySelector('.popup-close').addEventListener('click', () => hidePopup('welcome'));
  welcomePopup.querySelector('.close-popup').addEventListener('click', (e) => {
    e.preventDefault();
    hidePopup('welcome');
  });
  welcomePopup.querySelector('.subscribe-btn').addEventListener('click', () => {
    const emailInput = welcomePopup.querySelector('.email-input');
    if (emailInput?.value?.includes('@')) {
      welcomePopup.querySelector('.welcome-body').innerHTML = `
        <div class="success-message">
          <i class="fas fa-check-circle success-icon"></i>
          <h3>Đăng ký thành công!</h3>
          <p>Mã: <strong>WELCOME100K</strong></p>
          <button class="close-success-btn">Đóng</button>
        </div>
      `;
      welcomePopup.querySelector('.close-success-btn').addEventListener('click', () => hidePopup('welcome'));
    } else {
      alert('Email không hợp lệ');
    }
  });
}

function createDealPopup() {
  const dealPopup = document.createElement('div');
  dealPopup.id = 'deal-popup';
  dealPopup.className = 'popup deal-popup';
  dealPopup.setAttribute('role', 'dialog');
  dealPopup.setAttribute('aria-labelledby', 'deal-popup-title');
  dealPopup.innerHTML = `
    <div class="popup-content deal-content">
      <button class="popup-close" data-popup="deal" aria-label="Đóng popup">×</button>
      <div class="deal-header">
        <div class="popup-date">10.06</div>
      </div>
      <img src="assets/banner/digisale.png" alt="Sản phẩm khuyến mãi" class="deal-products-img">
      <div class="deal-footer">
        <a href="product.html" class="deal-button">MUA NGAY</a>
      </div>
    </div>
  `;
  document.getElementById('popup-container').appendChild(dealPopup);

  dealPopup.querySelector('.popup-close').addEventListener('click', () => hidePopup('deal'));
  dealPopup.querySelector('.deal-button').addEventListener('click', () => hidePopup('deal'));
}

function createPromotionPopup() {
  const productName = 'iPhone 15 Pro Max';
  const promotionPopup = document.createElement('div');
  promotionPopup.id = 'promotion-popup';
  promotionPopup.className = 'popup promotion-popup';
  promotionPopup.setAttribute('role', 'dialog');
  promotionPopup.setAttribute('aria-labelledby', 'promotion-popup-title');
  promotionPopup.innerHTML = `
    <div class="popup-content promo-content">
      <button class="popup-close" data-popup="promotion" aria-label="Đóng popup">×</button>
      <h3 id="promotion-popup-title">ƯU ĐÃI ĐẶC BIỆT</h3>
      <div class="promo-body">
        <img src="assets/banner/ip15giamgia.jpg alt="${productName}" class="promo-product-img">
        <div class="promo-info">
          <div class="promo-title">${productName}</div> 
          <div class="promo-price">
            <span class="current-price">25.990.000₫</span>
            <span class="old-price">29.990.000₫</span>
          </div>
          <div class="promo-benefits">
            <div class="benefit"><i class="fas fa-gift"></i> Ốp lưng chính hãng</div>
            <div class="benefit"><i class="fas fa-truck"></i> Miễn phí vận chuyển</div>
            <div class="benefit"><i class="fas fa-shield-alt"></i> Bảo hành 24 tháng</div>
          </div>
          <div class="promo-countdown">
            <div class="countdown-label">Kết thúc:</div>
            <div class="countdown-timer" id="promo-countdown-timer">00:00:00</div>
          </div>
          <a href="product-detail.html?id=${encodeURIComponent(productID)}" class="promo-button">MUA NGAY</a>
        </div>
      </div>
    </div>
  `;
  document.getElementById('popup-container').appendChild(promotionPopup);

  promotionPopup.querySelector('.popup-close').addEventListener('click', () => hidePopup('promotion'));
  promotionPopup.querySelector('.promo-button').addEventListener('click', () => hidePopup('promotion'));

  startPromotionCountdown();
}

function startPromotionCountdown() {
  const countdownElement = document.getElementById('promo-countdown-timer');
  if (!countdownElement) return;

  const expiry = Date.now() + 86400000;
  function updateCountdown() {
    const diff = expiry - Date.now();
    if (diff <= 0) {
      clearInterval(countdownInterval);
      countdownElement.textContent = "00:00:00";
      return;
    }
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);
  PopupSystem.timeouts['promotionCountdown'] = countdownInterval;
}

function showPopup(popupId) {
  if (!PopupSystem.allowPopups || PopupSystem.shown[popupId]) return;

  if (PopupSystem.activePopup) {
    PopupSystem.queue.push(popupId);
    return;
  }

  const popupElement = document.getElementById(`${popupId}-popup`);
  const overlay = document.getElementById('popup-overlay');
  if (!popupElement || !overlay) return;

  PopupSystem.bodyScrollPos = window.scrollY;
  document.body.classList.add('popup-open');
  document.body.style.top = `-${PopupSystem.bodyScrollPos}px`;

  overlay.style.display = 'block';
  overlay.setAttribute('aria-hidden', 'false');
  overlay.classList.add('active');

  popupElement.style.display = 'block';
  popupElement.classList.add('show');

  PopupSystem.activePopup = popupId;
  PopupSystem.shown[popupId] = true;
  popupElement.focus();
}

function hideActivePopup() {
  if (!PopupSystem.activePopup) return;
  hidePopup(PopupSystem.activePopup);
}

function hidePopup(popupId) {
  const popupElement = document.getElementById(`${popupId}-popup`);
  const overlay = document.getElementById('popup-overlay');
  if (!popupElement || !overlay) return;

  popupElement.classList.remove('show');
  popupElement.style.display = 'none';

  if (!PopupSystem.queue.length) {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.display = 'none';
    document.body.classList.remove('popup-open');
    window.scrollTo(0, PopupSystem.bodyScrollPos);
    document.body.style.top = '';
  }

  PopupSystem.activePopup = null;
  if (PopupSystem.queue.length) {
    showPopup(PopupSystem.queue.shift());
  }
}


document.addEventListener('DOMContentLoaded', () => {
  initializePopupSystem();
});

window.PopupSystem = {
  show: showPopup,
  hide: hidePopup,
  hideActive: hideActivePopup,
};