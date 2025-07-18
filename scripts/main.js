

const ThemeSettings = {
  // Chế độ mặc định (auto = theo hệ thống, light = sáng, dark = tối)
  defaultTheme: 'auto',
  // Key lưu trong localStorage
  storageKey: 'anhemrot_theme',
  // Các class để áp dụng chế độ tối
  darkModeClass: 'dark-theme',
  // Transition khi chuyển chế độ
  transitionClass: 'theme-transition',
  // Thời gian transition (ms)
  transitionDuration: 1000
};

// Khởi tạo themeManager
const themeManager = {
  currentTheme: ThemeSettings.defaultTheme,
  systemPrefersDark: false,

  /**
   * Khởi tạo chức năng
   */
  initialize() {
    // Kiểm tra theme trong localStorage
    const savedTheme = localStorage.getItem(ThemeSettings.storageKey);
    if (savedTheme) {
      this.currentTheme = savedTheme;
    }

    // Kiểm tra thiết lập hệ thống
    this.systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Thêm sự kiện lắng nghe khi thiết lập hệ thống thay đổi
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      this.systemPrefersDark = e.matches;
      if (this.currentTheme === 'auto') {
        this.applyTheme();
      }
    });

    // Tạo widget chuyển đổi
    this.createThemeWidget();

    // Áp dụng theme hiện tại
    this.applyTheme();
  },

  /**
   * Tạo widget chuyển đổi theme
   */
  createThemeWidget() {
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = `
      <button class="theme-toggle-btn" id="theme-toggle-btn" aria-label="Chuyển đổi giao diện">
        <i class="fas fa-sun light-icon"></i>
        <i class="fas fa-moon dark-icon"></i>
        <span class="theme-toggle-slider"></span>
      </button>
      <div class="theme-menu">
        <div class="theme-option" data-theme="light">
          <i class="fas fa-sun"></i>
          <span>Sáng</span>
        </div>
        <div class="theme-option" data-theme="dark">
          <i class="fas fa-moon"></i>
          <span>Tối</span>
        </div>
        <div class="theme-option" data-theme="auto">
          <i class="fas fa-adjust"></i>
          <span>Tự động</span>
        </div>
      </div>
    `;

    document.body.appendChild(themeToggle);

    // Thêm sự kiện click cho nút toggle
    const toggleBtn = document.getElementById('theme-toggle-btn');
    const themeMenu = themeToggle.querySelector('.theme-menu');

    toggleBtn.addEventListener('click', () => {
      themeMenu.classList.toggle('show');
    });

    // Thêm sự kiện cho các tùy chọn
    const themeOptions = themeToggle.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        this.setTheme(theme);
        themeMenu.classList.remove('show');
      });
    });

    // Đóng menu khi click ra ngoài
    document.addEventListener('click', (event) => {
      if (!themeToggle.contains(event.target)) {
        themeMenu.classList.remove('show');
      }
    });

    // Cập nhật trạng thái active cho tùy chọn hiện tại
    this.updateActiveOption();
  },

  /**
   * Cập nhật trạng thái active cho tùy chọn hiện tại
   */
  updateActiveOption() {
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
      const theme = option.getAttribute('data-theme');
      if (theme === this.currentTheme) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });

    // Cập nhật icon toggle
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (this.getCurrentMode() === 'dark') {
      toggleBtn.classList.add('dark-active');
    } else {
      toggleBtn.classList.remove('dark-active');
    }
  },

  /**
   * Đặt theme
   * @param {string} theme - Theme mới (light, dark, auto)
   */
  setTheme(theme) {
    if (!['light', 'dark', 'auto'].includes(theme)) {
      console.error('Theme không hợp lệ:', theme);
      return;
    }

    this.currentTheme = theme;
    localStorage.setItem(ThemeSettings.storageKey, theme);

    this.applyTheme();
    this.updateActiveOption();

    // Kích hoạt sự kiện theme thay đổi
    const event = new CustomEvent('themeChanged', {
      detail: { theme: theme, mode: this.getCurrentMode() }
    });
    document.dispatchEvent(event);
  },

  /**
   * Lấy chế độ hiện tại (light hoặc dark)
   */
  getCurrentMode() {
    if (this.currentTheme === 'auto') {
      return this.systemPrefersDark ? 'dark' : 'light';
    }
    return this.currentTheme;
  },

  /**
   * Áp dụng theme hiện tại vào trang
   */
  applyTheme() {
    // Thêm class transition trước khi thay đổi theme
    document.documentElement.classList.add(ThemeSettings.transitionClass);

    const mode = this.getCurrentMode();

    if (mode === 'dark') {
      document.documentElement.classList.add(ThemeSettings.darkModeClass);
    } else {
      document.documentElement.classList.remove(ThemeSettings.darkModeClass);
    }

    // Cập nhật toggle button
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      if (mode === 'dark') {
        toggleBtn.classList.add('dark-active');
      } else {
        toggleBtn.classList.remove('dark-active');
      }
    }

    // Xóa class transition sau khi hoàn tất
    setTimeout(() => {
      document.documentElement.classList.remove(ThemeSettings.transitionClass);
    }, ThemeSettings.transitionDuration);
  },

  /**
   * Chuyển đổi qua lại giữa light và dark
   */
  toggle() {
    const newTheme = this.getCurrentMode() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }
};


document.addEventListener('DOMContentLoaded', function () {
  themeManager.initialize();
});

window.themeManager = themeManager;

// hero
document.addEventListener('DOMContentLoaded', function () {
  const slidesData = [
    {
      title: "Chào mừng đến với Anh Em Rọt Store",
      description: "Nơi cung cấp các sản phẩm Apple chính hãng với giá tốt nhất và dịch vụ hậu mãi tuyệt vời.",
      imageUrl: "assets/banner/modau.jpg",
      button1Text: "Mua ngay",
      button1Link: "product.html",
      button2Text: "Tìm hiểu thêm",
      button2Link: "#",
      altText: "Cửa hàng Apple chính hãng Anh Em Rọt Store"
    },
    {
      title: "Khuyến mãi đặc biệt mùa hè",
      description: "Giảm giá lên đến 30% cho các sản phẩm iPhone mới nhất.",
      imageUrl: "assets/banner/giamgia.webp",
      button1Text: "Xem ngay",
      button1Link: "promotion.html",
      button2Text: "Liên hệ",
      button2Link: "contact.html",
      altText: "Khuyến mãi mùa hè giảm giá iPhone"
    },
    {
      title: "Phụ kiện chính hãng Apple",
      description: "Sạc, cáp, tai nghe AirPods với giá ưu đãi đặc biệt.",
      imageUrl: "assets/banner/phukienapple.jpg",
      button1Text: "Mua ngay",
      button1Link: "accessory.html",
      button2Text: "Xem tất cả",
      button2Link: "products.html",
      altText: "Phụ kiện Apple chính hãng"
    },
    {
      title: "Apple Siêu ưu đãi",
      description: "Giảm giá đến 15% cho các sản phẩm Apple.",
      imageUrl: "assets/banner/apple_uu_dai.png",
      button1Text: "Tìm hiểu ngay",
      button1Link: "product.html",
      button2Text: "Hotline",
      button2Link: "tel:0123456789",
      altText: "Anh Em Rọt Store"
    },
    {
      title: "Hè rực rỡ, giảm hết cỡ",
      description: "7 ngày dùng thử không ưng hoàn lại 100%.",
      imageUrl: "assets/banner/news.png",
      button1Text: "Tìm hiểu ngay",
      button1Link: "news.html",
      button2Text: "Hotline",
      button2Link: "tel:0123456789",
      altText: "Anh Em Rọt Store"
    }
  ];

  const sliderContainer = document.getElementById('heroSlider');
  const indicatorsContainer = document.querySelector('.slide-indicators');
  const prevButton = document.querySelector('.prev-slide');
  const nextButton = document.querySelector('.next-slide');
  let currentSlide = 0;
  let slideInterval;
  const slideDuration = 5000; // 5 seconds

  // Tạo slides từ dữ liệu
  function createSlides() {
    slidesData.forEach((slide, index) => {
      // Tạo slide
      const slideElement = document.createElement('div');
      slideElement.className = `slide ${index === 0 ? 'active' : ''}`;
      slideElement.style.backgroundImage = `url(${slide.imageUrl})`;
      slideElement.setAttribute('aria-hidden', index !== 0);
      slideElement.setAttribute('aria-label', slide.altText);

      slideElement.innerHTML = `
                <div class="hero-content">
                    <h1>${slide.title}</h1>
                    <p>${slide.description}</p>
                    <div class="hero-buttons">
                        <a href="${slide.button1Link}" class="btn btn-primary">${slide.button1Text}</a>
                        <a href="${slide.button2Link}" class="btn btn-outline">${slide.button2Text}</a>
                    </div>
                </div>
            `;

      sliderContainer.insertBefore(slideElement, sliderContainer.firstChild);

      // Tạo indicator
      const indicator = document.createElement('button');
      indicator.className = `slide-indicator ${index === 0 ? 'active' : ''}`;
      indicator.setAttribute('aria-label', `Chuyển đến slide ${index + 1}`);
      indicator.dataset.index = index;
      indicatorsContainer.appendChild(indicator);
    });
  }

  // Hàm chuyển đến slide cụ thể
  function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const indicators = document.querySelectorAll('.slide-indicator');

    // Ẩn slide hiện tại
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].setAttribute('aria-hidden', 'true');
    indicators[currentSlide].classList.remove('active');

    // Cập nhật slide mới
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add('active');
    slides[currentSlide].setAttribute('aria-hidden', 'false');
    indicators[currentSlide].classList.add('active');

    // Reset tự động chuyển slide
    resetSlideInterval();
  }

  // Tự động chuyển slide
  function startSlideInterval() {
    slideInterval = setInterval(() => {
      goToSlide(currentSlide + 1);
    }, slideDuration);
  }

  // Reset interval
  function resetSlideInterval() {
    clearInterval(slideInterval);
    startSlideInterval();
  }

  // Khởi tạo slider
  function initSlider() {
    createSlides();
    startSlideInterval();

    // Sự kiện nút previous
    prevButton.addEventListener('click', () => {
      goToSlide(currentSlide - 1);
    });

    // Sự kiện nút next
    nextButton.addEventListener('click', () => {
      goToSlide(currentSlide + 1);
    });

    // Sự kiện click indicator
    document.querySelectorAll('.slide-indicator').forEach(indicator => {
      indicator.addEventListener('click', () => {
        const index = parseInt(indicator.dataset.index);
        goToSlide(index);
      });
    });

    // Dừng tự động chuyển khi hover
    sliderContainer.addEventListener('mouseenter', () => {
      clearInterval(slideInterval);
    });

    sliderContainer.addEventListener('mouseleave', () => {
      startSlideInterval();
    });

    // Thêm keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1);
      } else if (e.key === 'ArrowRight') {
        goToSlide(currentSlide + 1);
      }
    });
  }

  initSlider();
});

$(document).ready(function () {
  // Danh sách tên người dùng Việt Nam phổ biến
  const vietnameseNames = [
    "Nguyễn Văn A", "Trần Thị B", "Lê Văn C", "Phạm Thị D",
    "Hoàng Văn E", "Ngô Thị F", "Vũ Văn G", "Đặng Thị H",
    "Bùi Văn I", "Đỗ Thị K", "Hồ Văn L", "Nguyễn Thị M",
    "Phan Văn N", "Trần Văn O", "Lê Thị P", "Võ Văn Q",
    "Mai Thị R", "Huỳnh Văn S", "Nguyễn Đức T", "Trần Minh U",
    "Lê Quốc V", "Phạm Hồng X", "Hoàng Thị Y", "Nguyễn Thành Z"
  ];

  // Danh sách địa điểm Việt Nam
  const locations = [
    "Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng",
    "Cần Thơ", "Biên Hòa", "Nha Trang", "Huế",
    "Buôn Ma Thuột", "Vinh", "Đà Lạt", "Quy Nhơn",
    "Thái Nguyên", "Vũng Tàu", "Long Xuyên", "Thanh Hóa",
    "Hải Dương", "Nam Định", "Rạch Giá", "Thủ Dầu Một"
  ];

  // Danh sách sản phẩm Apple
  const products = [
    { name: "iPhone 15 Pro", storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Titan Tự Nhiên", "Titan Trắng", "Titan Đen", "Titan Xanh"] },
    { name: "iPhone 15", storage: ["128GB", "256GB", "512GB"], colors: ["Đen", "Xanh Dương", "Xanh Lá", "Hồng", "Vàng"] },
    { name: "iPhone 14 Pro", storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Đen", "Bạc", "Vàng", "Tím Đậm"] },
    { name: "iPhone 14", storage: ["128GB", "256GB", "512GB"], colors: ["Đen", "Trắng", "Đỏ", "Xanh Dương", "Tím"] },
    { name: "MacBook Air M2", storage: ["256GB", "512GB", "1TB"], colors: ["Bạc", "Xám", "Đen", "Xanh"] },
    { name: "MacBook Pro M3", storage: ["512GB", "1TB", "2TB"], colors: ["Bạc", "Xám Không Gian"] },
    { name: "iPad Pro M2", storage: ["128GB", "256GB", "512GB", "1TB"], colors: ["Bạc", "Xám Không Gian"] },
    { name: "iPad Air", storage: ["64GB", "256GB"], colors: ["Xám Không Gian", "Xanh Dương", "Hồng", "Tím", "Xanh Lá"] },
    { name: "Apple Watch Series 9", storage: ["GPS", "GPS + Cellular"], colors: ["Bạc", "Đen", "Vàng"] },
    { name: "AirPods Pro 2", storage: [""], colors: ["Trắng"] }
  ];

  // Thời gian mua hàng
  const timeAgo = [
    "vừa mua", "1 phút trước", "2 phút trước", "5 phút trước",
    "10 phút trước", "15 phút trước", "20 phút trước", "30 phút trước",
    "1 giờ trước", "2 giờ trước", "3 giờ trước"
  ];

  // Tạo thông báo ngẫu nhiên
  function generateRandomNotification() {
    const randomName = vietnameseNames[Math.floor(Math.random() * vietnameseNames.length)];
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomStorage = randomProduct.storage[Math.floor(Math.random() * randomProduct.storage.length)];
    const randomColor = randomProduct.colors[Math.floor(Math.random() * randomProduct.colors.length)];
    const randomTime = timeAgo[Math.floor(Math.random() * timeAgo.length)];

    // Thêm đuôi để hiển thị dung lượng và màu nếu có
    let productText = randomProduct.name;
    if (randomStorage !== "") {
      productText += " " + randomStorage;
    }
    if (randomColor !== "") {
      productText += " Màu " + randomColor;
    }

    return {
      name: randomName,
      location: randomLocation,
      product: productText,
      time: randomTime
    };
  }

  // Tạo HTML cho thông báo
  function createNotificationHtml(notification) {
    return `
            <div class="recent-purchase-notification">
                <div class="notification-icon">
                    <i class="fas fa-shopping-bag"></i>
                </div>
                <div class="notification-content">
                    <p class="notification-text">
                        <strong>${notification.name}</strong> ở <strong>${notification.location}</strong> 
                        <span class="notification-action">đã mua</span> 
                        <strong>${notification.product}</strong>
                    </p>
                    <p class="notification-time">${notification.time}</p>
                </div>
                <button class="notification-close">×</button>
            </div>
        `;
  }

  // Hiển thị thông báo
  function showNotification() {
    // Tạo nội dung thông báo
    const notification = generateRandomNotification();
    const notificationHtml = createNotificationHtml(notification);

    // Thêm thông báo vào DOM
    const $notification = $(notificationHtml).appendTo('body');

    // Hiệu ứng hiển thị
    $notification.hide().fadeIn(500);

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      $notification.fadeOut(500, function () {
        $(this).remove();
      });
    }, 5000);

    // Sự kiện đóng thông báo
    $notification.find('.notification-close').on('click', function () {
      $notification.fadeOut(300, function () {
        $(this).remove();
      });
    });
  }

  // Hiển thị thông báo đầu tiên sau 5 giây khi trang tải xong
  setTimeout(showNotification, 5000);

  // Hiển thị thông báo tiếp theo sau mỗi 20-60 giây
  function scheduleNextNotification() {
    // Thời gian ngẫu nhiên từ 20-60 giây
    const randomTime = Math.floor(Math.random() * (60000 - 20000 + 1)) + 20000;

    setTimeout(() => {
      showNotification();
      scheduleNextNotification(); // Lên lịch cho thông báo tiếp theo
    }, randomTime);
  }

  // Bắt đầu lên lịch cho thông báo
  scheduleNextNotification();

  // Thêm CSS cho thông báo
  const notificationCss = `
        .recent-purchase-notification {
            position: fixed;
            bottom: 20px;
            left: 20px;
            width: 320px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 15px;
            display: flex;
            align-items: center;
            z-index: 9999;
            animation: slide-in 0.5s ease;
        }
        
        @keyframes slide-in {
            from { transform: translateX(-100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .notification-icon {
            width: 40px;
            height: 40px;
            background-color: #e6f7ff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            flex-shrink: 0;
        }
        
        .notification-icon i {
            color: #1890ff;
            font-size: 18px;
        }
        
        .notification-content {
            flex-grow: 1;
        }
        
        .notification-text {
            margin: 0;
            font-size: 13px;
            color: #333;
            line-height: 1.4;
        }
        
        .notification-action {
            color: #52c41a;
            font-weight: 500;
        }
        
        .notification-time {
            margin: 5px 0 0 0;
            font-size: 12px;
            color: #999;
        }
        
        .notification-close {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: none;
            border: none;
            color: #999;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            padding: 0;
            margin-left: 5px;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        
        .notification-close:hover {
            opacity: 1;
            color: #666;
        }
        
        @media (max-width: 576px) {
            .recent-purchase-notification {
                width: calc(100% - 40px);
                max-width: 320px;
            }
        }
    `;

  // Thêm CSS vào trang
  $('<style>').prop('type', 'text/css').html(notificationCss).appendTo('head');

  // Thêm tùy chọn để tắt thông báo
  if (localStorage.getItem('disableRecentPurchases') === 'true') {
    // Nếu người dùng đã tắt thông báo, không hiển thị nữa
    return;
  }

  // Tạo nút thiết lập
  const settingsButton = $(`
        <div class="notification-settings">
            <button class="notification-settings-toggle">
                <i class="fas fa-bell"></i>
            </button>
            <div class="notification-settings-panel" style="display: none;">
                <div class="settings-title">Thông báo mua hàng</div>
                <label class="settings-option">
                    <input type="checkbox" id="toggle-notifications" checked> Hiển thị thông báo
                </label>
                <div class="settings-info">
                    <i class="fas fa-info-circle"></i> Hiển thị hoạt động mua hàng gần đây
                </div>
            </div>
        </div>
    `).appendTo('body');

  // CSS cho nút thiết lập
  const settingsCss = `
        .notification-settings {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
        }
        
        .notification-settings-toggle {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #f0f0f0;
            border: none;
            color: #666;
            font-size: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.3s;
        }
        
        .notification-settings-toggle:hover {
            background-color: #e0e0e0;
        }
        
        .notification-settings-panel {
            position: absolute;
            bottom: 50px;
            right: 0;
            width: 250px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            padding: 15px;
        }
        
        .settings-title {
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
            font-size: 14px;
        }
        
        .settings-option {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
            cursor: pointer;
        }
        
        .settings-option input {
            margin-right: 8px;
        }
        
        .settings-info {
            font-size: 12px;
            color: #999;
            margin-top: 10px;
            display: flex;
            align-items: center;
        }
        
        .settings-info i {
            margin-right: 5px;
        }
    `;

  // Thêm CSS cho thiết lập
  $('<style>').prop('type', 'text/css').html(settingsCss).appendTo('head');

  // Sự kiện hiển thị/ẩn panel thiết lập
  $('.notification-settings-toggle').on('click', function () {
    $('.notification-settings-panel').fadeToggle(200);
  });

  // Đóng panel khi click bên ngoài
  $(document).on('click', function (e) {
    if (!$(e.target).closest('.notification-settings').length) {
      $('.notification-settings-panel').fadeOut(200);
    }
  });

  // Sự kiện bật/tắt thông báo
  $('#toggle-notifications').on('change', function () {
    if ($(this).is(':checked')) {
      localStorage.setItem('disableRecentPurchases', 'false');
      showNotification();
      scheduleNextNotification();
    } else {
      localStorage.setItem('disableRecentPurchases', 'true');
      $('.recent-purchase-notification').fadeOut(300, function () {
        $(this).remove();
      });
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const featureItems = document.querySelectorAll('.feature-item');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Optional: Unobserve after animation to improve performance
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2, // Trigger when 20% of the item is visible
    }
  );

  featureItems.forEach((item) => {
    observer.observe(item);
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const section = document.querySelector('.why-choose-us');
  const featureItems = section.querySelectorAll('.feature-item');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        section.classList.add('visible');
        featureItems.forEach((item, index) => {
          item.style.transitionDelay = `${index * 0.1}s`;
          item.classList.add('visible');
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(section);
});

document.addEventListener('DOMContentLoaded', () => {
  const testimonials = document.querySelector('.testimonials-section');
  const cards = testimonials.querySelectorAll('.testimonial-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        testimonials.classList.add('visible');
        cards.forEach((card, index) => {
          card.style.transitionDelay = `${index * 0.2}s`;
          card.classList.add('visible');
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  observer.observe(testimonials);
});


document.addEventListener('DOMContentLoaded', () => {
  const showcase = document.getElementById('product-showcase');
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  // gan su kien cho nut so huu ngay
  const BuynowButton = showcase.querySelector('.buy-now-btn');
  if (BuynowButton) {
    BuynowButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = "iphone.html";
    });
  } else {
    console.error('Nút "Mua ngay" không tìm thấy trong phần giới thiệu sản phẩm.');
  }
  observer.observe(showcase);
});

// news section
document.addEventListener("DOMContentLoaded", function () {
  // News section
  const blogGrid = document.getElementById('blog-grid');
  const prevBtn = document.getElementById('prev-page');
  const nextBtn = document.getElementById('next-page');
  const pageIndicator = document.getElementById('page-indicator');

  const itemsPerPage = 8;
  let currentPage = 1;
  let newsData = [];
  let totalPages = 0;

  // Format date
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('/');
    const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6',
      'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
    return `${day} ${months[parseInt(month) - 1]}, ${year}`;
  }

  // Render news cards
  function renderPage(page) {
    if (!blogGrid) {
      console.error('Blog grid not found: #blog-grid');
      return;
    }
    if (!newsData.length) {
      blogGrid.innerHTML = `<div class="col-12 error-message"><i class="fas fa-exclamation-triangle"></i><p>Không có tin tức để hiển thị.</p></div>`;
      return;
    }
    console.log('Rendering page:', page, 'with items:', newsData.slice((page - 1) * itemsPerPage, page * itemsPerPage));

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const items = newsData.slice(start, end);

    // Chỉ cập nhật nếu nội dung thay đổi
    const currentCards = blogGrid.querySelectorAll('.blog-post-card');
    if (currentCards.length !== items.length) {
      blogGrid.innerHTML = '';
      items.forEach((news, index) => {
        const card = document.createElement('div');
        card.className = 'blog-post-card';
        card.innerHTML = `
          <img src="${news.image || 'assets/default-news.jpg'}" alt="${news.title}" loading="lazy">
          <div class="blog-content">
            <div class="post-meta">
              <i class="fas fa-calendar-alt"></i> ${formatDate(news.date || news.startDate)}
            </div>
            <h4>${news.title || 'Không có tiêu đề'}</h4>
            <p>${news.description || 'Không có mô tả'}</p>
            <a href="news_detail.html?id=${news.newsID || news.id || ''}" class="read-more">Đọc thêm</a>
          </div>
        `;
        blogGrid.appendChild(card);
      });
    }

    updatePagination();
    setTimeout(() => {
      const cards = document.querySelectorAll('.blog-post-card');
      console.log('Cards rendered:', cards.length, 'for page:', page);
      cards.forEach((card, i) => {
        card.style.opacity = 1;
        card.style.transform = 'translateY(0)';
      });
    }, 50);
  }

  // Hàm cập nhật phân trang
  function updatePagination() {
    totalPages = newsData.length ? Math.ceil(newsData.length / itemsPerPage) : 0;
    console.log('Total pages:', totalPages, 'Current page:', currentPage);
    if (!pageIndicator) {
      console.error('Page indicator not found: #page-indicator');
      return;
    }
    if (totalPages === 0) {
      pageIndicator.textContent = '0 / 0';
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      prevBtn.classList.add('disabled');
      nextBtn.classList.add('disabled');
      return;
    }

    currentPage = Math.max(1, Math.min(currentPage, totalPages));
    pageIndicator.textContent = `${currentPage} / ${totalPages}`;
    prevBtn.disabled = currentPage <= 1;
    nextBtn.disabled = currentPage >= totalPages;

    console.log('Prev button disabled:', prevBtn.disabled, 'Next button disabled:', nextBtn.disabled);

    if (currentPage <= 1) {
      prevBtn.classList.add('disabled');
    } else {
      prevBtn.classList.remove('disabled');
    }

    if (currentPage >= totalPages) {
      nextBtn.classList.add('disabled');
    } else {
      nextBtn.classList.remove('disabled');
    }
  }

  // Hàm scroll đến phần tin tức
  function scrollToNews() {
    const newsSection = document.getElementById('blog-section');
    if (newsSection) {
      const offset = newsSection.getBoundingClientRect().top + window.pageYOffset - 50;
      window.scrollTo({
        top: offset,
        behavior: 'smooth'
      });
    } else {
      console.error('Blog section not found: #blog-section');
    }
  }

  // Sự kiện nút prev/next
  function handlePrevClick(e) {
    e.preventDefault();
    console.log('Prev button clicked, currentPage before:', currentPage);
    if (currentPage > 1 && !prevBtn.disabled) {
      currentPage--;
      console.log('New currentPage after prev:', currentPage);
      renderPage(currentPage);
      scrollToNews();
    } else {
      console.log('Prev button action blocked: page is 1 or button disabled');
    }
  }

  function handleNextClick(e) {
    e.preventDefault();
    console.log('Next button clicked, currentPage before:', currentPage);
    if (currentPage < totalPages && !nextBtn.disabled) {
      currentPage++;
      console.log('New currentPage after next:', currentPage);
      renderPage(currentPage);
      scrollToNews();
    } else {
      console.log('Next button action blocked: page is max or button disabled');
    }
  }

  // Kiểm tra và gắn sự kiện
  function attachEventListeners() {
    if (prevBtn) {
      prevBtn.style.pointerEvents = 'auto';
      prevBtn.removeEventListener('click', handlePrevClick);
      prevBtn.addEventListener('click', function (e) {
        console.log('Prev button click triggered, isDisabled:', prevBtn.disabled, 'event:', e);
        handlePrevClick(e);
      }, { capture: false });
      console.log('Prev button event attached, styles:', getComputedStyle(prevBtn).cssText);
    } else {
      console.error('Previous button not found: #prev-page');
    }
    if (nextBtn) {
      nextBtn.style.pointerEvents = 'auto';
      nextBtn.removeEventListener('click', handleNextClick);
      nextBtn.addEventListener('click', function (e) {
        console.log('Next button click triggered, isDisabled:', nextBtn.disabled, 'event:', e);
        handleNextClick(e);
      }, { capture: false });
      console.log('Next button event attached, styles:', getComputedStyle(nextBtn).cssText);
    } else {
      console.error('Next button not found: #next-page');
    }
  }

  // Gắn sự kiện ban đầu
  attachEventListeners();

  // Load news data
  fetch('data/news.json')
    .then(response => {
      if (!response.ok) throw new Error('Network error');
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) throw new Error('Invalid data format');
      newsData = data;
      console.log('News data loaded:', newsData);
      updatePagination();
      renderPage(currentPage);
      document.getElementById('blog-section').classList.add('visible');
      attachEventListeners();
    })
    .catch(error => {
      console.error('Error loading news:', error);
      if (blogGrid) {
        blogGrid.innerHTML = `
          <div class="col-12 error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Không thể tải tin tức. <button onclick="window.location.reload()">Thử lại</button></p>
          </div>
        `;
      }
      document.getElementById('blog-section').classList.add('visible');
      updatePagination();
    });
});

document.addEventListener('scroll', () => {
  const backToTop = document.querySelector('.back-to-top');
  if (window.scrollY > 300) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
});

document.querySelector('.back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Dữ liệu sản phẩm mẫu (có thể thay bằng API thực tế)
const featuredProductsData = [
  {
    id: 1,
    name: "iPhone 16 Pro",
    price: 29990000,
    oldPrice: 31990000,
    category: "iPhone",
    image: "assets/products/iphone/iphone16pro_titanden.png",
    stock: 10
  },
  {
    id: 2,
    name: "iPhone 15 Pro Max",
    price: 34990000,
    oldPrice: 36990000,
    category: "iPhone",
    image: "assets/products/iphone/iphone15prm_titanxanh.png",
    stock: 8
  },
  {
    id: 3,
    name: "iPhone 14",
    price: 19990000,
    oldPrice: 22990000,
    category: "iPhone",
    image: "assets/products/iphone/iphone14_vang_256GB.png",
    stock: 15
  },
  {
    id: 4,
    name: "iPhone 13",
    price: 16990000,
    oldPrice: 18990000,
    category: "iPhone",
    image: "assets/products/iphone/iphone13_xanhla_512v256.png",
    stock: 20
  },
  {
    id: 5,
    name: "iPad Pro 13-inch M4",
    price: 39990000,
    oldPrice: 42990000,
    category: "iPad",
    image: "assets/products/ipad/ipad_proM4_den.png",
    stock: 5
  },
  {
    id: 6,
    name: "iPad Air M2",
    price: 16490000,
    oldPrice: 17990000,
    category: "iPad",
    image: "assets/products/ipad/ipad_Air6M2_Tim.png",
    stock: 12
  },
  {
    id: 7,
    name: "iPad 10th Gen",
    price: 11990000,
    oldPrice: 13990000,
    category: "iPad",
    image: "assets/products/ipad/ipad_10_Bac.png",
    stock: 18
  },
  {
    id: 8,
    name: "iPad mini 6",
    price: 12990000,
    oldPrice: 14990000,
    category: "iPad",
    image: "assets/products/ipad/ipad_mini_denxam.png",
    stock: 10
  },
  {
    id: 9,
    name: "MacBook Air M3",
    price: 28990000,
    oldPrice: 30990000,
    category: "macbook",
    image: "assets/products/macbook/MacbookAir_Bac.png",
    stock: 7
  },
  {
    id: 10,
    name: "MacBook Pro 14-inch M3",
    price: 39990000,
    oldPrice: 42990000,
    category: "macbook",
    image: "assets/products/macbook/MacbookPro_Bac.png",
    stock: 4
  },
  {
    id: 11,
    name: "iMac M3",
    price: 34990000,
    oldPrice: 36990000,
    category: "macbook",
    image: "assets/products/macbook/iMac24_M3_Hong.png",
    stock: 6
  },
  {
    id: 12,
    name: "Mac mini M4",
    price: 20990000,
    oldPrice: 22990000,
    category: "macbook",
    image: "assets/products/macbook/Macmini_M4_Bac.png",
    stock: 9
  },
  {
    id: 13,
    name: "Apple Watch Ultra 2",
    price: 21990000,
    oldPrice: 23990000,
    category: "accessory",
    image: "assets/products/watch/applewatch_ultra2_dayocean.png",
    stock: 11
  },
  {
    id: 14,
    name: "Apple Watch Series 10",
    price: 10990000,
    oldPrice: 12990000,
    category: "accessory",
    image: "assets/products/watch/applewatch_series10_bac.png",
    stock: 15
  },
  {
    id: 15,
    name: "Apple Watch SE 2",
    price: 6990000,
    oldPrice: 7990000,
    category: "accessory",
    image: "assets/products/watch/applewatch_se2_bac.png",
    stock: 20
  },
  {
    id: 16,
    name: "AirPods Pro USB C",
    price: 5990000,
    oldPrice: 6990000,
    category: "airpod",
    image: "assets/products/tainghe/Airpods_pro_usb_c.png",
    stock: 25
  },
  {
    id: 17,
    name: "AirPods 4",
    price: 3490000,
    oldPrice: 3990000,
    category: "airpod",
    image: "assets/products/tainghe/Airpods4_chongon.png",
    stock: 30
  },
  {
    id: 18,
    name: "MagSafe Charger",
    price: 1090000,
    oldPrice: 1290000,
    category: "accessory",
    image: "assets/products/phukien/desackhongday_TypeC.png",
    stock: 50
  },
  {
    id: 19,
    name: "Apple Pencil Pro",
    price: 3490000,
    oldPrice: 3990000,
    category: "accessory",
    image: "assets/products/phukien/apple_pencilpro.png",
    stock: 15
  },
  {
    id: 20,
    name: "Magic Keyboard for iPad",
    price: 7990000,
    oldPrice: 8990000,
    category: "accessory",
    image: "assets/products/phukien/MagicKeyboard.png",
    stock: 10
  }
];

// Biến quản lý phân trang
let currentFeaturedPage = 1;
const itemsPerPage = 8;
let currentCategory = "all";

// Hiển thị sản phẩm
function displayFeaturedProducts() {
  const container = document.getElementById('featured-products');
  container.innerHTML = '';

  // Lọc sản phẩm theo danh mục
  let filteredProducts = featuredProductsData;
  if (currentCategory !== 'all') {
    filteredProducts = featuredProductsData.filter(product => product.category === currentCategory);
  }

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  document.getElementById('featured-total-pages').textContent = totalPages;

  // Điều chỉnh trang hiện tại nếu cần
  if (currentFeaturedPage > totalPages && totalPages > 0) {
    currentFeaturedPage = totalPages;
  }

  // Cập nhật nút phân trang
  document.getElementById('featured-prev').disabled = currentFeaturedPage <= 1;
  document.getElementById('featured-next').disabled = currentFeaturedPage >= totalPages;
  document.getElementById('featured-current-page').textContent = currentFeaturedPage;

  // Lấy sản phẩm cho trang hiện tại
  const startIndex = (currentFeaturedPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);

  // Hiển thị sản phẩm
  productsToShow.forEach(product => {
    const productElement = document.createElement('div');
    productElement.className = 'col';
    productElement.innerHTML = `
            <div class="featured-product">
                <img src="${product.image}" alt="${product.name}" loading="lazy">
                <div class="featured-product-content">
                    <h5>${product.name}</h5>
                    <p class="price">${product.price.toLocaleString()}đ</p>
                    ${product.oldPrice ? `<p class="old-price">${product.oldPrice.toLocaleString()}đ</p>` : ''}
                    <p class="stock">Còn lại: ${product.stock} sản phẩm</p>
                    <button class="btn">Xem chi tiết</button>
                </div>
            </div>
        `;
    container.appendChild(productElement);
  });

  // Hiển thị thông báo nếu không có sản phẩm
  if (filteredProducts.length === 0) {
    container.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 100%; width: 100%;">
            <h4>Không có sản phẩm nào trong danh mục này</h4>
        </div>
    `;
  }
}

// Xử lý sự kiện nút phân trang
document.getElementById('featured-prev').addEventListener('click', () => {
  if (currentFeaturedPage > 1) {
    currentFeaturedPage--;
    displayFeaturedProducts();
  }
});

document.getElementById('featured-next').addEventListener('click', () => {
  const filteredProducts = currentCategory === 'all'
    ? featuredProductsData
    : featuredProductsData.filter(product => product.category === currentCategory);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (currentFeaturedPage < totalPages) {
    currentFeaturedPage++;
    displayFeaturedProducts();
  }
});

// Xử lý sự kiện lọc sản phẩm
document.querySelectorAll('.featured-products-filter button').forEach(button => {
  button.addEventListener('click', () => {
    // Cập nhật trạng thái active của nút
    document.querySelectorAll('.featured-products-filter button').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');

    // Cập nhật danh mục và hiển thị lại sản phẩm
    currentCategory = button.dataset.category;
    currentFeaturedPage = 1;
    displayFeaturedProducts();
  });
});

// Khởi tạo hiển thị sản phẩm khi trang được tải
document.addEventListener('DOMContentLoaded', displayFeaturedProducts);

