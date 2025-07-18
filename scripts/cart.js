class Cart {
  constructor() {
    this.cartSystem = {
      items: [],
      subtotal: 0,
      discount: 0,
      shipping: 0,
      coupon: null,
      total: 0,
      productDiscount: 0,
      version: '2.2'
    };

    this.productsCache = null;
    this.fetchPromise = null;

    this.config = {
      shippingThreshold: 500000,
      shippingFee: 30000,
      maxRetries: 3,
      retryDelay: 1000
    };

    // Initialize cart on construction
    this.loadCart();
  }

  // Helper to show toasts
  showToast(title, type = 'info', message = '') {
    const toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      console.warn('Toast container not found!');
      return;
    }

    const toastId = `toast-${Date.now()}`;
    const toastHtml = `
      <div id="${toastId}" class="toast toast-${type}">
        <div class="toast-content">
          <div class="toast-title">${title}</div>
          ${message ? `<div class="toast-message">${message}</div>` : ''}
        </div>
        <button class="toast-close">&times;</button>
      </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    const toastElement = document.getElementById(toastId);
    toastElement.style.display = 'flex';
    setTimeout(() => toastElement.classList.add('show'), 10);

    toastElement.querySelector('.toast-close').addEventListener('click', () => {
      toastElement.classList.remove('show');
      setTimeout(() => toastElement.remove(), 300);
    });

    setTimeout(() => {
      toastElement.classList.remove('show');
      setTimeout(() => toastElement.remove(), 300);
    }, 5000);
  }

  // Helper for formatting currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  // Load cart from localStorage
  loadCart() {
    try {
      // Try to load from new cart system first
      const storedCart = localStorage.getItem('cartSystem');
      if (storedCart) {
        const parsedCart = JSON.parse(storedCart);
        this.cartSystem = { ...this.cartSystem, ...parsedCart };
      } else {
        // Migration from old cart system (navbar.js format)
        const oldCart = localStorage.getItem('cart');
        if (oldCart) {
          const oldCartItems = JSON.parse(oldCart);
          this.cartSystem.items = oldCartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.imageUrl || item.image,
            quantity: item.quantity || 1,
            storage: item.storage || 'Standard',
            color: item.color || 'Default'
          }));
          // Remove old cart and save new format
          localStorage.removeItem('cart');
          this.saveCart();
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      localStorage.removeItem('cartSystem');
      localStorage.removeItem('cart');
      this.cartSystem = {
        items: [],
        subtotal: 0,
        discount: 0,
        shipping: 0,
        coupon: null,
        total: 0,
        productDiscount: 0,
        version: '2.2'
      };
    }
    this.calculateCartTotals();
    this.triggerCartUpdate();
    this.renderCartItems();
    this.updateCartSummary();
  }

  // Save cart to localStorage
  saveCart() {
    try {
      localStorage.setItem('cartSystem', JSON.stringify(this.cartSystem));
      // Also maintain backward compatibility by saving in old format for navbar.js
      const legacyCart = this.cartSystem.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.image,
        quantity: item.quantity,
        storage: item.storage,
        color: item.color,
        timestamp: Date.now()
      }));
      localStorage.setItem('cart', JSON.stringify(legacyCart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
      this.showToast('Lỗi', 'error', 'Không thể lưu giỏ hàng. Vui lòng thử lại.');
    }
  }

  // Fetch product data from JSON file only
  async fetchProductData() {
    if (this.productsCache) {
      return this.productsCache;
    }
    if (this.fetchPromise) {
      return this.fetchPromise;
    }

    this.fetchPromise = new Promise(async (resolve, reject) => {
      for (let i = 0; i < this.config.maxRetries; i++) {
        try {
          const response = await fetch('data/product.json');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          this.productsCache = data;
          this.fetchPromise = null;
          resolve(data);
          return;
        } catch (error) {
          console.error(`Attempt ${i + 1} failed to fetch products:`, error);
          if (i < this.config.maxRetries - 1) {
            await new Promise(res => setTimeout(res, this.config.retryDelay));
          }
        }
      }
      this.fetchPromise = null;
      this.showToast('Lỗi', 'error', 'Không thể tải dữ liệu sản phẩm. Vui lòng tải lại trang.');
      reject(new Error('Failed to fetch product data after multiple retries.'));
    });
    return this.fetchPromise;
  }

  async findProductById(productId) {
    try {
      const products = await this.fetchProductData();
      
      // Handle product.json structure with categories
      if (products.categories) {
        for (const category of products.categories) {
          const product = category.products.find(p => 
            p.name === productId || 
            p.name.toLowerCase().replace(/\s+/g, '-') === productId ||
            p.id === productId
          );
          if (product) {
            return {
              id: product.name.toLowerCase().replace(/\s+/g, '-'),
              name: product.name,
              price: this.getProductPrice(product),
              image: product.defaultImage || product.image,
              stock: product.stock,
              configurations: product.configurations
            };
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error finding product:', error);
      return null;
    }
  }

  getProductPrice(product) {
    if (product.configurations) {
      const firstStorage = Object.keys(product.configurations)[0];
      const firstColor = Object.keys(product.configurations[firstStorage])[0];
      return product.configurations[firstStorage][firstColor].price;
    }
    return product.price || 0;
  }

  async addToCart(productId, quantity = 1) {
    if (quantity <= 0) {
      this.showToast('Lỗi', 'warning', 'Số lượng sản phẩm phải lớn hơn 0.');
      return;
    }

    try {
      const product = await this.findProductById(productId);

      if (!product) {
        this.showToast('Lỗi', 'error', 'Sản phẩm không tìm thấy.');
        return;
      }

      const existingItem = this.cartSystem.items.find(item => item.id === productId);

      if (existingItem) {
        const newQuantity = parseInt(existingItem.quantity) + parseInt(quantity);
        if (product.stock !== undefined && newQuantity > product.stock) {
          this.showToast('Lỗi', 'warning', `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho.`);
          return;
        }
        existingItem.quantity = newQuantity;
      } else {
        if (product.stock !== undefined && quantity > product.stock) {
          this.showToast('Lỗi', 'warning', `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho.`);
          return;
        }
        this.cartSystem.items.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: parseInt(quantity),
          storage: 'Standard',
          color: 'Default'
        });
      }

      this.calculateCartTotals();
      this.saveCart();
      this.triggerCartUpdate();
      this.renderCartItems();
      this.updateCartSummary();
      this.showToast('Thành công', 'success', `Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng.`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      this.showToast('Lỗi', 'error', 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  }

  removeItem(productId) {
    const initialLength = this.cartSystem.items.length;
    this.cartSystem.items = this.cartSystem.items.filter(item => item.id !== productId);

    if (this.cartSystem.items.length < initialLength) {
      this.calculateCartTotals();
      this.saveCart();
      this.triggerCartUpdate();
      this.renderCartItems();
      this.updateCartSummary();
      this.showToast('Thành công', 'success', 'Sản phẩm đã được xóa khỏi giỏ hàng.');
    } else {
      this.showToast('Thông báo', 'info', 'Không tìm thấy sản phẩm để xóa.');
    }
  }

  async updateQuantity(productId, newQuantity) {
    newQuantity = parseInt(newQuantity);
    if (isNaN(newQuantity) || newQuantity <= 0) {
      this.showToast('Lỗi', 'warning', 'Số lượng không hợp lệ.');
      return;
    }

    const itemToUpdate = this.cartSystem.items.find(item => item.id === productId);

    if (itemToUpdate) {
      try {
        const product = await this.findProductById(productId);
        if (product && product.stock !== undefined && newQuantity > product.stock) {
          this.showToast('Lỗi', 'warning', `Sản phẩm "${product.name}" chỉ còn ${product.stock} sản phẩm trong kho.`);
          return;
        }

        itemToUpdate.quantity = newQuantity;
        this.calculateCartTotals();
        this.saveCart();
        this.triggerCartUpdate();
        this.renderCartItems();
        this.updateCartSummary();
        this.showToast('Thành công', 'success', `Số lượng sản phẩm "${itemToUpdate.name}" đã được cập nhật.`);
      } catch (error) {
        console.error("Error updating quantity:", error);
        this.showToast('Lỗi', 'error', 'Không thể cập nhật số lượng sản phẩm.');
      }
    } else {
      this.showToast('Thông báo', 'info', 'Không tìm thấy sản phẩm trong giỏ hàng để cập nhật.');
    }
  }

  clearCart() {
    if (this.cartSystem.items.length === 0) {
      this.showToast('Thông báo', 'info', 'Giỏ hàng của bạn đã trống.');
      return;
    }
    this.cartSystem.items = [];
    this.cartSystem.coupon = null;
    this.calculateCartTotals();
    this.saveCart();
    this.triggerCartUpdate();
    this.renderCartItems();
    this.updateCartSummary();
    this.showToast('Thành công', 'success', 'Giỏ hàng đã được làm trống.');
  }

  // Coupon logic - simplified for demo
  async applyCoupon(couponCode) {
    if (couponCode === 'SAVE10') {
      this.cartSystem.coupon = { code: 'SAVE10', discountValue: 0.1 };
      this.calculateCartTotals();
      this.saveCart();
      this.triggerCartUpdate();
      this.renderCartItems();
      this.updateCartSummary();
      this.showToast('Thành công', 'success', 'Mã giảm giá SAVE10 đã được áp dụng (giảm 10%).');
      const removeCouponBtn = document.getElementById('remove-coupon-btn');
      if (removeCouponBtn) removeCouponBtn.classList.remove('d-none');
    } else {
      this.showToast('Lỗi', 'error', 'Mã giảm giá không hợp lệ.');
    }
  }

  removeCoupon() {
    if (this.cartSystem.coupon) {
      this.cartSystem.coupon = null;
      this.calculateCartTotals();
      this.saveCart();
      this.triggerCartUpdate();
      this.renderCartItems();
      this.updateCartSummary();
      this.showToast('Thành công', 'success', 'Mã giảm giá đã được gỡ bỏ.');
      const removeCouponBtn = document.getElementById('remove-coupon-btn');
      const couponInput = document.getElementById('coupon-code-input');
      if (removeCouponBtn) removeCouponBtn.classList.add('d-none');
      if (couponInput) couponInput.value = '';
    } else {
      this.showToast('Thông báo', 'info', 'Không có mã giảm giá nào được áp dụng.');
    }
  }

  calculateCartTotals() {
    this.cartSystem.subtotal = this.cartSystem.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.cartSystem.productDiscount = 0;

    // Apply coupon discount
    let totalDiscount = 0;
    if (this.cartSystem.coupon && this.cartSystem.coupon.discountValue) {
      totalDiscount = this.cartSystem.subtotal * this.cartSystem.coupon.discountValue;
    }
    this.cartSystem.discount = totalDiscount + this.cartSystem.productDiscount;

    // Calculate shipping
    this.cartSystem.shipping = (this.cartSystem.subtotal >= this.config.shippingThreshold) ? 0 : this.config.shippingFee;

    this.cartSystem.total = this.cartSystem.subtotal - this.cartSystem.discount + this.cartSystem.shipping;
  }

  proceedToCheckout() {
    if (this.cartSystem.items.length === 0) {
      this.showToast('Thông báo', 'info', 'Giỏ hàng của bạn đang trống. Vui lòng thêm sản phẩm để thanh toán.');
      return;
    }
    this.showToast('Chuyển hướng', 'info', 'Đang chuyển đến trang thanh toán...');
    setTimeout(() => {
      window.location.href = 'checkout.html';
    }, 1500);
  }

  // Update cart badge (for navbar compatibility)
  updateCartBadge(count) {
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
      cartBadge.textContent = count;
      cartBadge.style.display = count > 0 ? 'flex' : 'none';
    }

    // Also update other cart count elements
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
      cartCount.textContent = count;
    }
  }

  // Trigger cart update event
  triggerCartUpdate() {
    const totalItems = this.cartSystem.items.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);
    
    // Update cart badge
    this.updateCartBadge(totalItems);

    // Dispatch custom event for other components
    const event = new CustomEvent('cartUpdated', {
      detail: {
        count: totalItems,
        total: this.cartSystem.total,
        cart: { ...this.cartSystem }
      }
    });
    window.dispatchEvent(event);
  }

  // Get cart state
  getCart() {
    return { ...this.cartSystem };
  }

  // --- Cart Page Rendering Methods ---

  renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const clearCartBtn = document.getElementById('clear-cart-btn');

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = '';

    if (this.cartSystem.items.length === 0) {
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'table-cell';
      } else {
        cartItemsContainer.innerHTML = '<tr><td colspan="5" class="text-center">Giỏ hàng của bạn đang trống.</td></tr>';
      }
      if (clearCartBtn) clearCartBtn.classList.add('d-none');
    } else {
      if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
      }
      if (clearCartBtn) clearCartBtn.classList.remove('d-none');

      this.cartSystem.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>
            <div class="cart-item-info">
              <img src="${item.image}" alt="${item.name}" class="cart-item-image">
              <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
              </div>
            </div>
          </td>
          <td>${this.formatCurrency(item.price)}</td>
          <td>
            <div class="quantity-controls">
              <button class="decrease-qty-btn" data-product-id="${item.id}">-</button>
              <input type="number" class="item-qty-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
              <button class="increase-qty-btn" data-product-id="${item.id}">+</button>
            </div>
          </td>
          <td>${this.formatCurrency(item.price * item.quantity)}</td>
          <td>
            <button class="remove-item-btn" data-product-id="${item.id}"><i class="fas fa-trash"></i></button>
          </td>
        `;
        cartItemsContainer.appendChild(row);
      });

      this.setupItemEventListeners();
    }
  }

  setupItemEventListeners() {
    document.querySelectorAll('.remove-item-btn').forEach(button => {
      button.onclick = (e) => {
        const productId = e.currentTarget.dataset.productId;
        this.removeItem(productId);
      };
    });

    document.querySelectorAll('.decrease-qty-btn').forEach(button => {
      button.onclick = (e) => {
        const productId = e.currentTarget.dataset.productId;
        const input = document.querySelector(`.item-qty-input[data-product-id="${productId}"]`);
        let newQty = parseInt(input.value) - 1;
        if (newQty < 1) newQty = 1;
        this.updateQuantity(productId, newQty);
      };
    });

    document.querySelectorAll('.increase-qty-btn').forEach(button => {
      button.onclick = (e) => {
        const productId = e.currentTarget.dataset.productId;
        const input = document.querySelector(`.item-qty-input[data-product-id="${productId}"]`);
        let newQty = parseInt(input.value) + 1;
        this.updateQuantity(productId, newQty);
      };
    });

    document.querySelectorAll('.item-qty-input').forEach(input => {
      input.onchange = (e) => {
        const productId = e.currentTarget.dataset.productId;
        let newQty = parseInt(e.currentTarget.value);
        if (isNaN(newQty) || newQty < 1) {
          newQty = 1;
          e.currentTarget.value = 1;
        }
        this.updateQuantity(productId, newQty);
      };
    });
  }

  updateCartSummary() {
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const shippingEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-total');
    const couponInput = document.getElementById('coupon-code-input');
    const removeCouponBtn = document.getElementById('remove-coupon-btn');

    if (subtotalEl) subtotalEl.textContent = this.formatCurrency(this.cartSystem.subtotal);
    if (discountEl) discountEl.textContent = this.formatCurrency(this.cartSystem.discount);
    if (shippingEl) shippingEl.textContent = this.formatCurrency(this.cartSystem.shipping);
    if (totalEl) totalEl.textContent = this.formatCurrency(this.cartSystem.total);

    if (couponInput && removeCouponBtn) {
      if (this.cartSystem.coupon) {
        couponInput.value = this.cartSystem.coupon.code;
        removeCouponBtn.classList.remove('d-none');
      } else {
        couponInput.value = '';
        removeCouponBtn.classList.add('d-none');
      }
    }
  }

  setupCartPageEventListeners() {
    // Clear Cart Button
    const clearCartBtn = document.getElementById('clear-cart-btn');
    if (clearCartBtn) {
      clearCartBtn.addEventListener('click', () => {
        if (confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
          this.clearCart();
        }
      });
    }

    // Apply Coupon Button
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    const couponCodeInput = document.getElementById('coupon-code-input');
    if (applyCouponBtn && couponCodeInput) {
      applyCouponBtn.addEventListener('click', () => {
        const couponCode = couponCodeInput.value.trim();
        if (couponCode) {
          this.applyCoupon(couponCode);
        } else {
          this.showToast('Thông báo', 'info', 'Vui lòng nhập mã giảm giá.');
        }
      });
    }

    // Remove Coupon Button
    const removeCouponBtn = document.getElementById('remove-coupon-btn');
    if (removeCouponBtn) {
      removeCouponBtn.addEventListener('click', () => {
        this.removeCoupon();
      });
    }

    // Proceed to Checkout Button
    const proceedToCheckoutBtn = document.getElementById('proceed-to-checkout-btn');
    if (proceedToCheckoutBtn) {
      proceedToCheckoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.proceedToCheckout();
      });
    }

    // Listen for cartUpdated event
    window.addEventListener('cartUpdated', () => {
      this.renderCartItems();
      this.updateCartSummary();
    });
  }
}

// Initialize cart on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.myCart = new Cart();
  window.myCart.triggerCartUpdate();

  // Setup event listeners for cart page
  if (document.getElementById('cart-items-container')) {
    window.myCart.setupCartPageEventListeners();
    window.myCart.renderCartItems();
    window.myCart.updateCartSummary();
  }
});