// promotion_detail.js - Script xử lý dữ liệu khuyến mãi 

/**
 * Format date to Vietnamese format
 * @param {string} dateString - Date string in format yyyy-mm-dd
 * @return {string} Formatted date string in Vietnamese format dd/mm/yyyy
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

/**
 * Generate HTML for promotion cards
 * @param {Object} promo - Promotion object
 * @return {string} HTML for promotion card
 */
function createPromotionCard(promo) {
    return `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="promotion-card card">
                <img src="${promo.image}" class="card-img-top" alt="${promo.title}" onerror="this.src='/api/placeholder/400/320'">
                <div class="card-body">
                    <h3 class="card-title">${promo.title}</h3>
                    <p class="card-text">${promo.description}</p>
                    <p class="promotion-date">Từ ngày: ${formatDate(promo.startDate)}</p>
                    <button class="btn btn-apple promotion-details" data-id="${promo.id}">Xem Chi Tiết</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Show promotion details in modal
 * @param {string} promoId - Promotion ID
 * @param {Array} promotions - Array of promotions
 */
function showPromotionDetails(promoId, promotions) {
    const promotion = promotions.find(p => p.id === promoId);
    
    if (!promotion) return;
    
    // Cập nhật nội dung modal
    $("#modalTitle").text(promotion.title);
    $("#modalDesc").text(promotion.description);
    $("#modalDetails").html(promotion.details);
    
    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('promotionModal'));
    modal.show();
}

/**
 * Sort promotions by date (newest first)
 * @param {Array} promotions - Array of promotions
 * @return {Array} Sorted promotions
 */
function sortPromotionsByDate(promotions) {
    return promotions.sort((a, b) => {
        const dateA = new Date(a.startDate);
        const dateB = new Date(b.startDate);
        return dateB - dateA;
    });
}

/**
 * Generate pagination HTML
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @return {string} Pagination HTML
 */
function createPagination(currentPage, totalPages) {
    let paginationHTML = '<nav aria-label="Phân trang khuyến mãi"><ul class="pagination justify-content-center">';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Trước">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Sau">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `;
    
    paginationHTML += '</ul></nav>';
    return paginationHTML;
}

/**
 * Display promotions for current page
 * @param {Array} promotions - Array of promotions
 * @param {number} currentPage - Current page number
 * @param {number} itemsPerPage - Number of items per page
 */
function displayPromotions(promotions, currentPage, itemsPerPage) {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentPromotions = promotions.slice(startIndex, endIndex);
    
    const promotionList = $("#promotion-list");
    let promotionHTML = '';
    
    if (currentPromotions.length === 0) {
        promotionHTML = '<div class="col-12 text-center"><p>Không có khuyến mãi nào.</p></div>';
    } else {
        currentPromotions.forEach(promo => {
            promotionHTML += createPromotionCard(promo);
        });
    }
    
    promotionList.html(promotionHTML);
    
    // Hiển thị phân trang
    const totalPages = Math.ceil(promotions.length / itemsPerPage);
    const paginationHTML = createPagination(currentPage, totalPages);
    $("#pagination-container").html(paginationHTML);
}

/**
 * Filter promotions based on search term
 * @param {Array} promotions - Array of promotions
 * @param {string} searchTerm - Search term
 * @return {Array} Filtered promotions
 */
function filterPromotions(promotions, searchTerm) {
    if (!searchTerm) return promotions;
    
    searchTerm = searchTerm.toLowerCase().trim();
    return promotions.filter(promo => {
        return promo.title.toLowerCase().includes(searchTerm) || 
               promo.description.toLowerCase().includes(searchTerm);
    });
}

// Main function
$(document).ready(function() {
    // Lấy dữ liệu khuyến mãi từ file JSON đã có sẵn trong biến promotionsData
    const promotionsData = [
        {
            "id": "promo01",
            "title": "Giảm 20% cho iPhone 15 Pro",
            "image": "assets/promotions/iphone15pro.jpg",
            "description": "Ưu đãi siêu sốc chỉ trong tuần này!",
            "startDate": "2025-04-20",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Giảm giá</td><td>Giảm trực tiếp 20% giá bán iPhone 15 Pro</td></tr><tr><td>Áp dụng</td><td>Áp dụng tại tất cả chi nhánh và kênh online</td></tr><tr><td>Số lượng</td><td>Số lượng có hạn, nhanh tay nhé!</td></tr></table>"
        },
        {
            "id": "promo02",
            "title": "Tặng ốp lưng khi mua iPad Air",
            "image": "assets/promotions/ipadair-case.jpg",
            "description": "Mua iPad là có quà liền tay!",
            "startDate": "2025-04-15",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Quà tặng</td><td>Tặng 1 ốp lưng cao cấp trị giá 500.000đ</td></tr><tr><td>Áp dụng</td><td>Áp dụng cho iPad Air 2024 tại cửa hàng</td></tr><tr><td>Chú ý</td><td>Không áp dụng đồng thời các chương trình khác</td></tr></table>"
        },
        {
            "id": "promo03",
            "title": "Combo Apple Watch + Dây đeo thời trang",
            "image": "assets/promotions/applewatch-combo.jpg",
            "description": "Phong cách & công nghệ cùng lúc!",
            "startDate": "2025-04-10",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Quà tặng</td><td>Tặng dây đeo thời trang bằng da trị giá 1.200.000đ</td></tr><tr><td>Áp dụng</td><td>Áp dụng cho Apple Watch Series 9</td></tr><tr><td>Chú ý</td><td>Chọn màu dây đeo theo sở thích, áp dụng đến 30/4/2025 hoặc khi hết quà</td></tr></table>"
        },
        {
            "id": "promo04",
            "title": "MacBook Air M3 - Ưu đãi học sinh, sinh viên",
            "image": "assets/promotions/macbook-student.jpg",
            "description": "Học tốt, giá tốt!",
            "startDate": "2025-04-05",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Giảm giá</td><td>Giảm ngay 10% khi mua MacBook Air M3</td></tr><tr><td>Quà tặng</td><td>Tặng balo thời trang chuyên dụng cho laptop</td></tr><tr><td>Chú ý</td><td>Xuất trình thẻ học sinh/sinh viên khi thanh toán</td></tr></table>"
        },
        {
            "id": "promo05",
            "title": "Mua AirPods Pro 2, nhận ngay Apple Music 6 tháng",
            "image": "assets/promotions/airpods-music.jpg",
            "description": "Nghe nhạc thả ga cùng AirPods!",
            "startDate": "2025-04-12",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Quà tặng</td><td>Nhận mã Apple Music 6 tháng miễn phí</td></tr><tr><td>Áp dụng</td><td>Áp dụng khi mua AirPods Pro 2</td></tr><tr><td>Chú ý</td><td>Mỗi khách hàng chỉ nhận 1 mã, không áp dụng cho người đã sử dụng Apple Music</td></tr></table>"
        },{
            "id": "promo06",
            "title": "Giảm 15% khi mua Apple Pencil 2",
            "image": "assets/promotions/applepencil2.jpg",
            "description": "Vẽ sáng tạo, giá ưu đãi!",
            "startDate": "2025-05-01",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Giảm giá</td><td>Giảm trực tiếp 15% cho Apple Pencil 2</td></tr><tr><td>Áp dụng</td><td>Dành cho khách hàng mua kèm iPad Pro</td></tr><tr><td>Chú ý</td><td>Không áp dụng cùng các khuyến mãi khác</td></tr></table>"
        },
        {
            "id": "promo07",
            "title": "Tặng chuột Bluetooth khi mua Mac Mini",
            "image": "assets/promotions/macmini-mouse.jpg",
            "description": "Trang bị văn phòng hiệu quả hơn!",
            "startDate": "2025-05-03",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Quà tặng</td><td>Chuột Bluetooth không dây trị giá 700.000đ</td></tr><tr><td>Áp dụng</td><td>Mua Mac Mini M2 tại cửa hàng hoặc online</td></tr><tr><td>Chú ý</td><td>Không quy đổi quà tặng thành tiền mặt</td></tr></table>"
        },
        {
            "id": "promo08",
            "title": "Trả góp 0% cho iMac M3",
            "image": "assets/promotions/imac-m3-installment.jpg",
            "description": "Sở hữu iMac dễ dàng hơn bao giờ hết!",
            "startDate": "2025-04-28",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Ưu đãi</td><td>Trả góp lãi suất 0% qua thẻ tín dụng</td></tr><tr><td>Áp dụng</td><td>iMac M3 24 inch bản 2024</td></tr><tr><td>Chú ý</td><td>Kỳ hạn từ 6–12 tháng, yêu cầu giấy tờ CMND/CCCD</td></tr></table>"
        },
        {
            "id": "promo09",
            "title": "Giảm 1.000.000đ khi đổi Apple Watch cũ",
            "image": "assets/promotions/applewatch-tradein.jpg",
            "description": "Đổi cũ lấy mới – Tiết kiệm ngay!",
            "startDate": "2025-04-25",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Giảm giá</td><td>Giảm 1 triệu đồng khi đổi Apple Watch Series 6 trở lên</td></tr><tr><td>Áp dụng</td><td>Áp dụng khi mua Apple Watch Series 9</td></tr><tr><td>Chú ý</td><td>Thiết bị cũ phải hoạt động tốt, không móp méo</td></tr></table>"
        },
        {
            "id": "promo10",
            "title": "Tặng sạc nhanh khi mua iPhone SE 2024",
            "image": "assets/promotions/iphone-se-charger.jpg",
            "description": "Nhỏ gọn nhưng mạnh mẽ và tiết kiệm!",
            "startDate": "2025-05-02",
            "details": "<style>table {width: 100%; border-collapse: collapse; margin-top: 10px;} table th, table td {padding: 10px; text-align: left; border: 1px solid #ddd;} table th {background-color: #f4f4f4; font-weight: bold;} tr:nth-child(even) {background-color: #f9f9f9;} tr:hover {background-color: #f1f1f1;}</style><table><tr><th>Điều kiện</th><th>Thông tin</th></tr><tr><td>Quà tặng</td><td>Tặng củ sạc nhanh 20W trị giá 690.000đ</td></tr><tr><td>Áp dụng</td><td>iPhone SE 2024, tất cả phiên bản</td></tr><tr><td>Chú ý</td><td>Số lượng có hạn, áp dụng đến 15/5/2025</td></tr></table>"
        }
    ];
    
    // Khởi tạo biến
    let currentPage = 1;
    const itemsPerPage = 6; // Số sản phẩm trên mỗi trang
    let filteredPromotions = [];
    
    // Sắp xếp khuyến mãi theo ngày (mới nhất trước)
    const sortedPromotions = sortPromotionsByDate(promotionsData);
    filteredPromotions = sortedPromotions;
    
    // Thêm container cho phân trang
    $("#promotion-list").after('<div id="pagination-container" class="mt-4"></div>');
    
    // Thêm khung tìm kiếm
    $("#promotion-section .container").prepend(`
        <div class="row mb-4">
            <div class="col-md-6 offset-md-3">
                <div class="input-group">
                    <input type="text" class="form-control" id="search-promotions" placeholder="Tìm kiếm khuyến mãi...">
                    <button class="btn btn-apple" type="button" id="btn-search">Tìm</button>
                </div>
            </div>
        </div>
    `);
    
    // Hiển thị trang đầu tiên
    displayPromotions(filteredPromotions, currentPage, itemsPerPage);
    
    // Xử lý sự kiện khi click vào phân trang
    $(document).on("click", ".page-link", function(e) {
        e.preventDefault();
        const page = parseInt($(this).data("page"));
        
        if (page && page !== currentPage) {
            currentPage = page;
            displayPromotions(filteredPromotions, currentPage, itemsPerPage);
            // Cuộn lên đầu danh sách
            $('html, body').animate({
                scrollTop: $("#promotion-section").offset().top - 100
            }, 500);
        }
    });
    
    // Xử lý sự kiện khi click vào nút xem chi tiết
    $(document).on("click", ".promotion-details", function() {
        const promoId = $(this).data("id");
        showPromotionDetails(promoId, promotionsData);
    });
    
    // Xử lý sự kiện tìm kiếm
    $("#btn-search").on("click", function() {
        const searchTerm = $("#search-promotions").val();
        filteredPromotions = filterPromotions(sortedPromotions, searchTerm);
        currentPage = 1; // Reset về trang đầu tiên khi tìm kiếm
        displayPromotions(filteredPromotions, currentPage, itemsPerPage);
    });
    
    // Tìm kiếm khi nhấn Enter
    $("#search-promotions").on("keyup", function(e) {
        if (e.key === "Enter") {
            $("#btn-search").click();
        }
    });
    
    // Thêm hiệu ứng hover cho các card
    $(document).on("mouseenter", ".promotion-card", function() {
        $(this).addClass("hover");
    }).on("mouseleave", ".promotion-card", function() {
        $(this).removeClass("hover");
    });
});