document.addEventListener('DOMContentLoaded', () => {
    const newsContainer = document.getElementById('news-container');
    const searchInput = document.getElementById('news-search');
    const categoryPills = document.querySelectorAll('.category-pill');
    const sortSelect = document.getElementById('sort-select');
    const paginationContainer = document.querySelector('.pagination');
    const noResults = document.querySelector('.no-results');

    let currentPage = 1;
    const itemsPerPage = 6;
    let allNews = [];         // dữ liệu gốc
    let filteredNews = [];    // dữ liệu hiển thị
    let activeCategory = 'all';

    // Fetch news data
    const fetchNews = async () => {
        try {
            const response = await fetch('data/news.json'); // sửa đường dẫn nếu cần
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const newsData = await response.json();
            allNews = [...newsData];
            filteredNews = [...newsData];
            renderNews(filteredNews, currentPage);
        } catch (error) {
            console.error('Error fetching news:', error);
            noResults.classList.remove('d-none');
            noResults.innerHTML = `
                <i class="fas fa-exclamation-circle"></i>
                <h3>Lỗi khi tải tin tức</h3>
                <p>Vui lòng thử lại sau.</p>
            `;
        }
    };

    const formatDate = (dateStr) => {
        const [day, month, year] = dateStr.split('/');
        return `${day}/${month}/${year}`;
    };

    const renderNews = (news, page) => {
        newsContainer.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedNews = news.slice(start, end);

        if (paginatedNews.length === 0) {
            noResults.classList.remove('d-none');
            paginationContainer.innerHTML = '';
            return;
        }

        noResults.classList.add('d-none');
        paginatedNews.forEach(item => {
            const card = document.createElement('div');
            card.className = 'col-lg-4 col-md-6 mb-4';
            card.innerHTML = `
                <div class="news-card" data-id="${item.id}">
                    <img src="${item.image}" class="card-img-top" alt="${item.title}">
                    <div class="card-body">
                        <h5 class="news-title">${item.title}</h5>
                        <p class="card-text">${item.description}</p>
                        <div class="news-date"><i class="fas fa-calendar-alt"></i> ${formatDate(item.startDate)}</div>
                    </div>
                </div>
            `;
            newsContainer.appendChild(card);
        });

        // Thêm sự kiện click cho các thẻ tin tức
        document.querySelectorAll('.news-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Ngăn chặn sự kiện click lan ra các phần tử con
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') return;
                
                const newsId = card.dataset.id;
                window.location.href = `news_detail.html?id=${newsId}`;
            });
        });

        renderPagination(news.length);
    };

    const renderPagination = (totalItems) => {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        paginationContainer.innerHTML = '';
        if (totalPages <= 1) return;

        const prevItem = document.createElement('li');
        prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevItem.innerHTML = `<a class="page-link" href="#" data-page="prev">Trước</a>`;
        paginationContainer.appendChild(prevItem);

        for (let i = 1; i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageItem.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            paginationContainer.appendChild(pageItem);
        }

        const nextItem = document.createElement('li');
        nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextItem.innerHTML = `<a class="page-link" href="#" data-page="next">Tiếp</a>`;
        paginationContainer.appendChild(nextItem);
    };

    const updateNews = () => {
        let result = [...allNews];

        // Search filter
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm) {
            result = result.filter(item =>
                item.title.toLowerCase().includes(searchTerm) ||
                item.description.toLowerCase().includes(searchTerm)
            );
        }

        // Category filter
        if (activeCategory !== 'all') {
            result = result.filter(item => {
                const title = item.title.toLowerCase();
                if (activeCategory === 'iPhone' && title.includes('iphone')) return true;
                if (activeCategory === 'Apple Watch' && title.includes('apple watch')) return true;
                if (activeCategory === 'iPad' && title.includes('ipad')) return true;
                if (activeCategory === 'Apple Music' && title.includes('apple music')) return true;
                if (activeCategory === 'Apple TV' && title.includes('apple tv')) return true;
                if (activeCategory === 'iOS' && title.includes('ios')) return true;
                if (activeCategory === 'Apple Pay' && title.includes('apple pay')) return true;
                if (activeCategory === 'Environment' && title.includes('môi trường')) return true;
                if (activeCategory === 'macOS' && title.includes('macos')) return true;
                if (activeCategory === 'WWDC' && title.includes('wwdc')) return true;
                if (activeCategory === 'Apple Arcade' && title.includes('apple arcade')) return true;
                return false;
            });
        }

        // Sort
        const sortValue = sortSelect.value;
        result.sort((a, b) => {
            const dateA = new Date(a.startDate.split('/').reverse().join('-'));
            const dateB = new Date(b.startDate.split('/').reverse().join('-'));

            if (sortValue === 'date-desc') return dateB - dateA;
            if (sortValue === 'date-asc') return dateA - dateB;
            if (sortValue === 'title-asc') return a.title.localeCompare(b.title);
            if (sortValue === 'title-desc') return b.title.localeCompare(a.title);
        });

        filteredNews = result;
        currentPage = 1;
        renderNews(filteredNews, currentPage);
    };

    // Event listeners
    searchInput.addEventListener('input', updateNews);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') updateNews();
    });
    document.querySelector('.search-btn').addEventListener('click', updateNews);

    categoryPills.forEach(pill => {
        pill.addEventListener('click', () => {
            categoryPills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            activeCategory = pill.dataset.category;
            updateNews();
        });
    });

    sortSelect.addEventListener('change', updateNews);

    paginationContainer.addEventListener('click', (e) => {
        e.preventDefault();
        const page = e.target.dataset.page;
        if (!page) return;

        if (page === 'prev' && currentPage > 1) {
            currentPage--;
        } else if (page === 'next' && currentPage < Math.ceil(filteredNews.length / itemsPerPage)) {
            currentPage++;
        } else if (!isNaN(page)) {
            currentPage = parseInt(page);
        }
        renderNews(filteredNews, currentPage);
    });

    // Initialize
    fetchNews();
});