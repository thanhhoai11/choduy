const categories = ['iphone', 'macbook', 'ipad', 'applewatch', 'airpod', 'phukien'];
let allProductsData = [];

const productModal = document.getElementById('productModal');
const closeModalButton = document.querySelector('.modal .close-button');
const modalProductName = document.getElementById('modalProductName');
const modalProductPrice = document.getElementById('modalProductPrice');
const modalProductOriginalPrice = document.getElementById('modalProductOriginalPrice');
const modalProductDiscount = document.getElementById('modalProductDiscount');
const modalProductDescription = document.getElementById('modalProductDescription');
const modalProductSpecs = document.getElementById('modalProductSpecs');
const modalMainImage = document.getElementById('modalMainImage');
const modalThumbnails = document.getElementById('modalThumbnails');
const modalProductConfigurations = document.getElementById('modalProductConfigurations');
const modalProductPromotions = document.getElementById('modalProductPromotions');
const promotionsList = document.getElementById('promotionsList');
const addToCartBtn = document.querySelector('.add-to-cart-btn');
const buyNowBtn = document.querySelector('.buy-now-btn');

function createSlug(productName) {
    return productName
        .toLowerCase()
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
        .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
        .replace(/[ìíịỉĩ]/g, 'i')
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
        .replace(/[ùúụủũưừứựửữ]/g, 'u')
        .replace(/[ỳýỵỷỹ]/g, 'y')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

function getProductBySlug(slug) {
    return allProductsData.find(product => createSlug(product.name) === slug);
}

function calculatePrice(originalPrice, discount) {
    return originalPrice * (1 - discount / 100);
}

function openProductModal(product) {
    try {
        productModal.classList.add('loading');
        modalProductName.textContent = 'Đang tải...';
        modalProductPrice.textContent = '';
        modalProductOriginalPrice.textContent = '';
        modalProductDiscount.textContent = '';
        modalProductDescription.innerHTML = '';
        modalProductSpecs.innerHTML = '';
        modalMainImage.src = '';
        modalThumbnails.innerHTML = '';
        modalProductConfigurations.innerHTML = '';
        promotionsList.innerHTML = '';

        modalProductName.textContent = product.name || 'Sản phẩm không xác định';

        // Configurations (Storage and Color)
        modalProductConfigurations.innerHTML = '';
        modalProductConfigurations.style.display = 'block';
        if (product.configurations && Object.keys(product.configurations).length > 0) {
            // Create dropdown for Storage
            const storageDiv = document.createElement('div');
            storageDiv.classList.add('modal-configuration-option');
            const storageLabel = document.createElement('label');
            storageLabel.textContent = 'Dung lượng:';
            storageLabel.setAttribute('for', 'select-storage');
            storageDiv.appendChild(storageLabel);

            const storageSelect = document.createElement('select');
            storageSelect.id = 'select-storage';
            storageSelect.setAttribute('aria-label', 'Chọn Dung lượng');
            Object.keys(product.configurations).forEach(storage => {
                const option = document.createElement('option');
                option.value = storage;
                option.textContent = storage;
                storageSelect.appendChild(option);
            });
            storageDiv.appendChild(storageSelect);
            modalProductConfigurations.appendChild(storageDiv);

            // Create dropdown for Color based on selected Storage
            const colorDiv = document.createElement('div');
            colorDiv.classList.add('modal-configuration-option');
            const colorLabel = document.createElement('label');
            colorLabel.textContent = 'Màu sắc:';
            colorLabel.setAttribute('for', 'select-color');
            colorDiv.appendChild(colorLabel);

            const colorSelect = document.createElement('select');
            colorSelect.id = 'select-color';
            colorSelect.setAttribute('aria-label', 'Chọn Màu sắc');
            const firstStorage = Object.keys(product.configurations)[0];
            const colors = Object.keys(product.configurations[firstStorage]);
            colors.forEach(color => {
                const option = document.createElement('option');
                option.value = color;
                option.textContent = color;
                colorSelect.appendChild(option);
            });
            colorDiv.appendChild(colorSelect);
            modalProductConfigurations.appendChild(colorDiv);

            // Update colors when storage changes
            storageSelect.addEventListener('change', () => {
                colorSelect.innerHTML = '';
                const selectedStorage = storageSelect.value;
                const availableColors = Object.keys(product.configurations[selectedStorage]);
                availableColors.forEach(color => {
                    const option = document.createElement('option');
                    option.value = color;
                    option.textContent = color;
                    colorSelect.appendChild(option);
                });
                updateModalContent(product);
            });

            // Update modal content when color changes
            colorSelect.addEventListener('change', () => updateModalContent(product));
        } else {
            modalProductConfigurations.style.display = 'none';
        }

        updateModalContent(product);

        modalProductDescription.innerHTML = '';
        if (product.description && product.description.paragraphs && Array.isArray(product.description.paragraphs)) {
            product.description.paragraphs.forEach(pText => {
                const p = document.createElement('p');
                p.textContent = pText || 'Không có mô tả';
                modalProductDescription.appendChild(p);
            });
        } else {
            const p = document.createElement('p');
            p.textContent = 'Không có mô tả sản phẩm.';
            modalProductDescription.appendChild(p);
        }

        modalProductSpecs.innerHTML = '';
        if (product.specs && Object.keys(product.specs).length > 0) {
            for (const [groupName, specs] of Object.entries(product.specs)) {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'spec-group';
                const title = document.createElement('h4');
                title.textContent = groupName || 'Thông số';
                groupDiv.appendChild(title);
                const ul = document.createElement('ul');
                for (const [key, value] of Object.entries(specs)) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${key}:</strong> ${Array.isArray(value) ? value.join(', ') : (value || 'N/A')}`;
                    ul.appendChild(li);
                }
                groupDiv.appendChild(ul);
                modalProductSpecs.appendChild(groupDiv);
            }
        } else {
            const p = document.createElement('p');
            p.textContent = 'Không có thông số kỹ thuật.';
            modalProductSpecs.appendChild(p);
        }

        promotionsList.innerHTML = '';
        if (product.promotions && Array.isArray(product.promotions) && product.promotions.length > 0) {
            modalProductPromotions.style.display = 'block';
            product.promotions.forEach(promo => {
                const li = document.createElement('li');
                li.textContent = promo || 'Khuyến mãi không xác định';
                promotionsList.appendChild(li);
            });
        } else {
            modalProductPromotions.style.display = 'none';
        }

        productModal.style.display = 'flex';
        productModal.setAttribute('aria-hidden', 'false');
        productModal.classList.remove('loading');
        modalProductName.focus();

    } catch (error) {
        console.error('Error opening product modal:', error);
        if (window.myCart) {
            window.myCart.showToast('Lỗi', 'error', 'Không thể mở chi tiết sản phẩm');
        }
        productModal.classList.remove('loading');
        modalProductName.textContent = 'Lỗi tải sản phẩm';
    }
}

function updateModalContent(prod) {
    try {
        const storageSelect = document.getElementById('select-storage');
        const colorSelect = document.getElementById('select-color');
        let selectedStorage = storageSelect ? storageSelect.value : null;
        let selectedColor = colorSelect ? colorSelect.value : null;

        let priceToDisplay = prod.price || 0;
        let originalPriceToDisplay = prod.originalPrice || 0;
        let discountToDisplay = prod.discount || 0;
        let imageToDisplay = prod.defaultImage || 'images/fallback.jpg';
        let imagesForThumbnails = [imageToDisplay];

        // If the product has configurations (e.g., Storage and Color)
        if (prod.configurations && Object.keys(prod.configurations).length > 0) {
            // If no storage or color selected, use the first available option
            if (!selectedStorage) {
                selectedStorage = Object.keys(prod.configurations)[0];
                if (storageSelect) storageSelect.value = selectedStorage;
            }
            if (!selectedColor) {
                selectedColor = Object.keys(prod.configurations[selectedStorage])[0];
                if (colorSelect) colorSelect.value = selectedColor;
            }

            // Get price, original price, and discount from selected configuration
            if (prod.configurations[selectedStorage] && prod.configurations[selectedStorage][selectedColor]) {
                const config = prod.configurations[selectedStorage][selectedColor];
                priceToDisplay = config.price || 0;
                originalPriceToDisplay = config.originalPrice || priceToDisplay;
                discountToDisplay = config.discount || 0;
            } else {
                // Fallback to the first configuration if selected config is invalid
                const firstStorage = Object.keys(prod.configurations)[0];
                const firstColor = Object.keys(prod.configurations[firstStorage])[0];
                const config = prod.configurations[firstStorage][firstColor];
                priceToDisplay = config.price || 0;
                originalPriceToDisplay = config.originalPrice || priceToDisplay;
                discountToDisplay = config.discount || 0;
            }

            // Get image based on selected configuration
            if (prod.images && prod.images[selectedStorage] && prod.images[selectedStorage][selectedColor]) {
                imageToDisplay = prod.images[selectedStorage][selectedColor];
            } else if (prod.images) {
                // Fallback to the first image
                const firstStorage = Object.keys(prod.images)[0];
                const firstColor = Object.keys(prod.images[firstStorage])[0];
                imageToDisplay = prod.images[firstStorage][firstColor] || prod.defaultImage;
            }
        } else if (prod.price) {
            // For products without configurations (e.g., accessories)
            priceToDisplay = prod.price;
            originalPriceToDisplay = prod.originalPrice || priceToDisplay;
            discountToDisplay = prod.discount || 0;
        }

        // Collect images for thumbnails
        const collectedImages = new Set();
        function collectNestedImages(obj) {
            if (!obj) return;
            for (const key in obj) {
                if (typeof obj[key] === 'string' && (obj[key].startsWith('images/') || obj[key].startsWith('http'))) {
                    collectedImages.add(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    collectNestedImages(obj[key]);
                }
            }
        }

        if (imageToDisplay && typeof imageToDisplay === 'string') {
            collectedImages.add(imageToDisplay);
        }

        if (prod.images && typeof prod.images === 'object') {
            Object.values(prod.images).forEach(storage => {
                Object.values(storage).forEach(img => {
                    if (typeof img === 'string' && (img.startsWith('images/') || img.startsWith('http'))) {
                        collectedImages.add(img);
                    }
                });
            });
        }

        imagesForThumbnails = Array.from(collectedImages);
        if (imageToDisplay && !imagesForThumbnails.includes(imageToDisplay) && imagesForThumbnails.length > 0) {
            imagesForThumbnails.unshift(imageToDisplay);
        } else if (imageToDisplay && imagesForThumbnails.length === 0) {
            imagesForThumbnails = [imageToDisplay];
        }

        // Format prices using Vietnamese currency
        const formatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
        modalProductPrice.textContent = formatter.format(priceToDisplay);
        modalProductOriginalPrice.textContent = originalPriceToDisplay > priceToDisplay ? formatter.format(originalPriceToDisplay) : '';
        modalProductDiscount.textContent = discountToDisplay > 0 ? `Giảm ${discountToDisplay}%` : '';

        modalMainImage.src = imageToDisplay;
        modalMainImage.alt = `${prod.name || 'Sản phẩm'} image`;
        modalMainImage.onerror = () => {
            modalMainImage.src = 'images/fallback.jpg';
            modalMainImage.alt = 'Hình ảnh sản phẩm không khả dụng';
        };

        modalThumbnails.innerHTML = '';
        imagesForThumbnails.forEach(imgSrc => {
            if (imgSrc) {
                const imgThumb = document.createElement('img');
                imgThumb.src = imgSrc;
                imgThumb.classList.add('modal-thumbnail');
                imgThumb.setAttribute('loading', 'lazy');
                imgThumb.alt = `Hình thu nhỏ của ${prod.name || 'sản phẩm'}`;
                if (imgSrc === imageToDisplay) {
                    imgThumb.classList.add('active');
                }
                imgThumb.addEventListener('click', () => {
                    modalMainImage.src = imgSrc;
                    modalMainImage.alt = `${prod.name || 'Sản phẩm'} image`;
                    document.querySelectorAll('.modal-thumbnail').forEach(thumb => {
                        thumb.classList.remove('active');
                    });
                    imgThumb.classList.add('active');
                });
                modalThumbnails.appendChild(imgThumb);
            }
        });
    } catch (error) {
        console.error('Error updating modal content:', error);
        if (window.myCart) {
            window.myCart.showToast('Lỗi', 'error', 'Lỗi khi cập nhật thông tin sản phẩm');
        }
    }
}

function closeModal() {
    productModal.style.display = 'none';
    productModal.setAttribute('aria-hidden', 'true');
    productModal.classList.remove('loading');
}

closeModalButton.addEventListener('click', closeModal);

window.addEventListener('click', (event) => {
    if (event.target === productModal) {
        closeModal();
    }
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && productModal.style.display === 'flex') {
        closeModal();
    }
});

if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
        if (!window.myCart) {
            console.error('Cart instance not initialized');
            alert('Giỏ hàng chưa được khởi tạo. Vui lòng tải lại trang.');
            return;
        }

        const productName = modalProductName.textContent;
        const productId = createSlug(productName);
        const selectedConfig = {
            storage: document.getElementById('select-storage')?.value || 'Standard',
            color: document.getElementById('select-color')?.value || 'Default'
        };

        const product = allProductsData.find(p => p.name === productName);
        if (!product) {
            window.myCart.showToast('Lỗi', 'error', 'Sản phẩm không tồn tại');
            return;
        }

        let price = product.price || 0;
        let image = product.defaultImage || 'images/fallback.jpg';
        let currentConfigLevel = product.configurations;

        if (currentConfigLevel) {
            if (currentConfigLevel[selectedConfig.storage] && currentConfigLevel[selectedConfig.storage][selectedConfig.color]) {
                price = currentConfigLevel[selectedConfig.storage][selectedConfig.color].price || 0;
            } else {
                const firstStorage = Object.keys(currentConfigLevel)[0];
                const firstColor = Object.keys(currentConfigLevel[firstStorage])[0];
                price = currentConfigLevel[firstStorage][firstColor].price || 0;
            }
        }

        let currentImagesLevel = product.images;
        if (currentImagesLevel && currentImagesLevel[selectedConfig.storage] && currentImagesLevel[selectedConfig.storage][selectedConfig.color]) {
            image = currentImagesLevel[selectedConfig.storage][selectedConfig.color];
        } else if (currentImagesLevel) {
            const firstStorage = Object.keys(currentImagesLevel)[0];
            const firstColor = Object.keys(currentImagesLevel[firstStorage])[0];
            image = currentImagesLevel[firstStorage][firstColor] || product.defaultImage;
        }

        try {
            await window.myCart.addToCart(productId, 1);
            showToast('Thành công', 'success', `Đã thêm "${productName}" vào giỏ hàng`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            window.myCart.showToast('Lỗi', 'error', `Không thể thêm "${productName}" vào giỏ hàng`);
        }
    });
}

if (buyNowBtn) {
    buyNowBtn.addEventListener('click', () => {
        const productName = modalProductName.textContent;
        const selectedConfig = Array.from(modalProductConfigurations.querySelectorAll('select')).reduce((acc, select) => {
            acc[select.id.replace('select-', '')] = select.value;
            return acc;
        }, {});
        const price = parseInt(modalProductPrice.textContent.replace(/[^\d]/g, '')) || 0;

        sessionStorage.setItem('checkoutItems', JSON.stringify([{
            name: productName,
            config: selectedConfig,
            price: price,
            image: modalMainImage.src,
            quantity: 1
        }]));
        window.location.href = 'checkout.html';
    });
}

function initializeCarousel(categoryId, container, prevBtn, nextBtn) {
    let scrollPosition = 0;
    const cardWidth = 240;
    const maxScroll = container.scrollWidth - container.clientWidth;

    const updateButtonStates = () => {
        prevBtn.disabled = scrollPosition <= 0;
        nextBtn.disabled = scrollPosition >= maxScroll;
        prevBtn.setAttribute('aria-disabled', prevBtn.disabled);
        nextBtn.setAttribute('aria-disabled', nextBtn.disabled);
    };

    nextBtn.addEventListener('click', () => {
        if (scrollPosition < maxScroll) {
            scrollPosition += cardWidth;
            container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
            updateButtonStates();
        }
    });

    prevBtn.addEventListener('click', () => {
        if (scrollPosition > 0) {
            scrollPosition -= cardWidth;
            container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
            updateButtonStates();
        }
    });

    container.addEventListener('scroll', () => {
        scrollPosition = container.scrollLeft;
        updateButtonStates();
    });

    if (container.scrollWidth <= container.clientWidth) {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } else {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    }
}

fetch('data/product.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Không thể tải dữ liệu sản phẩm');
        }
        return response.json();
    })
    .then(data => {
        allProductsData = data.categories.flatMap(cat => cat.products.map(p => ({ ...p, categoryId: cat.id })));

        categories.forEach(categoryId => {
            const container = document.getElementById(categoryId);
            const prevBtn = document.getElementById(`prev-${categoryId}`);
            const nextBtn = document.getElementById(`next-${categoryId}`);

            const category = data.categories.find(cat => cat.id === categoryId);
            if (!category || !container) return;

            container.innerHTML = '<div class="carousel-loading" role="alert" aria-live="polite">Đang tải sản phẩm...</div>';

            category.products.forEach(product => {
                const productCard = document.createElement('div');
                productCard.classList.add('product-card');
                productCard.setAttribute('role', 'article');

                let displayPrice = product.price || 0;
                let displayOriginalPrice = product.originalPrice || 0;
                let displayDiscount = product.discount || 0;
                let displayImageSrc = product.defaultImage || 'images/fallback.jpg';

                if (product.configurations && Object.keys(product.configurations).length > 0) {
                    const firstConfigName = Object.keys(product.configurations)[0];
                    const firstConfigOptions = product.configurations[firstConfigName];

                    if (firstConfigOptions && Object.keys(firstConfigOptions).length > 0) {
                        const firstOptionKey = Object.keys(firstConfigOptions)[0];
                        let currentPriceInfo = firstConfigOptions[firstOptionKey];
                        let currentImageInfo = product.images?.[firstConfigName]?.[firstOptionKey];

                        if (typeof currentPriceInfo === 'object' && Object.keys(currentPriceInfo).length > 0 && typeof currentPriceInfo.price === 'undefined') {
                            const secondLevelConfigKey = Object.keys(currentPriceInfo)[0];
                            currentPriceInfo = currentPriceInfo[secondLevelConfigKey];
                            currentImageInfo = product.images?.[firstConfigName]?.[firstOptionKey]?.[secondLevelConfigKey] || currentImageInfo;
                        }

                        if (typeof currentPriceInfo.price === 'number') {
                            displayPrice = currentPriceInfo.price;
                            displayOriginalPrice = currentPriceInfo.originalPrice || displayPrice;
                            displayDiscount = currentPriceInfo.discount || 0;
                        }
                        if (currentImageInfo && typeof currentImageInfo === 'string') {
                            displayImageSrc = currentImageInfo;
                        }
                    }
                }

                const productSlug = createSlug(product.name);

                productCard.innerHTML = `
                    <div class="product-image-container">
                        <img src="${displayImageSrc}" alt="${product.name || 'Sản phẩm'}" class="product-image" loading="lazy" onerror="this.src='images/fallback.jpg'; this.alt='Hình ảnh sản phẩm không khả dụng'">
                        ${displayDiscount > 0 ? `<div class="discount-badge">Giảm ${displayDiscount}%</div>` : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.name || 'Sản phẩm không xác định'}</h3>
                        <p class="price-section">
                            <span class="price">${displayPrice.toLocaleString('vi-VN')} đ</span>
                            ${displayOriginalPrice > 0 && displayOriginalPrice !== displayPrice ? `<span class="original-price">${displayOriginalPrice.toLocaleString('vi-VN')} đ</span>` : ''}
                        </p>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-secondary btn-quick-view" data-product-id="${product.name}" aria-label="Xem nhanh ${product.name || 'sản phẩm'}">Xem nhanh</button>
                        <a href="product-detail.html?id=${encodeURIComponent(product.name)}" class="btn btn-primary btn-detail" aria-label="Xem chi tiết ${product.name || 'sản phẩm'}">Xem chi tiết</a>
                    </div>
                `;
                container.appendChild(productCard);
            });

            container.querySelector('.carousel-loading')?.remove();

            container.querySelectorAll('.btn-quick-view').forEach(button => {
                button.addEventListener('click', (event) => {
                    const productId = event.currentTarget.dataset.productId;
                    const product = allProductsData.find(p => p.name === productId);
                    if (product) {
                        openProductModal(product);
                    } else {
                        console.error('Sản phẩm không tìm thấy:', productId);
                        if (window.myCart) {
                            window.myCart.showToast('Lỗi', 'error', 'Sản phẩm không tồn tại');
                        }
                    }
                });
            });

            initializeCarousel(categoryId, container, prevBtn, nextBtn);
        });
    })
    .catch(error => {
        console.error('Lỗi khi tải dữ liệu sản phẩm:', error);
        if (window.myCart) {
            window.myCart.showToast('Lỗi', 'error', 'Không thể tải danh sách sản phẩm');
        }
        categories.forEach(categoryId => {
            const container = document.getElementById(categoryId);
            if (container) {
                container.innerHTML = '<p role="alert" aria-live="assertive">Lỗi tải sản phẩm, vui lòng thử lại sau.</p>';
            }
        });
    });

document.addEventListener('DOMContentLoaded', () => {
    productModal.style.display = 'none';
    productModal.setAttribute('aria-hidden', 'true');
    productModal.classList.remove('loading');
});

window.getProductBySlug = getProductBySlug;