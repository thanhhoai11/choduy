/**
 * Recently Viewed Products Module - Anh Em Rọt Store
 * Tracks and displays recently viewed products
 */

const RecentlyViewed = {
  // Maximum number of products to store
  maxProducts: 10,
  
  // Initialize recently viewed module
  init: function() {
    // Track product view on product detail page
    this.trackProductView();
    
    // Render recently viewed section if we're on a product listing page
    if (document.querySelector('.product-grid') && !document.querySelector('.product-detail-container')) {
      this.renderRecentlyViewedSection();
    }
  },
  
  // Get recently viewed products from localStorage
  getRecentlyViewed: function() {
    return JSON.parse(localStorage.getItem('recentlyViewed')) || [];
  },
  
  // Save recently viewed products to localStorage
  saveRecentlyViewed: function(products) {
    localStorage.setItem('recentlyViewed', JSON.stringify(products));
  },
  
  // Track current product view on product detail page
  trackProductView: function() {
    // Check if we're on a product detail page
    const productTitle = document.getElementById('productTitle');
    if (!productTitle) return;
    
    const productName = productTitle.textContent;
    const productImage = document.getElementById('mainImage')?.src;
    const productPrice = document.getElementById('productPrice')?.textContent;
    
    // Get product id from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id') || this.generateProductId(productName);
    
    if (!productName || !productImage || !productPrice) return;
    
    // Get current list
    let recentlyViewed = this.getRecentlyViewed();
    
    // Check if product is already in the list
    const existingIndex = recentlyViewed.findIndex(p => p.id === productId);
    if (existingIndex !== -1) {
      // Remove it so we can add it to the top
      recentlyViewed.splice(existingIndex, 1);
    }
    
    // Add current product to the beginning
    recentlyViewed.unshift({
      id: productId,
      name: productName,
      image: productImage,
      price: productPrice,
      url: window.location.href,
      timestamp: new Date().getTime()
    });
    
    // Limit to max products
    if (recentlyViewed.length > this.maxProducts) {
      recentlyViewed = recentlyViewed.slice(0, this.maxProducts);
    }
    
    // Save updated list
    this.saveRecentlyViewed(recentlyViewed);
  },
  
  // Generate a simple ID from the product name
  generateProductId: function(name) {
    return 'product_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  },
  
  // Render recently viewed products section
  renderRecentlyViewedSection: function() {
    const recentlyViewed = this.getRecentlyViewed();
    
    // Don't show if we have no products
    if (recentlyViewed.length === 0) return;
    
    // Create the recently viewed section
    const section = document.createElement('section');
    section.className = 'recently-viewed-section';
    section.innerHTML = `
      <div class="container">
        <h3 class="section-title">Đã xem gần đây</h3>
        <div class="row g-4" id="recentlyViewedProducts"></div>
      </div>
    `;
    
    // Find a good place to insert the section
    const targetElement = document.querySelector('.recommendations-section') || document.querySelector('.footer');
    if (targetElement) {
      targetElement.parentNode.insertBefore(section, targetElement);
    } else {
      // Fallback - append to body
      document.body.appendChild(section);
    }
    
    // Populate products
    const productsContainer = document.getElementById('recentlyViewedProducts');
    
    recentlyViewed.forEach(product => {
      const productCol = document.createElement('div');
      productCol.className = 'col-6 col-md-3 col-lg-3';
      
      productCol.innerHTML = `
        <div class="product-card" data-product-id="${product.id}">
          <div class="product-image-container">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="recently-viewed-badge">
              <i class="fas fa-history"></i> Đã xem
            </div>
          </div>
          <div class="product-body">
            <h5 class="product-title">${product.name}</h5>
            <div class="product-price">${product.price}</div>
            <a href="${product.url}" class="btn btn-detail">
              <i class="fas fa-eye"></i> Xem lại
            </a>
          </div>
        </div>
      `;
      
      productsContainer.appendChild(productCol);
    });
    
    // Add compare buttons to products if ProductCompare is available
    if (typeof ProductCompare !== 'undefined') {
      recentlyViewed.forEach(product => {
        const productCard = document.querySelector(`.product-card[data-product-id="${product.id}"]`);
        if (productCard) {
          ProductCompare.addCompareButton(
            productCard, 
            product.id, 
            product.name, 
            product.image, 
            product.price
          );
        }
      });
    }
  },
  
  // Render a smaller recently viewed section in the product detail sidebar
  renderSidebarRecentlyViewed: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const recentlyViewed = this.getRecentlyViewed().slice(0, 4); // Limit to 4 items for sidebar
    
    // Don't show if we have no products or just the current one
    if (recentlyViewed.length <= 1) return;
    
    // Get current product ID to exclude it
    const urlParams = new URLSearchParams(window.location.search);
    const currentProductId = urlParams.get('id') || this.generateProductId(document.getElementById('productTitle')?.textContent || '');
    
    // Filter out current product
    const filteredProducts = recentlyViewed.filter(p => p.id !== currentProductId);
    
    // Don't show if we have no other products
    if (filteredProducts.length === 0) return;
    
    // Create recently viewed sidebar
    container.innerHTML = `
      <div class="recently-viewed-sidebar">
        <h5 class="sidebar-title">Đã xem gần đây</h5>
        <div class="recently-viewed-items" id="recentlyViewedItems"></div>
      </div>
    `;
    
    const itemsContainer = document.getElementById('recentlyViewedItems');
    
    filteredProducts.slice(0, 3).forEach(product => {
      const item = document.createElement('div');
      item.className = 'recently-viewed-item';
      
      item.innerHTML = `
        <a href="${product.url}" class="recently-viewed-link">
          <div class="recently-viewed-image">
            <img src="${product.image}" alt="${product.name}">
          </div>
          <div class="recently-viewed-info">
            <div class="recently-viewed-name">${product.name}</div>
            <div class="recently-viewed-price">${product.price}</div>
          </div>
        </a>
      `;
      
      itemsContainer.appendChild(item);
    });
  }
};

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  RecentlyViewed.init();
  
  // Add recently viewed sidebar to product detail page if the container exists
  if (document.querySelector('.product-detail-container')) {
    // Create sidebar container if it doesn't exist
    let sidebarContainer = document.getElementById('recentlyViewedSidebar');
    if (!sidebarContainer) {
      sidebarContainer = document.createElement('div');
      sidebarContainer.id = 'recentlyViewedSidebar';
      sidebarContainer.className = 'sidebar-section mt-4';
      
      // Add it after product info
      const productInfo = document.querySelector('.product-info');
      if (productInfo) {
        productInfo.parentNode.appendChild(sidebarContainer);
      }
    }
    
    RecentlyViewed.renderSidebarRecentlyViewed('recentlyViewedSidebar');
  }
});