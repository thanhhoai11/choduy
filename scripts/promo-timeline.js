/**
 * Timeline khuyến mãi
 * File: promo-timeline.js (Thêm vào thư mục scripts)
 */

/**
 * Quản lý timeline các sự kiện khuyến mãi
 * - Hiển thị lịch khuyến mãi
 * - Đếm ngược đến các sự kiện
 * - Lọc theo loại sự kiện
 */
const PromoTimeline = {
  // Dữ liệu khuyến mãi
  events: [],
  
  // Các thiết lập
  settings: {
    containerSelector: '.promo-timeline-container',
    eventsLimit: 5, // Số sự kiện hiển thị mặc định
    autoScrollInterval: 5000, // Thời gian tự động cuộn (ms)
    scrollTimer: null
  },
  
  /**
   * Khởi tạo timeline khuyến mãi
   */
  initialize() {
    // Tải dữ liệu sự kiện
    this.loadEvents();
    
    // Lắng nghe sự kiện thay đổi theme
    document.addEventListener('themeChanged', event => {
      // Cập nhật giao diện timeline với theme mới
      this.updateTimelineAppearance(event.detail.mode);
    });
  },
  
  /**
   * Tải dữ liệu sự kiện khuyến mãi
   */
  loadEvents() {
    fetch('data/promo-events.json')
      .then(res => res.json())
      .then(data => {
        if (!data.events || !Array.isArray(data.events)) {

          this.events = this.generateSampleEvents();
        } else {
          // Sắp xếp sự kiện theo thời gian
          this.events = data.events.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        }
        
        // Render timeline
        this.renderTimeline();
        
        // Cập nhật đếm ngược
        this.startCountdowns();
        
        // Bắt đầu tự động cuộn
        this.startAutoScroll();
      })
      .catch(err => {
        console.error('Không thể tải dữ liệu sự kiện khuyến mãi:', err);
        
        // Sử dụng dữ liệu mẫu trong trường hợp lỗi
        this.events = this.generateSampleEvents();
        
        // Render timeline
        this.renderTimeline();
        
        // Cập nhật đếm ngược
        this.startCountdowns();
        
        // Bắt đầu tự động cuộn
        this.startAutoScroll();
      });
  },
  
  /**
   * Tạo dữ liệu mẫu cho timeline
   */
  generateSampleEvents() {
    const currentDate = new Date();
    const events = [];
    
    // Thêm sự kiện đang diễn ra
    events.push({
      id: 1,
      title: 'Flash Sale Hàng Ngày',
      description: 'Giảm đến 50% cho các sản phẩm Apple',
      startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 21, 0, 0).toISOString(),
      endDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59).toISOString(),
      type: 'flash-sale',
      url: '#flash-sale',
      imageUrl: 'assets/promotions/flash-sale.jpg'
    });
    
    // Thêm sự kiện sắp diễn ra
    for (let i = 1; i <= 5; i++) {
      const futureDate = new Date(currentDate);
      futureDate.setDate(futureDate.getDate() + i);
      
      const types = ['flash-sale', 'promotion', 'special', 'clearance', 'new-arrival'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const titles = {
        'flash-sale': 'Flash Sale ' + futureDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        'promotion': 'Khuyến mãi cuối tuần',
        'special': 'Ưu đãi đặc biệt',
        'clearance': 'Xả kho giá sốc',
        'new-arrival': 'Ra mắt sản phẩm mới'
      };
      
      const descriptions = {
        'flash-sale': 'Giảm đến 50% trong 2 giờ duy nhất',
        'promotion': 'Mua 1 tặng 1 cho phụ kiện Apple',
        'special': 'Ưu đãi đặc biệt cho khách hàng thân thiết',
        'clearance': 'Xả kho các sản phẩm cũ để đón sản phẩm mới',
        'new-arrival': 'Ra mắt iPhone mới với nhiều ưu đãi hấp dẫn'
      };
      
      events.push({
        id: i + 1,
        title: titles[type],
        description: descriptions[type],
        startDate: new Date(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), 9, 0, 0).toISOString(),
        endDate: new Date(futureDate.getFullYear(), futureDate.getMonth(), futureDate.getDate(), 21, 0, 0).toISOString(),
        type: type,
        url: '#' + type,
        imageUrl: 'assets/promotions/' + type + '.jpg'
      });
    }
    
    return events;
  },
  
  /**
   * Render timeline khuyến mãi
   */
  renderTimeline() {
    const container = document.querySelector(this.settings.containerSelector);
    if (!container) {
      console.error('Không tìm thấy container cho timeline khuyến mãi');
      return;
    }
    
    // Tạo HTML cho timeline
    container.innerHTML = `
      <div class="promo-timeline-header">
        <h3><i class="fas fa-calendar-alt me-2"></i>Lịch khuyến mãi</h3>
        <div class="promo-timeline-filters">
          <button class="filter-item active" data-filter="all">Tất cả</button>
          <button class="filter-item" data-filter="flash-sale">Flash Sale</button>
          <button class="filter-item" data-filter="promotion">Khuyến mãi</button>
          <button class="filter-item" data-filter="special">Đặc biệt</button>
        </div>
      </div>
      <div class="promo-timeline-scroll">
        <div class="promo-timeline-events">
          ${this.generateEventsHTML()}
        </div>
      </div>
      <div class="promo-timeline-footer">
        <button class="btn-show-more">Xem thêm <i class="fas fa-chevron-down"></i></button>
      </div>
    `;
    
    // Thêm sự kiện cho các nút lọc
    const filterButtons = container.querySelectorAll('.filter-item');
    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Cập nhật trạng thái active
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Lọc sự kiện
        const filter = button.getAttribute('data-filter');
        this.filterEvents(filter);
      });
    });
    
    // Thêm sự kiện cho nút Xem thêm
    const showMoreBtn = container.querySelector('.btn-show-more');
    if (showMoreBtn) {
      showMoreBtn.addEventListener('click', () => {
        this.toggleShowMore(showMoreBtn);
      });
    }
    
    // Setup scroll event
    const scrollContainer = container.querySelector('.promo-timeline-scroll');
    if (scrollContainer) {
      scrollContainer.addEventListener('mouseenter', () => {
        // Dừng tự động cuộn khi hover
        this.stopAutoScroll();
      });
      
      scrollContainer.addEventListener('mouseleave', () => {
        // Tiếp tục tự động cuộn khi không hover
        this.startAutoScroll();
      });
    }
  },
  
  /**
   * Tạo HTML cho các sự kiện
   */
  generateEventsHTML() {
    if (!this.events || this.events.length === 0) {
      return `<div class="empty-timeline">Không có sự kiện khuyến mãi nào sắp diễn ra</div>`;
    }
    
    return this.events.map((event, index) => {
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      const now = new Date();
      
      // Xác định trạng thái sự kiện
      let status = '';
      let statusClass = '';
      
      if (now < startDate) {
        status = 'Sắp diễn ra';
        statusClass = 'upcoming';
      } else if (now >= startDate && now <= endDate) {
        status = 'Đang diễn ra';
        statusClass = 'active';
      } else {
        status = 'Đã kết thúc';
        statusClass = 'ended';
      }
      
      // Format date
      const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit' };
      
      const startDateStr = startDate.toLocaleDateString('vi-VN', dateOptions);
      const startTimeStr = startDate.toLocaleTimeString('vi-VN', timeOptions);
      const endDateStr = endDate.toLocaleDateString('vi-VN', dateOptions);
      const endTimeStr = endDate.toLocaleTimeString('vi-VN', timeOptions);
      
      // Countdown ID
      const countdownId = `countdown-${event.id}`;
      
      // Event class based on visibility (để làm hiệu ứng show more)
      const eventClass = index >= this.settings.eventsLimit ? 'hidden-event' : '';
      
      return `
        <div class="timeline-event ${eventClass}" data-type="${event.type}">
          <div class="event-image">
            <img src="${event.imageUrl || `assets/promotions/${event.type}.jpg`}" alt="${event.title}">
            <div class="event-type ${event.type}">${this.getTypeLabel(event.type)}</div>
          </div>
          <div class="event-content">
            <div class="event-header">
              <div class="event-status ${statusClass}">${status}</div>
              <h4 class="event-title">${event.title}</h4>
            </div>
            <p class="event-description">${event.description}</p>
            <div class="event-time">
              <div class="time-row">
                <i class="far fa-calendar-alt"></i>
                <span>Bắt đầu: ${startDateStr} ${startTimeStr}</span>
              </div>
              <div class="time-row">
                <i class="far fa-calendar-check"></i>
                <span>Kết thúc: ${endDateStr} ${endTimeStr}</span>
              </div>
            </div>
            <div class="event-footer">
              <div class="event-countdown" id="${countdownId}">
                <div class="countdown-label">
                  ${now < startDate ? 'Bắt đầu sau:' : (now <= endDate ? 'Kết thúc sau:' : 'Đã kết thúc')}
                </div>
                <div class="countdown-timer">
                  <span class="countdown-days">00</span>:
                  <span class="countdown-hours">00</span>:
                  <span class="countdown-minutes">00</span>:
                  <span class="countdown-seconds">00</span>
                </div>
              </div>
              <a href="${event.url}" class="event-link">
                ${now <= endDate ? 'Xem ngay' : 'Chi tiết'} <i class="fas fa-chevron-right"></i>
              </a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  /**
   * Lấy nhãn cho loại sự kiện
   */
  getTypeLabel(type) {
    const labels = {
      'flash-sale': 'Flash Sale',
      'promotion': 'Khuyến mãi',
      'special': 'Đặc biệt',
      'clearance': 'Xả kho',
      'new-arrival': 'Sản phẩm mới'
    };
    
    return labels[type] || 'Khuyến mãi';
  },
  
  /**
   * Bắt đầu đếm ngược cho các sự kiện
   */
  startCountdowns() {
    this.events.forEach(event => {
      const countdownId = `countdown-${event.id}`;
      const countdownEl = document.getElementById(countdownId);
      
      if (!countdownEl) return;
      
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      const now = new Date();
      
      // Chọn thời gian kết thúc cho đếm ngược
      const targetDate = now < startDate ? startDate : endDate;
      
      // Nếu sự kiện đã kết thúc, không cần đếm ngược
      if (now > endDate) {
        countdownEl.querySelector('.countdown-timer').innerHTML = 'Đã kết thúc';
        return;
      }
      
      // Cập nhật đếm ngược mỗi giây
      const updateCountdown = () => {
        const currentTime = new Date();
        const diff = targetDate - currentTime;
        
        if (diff <= 0) {
          // Nếu đếm ngược kết thúc, tải lại trang sau 2s
          setTimeout(() => this.renderTimeline(), 2000);
          return;
        }
        
        // Tính toán thời gian còn lại
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        // Cập nhật hiển thị
        const daysEl = countdownEl.querySelector('.countdown-days');
        const hoursEl = countdownEl.querySelector('.countdown-hours');
        const minutesEl = countdownEl.querySelector('.countdown-minutes');
        const secondsEl = countdownEl.querySelector('.countdown-seconds');
        
        if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
      };
      
      // Cập nhật ngay lập tức
      updateCountdown();
      
      // Sau đó cập nhật mỗi giây
      const intervalId = setInterval(updateCountdown, 1000);
      
      // Lưu interval ID để có thể clear khi cần
      countdownEl.dataset.intervalId = intervalId;
    });
  },
  
  /**
   * Lọc sự kiện theo loại
   */
  filterEvents(filter) {
    const container = document.querySelector(this.settings.containerSelector);
    if (!container) return;
    
    const events = container.querySelectorAll('.timeline-event');
    events.forEach(event => {
      const eventType = event.getAttribute('data-type');
      
      if (filter === 'all' || filter === eventType) {
        event.style.display = '';
      } else {
        event.style.display = 'none';
      }
    });
  },
  
  /**
   * Chuyển đổi hiển thị sự kiện (xem thêm / thu gọn)
   */
  toggleShowMore(button) {
    const container = document.querySelector(this.settings.containerSelector);
    if (!container) return;
    
    const hiddenEvents = container.querySelectorAll('.timeline-event.hidden-event');
    
    if (hiddenEvents.length > 0) {
      hiddenEvents.forEach(event => {
        event.classList.remove('hidden-event');
        event.classList.add('visible-event');
      });
      
      button.innerHTML = 'Thu gọn <i class="fas fa-chevron-up"></i>';
    } else {
      const visibleEvents = container.querySelectorAll('.timeline-event.visible-event');
      
      visibleEvents.forEach(event => {
        event.classList.remove('visible-event');
        event.classList.add('hidden-event');
      });
      
      button.innerHTML = 'Xem thêm <i class="fas fa-chevron-down"></i>';
    }
  },
  
  /**
   * Bắt đầu tự động cuộn
   */
  startAutoScroll() {
    const container = document.querySelector('.promo-timeline-scroll');
    if (!container) return;
    
    this.stopAutoScroll(); // Dừng timer cũ nếu có
    
    this.settings.scrollTimer = setInterval(() => {
      // Cuộn nhẹ nhàng xuống dưới
      container.scrollBy({ top: 1, behavior: 'smooth' });
      
      // Nếu đã cuộn đến cuối, quay lại đầu
      if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  },
  
  /**
   * Dừng tự động cuộn
   */
  stopAutoScroll() {
    if (this.settings.scrollTimer) {
      clearInterval(this.settings.scrollTimer);
      this.settings.scrollTimer = null;
    }
  },
  
  /**
   * Cập nhật giao diện timeline theo theme
   */
  updateTimelineAppearance(mode) {
    const container = document.querySelector(this.settings.containerSelector);
    if (!container) return;
    
    if (mode === 'dark') {
      container.classList.add('dark-theme');
    } else {
      container.classList.remove('dark-theme');
    }
  }
};

// Khởi tạo khi trang tải xong
document.addEventListener('DOMContentLoaded', function() {
  // Tạo container cho timeline nếu chưa có
  if (!document.querySelector('.promo-timeline-container')) {
    const timelineSection = document.createElement('section');
    timelineSection.className = 'promo-timeline-section';
    timelineSection.innerHTML = `
      <div class="container">
        <div class="promo-timeline-container"></div>
      </div>
    `;
    
    // Chèn vào trước phần Comments
    const commentsSection = document.querySelector('.comments-section');
    if (commentsSection) {
      commentsSection.parentNode.insertBefore(timelineSection, commentsSection);
    } else {
      // Hoặc chèn vào cuối main
      const mainContent = document.querySelector('main');
      if (mainContent) {
        mainContent.appendChild(timelineSection);
      }
    }
  }
  
  // Khởi tạo timeline
  PromoTimeline.initialize();
});

// Export để sử dụng từ bên ngoài
window.PromoTimeline = PromoTimeline;