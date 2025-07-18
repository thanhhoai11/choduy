// Dữ liệu tin tức
let newsData = [];

// Tải dữ liệu tin tức từ JSON
async function loadNewsData() {
    try {
        const response = await fetch('data/news.json');
        const data = await response.json();
        newsData = [...data];
        
        // Thêm dữ liệu tin tức giả
        addMockNews();
        
        // Hiển thị chi tiết tin tức
        displayNewsDetail();
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu tin tức:', error);
        document.getElementById('news-detail').innerHTML = `
            <div class="text-center">
                <p class="text-danger">Đã xảy ra lỗi khi tải dữ liệu. Vui lòng thử lại sau.</p>
                <a href="news.html" class="btn btn-primary">Quay lại trang tin tức</a>
            </div>
        `;
    }
}

// Thêm dữ liệu tin tức giả để demo

// Lấy tham số từ URL
function getParameterFromUrl(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(paramName);
}

// Hiển thị chi tiết tin tức
function displayNewsDetail() {
    const newsId = getParameterFromUrl('id');
    
    if (!newsId) {
        // Nếu không có ID, hiển thị thông báo lỗi
        document.getElementById('news-detail').innerHTML = `
            <div class="text-center">
                <p class="text-danger">Không tìm thấy tin tức.</p>
                <a href="news.html" class="btn btn-primary">Quay lại trang tin tức</a>
            </div>
        `;
        return;
    }
    
    // Tìm tin tức theo ID
    const newsItem = newsData.find(item => item.id === newsId);
    
    if (!newsItem) {
        // Nếu không tìm thấy tin tức, hiển thị thông báo lỗi
        document.getElementById('news-detail').innerHTML = `
            <div class="text-center">
                <p class="text-danger">Không tìm thấy tin tức với ID: ${newsId}</p>
                <a href="news.html" class="btn btn-primary">Quay lại trang tin tức</a>
            </div>
        `;
        return;
    }
    
    // Cập nhật tiêu đề trang
    document.title = `${newsItem.title} | Anh Em Rọt`;
    
    // Hiển thị chi tiết tin tức
    document.getElementById('news-detail').innerHTML = `
        <div class="row">
            <div class="col-md-10 mx-auto">
                <a href="news.html" class="btn btn-outline-primary mb-4">
                    <i class="fas fa-arrow-left"></i> Quay lại tin tức
                </a>
                
                <h1 class="mb-4">${newsItem.title}</h1>
                
                <div class="d-flex align-items-center mb-4">
                    <span class="text-muted me-3">
                        <i class="far fa-calendar-alt me-1"></i> ${newsItem.startDate}
                    </span>
                    <span class="badge bg-primary">${newsItem.category || 'Tin tức'}</span>
                </div>
                
                <img src="${newsItem.image}" alt="${newsItem.title}" class="news-image mb-4">
                
                <div class="news-content mb-5">
                    ${newsItem.details}
                </div>
                
                <hr class="my-5">
                
                <div class="row">
                    <div class="col-md-6">
                        <h4>Chia sẻ</h4>
                        <div class="d-flex mt-2">
                            <a href="#" class="me-2 btn btn-outline-primary btn-sm">
                                <i class="fab fa-facebook-f"></i> Facebook
                            </a>
                            <a href="#" class="me-2 btn btn-outline-info btn-sm">
                                <i class="fab fa-twitter"></i> Twitter
                            </a>
                            <a href="#" class="btn btn-outline-success btn-sm">
                                <i class="fab fa-whatsapp"></i> WhatsApp
                            </a>
                        </div>
                    </div>
                    <div class="col-md-6 text-md-end mt-4 mt-md-0">
                        <a href="news.html" class="btn btn-primary">
                            Xem thêm tin tức <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
                
                <hr class="my-5">
                
                <h4 class="mb-4">Tin tức liên quan</h4>
                <div class="row" id="related-news">
                    <!-- Tin tức liên quan sẽ được thêm vào đây bằng JavaScript -->
                </div>
            </div>
        </div>
    `;
    
    // Hiển thị tin tức liên quan
    displayRelatedNews(newsItem);
}

// Hiển thị tin tức liên quan
function displayRelatedNews(currentNews) {
    // Lọc tin tức cùng danh mục, loại bỏ tin tức hiện tại
    let relatedNews = newsData.filter(item => 
        item.category === currentNews.category && 
        item.id !== currentNews.id
    );
    
    // Nếu không đủ 3 tin tức cùng danh mục, bổ sung thêm tin tức khác
    if (relatedNews.length < 3) {
        const otherNews = newsData.filter(item => 
            item.category !== currentNews.category && 
            item.id !== currentNews.id
        );
        
        // Trộn ngẫu nhiên và lấy đủ số lượng cần thiết
        otherNews.sort(() => 0.5 - Math.random());
        relatedNews = [...relatedNews, ...otherNews.slice(0, 3 - relatedNews.length)];
    }
    
    // Giới hạn chỉ hiển thị 3 tin tức liên quan
    relatedNews = relatedNews.slice(0, 3);
    
    // Tạo HTML cho tin tức liên quan
    let relatedNewsHTML = '';
    
    relatedNews.forEach(item => {
        relatedNewsHTML += `
            <div class="col-md-4 mb-4">
                <div class="card news-card h-100" onclick="location.href='news_detail.html?id=${item.id}'">
                    <img src="${item.image}" class="card-img-top" alt="${item.title}" style="height: 180px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="news-title">${item.title}</h5>
                        <div class="news-date mt-2">
                            <i class="far fa-calendar-alt"></i>
                            <span>${item.startDate}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    document.getElementById('related-news').innerHTML = relatedNewsHTML;
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    // Tải dữ liệu tin tức
    loadNewsData();
});