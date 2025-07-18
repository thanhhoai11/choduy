// Global variables
let currentProduct = null;
let currentImageIndex = 0;
let productImages = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
});

// Initialize Application
function initializeApp() {
  showLoading();
  setupEventListeners();
  loadProductFromURL();
  updateCartCount();
  setupFloatingElements();
}

// Add to cart functionality - Updated to use Cart class
function addToCart() {
  if (!currentProduct) return;

  const addToCartBtn = document.getElementById('addToCartBtn');
  const originalText = addToCartBtn.innerHTML;

  // Show loading state
  addToCartBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Đang thêm...</span>';
  addToCartBtn.disabled = true;

  setTimeout(() => {
    const selectedStorage = document.querySelector('#storageOptions .option-btn.active')?.dataset.value || 'Standard';
    const selectedColor = document.querySelector('#colorOptions .option-btn.active')?.dataset.value || 'Default';
    const quantity = parseInt(document.getElementById('qtyInput').value) || 1;

    // Get current price
    let currentPrice = currentProduct.price;
    if (currentProduct.configurations && currentProduct.configurations[selectedStorage] && currentProduct.configurations[selectedStorage][selectedColor]) {
      currentPrice = currentProduct.configurations[selectedStorage][selectedColor].price;
    }

    // Use Cart class if available, otherwise fallback
    if (window.myCart) {
      // Use the new Cart system
      window.myCart.addToCart(currentProduct.id, quantity).then(() => {
        // Success handled by Cart class
        addToCartBtn.innerHTML = '<i class="fas fa-check"></i> <span>Đã thêm!</span>';
        addToCartBtn.style.background = 'var(--color-success)';

        setTimeout(() => {
          addToCartBtn.innerHTML = originalText;
          addToCartBtn.disabled = false;
          addToCartBtn.style.background = '';
        }, 2000);
      }).catch((error) => {
        console.error('Error adding to cart:', error);
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.disabled = false;
        showToast('Có lỗi xảy ra khi thêm sản phẩm', 'error');
      });
    } else {
      // Fallback to old cart system
      const cartItem = {
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentPrice,
        imageUrl: currentProduct.images[0]?.url || currentProduct.defaultImage,
        quantity: quantity,
        storage: selectedStorage,
        color: selectedColor,
        timestamp: Date.now()
      };

      addItemToCart(cartItem);
      updateCartCount();

      addToCartBtn.innerHTML = '<i class="fas fa-check"></i> <span>Đã thêm!</span>';
      addToCartBtn.style.background = 'var(--color-success)';

      setTimeout(() => {
        addToCartBtn.innerHTML = originalText;
        addToCartBtn.disabled = false;
        addToCartBtn.style.background = '';
      }, 2000);

      showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    }
  }, 1000);
}

// Buy now functionality - Updated
function buyNow() {
  if (!currentProduct) return;

  const buyNowBtn = document.getElementById('buyNowBtn');
  const originalText = buyNowBtn.innerHTML;

  buyNowBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Đang xử lý...</span>';
  buyNowBtn.disabled = true;

  setTimeout(() => {
    const selectedStorage = document.querySelector('#storageOptions .option-btn.active')?.dataset.value || 'Standard';
    const selectedColor = document.querySelector('#colorOptions .option-btn.active')?.dataset.value || 'Default';
    const quantity = parseInt(document.getElementById('qtyInput').value) || 1;

    // Get current price
    let currentPrice = currentProduct.price;
    if (currentProduct.configurations && currentProduct.configurations[selectedStorage] && currentProduct.configurations[selectedStorage][selectedColor]) {
      currentPrice = currentProduct.configurations[selectedStorage][selectedColor].price;
    }

    const checkoutItem = {
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentPrice,
      image: currentProduct.images[0]?.url || currentProduct.defaultImage,
      storage: selectedStorage,
      color: selectedColor,
      quantity: quantity
    };

    // Store in session for checkout page
    sessionStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));

    // Navigate to checkout
    window.location.href = 'checkout.html';
  }, 1500);
}

// Cart management - Updated to sync with new system
function addItemToCart(item) {
  const existingItemIndex = cart.findIndex(cartItem =>
    cartItem.id === item.id &&
    cartItem.storage === item.storage &&
    cartItem.color === item.color
  );

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += item.quantity;
  } else {
    cart.push(item);
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  // Also update the new cart system if available
  if (window.myCart) {
    window.myCart.loadCart(); // Refresh the cart system
  }
}

function updateCartCount() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update cart badge in header
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  // Update cart count
  const cartCount = document.querySelector('.cart-count');
  if (cartCount) {
    cartCount.textContent = totalItems;
  }

  // Update floating cart count
  const floatingCartCount = document.getElementById('floatingCartCount');
  if (floatingCartCount) {
    floatingCartCount.textContent = totalItems;
    floatingCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
  }

  // Trigger cart update event for other components
  const event = new CustomEvent('cartUpdated', {
    detail: {
      count: totalItems,
      cart: cart
    }
  });
  window.dispatchEvent(event);
}

// Setup Event Listeners
function setupEventListeners() {
  // Tab navigation
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Suggestion tabs
  const suggestionTabBtns = document.querySelectorAll('.suggestion-tab-btn');
  suggestionTabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchSuggestionTab(btn.dataset.tab));
  });

  // Quantity controls
  document.getElementById('qtyMinus')?.addEventListener('click', decreaseQuantity);
  document.getElementById('qtyPlus')?.addEventListener('click', increaseQuantity);
  document.getElementById('qtyInput')?.addEventListener('change', validateQuantity);

  // Action buttons
  document.getElementById('addToCartBtn')?.addEventListener('click', addToCart);
  document.getElementById('buyNowBtn')?.addEventListener('click', buyNow);
  document.getElementById('favoriteBtn')?.addEventListener('click', toggleFavorite);
  document.getElementById('compareBtn')?.addEventListener('click', addToCompare);
  document.getElementById('callBtn')?.addEventListener('click', callSupport);

  // Share functionality
  document.getElementById('shareBtn')?.addEventListener('click', showShareModal);
  document.getElementById('closeShareModal')?.addEventListener('click', hideShareModal);

  // Share options
  document.querySelectorAll('.share-option').forEach(btn => {
    btn.addEventListener('click', () => shareProduct(btn.dataset.platform));
  });

  // Image functionality
  document.getElementById('zoomBtn')?.addEventListener('click', showImageModal);
  document.getElementById('closeImageModal')?.addEventListener('click', hideImageModal);
  document.getElementById('prevImage')?.addEventListener('click', previousImage);
  document.getElementById('nextImage')?.addEventListener('click', nextImage);

  // Floating elements
  document.getElementById('floatingCart')?.addEventListener('click', () => {
    window.location.href = 'cart.html';
  });

  document.getElementById('backToTop')?.addEventListener('click', scrollToTop);

  // Modal close on outside click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      hideAllModals();
    }
  });

  // Scroll events
  window.addEventListener('scroll', handleScroll);

  // Keyboard events
  document.addEventListener('keydown', handleKeydown);
}

// Load product from URL parameters
async function loadProductFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const productID = urlParams.get('id');

  if (!productID) {
    showError('Không tìm thấy thông tin sản phẩm');
    return;
  }

  try {
    const productData = await fetchProductData(productID);
    if (productData) {
      currentProduct = productData;
      displayProduct(productData);
      loadRelatedProducts(productData);
      addToRecentlyViewed(productData);
      hideLoading();
    } else {
      showError('Sản phẩm không tồn tại');
    }
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm:', error);
    showError('Có lỗi xảy ra khi tải sản phẩm');
  }
}

// Fetch product data from JSON file
async function fetchProductData(key) {
  const response = await fetch('data/product.json');
  const data = await response.json();

  for (const category of data.categories) {
    const product = category.products.find(p => 
      p.id === key || p.name.toLowerCase() === key.toLowerCase()
    );
    if (product) return transformProductData(product, category);
  }

  return null;
}


// Transform product data to standardized format
function transformProductData(product, category) {
  const transformed = {
    id: product.id,
    name: product.name,
    category: category.id,
    categoryName: getCategoryDisplayName(category.id),
    description: product.description,
    specs: product.specs,
    images: [],
    configurations: product.configurations,
    accessories: product.accessories || [],
    promotions: product.promotions || [],
    defaultImage: product.defaultImage
  };

  // Process images from configurations
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

  // Get first configuration for default pricing
  const firstStorage = Object.keys(product.configurations)[0];
  const firstColor = Object.keys(product.configurations[firstStorage])[0];
  const defaultConfig = product.configurations[firstStorage][firstColor];

  transformed.price = defaultConfig.price;
  transformed.originalPrice = defaultConfig.originalPrice;
  transformed.discount = defaultConfig.discount;

  return transformed;
}

// Get category display name
function getCategoryDisplayName(categoryId) {
  const categoryNames = {
    'iphone': 'iPhone',
    'ipad': 'iPad',
    'macbook': 'MacBook',
    'applewatch': 'Apple Watch',
    'airpod': 'AirPods',
    'phukien': 'Phụ kiện'
  };
  return categoryNames[categoryId] || categoryId;
}

// Display product information
function displayProduct(product) {
  // Update page title and breadcrumb
  document.title = `${product.name} | Anh Em Rọt Store`;
  const categoryBreadcrumb = document.getElementById('categoryBreadcrumb');
  const productBreadcrumb = document.getElementById('productBreadcrumb');
  if (categoryBreadcrumb) categoryBreadcrumb.textContent = product.categoryName;
  if (productBreadcrumb) productBreadcrumb.textContent = product.name;

  // Update product title
  const productTitle = document.getElementById('productTitle');
  if (productTitle) productTitle.textContent = product.name;

  // Update images
  displayProductImages(product.images);

  // Update pricing
  displayProductPricing(product);

  // Update options
  displayProductOptions(product);

  // Update promotions
  displayPromotions(product.promotions);

  // Update tabs content
  displayDescription(product.description);
  displaySpecifications(product.specs);
  displayAccessories(product.accessories);

  // Update stock status
  updateStockStatus(true);

  // Check if product is in favorites
  updateFavoriteButton(favorites.includes(product.id));
}

// Display product images
function displayProductImages(images) {
  productImages = images;
  currentImageIndex = 0;

  const mainImage = document.getElementById('mainImage');
  const thumbnailsContainer = document.getElementById('thumbnails');

  if (images.length > 0 && mainImage && thumbnailsContainer) {
    // Set main image
    mainImage.src = images[0].url;
    mainImage.alt = images[0].alt;

    // Generate thumbnails
    thumbnailsContainer.innerHTML = '';
    images.forEach((image, index) => {
      const thumbnail = document.createElement('img');
      thumbnail.src = image.url;
      thumbnail.alt = image.alt;
      thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
      thumbnail.addEventListener('click', () => selectImage(index));
      thumbnailsContainer.appendChild(thumbnail);
    });

    // Show/hide navigation buttons
    const prevBtn = document.getElementById('prevImage');
    const nextBtn = document.getElementById('nextImage');
    if (prevBtn && nextBtn) {
      prevBtn.style.display = images.length > 1 ? 'block' : 'none';
      nextBtn.style.display = images.length > 1 ? 'block' : 'none';
    }
  }
}

// Select image by index
function selectImage(index) {
  if (index < 0 || index >= productImages.length) return;

  currentImageIndex = index;
  const mainImage = document.getElementById('mainImage');
  const thumbnails = document.querySelectorAll('.thumbnail');

  if (mainImage) {
    // Update main image
    mainImage.src = productImages[index].url;
    mainImage.alt = productImages[index].alt;
  }

  // Update active thumbnail
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

// Display product pricing
function displayProductPricing(product) {
  const currentPriceEl = document.getElementById('currentPrice');
  const originalPriceEl = document.getElementById('originalPrice');
  const discountInfo = document.getElementById('discountInfo');
  const discountPercentEl = document.getElementById('discountPercent');
  const saveAmountEl = document.getElementById('saveAmount');

  if (currentPriceEl) currentPriceEl.textContent = formatPrice(product.price);

  if (product.originalPrice && product.originalPrice > product.price && originalPriceEl) {
    originalPriceEl.textContent = formatPrice(product.originalPrice);
    originalPriceEl.style.display = 'inline';

    if (discountInfo && discountPercentEl && saveAmountEl) {
      const saveAmount = product.originalPrice - product.price;
      discountPercentEl.textContent = `-${product.discount}%`;
      saveAmountEl.textContent = formatPrice(saveAmount);
      discountInfo.style.display = 'flex';
    }

    // Show discount badge
    const discountBadge = document.getElementById('discountBadge');
    if (discountBadge) {
      discountBadge.textContent = `-${product.discount}%`;
      discountBadge.style.display = 'block';
    }
  }
}

// Display product options
function displayProductOptions(product) {
  const storageGroup = document.getElementById('storageGroup');
  const colorGroup = document.getElementById('colorGroup');
  const storageOptions = document.getElementById('storageOptions');
  const colorOptions = document.getElementById('colorOptions');

  if (!storageOptions || !colorOptions) return;

  // Reset options
  storageOptions.innerHTML = '';
  colorOptions.innerHTML = '';

  if (product.configurations) {
    const storages = Object.keys(product.configurations);
    const colors = Object.keys(product.configurations[storages[0]]);

    // Display storage options
    if (storages.length > 1 && storageGroup) {
      storageGroup.style.display = 'block';
      storages.forEach((storage, index) => {
        const btn = document.createElement('button');
        btn.className = `option-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = storage;
        btn.dataset.value = storage;
        btn.addEventListener('click', () => selectStorageOption(btn, storage));
        storageOptions.appendChild(btn);
      });
    }

    // Display color options
    if (colors.length > 1 && colorGroup) {
      colorGroup.style.display = 'block';
      colors.forEach((color, index) => {
        const btn = document.createElement('button');
        btn.className = `option-btn ${index === 0 ? 'active' : ''}`;
        btn.textContent = color;
        btn.dataset.value = color;
        btn.addEventListener('click', () => selectColorOption(btn, color));
        colorOptions.appendChild(btn);
      });
    }
  }
}

// Select storage option
function selectStorageOption(buttonElement, storage) {
  // Update active button
  document.querySelectorAll('#storageOptions .option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  buttonElement.classList.add('active');

  // Update pricing based on selected options
  updatePricingForSelection();

  // Update color options for selected storage
  updateColorOptionsForStorage(storage);
}

// Select color option
function selectColorOption(buttonElement, color) {
  // Update active button
  document.querySelectorAll('#colorOptions .option-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  buttonElement.classList.add('active');

  // Update pricing based on selected options
  updatePricingForSelection();

  // Update main image if available
  updateImageForSelection();
}

// Update pricing for current selection
function updatePricingForSelection() {
  const selectedStorage = document.querySelector('#storageOptions .option-btn.active')?.dataset.value;
  const selectedColor = document.querySelector('#colorOptions .option-btn.active')?.dataset.value;

  if (selectedStorage && selectedColor && currentProduct.configurations) {
    const config = currentProduct.configurations[selectedStorage]?.[selectedColor];
    if (config) {
      displayProductPricing({
        price: config.price,
        originalPrice: config.originalPrice,
        discount: config.discount
      });
    }
  }
}

// Update color options for selected storage
function updateColorOptionsForStorage(storage) {
  const colorOptions = document.getElementById('colorOptions');
  if (!colorOptions || !currentProduct.configurations) return;

  const colors = Object.keys(currentProduct.configurations[storage]);

  colorOptions.innerHTML = '';
  colors.forEach((color, index) => {
    const btn = document.createElement('button');
    btn.className = `option-btn ${index === 0 ? 'active' : ''}`;
    btn.textContent = color;
    btn.dataset.value = color;
    btn.addEventListener('click', () => selectColorOption(btn, color));
    colorOptions.appendChild(btn);
  });

  // Update pricing after color options change
  updatePricingForSelection();
}

// Update image for current selection
function updateImageForSelection() {
  const selectedStorage = document.querySelector('#storageOptions .option-btn.active')?.dataset.value;
  const selectedColor = document.querySelector('#colorOptions .option-btn.active')?.dataset.value;

  if (selectedStorage && selectedColor && currentProduct.images) {
    const matchingImage = currentProduct.images.find(img =>
      img.storage === selectedStorage && img.color === selectedColor
    );

    if (matchingImage) {
      const imageIndex = currentProduct.images.indexOf(matchingImage);
      selectImage(imageIndex);
    }
  }
}

// Display promotions
function displayPromotions(promotions) {
  const promotionList = document.getElementById('promotionList');
  if (!promotionList) return;

  promotionList.innerHTML = '';

  promotions.forEach(promotion => {
    const li = document.createElement('li');
    li.className = 'promotion-item';
    li.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${promotion}</span>
    `;
    promotionList.appendChild(li);
  });
}

// Display description
function displayDescription(description) {
  const descriptionContent = document.getElementById('descriptionContent');
  if (!descriptionContent) return;

  if (description && description.paragraphs) {
    descriptionContent.innerHTML = description.paragraphs
      .map(paragraph => `<p>${paragraph}</p>`)
      .join('');
  } else if (typeof description === 'string') {
    descriptionContent.innerHTML = `<p>${description}</p>`;
  }
}

// Display specifications
function displaySpecifications(specs) {
  const specsContent = document.getElementById('specsContent');
  if (!specsContent) return;

  specsContent.innerHTML = '';

  if (specs && typeof specs === 'object') {
    Object.entries(specs).forEach(([groupName, specGroup]) => {
      const groupDiv = document.createElement('div');
      groupDiv.className = 'spec-group';

      const title = document.createElement('h3');
      title.className = 'spec-group-title';
      title.innerHTML = `<i class="fas fa-cog"></i> ${groupName}`;
      groupDiv.appendChild(title);

      const list = document.createElement('ul');
      list.className = 'spec-list';

      if (typeof specGroup === 'object' && !Array.isArray(specGroup)) {
        Object.entries(specGroup).forEach(([key, value]) => {
          const item = document.createElement('li');
          item.className = 'spec-item';
          item.innerHTML = `
            <span class="spec-label">${key}</span>
            <span class="spec-value">${Array.isArray(value) ? value.join(', ') : value}</span>
          `;
          list.appendChild(item);
        });
      }

      groupDiv.appendChild(list);
      specsContent.appendChild(groupDiv);
    });
  }
}

// Display accessories
function displayAccessories(accessories) {
  const accessoriesGrid = document.getElementById('accessoriesGrid');
  if (!accessoriesGrid) return;

  accessoriesGrid.innerHTML = '';

  accessories.forEach(accessory => {
    const accessoryDiv = document.createElement('div');
    accessoryDiv.className = 'accessory-item';
    accessoryDiv.innerHTML = `
      <img src="${accessory.image}" alt="${accessory.name}" class="accessory-image" loading="lazy">
      <div class="accessory-name">${accessory.name}</div>
      <div class="accessory-price">
        ${formatPrice(accessory.price)}
        ${accessory.originalPrice ? `<span style="text-decoration: line-through; color: #999; font-size: 0.9rem;">${formatPrice(accessory.originalPrice)}</span>` : ''}
      </div>
    `;
    accessoryDiv.addEventListener('click', () => {
      // Navigate to accessory detail or add to cart
      showToast(`Đã thêm ${accessory.name} vào giỏ hàng`, 'success');
    });
    accessoriesGrid.appendChild(accessoryDiv);
  });
}

// Quantity controls
function decreaseQuantity() {
  const qtyInput = document.getElementById('qtyInput');
  if (!qtyInput) return;

  const currentQty = parseInt(qtyInput.value);
  if (currentQty > 1) {
    qtyInput.value = currentQty - 1;
  }
}

function increaseQuantity() {
  const qtyInput = document.getElementById('qtyInput');
  if (!qtyInput) return;

  const currentQty = parseInt(qtyInput.value);
  const maxQty = 10; // Set maximum quantity
  if (currentQty < maxQty) {
    qtyInput.value = currentQty + 1;
  }
}

function validateQuantity() {
  const qtyInput = document.getElementById('qtyInput');
  if (!qtyInput) return;

  let qty = parseInt(qtyInput.value);
  if (isNaN(qty) || qty < 1) qty = 1;
  if (qty > 10) qty = 10;
  qtyInput.value = qty;
}

// Toggle favorite
function toggleFavorite() {
  if (!currentProduct) return;

  const favoriteBtn = document.getElementById('favoriteBtn');
  if (!favoriteBtn) return;

  const icon = favoriteBtn.querySelector('i');
  const text = favoriteBtn.querySelector('span');

  if (favorites.includes(currentProduct.id)) {
    // Remove from favorites
    favorites = favorites.filter(id => id !== currentProduct.id);
    if (icon) icon.className = 'far fa-heart';
    if (text) text.textContent = 'Yêu thích';
    showToast('Đã xóa khỏi danh sách yêu thích', 'success');
  } else {
    // Add to favorites
    favorites.push(currentProduct.id);
    if (icon) icon.className = 'fas fa-heart';
    if (text) text.textContent = 'Đã thích';
    showToast('Đã thêm vào danh sách yêu thích', 'success');
  }

  localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Update favorite button state
function updateFavoriteButton(isFavorite) {
  const favoriteBtn = document.getElementById('favoriteBtn');
  if (favoriteBtn) {
    const icon = favoriteBtn.querySelector('i');
    const text = favoriteBtn.querySelector('span');

    if (isFavorite) {
      if (icon) icon.className = 'fas fa-heart';
      if (text) text.textContent = 'Đã thích';
    } else {
      if (icon) icon.className = 'far fa-heart';
      if (text) text.textContent = 'Yêu thích';
    }
  }
}

// Add to compare
function addToCompare() {
  if (!currentProduct) return;

  let compareList = JSON.parse(localStorage.getItem('compareList')) || [];

  if (compareList.find(item => item.id === currentProduct.id)) {
    showToast('Sản phẩm đã có trong danh sách so sánh', 'warning');
    return;
  }

  if (compareList.length >= 3) {
    showToast('Chỉ có thể so sánh tối đa 3 sản phẩm', 'warning');
    return;
  }

  compareList.push({
    id: currentProduct.id,
    name: currentProduct.name,
    image: currentProduct.images[0]?.url || currentProduct.defaultImage,
    price: currentProduct.price,
    specs: currentProduct.specs
  });

  localStorage.setItem('compareList', JSON.stringify(compareList));
  showToast('Đã thêm vào danh sách so sánh', 'success');
}

// Call support
function callSupport() {
  const phoneNumber = '1900-1234';
  if (confirm(`Bạn có muốn gọi đến số hotline ${phoneNumber} để được tư vấn?`)) {
    window.open(`tel:${phoneNumber}`);
  }
}

// Share functionality
function showShareModal() {
  const shareModal = document.getElementById('shareModal');
  if (shareModal) shareModal.classList.add('active');
}

function hideShareModal() {
  const shareModal = document.getElementById('shareModal');
  if (shareModal) shareModal.classList.remove('active');
}

function shareProduct(platform) {
  const productUrl = window.location.href;
  const productTitle = currentProduct?.name || 'Sản phẩm tuyệt vời';
  const productDescription = currentProduct?.description?.paragraphs?.[0] || 'Khám phá sản phẩm chất lượng cao tại Anh Em Rọt Store';

  let shareUrl = '';

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(productTitle)}&url=${encodeURIComponent(productUrl)}`;
      break;
    case 'zalo':
      shareUrl = `https://zalo.me/share?url=${encodeURIComponent(productUrl)}&title=${encodeURIComponent(productTitle)}`;
      break;
    case 'copy':
      navigator.clipboard.writeText(productUrl).then(() => {
        showToast('Đã sao chép link sản phẩm', 'success');
        hideShareModal();
      });
      return;
  }

  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    hideShareModal();
  }
}

// Image modal functionality
function showImageModal() {
  const imageModal = document.getElementById('imageModal');
  const modalImage = document.getElementById('modalImage');

  if (imageModal && modalImage) {
    modalImage.src = productImages[currentImageIndex]?.url || '';
    modalImage.alt = productImages[currentImageIndex]?.alt || '';
    imageModal.classList.add('active');
  }
}

function hideImageModal() {
  const imageModal = document.getElementById('imageModal');
  if (imageModal) imageModal.classList.remove('active');
}

// Image navigation
function previousImage() {
  const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : productImages.length - 1;
  selectImage(newIndex);
}

function nextImage() {
  const newIndex = currentImageIndex < productImages.length - 1 ? currentImageIndex + 1 : 0;
  selectImage(newIndex);
}

// Tab switching
function switchTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeTab) activeTab.classList.add('active');

  // Update tab content
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.remove('active');
  });
  const activePane = document.getElementById(tabName);
  if (activePane) activePane.classList.add('active');
}

// Suggestion tab switching
function switchSuggestionTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.suggestion-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
  if (activeTab) activeTab.classList.add('active');

  // Load suggestions based on tab
  loadSuggestions(tabName);
}

// Load related products and suggestions
async function loadRelatedProducts(product) {
  try {
    const response = await fetch('data/product.json');
    const data = await response.json();

    // Find products in the same category
    const sameCategory = data.categories.find(cat => cat.id === product.category);
    if (sameCategory) {
      const relatedProducts = sameCategory.products
        .filter(p => p.name !== product.name)
        .slice(0, 8)
        .map(p => transformProductData(p, sameCategory));

      displaySuggestions(relatedProducts, 'related');
    }

    // Load recently viewed
    displaySuggestions(getRecentlyViewedProducts(), 'viewed');

    // Load bestsellers (mock data)
    displaySuggestions(getBestsellerProducts(data), 'bestseller');

  } catch (error) {
    console.error('Lỗi khi tải sản phẩm liên quan:', error);
  }
}

// Load suggestions based on type
function loadSuggestions(type) {
  switch (type) {
    case 'related':
      loadRelatedProducts(currentProduct);
      break;
    case 'viewed':
      displaySuggestions(getRecentlyViewedProducts(), 'viewed');
      break;
    case 'bestseller':
      // Load bestseller products
      fetch('data/product.json')
        .then(response => response.json())
        .then(data => {
          const bestsellers = getBestsellerProducts(data);
          displaySuggestions(bestsellers, 'bestseller');
        });
      break;
  }
}

// Display suggestions
function displaySuggestions(products, type) {
  const suggestionGrid = document.getElementById('suggestionGrid');
  if (!suggestionGrid) return;

  suggestionGrid.innerHTML = '';

  if (products.length === 0) {
    suggestionGrid.innerHTML = '<p class="text-center">Không có sản phẩm nào để hiển thị</p>';
    return;
  }

  products.forEach(product => {
    const productCard = createProductCard(product);
    suggestionGrid.appendChild(productCard);
  });
}

// Create product card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'suggestion-card';
  card.onclick = () => viewProduct(product);

  const discountBadge = product.discount ? `<div class="suggestion-badge">-${product.discount}%</div>` : '';

  card.innerHTML = `
    <img src="${product.images?.[0]?.url || product.defaultImage}" alt="${product.name}" class="suggestion-image" loading="lazy">
    ${discountBadge}
    <div class="suggestion-content">
      <h3 class="suggestion-title">${product.name}</h3>
      <div class="suggestion-price">
        ${formatPrice(product.price)}
        ${product.originalPrice ? `<span style="text-decoration: line-through; color: #999; font-size: 0.9rem; margin-left: 0.5rem;">${formatPrice(product.originalPrice)}</span>` : ''}
      </div>
      <div class="suggestion-rating">
        <div class="stars">
          ${generateStars(4.5)}
        </div>
        <span>4.5 (${Math.floor(Math.random() * 100) + 50} đánh giá)</span>
      </div>
    </div>
  `;

  return card;
}

// Generate star rating HTML
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let starsHTML = '';

  for (let i = 0; i < fullStars; i++) {
    starsHTML += '<i class="fas fa-star"></i>';
  }

  if (hasHalfStar) {
    starsHTML += '<i class="fas fa-star-half-alt"></i>';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    starsHTML += '<i class="far fa-star"></i>';
  }

  return starsHTML;
}

// View product
function viewProduct(product) {
  const productID = encodeURIComponent(product.id);
  window.location.href = `product-detail.html?id=${productID}`;
}

// Get recently viewed products
function getRecentlyViewedProducts() {
  return recentlyViewed
    .filter(item => item.id !== currentProduct?.id)
    .slice(0, 6);
}

// Get bestseller products (mock implementation)
function getBestsellerProducts(data) {
  const allProducts = [];

  data.categories.forEach(category => {
    category.products.forEach(product => {
      allProducts.push(transformProductData(product, category));
    });
  });

  // Sort by discount and return top products
  return allProducts
    .filter(p => p.id !== currentProduct?.id)
    .sort((a, b) => (b.discount || 0) - (a.discount || 0))
    .slice(0, 8);
}

// Add to recently viewed
function addToRecentlyViewed(product) {
  const recentItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images?.[0]?.url || product.defaultImage,
    timestamp: Date.now(),
  };

  // Remove if already exists
  recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);

  // Add to beginning
  recentlyViewed.unshift(recentItem);

  // Limit to 10 items
  recentlyViewed = recentlyViewed.slice(0, 10);

  localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
}
// Update stock status
function updateStockStatus(inStock) {
  const stockInfo = document.querySelector('.stock-info');
  const icon = stockInfo?.querySelector('i');
  const text = stockInfo?.querySelector('span');

  if (stockInfo && icon && text) {
    if (inStock) {
      icon.className = 'fas fa-check-circle';
      icon.style.color = 'var(--color-success)';
      text.textContent = 'Còn hàng';
    } else {
      icon.className = 'fas fa-times-circle';
      icon.style.color = 'var(--color-danger)';
      text.textContent = 'Hết hàng';
    }
  }
}

// Floating elements setup
function setupFloatingElements() {
  // Back to top button
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });
  }
}

// Scroll to top
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
}

// Handle scroll events
function handleScroll() {
  const scrolled = window.scrollY;

  // Show/hide back to top button
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    if (scrolled > 300) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }

  // Header scroll effect
  const header = document.querySelector('.header');
  if (header) {
    if (scrolled > 50) {
      header.style.boxShadow = 'var(--shadow-lg)';
    } else {
      header.style.boxShadow = 'var(--shadow-sm)';
    }
  }
}

// Handle keyboard events
function handleKeydown(event) {
  // Close modals with Escape key
  if (event.key === 'Escape') {
    hideAllModals();
  }

  // Image navigation with arrow keys
  if (event.key === 'ArrowLeft') {
    previousImage();
  } else if (event.key === 'ArrowRight') {
    nextImage();
  }
}

// Hide all modals
function hideAllModals() {
  document.querySelectorAll('.modal').forEach(modal => {
    modal.classList.remove('active');
  });
}

// Loading states
function showLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.remove('hidden');
  }
}

function hideLoading() {
  const loadingOverlay = document.getElementById('loadingOverlay');
  if (loadingOverlay) {
    loadingOverlay.classList.add('hidden');
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 300);
  }
}

// Toast notifications
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    alert(message);
    return;
  }

  const now = new Date('2025-06-01T16:36:00+07:00');
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

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const iconClass = type === 'success' ? 'fa-check-circle' :
    type === 'error' ? 'fa-exclamation-circle' :
      type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle';

  toast.innerHTML = `
        <i class="fas ${iconClass} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
            <div class="toast-datetime">${dateTimeString}</div>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    removeToast(toast);
  });

  toastContainer.appendChild(toast);

  setTimeout(() => {
    removeToast(toast);
  }, 5000);
}

function removeToast(toast) {
  toast.style.animation = 'slideOutRight 0.3s ease-out forwards';
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// Error handling
function showError(message) {
  hideLoading();

  const container = document.querySelector('.container');
  if (container) {
    container.innerHTML = `
      <div class="error-container" style="text-align: center; padding: 4rem 2rem;">
        <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: var(--color-danger); margin-bottom: 2rem;"></i>
        <h2 style="color: var(--color-dark); margin-bottom: 1rem;">Có lỗi xảy ra</h2>
        <p style="color: var(--color-gray-600); margin-bottom: 2rem;">${message}</p>
        <button class="btn btn-primary" onclick="window.location.href='/product.html'">
          <i class="fas fa-redo"></i>
          <span>Thử lại</span>
        </button>
      </div>
    `;
  }
}

// Utility functions
function formatPrice(price) {
  if (typeof price !== 'number') return '0₫';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Initialize review system
function initializeReviews() {
  const reviewList = document.getElementById('reviewList');
  if (!reviewList) return;

  // Sample reviews data
  const sampleReviews = [
    {
      id: 1,
      author: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/50?u=A',
      rating: 5,
      date: new Date('2024-01-15'),
      title: 'Sản phẩm tuyệt vời!',
      content: 'Chất lượng rất tốt, đóng gói cẩn thận. Giao hàng nhanh chóng. Tôi rất hài lòng với sản phẩm này.'
    },
    {
      id: 2,
      author: 'Trần Thị B',
      avatar: 'https://i.pravatar.cc/50?u=B',
      rating: 4,
      date: new Date('2024-01-12'),
      title: 'Giá trị tốt',
      content: 'Sản phẩm đúng như mô tả, giá cả hợp lý. Dịch vụ khách hàng tốt.'
    },
    {
      id: 3,
      author: 'Lê Văn C',
      avatar: 'https://i.pravatar.cc/50?u=C',
      rating: 5,
      date: new Date('2024-01-10'),
      title: 'Rất đáng mua',
      content: 'Thiết kế đẹp, chất lượng cao. Sẽ giới thiệu cho bạn bè.'
    },
    {
      id: 4,
      author: 'Phạm Thị D',
      avatar: 'https://i.pravatar.cc/50?u=D',
      rating: 3,
      date: new Date('2024-01-08'),
      title: 'Tạm ổn',
      content: 'Sản phẩm ổn trong tầm giá. Tuy nhiên đóng gói chưa chắc chắn.'
    }
  ];

  // Display reviews
  reviewList.innerHTML = '';
  sampleReviews.forEach(review => {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review-item';
    reviewElement.innerHTML = `
    <div class="review-header" style="display: flex; align-items: center; margin-bottom: 0.5rem;">
      <img src="${review.avatar}" alt="${review.author}" style="width: 40px; height: 40px; border-radius: 50%; margin-right: 10px;">
      <div>
        <strong class="review-author">${review.author}</strong><br>
        <small class="review-date" style="color: gray;">${formatDate(review.date)}</small>
      </div>
    </div>
    <div class="stars" style="margin-bottom: 0.5rem;">
      ${generateStars(review.rating)}
    </div>
    <h4 style="margin-bottom: 0.5rem; font-size: var(--font-size-base); font-weight: 600;">${review.title}</h4>
    <div class="review-content">${review.content}</div>
  `;
    reviewList.appendChild(reviewElement);
  });
}

// Performance optimizations
function optimizeImages() {
  // Lazy loading for images
  const images = document.querySelectorAll('img[loading="lazy"]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }
}

// Analytics tracking (placeholder)
function trackProductView(productId, productName) {
  // Track product view event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'view_item', {
      currency: 'VND',
      value: currentProduct?.price || 0,
      items: [{
        item_id: productId,
        item_name: productName,
        category: currentProduct?.categoryName || 'Unknown',
        quantity: 1,
        price: currentProduct?.price || 0
      }]
    });
  }
}

function trackAddToCart(productId, productName, price, quantity) {
  // Track add to cart event
  if (typeof gtag !== 'undefined') {
    gtag('event', 'add_to_cart', {
      currency: 'VND',
      value: price * quantity,
      items: [{
        item_id: productId,
        item_name: productName,
        category: currentProduct?.categoryName || 'Unknown',
        quantity: quantity,
        price: price
      }]
    });
  }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  initializeApp();
  initializeReviews();
  optimizeImages();

  // Track product view if analytics is available
  if (currentProduct) {
    trackProductView(currentProduct.id, currentProduct.name);
  }
});

// Handle page visibility change
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    // Page is hidden - pause any ongoing operations
    clearTimeout(window.autoSlideTimeout);
  } else {
    // Page is visible - resume operations
    if (productImages.length > 1) {
      // Resume auto-slide if applicable
    }
  }
});

// Handle online/offline status
window.addEventListener('online', function () {
  showToast('Kết nối internet đã được khôi phục', 'success');
});

window.addEventListener('offline', function () {
  showToast('Mất kết nối internet. Một số tính năng có thể không hoạt động.', 'warning');
});

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    formatPrice,
    generateStars,
    addItemToCart,
    updateCartCount
  };
}