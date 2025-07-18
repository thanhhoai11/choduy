document.addEventListener("DOMContentLoaded", function () {
    loadPromotions();
    setupEventListeners();
});

let allPromotions = [];
let filteredPromotions = [];
const itemsPerPage = 8;
let currentPage = 1;
let currentFilter = 'all';
let searchTerm = '';

function loadPromotions() {
    fetch('data/promotion.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allPromotions = data;
            if (!allPromotions || allPromotions.length === 0) {
                document.getElementById('promotion-list').innerHTML = '<p class="col-12 text-center text-muted">Không có khuyến mãi nào vào lúc này.</p>';
                return;
            }
            filterAndSearchPromotions();
        })
        .catch(error => {
            console.error('Lỗi khi tải khuyến mãi:', error);
            document.getElementById('promotion-list').innerHTML = '<p class="col-12 text-danger text-center">Không thể tải dữ liệu khuyến mãi. Vui lòng kiểm tra file promotion.json hoặc đường dẫn.</p>';
        });
}

function filterAndSearchPromotions() {
    let tempPromotions = allPromotions;

    // Apply filter by type if not 'all'
    if (currentFilter !== 'all') {
        tempPromotions = tempPromotions.filter(promotion => {
            return promotion.type && promotion.type.toLowerCase() === currentFilter;
        });
    }

    // Apply search by title only
    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        tempPromotions = tempPromotions.filter(promotion => {
            const title = promotion.title ? promotion.title.toLowerCase() : '';
            const description = promotion.description ? promotion.description.toLowerCase() : '';
            return title.includes(lowerCaseSearchTerm) || description.includes(lowerCaseSearchTerm);
        });
    }

    filteredPromotions = tempPromotions;
    currentPage = 1;
    displayPromotions(currentPage);
    setupPagination(filteredPromotions.length, itemsPerPage);
}

function displayPromotions(page) {
    currentPage = page;
    const promotionListBox = document.getElementById('promotion-list');
    promotionListBox.innerHTML = '';

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const promotionsToDisplay = filteredPromotions.slice(startIndex, endIndex);

    const noResultsElement = document.getElementById('no-results');
    if (promotionsToDisplay.length === 0) {
        if (noResultsElement) noResultsElement.classList.remove('d-none');
        return;
    } else {
        if (noResultsElement) noResultsElement.classList.add('d-none');
    }

    promotionsToDisplay.forEach(promotion => {
        const promotionBox = document.createElement('div');
        promotionBox.className = 'promotion-box';
        promotionBox.setAttribute('data-type', promotion.type ? promotion.type : 'general');
        promotionBox.setAttribute('data-bs-toggle', 'modal');
        promotionBox.setAttribute('data-bs-target', '#promotionModal');
        promotionBox.setAttribute('data-id', promotion.id || '');
        promotionBox.setAttribute('data-title', promotion.title || '');
        promotionBox.setAttribute('data-description', promotion.description || '');
        promotionBox.setAttribute('data-start-date', promotion.startDate || '');
        promotionBox.setAttribute('data-end-date', promotion.endDate || '');
        promotionBox.setAttribute('data-promo-type', promotion.type || 'general');
        promotionBox.setAttribute('data-url', promotion.url || '#');
        promotionBox.setAttribute('data-image-url', promotion.image || 'assets/promotions/default-promo.jpg');
        promotionBox.setAttribute('data-details-html', promotion.details || '');

        const boxImageUrl = promotion.image && promotion.image !== "" ? promotion.image : 'assets/promotions/default-promo.jpg';
        const boxTitle = promotion.title || 'Ưu Đãi Mới';
        const boxDescription = promotion.description || 'Thông tin khuyến mãi đang cập nhật.';
        const boxStartDateFormatted = promotion.startDate ? new Date(promotion.startDate).toLocaleDateString('vi-VN') : 'N/A';
        const boxEndDateFormatted = promotion.endDate ? new Date(promotion.endDate).toLocaleDateString('vi-VN') : 'N/A';
        const boxTypeDisplay = promotion.type ? promotion.type.replace('-', ' ').toUpperCase() : 'KHUYẾN MÃI';

        promotionBox.innerHTML = `
            <img src="${boxImageUrl}" class="promotion-box-image" alt="${boxTitle}" onerror="this.onerror=null;this.src='assets/promotions/default-promo.jpg';">
            <div class="promotion-box-content">
                <h5 class="promotion-box-title">${boxTitle}</h5>
                <p class="promotion-box-description">${boxDescription}</p>
                <p class="promotion-box-date">Thời gian: ${boxStartDateFormatted} - ${boxEndDateFormatted}</p>
            </div>
            <div class="promotion-box-footer">
                <span class="promotion-box-type">${boxTypeDisplay}</span>
                <span class="promotion-box-link">Xem chi tiết <i class="fas fa-external-link-alt"></i></span>
            </div>
        `;
        promotionListBox.appendChild(promotionBox);
    });
}

function setupPagination(totalItems, itemsPerPage) {
    const paginationContainer = document.getElementById('pagination-container');
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return;
    }

    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            displayPromotions(currentPage - 1);
            setupPagination(totalItems, itemsPerPage);
        }
    });
    paginationContainer.appendChild(prevLi);

    for (let i = 1; i <= totalPages; i++) {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageLi.addEventListener('click', (e) => {
            e.preventDefault();
            displayPromotions(i);
            setupPagination(totalItems, itemsPerPage);
        });
        paginationContainer.appendChild(pageLi);
    }

    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            displayPromotions(currentPage + 1);
            setupPagination(totalItems, itemsPerPage);
        }
    });
    paginationContainer.appendChild(nextLi);
}

const promotionModal = document.getElementById('promotionModal');
promotionModal.addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    const id = button.getAttribute('data-id');
    const title = button.getAttribute('data-title');
    const description = button.getAttribute('data-description');
    const startDate = button.getAttribute('data-start-date');
    const endDate = button.getAttribute('data-end-date');
    const type = button.getAttribute('data-promo-type');
    const url = button.getAttribute('data-url');
    const imageUrl = button.getAttribute('data-image-url');
    const detailsHtml = button.getAttribute('data-details-html');

    const modalTitle = promotionModal.querySelector('#modalTitle');
    const modalDesc = promotionModal.querySelector('#modalDesc');
    const modalDetails = promotionModal.querySelector('#modalDetails');
    const modalActionBtn = promotionModal.querySelector('#modalActionBtn');

    modalTitle.textContent = title;
    modalDesc.textContent = description;
    modalDetails.innerHTML = detailsHtml;

    const generalInfoDiv = document.createElement('div');
    generalInfoDiv.innerHTML = `
        <p class="mt-3"><strong>Loại ưu đãi:</strong> ${type ? type.replace('-', ' ').toUpperCase() : 'N/A'}</p>
        <p><strong>Thời gian:</strong> ${startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'N/A'} - ${endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'N/A'}</p>
    `;
    modalDetails.appendChild(generalInfoDiv);

    if (imageUrl && imageUrl !== 'assets/promotions/default-promo.jpg') {
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.alt = title;
        imgElement.className = 'img-fluid mt-3 mb-3';
        imgElement.style.maxHeight = '300px';
        imgElement.style.objectFit = 'contain';
        modalDetails.appendChild(imgElement);
    }

    if (url && url !== '#' && url !== 'undefined' && url !== null) {
        modalActionBtn.href = url;
        modalActionBtn.style.display = 'inline-block';
    } else {
        modalActionBtn.style.display = 'none';
    }
});

function setupEventListeners() {
    document.querySelectorAll('.filter-item').forEach(button => {
        button.addEventListener('click', function () {
            document.querySelectorAll('.filter-item').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.getAttribute('data-filter');
            filterAndSearchPromotions();
        });
    });

    const searchInput = document.getElementById('search-promotions');
    const searchButton = document.getElementById('btn-search');

    if (searchInput && searchButton) {
        const applySearch = () => {
            searchTerm = searchInput.value.trim();
            filterAndSearchPromotions();
        };

        searchButton.addEventListener('click', applySearch);
        searchInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                applySearch();
            }
        });
    }
}