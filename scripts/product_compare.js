

const ProductCompare = {
  // Maximum products to compare
  maxProducts: 4,

  // Initialize comparison module
  init: function () {
    this.loadCompareList();
    this.renderCompareIndicator();
    this.bindEvents();
    this.updateCompareCount();
    this.setupFixedCompareButton();
    this.setupFloatingCompareButton();
  },

  // Get products from localStorage
  getCompareList: function () {
    try {
      return JSON.parse(localStorage.getItem('compareList')) || [];
    } catch (error) {
      console.error('Error parsing compare list from localStorage:', error);
      return [];
    }
  },

  // Save products to localStorage
  saveCompareList: function (list) {
    try {
      localStorage.setItem('compareList', JSON.stringify(list));
    } catch (error) {
      console.error('Error saving compare list to localStorage:', error);
    }
  },

  // Load comparison list from localStorage
  loadCompareList: function () {
    const compareList = this.getCompareList();
    this.updateCompareUI(compareList);
  },

  // Update compare count in navbar, fixed button and floating button
  updateCompareCount: function () {
    const compareList = this.getCompareList();

    // Cập nhật badge trong thanh điều hướng
    const compareCount = document.getElementById('compareCount');
    if (compareCount) {
      compareCount.textContent = compareList.length;
    }

    // Cập nhật badge trong nút cố định
    const compareCountFixed = document.getElementById('compareCountFixed');
    if (compareCountFixed) {
      compareCountFixed.textContent = compareList.length;
      compareCountFixed.classList.toggle('visible', compareList.length > 0);
    }

    // Cập nhật badge trong nút nổi
    const floatingCount = document.querySelector('#CompareBtn .compare-count');
    if (floatingCount) {
      const prevCount = parseInt(floatingCount.dataset.prevCount || '0');
      floatingCount.textContent = compareList.length;
      floatingCount.classList.toggle('visible', compareList.length > 0);

      // Thêm hiệu ứng pulse khi số lượng tăng
      if (compareList.length > prevCount) {
        const compareBtn = document.getElementById('CompareBtn');
        if (compareBtn) {
          compareBtn.classList.add('pulse');
          setTimeout(() => {
            compareBtn.classList.remove('pulse');
          }, 500);
        }
      }
      floatingCount.dataset.prevCount = compareList.length.toString();
    }
  },

  // Thiết lập sự kiện cho nút cố định
  setupFixedCompareButton: function () {
    const fixedCompareBtn = document.getElementById('fixedCompareBtn');
    if (fixedCompareBtn) {
      fixedCompareBtn.addEventListener('click', () => {
        this.goToComparePage();
      });
    }
  },

  // Thiết lập sự kiện cho nút nổi
  setupFloatingCompareButton: function () {
    const floatingBtn = document.getElementById('CompareBtn');
    if (floatingBtn) {
      // Cập nhật số lượng ban đầu
      const compareList = this.getCompareList();
      const countElement = floatingBtn.querySelector('.compare-count');
      if (countElement) {
        countElement.textContent = compareList.length;
        countElement.classList.toggle('visible', compareList.length > 0);
        countElement.dataset.prevCount = compareList.length.toString();
      }

      // Thêm sự kiện click
      floatingBtn.addEventListener('click', () => {
        this.goToComparePage();
      });
    }
  },

  // Toggle product in comparison list
  toggleProduct: function (productId, productName, productImage, productPrice) {
    let compareList = this.getCompareList();
    const existingIndex = compareList.findIndex(item => item.id === productId);

    if (existingIndex !== -1) {
      // Remove product from comparison
      compareList.splice(existingIndex, 1);
      this.saveCompareList(compareList);
      this.showToast(`${productName} đã được xóa khỏi danh sách so sánh`, 'info');
    } else {
      // Add product to comparison
      if (compareList.length >= this.maxProducts) {
        this.showToast(`Chỉ có thể so sánh tối đa ${this.maxProducts} sản phẩm. Vui lòng xóa bớt sản phẩm.`, 'warning');
        return;
      }

      compareList.push({
        id: productId,
        name: productName,
        image: productImage,
        price: productPrice
      });

      this.saveCompareList(compareList);
      this.showToast(`${productName} đã được thêm vào danh sách so sánh`, 'success');
    }

    this.updateCompareUI(compareList);
    this.updateCompareCount();
  },

  // Update comparison UI elements
  updateCompareUI: function (compareList) {
    // Update compare buttons state
    document.querySelectorAll('.compare-btn').forEach(btn => {
      const productId = btn.getAttribute('data-product-id');
      const isInCompare = compareList.some(item => item.id === productId);
      const icon = btn.querySelector('i');
      
      if (isInCompare) {
        btn.classList.add('active');
        if (icon) {
          icon.classList.remove('fa-plus', 'fa-balance-scale');
          icon.classList.add('fa-check');
        }
      } else {
        btn.classList.remove('active');
        if (icon) {
          icon.classList.remove('fa-check');
          if (btn.classList.contains('action-btn')) {
            icon.classList.add('fa-balance-scale');
          } else {
            icon.classList.add('fa-plus');
          }
        }
      }
    });

    // Update compare bar visibility
    const compareBar = document.getElementById('compareBar');
    if (compareBar) {
      compareBar.classList.toggle('visible', compareList.length > 0);
    }

    this.renderCompareItems(compareList);
  },

  // Render compare items in the comparison bar
  renderCompareItems: function (compareList) {
    const compareItems = document.getElementById('compareItems');
    if (!compareItems) return;

    compareItems.innerHTML = '';

    // Render sản phẩm đã thêm
    compareList.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'compare-item';
      itemEl.innerHTML = `
        <div class="compare-item-image">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
          <button class="remove-compare-item" data-product-id="${item.id}" title="Xóa khỏi so sánh">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="compare-item-name">${item.name}</div>
      `;
      
      // Add event listener for remove button
      const removeBtn = itemEl.querySelector('.remove-compare-item');
      removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeCompareItem(item.id, item.name);
      });
      
      compareItems.appendChild(itemEl);
    });

    // Render placeholder
    const placeholdersToAdd = this.maxProducts - compareList.length;
    for (let i = 0; i < placeholdersToAdd; i++) {
      const placeholder = document.createElement('div');
      placeholder.className = 'compare-item compare-placeholder';
      placeholder.innerHTML = `
        <div class="compare-item-image placeholder-image">
          <i class="fas fa-plus-circle"></i>
        </div>
        <div class="compare-item-name">Thêm sản phẩm</div>
      `;
      compareItems.appendChild(placeholder);
    }
  },

  // Remove a product from comparison
  removeCompareItem: function (productId, productName) {
    let compareList = this.getCompareList();
    compareList = compareList.filter(item => item.id !== productId);
    this.saveCompareList(compareList);
    this.updateCompareUI(compareList);
    this.updateCompareCount();
    this.showToast(`${productName} đã được xóa khỏi danh sách so sánh`, 'info');
  },

  // Clear all products from comparison
  clearCompareList: function () {
    this.saveCompareList([]);
    this.updateCompareUI([]);
    this.updateCompareCount();
    this.showToast('Đã xóa tất cả sản phẩm khỏi danh sách so sánh', 'info');
  },

  // Show comparison popup
  goToComparePage: function () {
    const compareList = this.getCompareList();
    if (compareList.length < 2) {
      this.showToast('Vui lòng chọn ít nhất 2 sản phẩm để so sánh', 'warning');
      return;
    }

    // Create modal if it doesn't exist
    let compareModal = document.getElementById('compareModal');
    if (!compareModal) {
      this.createCompareModal();
      compareModal = document.getElementById('compareModal');
    }

    if (compareModal) {
      compareModal.classList.add('active');
      document.body.classList.add('modal-open');
      this.showComparePopup(compareList);
    }
  },

  // Create compare modal if it doesn't exist
  createCompareModal: function () {
    const modalHTML = `
      <div id="compareModal" class="compare-modal">
        <div class="compare-modal-overlay"></div>
        <div class="compare-modal-container">
          <div class="compare-modal-header">
            <h3><i class="fas fa-balance-scale me-2"></i>So sánh sản phẩm</h3>
            <button id="closeCompareModal" class="close-modal-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="compare-modal-body">
            <div id="compareModalContent">
              <div class="text-center p-4">
                <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add CSS styles
    this.addCompareModalStyles();

    // Add event listeners
    const closeBtn = document.getElementById('closeCompareModal');
    const overlay = document.querySelector('.compare-modal-overlay');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeCompareModal());
    }
    
    if (overlay) {
      overlay.addEventListener('click', () => this.closeCompareModal());
    }

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeCompareModal();
      }
    });
  },

  // Close compare modal
  closeCompareModal: function () {
    const compareModal = document.getElementById('compareModal');
    if (compareModal) {
      compareModal.classList.remove('active');
      document.body.classList.remove('modal-open');
    }
  },

  // Add CSS styles for compare modal
  addCompareModalStyles: function () {
    if (document.getElementById('compareModalStyles')) return;

    const styles = `
      <style id="compareModalStyles">
        .compare-modal {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100vh;
          z-index: 9999;
        }

        .compare-modal.active {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .compare-modal-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(5px);
        }

        .compare-modal-container {
          position: relative;
          background: white;
          border-radius: 12px;
          max-width: 95vw;
          max-height: 90vh;
          width: 1200px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          overflow: hidden;
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .compare-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .compare-modal-header h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: #333;
        }

        .close-modal-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #666;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .close-modal-btn:hover {
          background: #e9ecef;
          color: #333;
        }

        .compare-modal-body {
          padding: 0;
          max-height: calc(90vh - 80px);
          overflow-y: auto;
        }

        .compare-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }

        .compare-row {
          display: flex;
          border-bottom: 1px solid #e9ecef;
        }

        .compare-row:last-child {
          border-bottom: none;
        }

        .compare-cell {
          flex: 1;
          padding: 16px;
          border-right: 1px solid #e9ecef;
          min-height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .compare-cell:last-child {
          border-right: none;
        }

        .compare-label {
          background: #f8f9fa;
          font-weight: 600;
          color: #495057;
          flex: 0 0 200px;
          justify-content: flex-start;
          text-align: left;
        }

        .compare-header {
          background: #fff;
          border-bottom: 2px solid #dee2e6;
        }

        .compare-header .compare-cell {
          flex-direction: column;
          padding: 20px 16px;
        }

        .compare-product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 12px;
          border: 1px solid #e9ecef;
        }

        .compare-product-name {
          font-weight: 600;
          font-size: 0.9rem;
          color: #333;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .remove-compare-item {
          font-size: 0.8rem;
          padding: 4px 8px;
        }

        body.modal-open {
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .compare-modal-container {
            width: 95vw;
            max-height: 95vh;
          }

          .compare-cell {
            padding: 12px 8px;
            font-size: 0.85rem;
          }

          .compare-label {
            flex: 0 0 120px;
            font-size: 0.8rem;
          }

          .compare-product-image {
            width: 60px;
            height: 60px;
          }

          .compare-product-name {
            font-size: 0.8rem;
          }
        }
      </style>
    `;

    document.head.insertAdjacentHTML('beforeend', styles);
  },

  // Hiển thị bảng so sánh trong popup
  showComparePopup: async function (compareList) {
    const modalContent = document.getElementById('compareModalContent');
    if (!modalContent) return;

    // Show loading state
    modalContent.innerHTML = '<div class="text-center p-4"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</div>';

    try {
      const detailedProducts = await this.fetchProductDetails(compareList);
      if (!detailedProducts || detailedProducts.length === 0) {
        modalContent.innerHTML = '<div class="text-center p-4">Không thể tải dữ liệu sản phẩm để so sánh.</div>';
        return;
      }

      let html = '<div class="compare-table">';

      // Header row with product images and names
      html += '<div class="compare-row compare-header">';
      html += '<div class="compare-cell"></div>';
      detailedProducts.forEach(product => {
        html += `
          <div class="compare-cell">
            <img src="${product.images?.[0]?.url || product.defaultImage}" alt="${product.name}" class="compare-product-image" onerror="this.src='images/placeholder.jpg'">
            <div class="compare-product-name">${product.name}</div>
            <button class="remove-compare-item btn btn-sm btn-outline-danger" data-product-id="${product.id}">
              <i class="fas fa-times"></i> Xóa
            </button>
          </div>
        `;
      });
      html += '</div>';

      // Price row
      html += '<div class="compare-row">';
      html += '<div class="compare-cell compare-label">Giá</div>';
      detailedProducts.forEach(product => {
        html += `
          <div class="compare-cell">
            <strong>${this.formatCurrency(product.price)}</strong>
          </div>
        `;
      });
      html += '</div>';

      // Specification rows
      const attributes = this.getCompareAttributes(detailedProducts);
      attributes.forEach(attr => {
        html += '<div class="compare-row">';
        html += `<div class="compare-cell compare-label">${attr}</div>`;
        detailedProducts.forEach(product => {
          const value = this.getAttributeValue(product, attr);
          html += `<div class="compare-cell">${value || 'N/A'}</div>`;
        });
        html += '</div>';
      });

      html += '</div>';
      modalContent.innerHTML = html;

      // Add event listeners for remove buttons
      modalContent.querySelectorAll('.remove-compare-item').forEach(button => {
        button.addEventListener('click', (e) => {
          const productId = e.currentTarget.dataset.productId;
          const product = detailedProducts.find(item => item.id === productId);
          this.removeCompareItem(productId, product?.name || 'Sản phẩm');
          
          const updatedList = this.getCompareList();
          if (updatedList.length < 2) {
            this.closeCompareModal();
          } else {
            this.showComparePopup(updatedList);
          }
        });
      });

    } catch (error) {
      console.error('Error showing compare popup:', error);
      modalContent.innerHTML = '<div class="text-center p-4 text-danger">Có lỗi xảy ra khi tải dữ liệu so sánh.</div>';
    }
  },

  // Lấy dữ liệu chi tiết sản phẩm từ product.json
  fetchProductDetails: async function (compareList) {
    try {
      const response = await fetch('data/product.json');
      if (!response.ok) throw new Error('Không thể tải dữ liệu sản phẩm');

      const data = await response.json();
      const detailedProducts = [];

      for (const item of compareList) {
        let foundProduct = null;
        
        // Search through all categories
        for (const category of data.categories) {
          foundProduct = category.products.find(p => {
            const productId = p.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
            return productId === item.id;
          });
          
          if (foundProduct) {
            foundProduct = this.transformProductData(foundProduct, category);
            detailedProducts.push(foundProduct);
            break;
          }
        }
        
        // If product not found, add basic info from compareList
        if (!foundProduct) {
          detailedProducts.push({
            id: item.id,
            name: item.name,
            price: this.parseCurrency(item.price),
            images: [{ url: item.image, alt: item.name }],
            defaultImage: item.image,
            specs: {}
          });
        }
      }

      return detailedProducts;
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
      return [];
    }
  },

  // Transform product data to standardized format
  transformProductData: function (product, category) {
    const transformed = {
      id: product.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase(),
      name: product.name,
      category: category.id,
      categoryName: this.getCategoryDisplayName(category.id),
      description: product.description,
      specs: product.specs || {},
      images: [],
      configurations: product.configurations || {},
      accessories: product.accessories || [],
      promotions: product.promotions || [],
      defaultImage: product.defaultImage
    };

    // Handle images
    if (product.images && product.configurations) {
      const allImages = [];
      Object.keys(product.configurations).forEach(storage => {
        Object.keys(product.configurations[storage]).forEach(color => {
          if (product.images[storage] && product.images[storage][color]) {
            allImages.push({
              url: product.images[storage][color],
              storage: storage,
              color: color,
              alt: `${product.name} ${storage} ${color}`
            });
          }
        });
      });
      transformed.images = allImages.length > 0 ? allImages : [{ url: product.defaultImage, alt: product.name }];
    } else {
      transformed.images = [{ url: product.defaultImage, alt: product.name }];
    }

    // Handle pricing
    if (product.configurations && Object.keys(product.configurations).length > 0) {
      const firstStorage = Object.keys(product.configurations)[0];
      const firstColor = Object.keys(product.configurations[firstStorage])[0];
      const defaultConfig = product.configurations[firstStorage][firstColor];

      transformed.price = defaultConfig.price;
      transformed.originalPrice = defaultConfig.originalPrice;
      transformed.discount = defaultConfig.discount;
    } else {
      transformed.price = 0;
    }

    return transformed;
  },

  // Get category display name
  getCategoryDisplayName: function (categoryId) {
    const categoryNames = {
      'iphone': 'iPhone',
      'ipad': 'iPad',
      'macbook': 'MacBook',
      'applewatch': 'Apple Watch',
      'airpod': 'AirPods',
      'phukien': 'Phụ kiện'
    };
    return categoryNames[categoryId] || categoryId;
  },

  // Lấy danh sách các thuộc tính để so sánh
  getCompareAttributes: function (products) {
    const attributesSet = new Set();

    products.forEach(product => {
      if (product.specs) {
        Object.keys(product.specs).forEach(group => {
          if (typeof product.specs[group] === 'object' && product.specs[group] !== null) {
            Object.keys(product.specs[group]).forEach(attr => {
              attributesSet.add(`${group}: ${attr}`);
            });
          }
        });
      }
    });

    return Array.from(attributesSet).sort();
  },

  // Lấy giá trị của một thuộc tính cho sản phẩm
  getAttributeValue: function (product, attr) {
    const [group, key] = attr.split(': ');
    if (product.specs && product.specs[group] && product.specs[group][key]) {
      const value = product.specs[group][key];
      return Array.isArray(value) ? value.join(', ') : value;
    }
    return null;
  },

  // Parse currency string to number
  parseCurrency: function (currencyString) {
    if (typeof currencyString === 'number') return currencyString;
    if (typeof currencyString === 'string') {
      return parseInt(currencyString.replace(/[^\d]/g, '')) || 0;
    }
    return 0;
  },

  // Định dạng tiền tệ
  formatCurrency: function (amount) {
    if (typeof amount === 'string') {
      amount = this.parseCurrency(amount);
    }
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  },

  // Render compare indicator
  renderCompareIndicator: function () {
    if (document.getElementById('compareBar')) return;

    const compareBar = document.createElement('div');
    compareBar.id = 'compareBar';
    compareBar.className = 'compare-bar';
    compareBar.innerHTML = `
      <div class="container">
        <div class="compare-bar-content">
          <div class="compare-bar-title">
            <i class="fas fa-balance-scale me-2"></i>
            So sánh (<span id="compareCount">0</span>)
          </div>
          <div class="compare-items" id="compareItems"></div>
          <div class="compare-actions">
            <button id="clearCompareBtn" class="btn btn-sm btn-outline-light">
              <i class="fas fa-trash me-2"></i>Xóa tất cả
            </button>
            <button id="goCompareBtn" class="btn btn-sm btn-light">
              <i class="fas fa-balance-scale me-2"></i>So sánh ngay
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(compareBar);

    // Add event listeners
    document.getElementById('clearCompareBtn').addEventListener('click', () => this.clearCompareList());
    document.getElementById('goCompareBtn').addEventListener('click', () => this.goToComparePage());

    this.renderCompareItems(this.getCompareList());
  },

  // Add compare button to product card
  addCompareButton: function (productCard, productId, productName, productImage, productPrice) {
    // Check if button already exists
    if (productCard.querySelector('.compare-btn')) return;

    const compareBtn = document.createElement('div');
    compareBtn.className = 'compare-btn';
    compareBtn.setAttribute('data-product-id', productId);
    compareBtn.innerHTML = '<i class="fas fa-plus"></i>';
    compareBtn.title = 'Thêm vào so sánh';

    const compareList = this.getCompareList();
    if (compareList.some(item => item.id === productId)) {
      compareBtn.classList.add('active');
      compareBtn.querySelector('i').classList.remove('fa-plus');
      compareBtn.querySelector('i').classList.add('fa-check');
    }

    compareBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleProduct(productId, productName, productImage, productPrice);
    });

    const imageContainer = productCard.querySelector('.product-image-container');
    if (imageContainer) {
      imageContainer.appendChild(compareBtn);
    }
  },

  // Add compare button to product detail page
  addCompareButtonToDetail: function (productId, productName, productImage, productPrice) {
    const actionBtns = document.querySelector('.additional-actions');
    if (!actionBtns) return;

    // Check if button already exists
    if (actionBtns.querySelector('.compare-btn')) return;

    const compareBtn = document.createElement('button');
    compareBtn.className = 'action-btn compare-btn';
    compareBtn.setAttribute('data-product-id', productId);

    const compareList = this.getCompareList();
    const isInCompare = compareList.some(item => item.id === productId);

    compareBtn.innerHTML = `
      <i class="${isInCompare ? 'fas fa-check' : 'fas fa-balance-scale'}"></i>
      ${isInCompare ? 'Đã thêm vào so sánh' : 'So sánh'}
    `;

    if (isInCompare) {
      compareBtn.classList.add('active');
    }

    compareBtn.addEventListener('click', () => {
      this.toggleProduct(productId, productName, productImage, productPrice);

      const isNowInCompare = this.getCompareList().some(item => item.id === productId);
      compareBtn.innerHTML = `
        <i class="${isNowInCompare ? 'fas fa-check' : 'fas fa-balance-scale'}"></i>
        ${isNowInCompare ? 'Đã thêm vào so sánh' : 'So sánh'}
      `;

      compareBtn.classList.toggle('active', isNowInCompare);
    });

    actionBtns.appendChild(compareBtn);
  },

  // Bind events
  bindEvents: function () {
    document.querySelectorAll('.product-card').forEach(card => {
      const productId = card.getAttribute('data-product-id');
      const productName = card.querySelector('.product-title')?.textContent?.trim();
      const productImage = card.querySelector('.product-image')?.src;
      const productPriceElement = card.querySelector('.product-price');
      const productPrice = productPriceElement?.textContent?.trim() || productPriceElement?.getAttribute('data-price');

      if (productId && productName && productImage && productPrice) {
        this.addCompareButton(card, productId, productName, productImage, productPrice);
      }
    });
  },

  // Show toast notification
  showToast: function (message, type = 'success') {
    // Use existing toast function if available
    if (typeof window.showToast === 'function') {
      window.showToast(message, type);
      return;
    }

    // Create our own toast
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = (hours % 12) || 12;
    const daysOfWeek = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
    const dayOfWeek = daysOfWeek[now.getDay()];
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const dateTimeString = `${formattedHours}:${minutes} ${ampm} +07, ${dayOfWeek}, ${day}/${month}/${year}`;

    const typeClass = type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'info';
    
    const toastHTML = `
      <div class="toast-notification">
        <div class="toast show align-items-center text-white bg-${typeClass} border-0" role="alert">
          <div class="d-flex">
            <div class="toast-body">
              ${message}
              <div class="toast-datetime">${dateTimeString}</div>
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', toastHTML);

    // Auto remove toast
    const toastElement = document.querySelector('.toast-notification:last-child');
    const closeBtn = toastElement?.querySelector('.btn-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toastElement.remove();
      });
    }

    setTimeout(() => {
      if (toastElement && toastElement.parentNode) {
        toastElement.classList.add('fade-out');
        setTimeout(() => toastElement.remove(), 300);
      }
    }, 3000);
  }
};

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  ProductCompare.init();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProductCompare;
}