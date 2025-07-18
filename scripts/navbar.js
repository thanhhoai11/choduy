// Simulated authentication state
let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

// Cache for product data and cart items
let productDataCache = null;
let isFetching = false;
let cartItems = getCartFromStorage();

function getCartFromStorage() {
    // Try to get from new cart system first
    const cartSystemData = localStorage.getItem('cartSystem');
    if (cartSystemData) {
        try {
            const cartSystem = JSON.parse(cartSystemData);
            return cartSystem.items.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                imageUrl: item.image,
                quantity: item.quantity,
                storage: item.storage,
                color: item.color
            }));
        } catch (e) {
            console.error('Error parsing cartSystem:', e);
        }
    }

    // Fallback to old cart format
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
}

const message = "📢Anh Em Rọt Store - Proud of you! ";
const el = document.getElementById("typewriter");
const sound = document.getElementById("type-sound");

let i = 0;
function typeChar() {
    if (i < message.length) {
        el.textContent += message[i++];
        if (sound) {
            sound.currentTime = 0;
        }
        setTimeout(typeChar, 80);
    }
}
typeChar();

// Giả lập thời tiết
const fakeWeatherData = [
    { icon: "☀️", city: "Hà Nội", temp: 33, desc: "Nắng đẹp" },
    { icon: "⛅", city: "Đà Nẵng", temp: 30, desc: "Trời quang mây" },
    { icon: "🌧️", city: "TP.HCM", temp: 28, desc: "Mưa nhẹ" },
    { icon: "🌤️", city: "Hải Phòng", temp: 29, desc: "Nắng nhẹ" },
    { icon: "🌩️", city: "Cần Thơ", temp: 27, desc: "Giông bão" }
];

function showFakeWeather() {
    const data = fakeWeatherData[Math.floor(Math.random() * fakeWeatherData.length)];
    document.getElementById("weather").textContent = `${data.icon} ${data.city}: ${data.temp}°C - ${data.desc}`;
}

showFakeWeather();
// Update mỗi 30s cho vui
setInterval(showFakeWeather, 30000);

// Function to show notifications
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' :
            type === 'error' ? '#f44336' :
                type === 'warning' ? '#ff9800' : '#2196f3'};
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        transform: translateX(100%);
        transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        max-width: 350px;
        `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Function to update user section
function updateUserSection() {
    const userSection = document.getElementById('user-section');
    if (!userSection) return;

    if (isLoggedIn && currentUser) {
        userSection.innerHTML = `
            <div class="user-dropdown">
                <div class="user-icon" aria-label="Tài khoản người dùng">
                    <i class="fas fa-user"></i>
                    <span class="user-name">${currentUser.fullName.split(' ')[0]}</span>
                </div>
                <div class="dropdown-content">
                    <a href="#"><i class="fas fa-user-circle"></i> Thông tin tài khoản</a>
                    <a href="#"><i class="fas fa-shopping-cart"></i> Giỏ hàng của tôi</a>
                    <a href="#" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Đăng xuất</a>
                </div>
            </div>
        `;
        const userDropdown = userSection.querySelector('.user-dropdown');
        if (userDropdown) {
            document.addEventListener('click', (e) => {
                if (!userDropdown.contains(e.target)) {
                    userDropdown.querySelector('.dropdown-content').style.display = 'none';
                }
            });

            userDropdown.querySelector('.user-icon').addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = userDropdown.querySelector('.dropdown-content');
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });

            const dropdownItems = userDropdown.querySelectorAll('.dropdown-content a');
            dropdownItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const action = item.textContent.trim();

                    if (action.includes('Giỏ hàng')) {
                        showNotification('Chuyển hướng đến giỏ hàng...', 'info');
                        setTimeout(() => {
                            window.location.href = 'cart.html';
                        }, 1500);
                    } else if (action.includes('Đăng xuất')) {
                        handleLogout();
                    } else if (action.includes('Thông tin')) {
                        showNotification('Chuyển hướng đến trang thông tin tài khoản', 'info');
                        setTimeout(() => {
                            window.location.href = '#';
                        }, 1500);
                    }

                    userDropdown.querySelector('.dropdown-content').style.display = 'none';
                });
            });
        }
    } else {
        userSection.innerHTML = `
                    <button class="login-btn" id="login-btn">
                        <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>Đăng nhập
                    </button>
                `;
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showNotification('Chuyển hướng đến trang đăng nhập...', 'info');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            });
        }
    }
}

function handleLogout() {
    showNotification('Đã đăng xuất thành công!', 'success');
    setTimeout(() => {
        isLoggedIn = false;
        currentUser = null;
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        updateUserSection();
    }, 1500);
}

// Listen for cart updates from the Cart class
window.addEventListener('cartUpdated', (event) => {
    cartItems = getCartFromStorage();
    const totalItems = event.detail.count;

    // Update cart count in navbar
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = totalItems;
    }

    // Update cart badge
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Update other cart elements
    const cartBadges = document.querySelectorAll('.cart-badge, .badge');
    cartBadges.forEach(badge => {
        if (badge.id !== 'cart-badge') {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'inline' : 'none';
        }
    });
});

// Mega Menu Functionality
document.addEventListener('DOMContentLoaded', () => {
    updateUserSection();

    const productsDropdown = document.getElementById('products-dropdown');
    const productsLink = document.querySelector('.desktop-nav .has-dropdown > a');
    const categoryItems = document.querySelectorAll('.main-categories-column .category-item');
    const subcategoryDisplayPlaceholder = document.querySelector('.subcategory-display-column .subcategory-content-placeholder');
    const defaultPlaceholderContent = '<p>🖱️ Di chuột qua danh mục để xem chi tiết</p>';

    if (subcategoryDisplayPlaceholder) {
        subcategoryDisplayPlaceholder.innerHTML = defaultPlaceholderContent;
    }

    if (productsLink && productsDropdown && categoryItems.length > 0 && subcategoryDisplayPlaceholder) {
        productsLink.addEventListener('mouseenter', () => {
            productsDropdown.style.display = 'block';
        });

        productsLink.parentElement.addEventListener('mouseleave', (e) => {
            if (!productsDropdown.contains(e.relatedTarget) && !productsLink.contains(e.relatedTarget)) {
                productsDropdown.style.display = 'none';
                subcategoryDisplayPlaceholder.innerHTML = defaultPlaceholderContent;
                categoryItems.forEach(item => item.classList.remove('active'));
            }
        });

        productsDropdown.addEventListener('mouseleave', () => {
            productsDropdown.style.display = 'none';
            subcategoryDisplayPlaceholder.innerHTML = defaultPlaceholderContent;
            categoryItems.forEach(item => item.classList.remove('active'));
        });

        categoryItems.forEach(item => {
            const categoryLink = item.querySelector('a[data-target-category]');
            if (categoryLink) {
                const targetCategoryId = categoryLink.dataset.targetCategory;
                const subcategoryContent = document.getElementById(targetCategoryId + '-content');

                if (subcategoryContent) {
                    item.addEventListener('mouseenter', () => {
                        categoryItems.forEach(cat => cat.classList.remove('active'));
                        item.classList.add('active');

                        subcategoryDisplayPlaceholder.innerHTML = '';
                        const clonedContent = subcategoryContent.cloneNode(true);
                        clonedContent.style.display = 'block';
                        subcategoryDisplayPlaceholder.appendChild(clonedContent);
                    });
                }
            }
        });
    }

    // Mobile Navigation Functionality
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const closeMobileNav = document.querySelector('.close-mobile-nav');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const hasSubmenus = document.querySelectorAll('.mobile-nav .has-submenu');

    if (hamburgerMenu && mobileNav && closeMobileNav && mobileOverlay) {
        hamburgerMenu.addEventListener('click', () => {
            mobileNav.classList.add('active');
            mobileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        const closeMobileMenu = () => {
            mobileNav.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeMobileNav.addEventListener('click', closeMobileMenu);
        mobileOverlay.addEventListener('click', closeMobileMenu);

        hasSubmenus.forEach(item => {
            item.querySelector('a').addEventListener('click', (e) => {
                e.preventDefault();
                item.classList.toggle('active');
                const submenu = item.querySelector('.submenu');
                if (submenu) {
                    submenu.style.display = submenu.style.display === 'block' ? 'none' : 'block';
                }
            });
        });
    }

    // Header scroll effect
    let lastScrollTop = 0;
    const header = document.querySelector('.main-header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

        if (scrollTop > lastScrollTop && scrollTop > 100) {
            if (header) header.style.transform = 'translateY(-100%)';
        } else {
            if (header) header.style.transform = 'translateY(0)';
        }

        lastScrollTop = scrollTop;
    });

    // Cart Modal Functionality
    const cartIcon = document.querySelector('.cart-icon');
    const cartModal = document.querySelector('.cart-modal');
    const cartModalOverlay = document.querySelector('.cart-modal-overlay');
    const closeCartModal = document.querySelector('.close-cart-modal');
    const cartModalBody = document.querySelector('.cart-modal-body');
    const cartCount = document.querySelector('.cart-count');
    const viewCartBtn = document.querySelector('.view-cart-btn');
    const checkoutBtn = document.querySelector('.checkout-btn');

    function updateCartModal() {
        // Refresh cart items from storage
        cartItems = getCartFromStorage();

        if (!cartModalBody) return;

        if (cartItems.length === 0) {
            cartModalBody.innerHTML = `
                        <div class="cart-empty">
                            <i class="fas fa-shopping-cart"></i>
                            <p>Giỏ hàng trống</p>
                        </div>
                    `;
        } else {
            cartModalBody.innerHTML = '';
            cartItems.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                            <img src="${item.imageUrl}" alt="${item.name}" onerror="this.src='images/default.jpg'">
                            <div class="cart-item-info">
                                <div class="cart-item-name">${item.name}</div>
                                <div class="cart-item-price">${formatPrice(item.price)}</div>
                                <div class="cart-item-quantity">Số lượng: ${item.quantity}</div>
                            </div>
                            <button class="remove-cart-item" data-index="${index}" data-product-id="${item.id}">Xóa</button>
                        `;
                cartModalBody.appendChild(cartItem);
            });

            const removeButtons = cartModalBody.querySelectorAll('.remove-cart-item');
            removeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const productId = button.dataset.productId;
                    // Use the Cart class method if available
                    if (window.myCart) {
                        window.myCart.removeItem(productId);
                    } else {
                        // Fallback to old method
                        const index = parseInt(button.dataset.index);
                        cartItems.splice(index, 1);
                        localStorage.setItem('cart', JSON.stringify(cartItems));
                        updateCartModal();
                        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
                        if (cartCount) cartCount.textContent = totalItems;
                    }
                    showNotification('Đã xóa sản phẩm khỏi giỏ hàng!', 'success');
                });
            });
        }
    }

    if (cartIcon && cartModal && cartModalOverlay && closeCartModal) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            cartModal.classList.add('active');
            cartModalOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            updateCartModal();
        });

        const closeCart = () => {
            cartModal.classList.remove('active');
            cartModalOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeCartModal.addEventListener('click', closeCart);
        cartModalOverlay.addEventListener('click', closeCart);

        if (viewCartBtn) {
            viewCartBtn.addEventListener('click', () => {
                closeCart();
                showNotification('Chuyển hướng đến trang giỏ hàng...', 'info');
                setTimeout(() => {
                    window.location.href = 'cart.html';
                }, 1500);
            });
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                closeCart();
                showNotification('Chuyển hướng đến trang thanh toán...', 'info');
                setTimeout(() => {
                    window.location.href = 'checkout.html';
                }, 1500);
            });
        }
    }

    // Initialize cart count display
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalItems;

    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    // Update all cart badges
    const allCartBadges = document.querySelectorAll('.cart-badge, .badge');
    allCartBadges.forEach(badge => {
        badge.textContent = totalItems;
        badge.style.display = totalItems > 0 ? 'inline' : 'none';
    });

    // Add bounce animation styles
    // const style = document.createElement('style');
    // style.textContent = `
    //             @keyframes bounce {
    //                 0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
    //                 40%, 43% { transform: translate3d(0, -8px, 0); }
    //                 70% { transform: translate3d(0, -4px, 0); }
    //                 90% { transform: translate3d(0, -2px, 0); }
    //             }

    //             .cart-badge.bounce {
    //                 animation: bounce 0.6s ease-in-out;
    //             }

    //             .cart-modal {
    //                 position: fixed;
    //                 top: 0;
    //                 right: -400px;
    //                 width: 400px;
    //                 height: 100vh;
    //                 background: white;
    //                 z-index: 1000;
    //                 transition: right 0.3s ease;
    //                 box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    //             }

    //             .cart-modal.active {
    //                 right: 0;
    //             }

    //             .cart-modal-overlay {
    //                 position: fixed;
    //                 top: 0;
    //                 left: 0;
    //                 width: 100%;
    //                 height: 100vh;
    //                 background: rgba(0,0,0,0.5);
    //                 z-index: 999;
    //                 opacity: 0;
    //                 visibility: hidden;
    //                 transition: all 0.3s ease;
    //             }

    //             .cart-modal-overlay.active {
    //                 opacity: 1;
    //                 visibility: visible;
    //             }

    //             .cart-modal-header {
    //                 padding: 20px;
    //                 border-bottom: 1px solid #eee;
    //                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    //                 color: white;
    //             }

    //             .cart-modal-header h3 {
    //                 margin: 0;
    //                 font-size: 18px;
    //                 font-weight: 600;
    //             }

    //             .close-cart-modal {
    //                 position: absolute;
    //                 top: 15px;
    //                 right: 15px;
    //                 background: rgba(255,255,255,0.2);
    //                 border: none;
    //                 color: white;
    //                 font-size: 20px;
    //                 width: 30px;
    //                 height: 30px;
    //                 border-radius: 50%;
    //                 cursor: pointer;
    //                 display: flex;
    //                 align-items: center;
    //                 justify-content: center;
    //                 transition: background 0.2s ease;
    //             }

    //             .close-cart-modal:hover {
    //                 background: rgba(255,255,255,0.3);
    //             }

    //             .cart-modal-body {
    //                 padding: 20px;
    //                 max-height: calc(100vh - 160px);
    //                 overflow-y: auto;
    //             }

    //             .cart-modal-footer {
    //                 position: absolute;
    //                 bottom: 0;
    //                 left: 0;
    //                 right: 0;
    //                 padding: 20px;
    //                 border-top: 1px solid #eee;
    //                 background: white;
    //                 display: flex;
    //                 gap: 10px;
    //             }

    //             .view-cart-btn, .checkout-btn {
    //                 flex: 1;
    //                 padding: 12px;
    //                 border: none;
    //                 border-radius: 8px;
    //                 font-weight: 500;
    //                 cursor: pointer;
    //                 transition: all 0.2s ease;
    //             }

    //             .view-cart-btn {
    //                 background: #f0f0f0;
    //                 color: #333;
    //             }

    //             .view-cart-btn:hover {
    //                 background: #e0e0e0;
    //             }

    //             .checkout-btn {
    //                 background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    //                 color: white;
    //             }

    //             .checkout-btn:hover {
    //                 transform: translateY(-2px);
    //                 box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    //             }

    //             /* Mobile responsive */
    //             @media (max-width: 768px) {
    //                 .cart-modal {
    //                     width: 100%;
    //                     right: -100%;
    //                 }
    //             }

    //             @media (max-width: 480px) {
    //                 .cart-modal-footer {
    //                     flex-direction: column;
    //                 }

    //                 .cart-modal-body {
    //                     max-height: calc(100vh - 200px);
    //                 }
    //             }
    //         `;
    // document.head.appendChild(style);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (mobileNav && mobileNav.classList.contains('active')) {
                mobileNav.classList.remove('active');
                if (mobileOverlay) mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
            if (searchInputContainer && searchInputContainer.classList.contains('active')) {
                searchInputContainer.classList.remove('active');
                if (searchIcon) searchIcon.classList.remove('active');
                if (searchInput) searchInput.value = '';
                if (searchResultsContainer) searchResultsContainer.style.display = 'none';
            }
            if (cartModal && cartModal.classList.contains('active')) {
                cartModal.classList.remove('active');
                if (cartModalOverlay) cartModalOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });

    // Smooth animations for category hover
    categoryItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
});

// Search Box Functionality
const searchIcon = document.querySelector('.search-icon');
const searchInputContainer = document.querySelector('.search-input-container');
const searchInput = document.querySelector('.search-input');
const closeSearchBtn = document.querySelector('.close-search-btn');
const searchResultsContainer = document.querySelector('.search-results-container');

if (searchIcon && searchInputContainer && searchInput && closeSearchBtn && searchResultsContainer) {
    searchIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Search icon clicked, toggling active class');
        searchInputContainer.classList.toggle('active');
        searchIcon.classList.toggle('active');
        console.log('Class list:', searchInputContainer.classList);

        if (searchInputContainer.classList.contains('active')) {
            setTimeout(() => {
                console.log('Forcing search box open');
                searchInputContainer.classList.add('active');
                searchInput.focus();
            }, 50);
        } else {
            console.log('Search box closed, clearing input');
            searchInput.value = '';
            searchResultsContainer.style.display = 'none';
        }
    });

    async function fetchProductData() {
        if (productDataCache) return productDataCache;
        if (isFetching) return null;

        isFetching = true;
        searchResultsContainer.innerHTML = `
                    <div class="loading-results">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Đang tải dữ liệu...</p>
                    </div>
                `;
        searchResultsContainer.style.display = 'block';

        try {
            const response = await fetch('data/product.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            productDataCache = data;
            return data;
        } catch (error) {
            console.error('Failed to fetch product data:', error);
            searchResultsContainer.innerHTML = `
                        <div class="error-results">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Không thể tải dữ liệu sản phẩm</p>
                        </div>
                    `;
            searchResultsContainer.style.display = 'block';
            return null;
        } finally {
            isFetching = false;
        }
    }

    function getAllProducts(productData) {
        const products = [];
        if (!productData || !productData.categories) return products;

        productData.categories.forEach(category => {
            category.products.forEach(product => {
                const storageOptions = Object.keys(product.configurations || {});
                const firstStorage = storageOptions[0];
                const colorOptions = firstStorage ? Object.keys(product.configurations[firstStorage]) : [];
                const firstColor = colorOptions[0];
                const firstPrice = firstStorage && firstColor
                    ? product.configurations[firstStorage][firstColor].price
                    : product.price || 0;

                const imageUrl = product.defaultImage || 'images/default.jpg';

                products.push({
                    id: product.name.toLowerCase().replace(/\s+/g, '-'),
                    name: product.name,
                    category: category.id,
                    imageUrl: imageUrl,
                    price: firstPrice
                });
            });
        });

        return products;
    }

    function searchProducts(query, productData, category = 'all') {
        if (!query || query.length < 2 || !productData) return [];
        const products = getAllProducts(productData);

        return products.filter(product => {
            const matchesQuery = product.name.toLowerCase().includes(query.toLowerCase());
            const matchesCategory = category === 'all' || product.category === category;
            return matchesQuery && matchesCategory;
        });
    }

    function filterProductsByCategory(products, category) {
        if (category === 'all') return products;
        return products.filter(product => product.category === category);
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    }

    function createSearchResults(results) {
        searchResultsContainer.innerHTML = '';
        searchResultsContainer.style.display = results.length > 0 ? 'block' : 'none';

        if (results.length === 0) {
            searchResultsContainer.innerHTML = `
                        <div class="no-results-found">
                            <i class="fas fa-search"></i>
                            <p>Không tìm thấy sản phẩm nào</p>
                        </div>
                    `;
            searchResultsContainer.style.display = 'block';
            return;
        }

        results.forEach((product, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';
            resultItem.setAttribute('role', 'option');
            resultItem.setAttribute('tabindex', '0');
            resultItem.setAttribute('aria-selected', 'false');
            resultItem.setAttribute('data-index', index);
            resultItem.innerHTML = `
                        <img src="${product.imageUrl}" alt="${product.name}" onerror="this.src='images/default.jpg'">
                        <div class="product-info">
                            <div class="product-name">${product.name}</div>
                            <div class="product-category">${product.category}</div>
                            <div class="product-price">${formatPrice(product.price)}</div>
                        </div>
                        <button class="add-to-cart-btn">Thêm vào giỏ</button>
                    `;
            searchResultsContainer.appendChild(resultItem);

            resultItem.addEventListener('click', (e) => {
                if (e.target.classList.contains('add-to-cart-btn')) return;
                showNotification(`Chuyển hướng đến trang sản phẩm ${product.name}`, 'info');
                setTimeout(() => {
                    window.location.href = `product-detail.html?id=${encodeURIComponent(product.id)}#product/${product.id}`;
                }, 1000);
            });

            resultItem.querySelector('.add-to-cart-btn').addEventListener('click', () => {
                // Use Cart class if available
                if (window.myCart) {
                    window.myCart.addToCart(product.id, 1);
                } else {
                    // Fallback to old method
                    const existingItem = cartItems.find(item => item.id === product.id);
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        cartItems.push({ ...product, quantity: 1 });
                    }
                    localStorage.setItem('cart', JSON.stringify(cartItems));
                    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
                    const cartCount = document.querySelector('.cart-count');
                    if (cartCount) cartCount.textContent = totalItems;

                    // Add bounce animation
                    const cartBadge = document.getElementById('cart-badge');
                    if (cartBadge) {
                        cartBadge.textContent = totalItems;
                        cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';
                        cartBadge.classList.add('bounce');
                        setTimeout(() => cartBadge.classList.remove('bounce'), 600);
                    }
                }
                showNotification(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
            });
        });
    }

    function handleKeyboardNavigation(e) {
        const items = searchResultsContainer.querySelectorAll('.search-result-item');
        if (items.length === 0) return;

        let currentIndex = Array.from(items).findIndex(item => item === document.activeElement);
        if (currentIndex === -1) currentIndex = 0;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].focus();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            items[currentIndex].focus();
        } else if (e.key === 'Enter' && document.activeElement.classList.contains('search-result-item')) {
            e.preventDefault();
            document.activeElement.click();
        } else if (e.key === 'Escape') {
            searchInputContainer.classList.remove('active');
            searchIcon.classList.remove('active');
            searchInput.value = '';
            searchResultsContainer.style.display = 'none';
            searchIcon.focus();
        }
    }

    closeSearchBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Close button clicked');
        searchInputContainer.classList.remove('active');
        searchIcon.classList.remove('active');
        searchInput.value = '';
        searchResultsContainer.style.display = 'none';
    });

    let debounceTimer;
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim();
        debounceSearch(query);
    });

    function debounceSearch(query) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(async () => {
            if (!query) {
                searchResultsContainer.style.display = 'none';
                return;
            }

            const productData = await fetchProductData();
            const activeFilter = document.querySelector('.filter-btn.active');
            const category = activeFilter ? activeFilter.dataset.category : 'all';

            const results = searchProducts(query, productData, category);
            createSearchResults(results);
        }, 300);
    }

    searchResultsContainer.addEventListener('keydown', handleKeyboardNavigation);

    document.addEventListener('click', (e) => {
        if (!searchInputContainer.classList.contains('active') ||
            (searchIcon.contains(e.target) || searchInputContainer.contains(e.target) || searchResultsContainer.contains(e.target))) {
            return;
        }
        console.log('Clicked outside, closing search box');
        searchInputContainer.classList.remove('active');
        searchIcon.classList.remove('active');
        searchInput.value = '';
        searchResultsContainer.style.display = 'none';
    });



} else {
    console.error('Search elements not found:', {
        searchIcon: !!searchIcon,
        searchInputContainer: !!searchInputContainer,
        searchInput: !!searchInput,
        closeSearchBtn: !!closeSearchBtn,
        searchResultsContainer: !!searchResultsContainer
    });
}

// Additional utility functions
function animateCartBadge() {
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        cartBadge.classList.add('bounce');
        setTimeout(() => cartBadge.classList.remove('bounce'), 600);
    }
}

function updateAllCartCounts(count) {
    // Update all cart-related elements
    const elements = [
        '.cart-count',
        '.cart-badge',
        '#cart-badge',
        '.badge'
    ];

    elements.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.textContent = count;
            element.style.display = count > 0 ? (selector.includes('badge') ? 'flex' : 'inline') : 'none';
        }
    });

    // Animate if count increased
    if (count > 0) {
        animateCartBadge();
    }
}

// Enhanced notification system
function showEnhancedNotification(title, message, type = 'success', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `enhanced-notification ${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' :
            type === 'error' ? 'fa-exclamation-circle' :
                type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            ${message ? `<div class="notification-message">${message}</div>` : ''}
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

    // Add styles if not already added
    if (!document.querySelector('#enhanced-notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'enhanced-notification-styles';
        styles.textContent = `
            .enhanced-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.12);
                padding: 16px;
                margin-bottom: 10px;
                z-index: 10001;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                max-width: 400px;
                min-width: 300px;
                transform: translateX(100%);
                transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                border-left: 4px solid #28a745;
            }
            
            .enhanced-notification.error {
                border-left-color: #dc3545;
            }
            
            .enhanced-notification.warning {
                border-left-color: #ffc107;
            }
            
            .enhanced-notification.info {
                border-left-color: #17a2b8;
            }
            
            .enhanced-notification.show {
                transform: translateX(0);
            }
            
            .notification-icon {
                color: #28a745;
                font-size: 1.2rem;
                margin-top: 2px;
            }
            
            .enhanced-notification.error .notification-icon {
                color: #dc3545;
            }
            
            .enhanced-notification.warning .notification-icon {
                color: #ffc107;
            }
            
            .enhanced-notification.info .notification-icon {
                color: #17a2b8;
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-title {
                font-weight: 600;
                margin-bottom: 4px;
                color: #333;
            }
            
            .notification-message {
                font-size: 0.9rem;
                color: #666;
                line-height: 1.4;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
            }
            
            .notification-close:hover {
                background-color: #f5f5f5;
                color: #666;
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        closeNotification(notification);
    });

    // Auto close
    setTimeout(() => {
        closeNotification(notification);
    }, duration);
}

function closeNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 400);
}

// Performance optimization
function debounce(func, wait, immediate) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func(...args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func(...args);
    };
}

// Initialize performance optimizations
const optimizedScroll = debounce(() => {
    // Handle scroll-based animations and effects
    const scrolled = window.scrollY;
    const header = document.querySelector('.main-header');

    if (header) {
        if (scrolled > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }
}, 10);

window.addEventListener('scroll', optimizedScroll);

// Lazy loading for images
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => {
            img.src = img.dataset.src;
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    initLazyLoading();
});

// Export functions for external use
window.NavbarUtils = {
    showNotification,
    showEnhancedNotification,
    updateAllCartCounts,
    animateCartBadge,
    getCartFromStorage,
    formatPrice
};

