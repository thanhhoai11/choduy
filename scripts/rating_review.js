/**
 * Rating & Review System - Anh Em Rọt Store
 * Manages product ratings and reviews functionality for the product detail page
 */
const RatingReview = (() => {
  // Constants
  const ITEMS_PER_PAGE = 5;
  const selectors = {
    productDetail: '.product-detail-container',
    productTabs: '#productTabs',
    productTabsContent: '#productTabsContent',
    reviewsSummary: '#reviewsSummary',
    reviewsList: '#reviewsList',
    reviewsPagination: '#reviewsPagination',
    filterTags: '#filterTags',
    reviewsSort: '#reviewsSort',
    writeReviewBtn: '#writeReviewBtn',
    reviewModal: '#reviewModal',
    reviewForm: '#reviewForm',
    ratingInput: '#ratingInput',
    reviewTitle: '#reviewTitle',
    reviewContent: '#reviewContent',
    reviewPhotos: '#reviewPhotos',
    photosPreview: '#photosPreview',
    reviewName: '#reviewName',
    reviewEmail: '#reviewEmail',
    saveReviewInfo: '#saveReviewInfo',
    submitReviewBtn: '#submitReviewBtn',
    productMeta: '.product-meta',
  };

  // State
  let currentPage = 1;
  let reviewsData = [];

  // Initialize the system
  const init = () => {
    if (!document.querySelector(selectors.productDetail)) return;

    createReviewsTab();
    loadProductReviews();
    setupReviewForm();
    addRatingSummary();
  };

  // Create reviews tab and content
  const createReviewsTab = () => {
    const productTabs = document.querySelector(selectors.productTabs);
    const productTabsContent = document.querySelector(selectors.productTabsContent);
    if (!productTabs || !productTabsContent) return;

    // Reviews tab button
    const reviewsTabButton = document.createElement('li');
    reviewsTabButton.className = 'nav-item';
    reviewsTabButton.innerHTML = `
      <button class="nav-link" id="reviews-tab" data-bs-toggle="tab" data-bs-target="#reviews" type="button" role="tab" aria-controls="reviews">
        <i class="fas fa-star me-2"></i>Đánh giá
      </button>
    `;
    productTabs.appendChild(reviewsTabButton);

    // Reviews tab content
    const reviewsTabContent = document.createElement('div');
    reviewsTabContent.className = 'tab-pane fade';
    reviewsTabContent.id = 'reviews';
    reviewsTabContent.setAttribute('role', 'tabpanel');
    reviewsTabContent.setAttribute('aria-labelledby', 'reviews-tab');
    reviewsTabContent.innerHTML = `
      <div class="reviews-container">
        <div class="row">
          <div class="col-md-4">
            <div class="reviews-summary" id="reviewsSummary">
              <h4 class="summary-rating" data-rating="4.5">4.5</h4>
              <div class="summary-stars">${generateStarRating(4.5)}</div>
              <div class="summary-count">Dựa trên 128 đánh giá</div>
              <div class="rating-bars mt-4">
                ${generateRatingBars([
                  { stars: 5, count: 96, percentage: 75 },
                  { stars: 4, count: 19, percentage: 15 },
                  { stars: 3, count: 9, percentage: 7 },
                  { stars: 2, count: 3, percentage: 2 },
                  { stars: 1, count: 1, percentage: 1 },
                ])}
              </div>
              <button class="btn btn-primary mt-4" id="writeReviewBtn">
                <i class="fas fa-pencil-alt me-2"></i>Viết đánh giá
              </button>
            </div>
          </div>
          <div class="col-md-8">
            <div class="reviews-filter">
              <div class="filter-header">
                <h5 class="filter-title">128 đánh giá</h5>
                <div class="filter-actions">
                  <select class="form-select form-select-sm" id="reviewsSort">
                    <option value="newest">Mới nhất</option>
                    <option value="oldest">Cũ nhất</option>
                    <option value="highest">Điểm cao nhất</option>
                    <option value="lowest">Điểm thấp nhất</option>
                  </select>
                </div>
              </div>
              <div class="filter-tags" id="filterTags">
                <button class="filter-tag active" data-filter="all">Tất cả</button>
                <button class="filter-tag" data-filter="5">5 sao</button>
                <button class="filter-tag" data-filter="4">4 sao</button>
                <button class="filter-tag" data-filter="3">3 sao</button>
                <button class="filter-tag" data-filter="2">2 sao</button>
                <button class="filter-tag" data-filter="1">1 sao</button>
                <button class="filter-tag" data-filter="has_photo">Có hình ảnh</button>
              </div>
            </div>
            <div class="reviews-list" id="reviewsList">
              <div class="text-center py-5 reviews-loading">
                <div class="spinner-border text-primary mb-3" role="status">
                  <span class="visually-hidden">Đang tải...</span>
                </div>
                <p>Đang tải đánh giá...</p>
              </div>
            </div>
            <div class="reviews-pagination" id="reviewsPagination"></div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="reviewModal" tabindex="-1" aria-labelledby="reviewModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="reviewModalLabel">Đánh giá sản phẩm</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="reviewForm">
                <div class="mb-3">
                  <label class="form-label">Đánh giá của bạn <span class="text-danger">*</span></label>
                  <div class="rating-input" role="radiogroup" aria-label="Đánh giá sao">
                    ${Array.from({ length: 5 }, (_, i) => `
                      <i class="far fa-star" data-rating="${i + 1}" role="radio" aria-checked="false"></i>
                    `).join('')}
                  </div>
                  <input type="hidden" name="rating" id="ratingInput" value="0" required>
                  <div class="invalid-feedback">Vui lòng chọn số sao đánh giá.</div>
                </div>
                <div class="mb-3">
                  <label for="reviewTitle" class="form-label">Tiêu đề <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="reviewTitle" name="title" placeholder="Tiêu đề đánh giá" required>
                  <div class="invalid-feedback">Vui lòng nhập tiêu đề.</div>
                </div>
                <div class="mb-3">
                  <label for="reviewContent" class="form-label">Nội dung đánh giá <span class="text-danger">*</span></label>
                  <textarea class="form-control" id="reviewContent" name="content" rows="4" placeholder="Chia sẻ trải nghiệm của bạn" required></textarea>
                  <div class="invalid-feedback">Vui lòng nhập nội dung đánh giá.</div>
                </div>
                <div class="mb-3">
                  <label class="form-label">Tải lên hình ảnh (tối đa 5 ảnh)</label>
                  <div class="review-photos-container">
                    <div class="review-photo-upload">
                      <input type="file" id="reviewPhotos" name="photos" accept="image/*" multiple class="photo-input">
                      <div class="upload-placeholder">
                        <i class="fas fa-camera"></i>
                        <span>Thêm ảnh</span>
                      </div>
                    </div>
                    <div class="review-photos-preview" id="photosPreview"></div>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="reviewName" class="form-label">Tên của bạn <span class="text-danger">*</span></label>
                  <input type="text" class="form-control" id="reviewName" name="name" placeholder="Tên hiển thị" required>
                  <div class="invalid-feedback">Vui lòng nhập tên của bạn.</div>
                </div>
                <div class="mb-3">
                  <label for="reviewEmail" class="form-label">Email <span class="text-danger">*</span></label>
                  <input type="email" class="form-control" id="reviewEmail" name="email" placeholder="Email của bạn" required>
                  <div class="form-text">Email sẽ không hiển thị công khai.</div>
                  <div class="invalid-feedback">Vui lòng nhập email hợp lệ.</div>
                </div>
                <div class="form-check mb-3">
                  <input class="form-check-input" type="checkbox" id="saveReviewInfo" name="saveInfo">
                  <label class="form-check-label" for="saveReviewInfo">Lưu thông tin cho lần sau</label>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
              <button type="button" class="btn btn-primary" id="submitReviewBtn">Gửi đánh giá</button>
            </div>
          </div>
        </div>
      </div>
    `;
    productTabsContent.appendChild(reviewsTabContent);
  };

  // Generate star rating HTML
  const generateStarRating = (rating) => {
    return Array.from({ length: 5 }, (_, i) => {
      const starIndex = i + 1;
      return `<i class="${starIndex <= rating ? 'fas fa-star' : starIndex - 0.5 <= rating ? 'fas fa-star-half-alt' : 'far fa-star'}"></i>`;
    }).join('');
  };

  // Generate rating bars HTML
  const generateRatingBars = (bars) => {
    return bars.map(bar => `
      <div class="rating-bar-item">
        <div class="rating-label">${bar.stars} <i class="fas fa-star"></i></div>
        <div class="rating-bar">
          <div class="rating-bar-fill" style="width: ${bar.percentage}%"></div>
        </div>
        <div class="rating-count">${bar.count}</div>
      </div>
    `).join('');
  };

  // Load product reviews
  const loadProductReviews = () => {
    const reviewsList = document.querySelector(selectors.reviewsList);
    if (!reviewsList) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productName = decodeURIComponent(urlParams.get('product') || '');

    setTimeout(() => {
      reviewsList.innerHTML = '';
      reviewsData = getSampleReviews(productName);

      if (!reviewsData.length) {
        reviewsList.innerHTML = `
          <div class="no-reviews text-center">
            <i class="far fa-star fa-3x text-muted mb-3"></i>
            <h5>Chưa có đánh giá</h5>
            <p>Hãy là người đầu tiên đánh giá sản phẩm này!</p>
            <button class="btn btn-primary" id="noReviewsWriteBtn">
              <i class="fas fa-pencil-alt me-2"></i>Viết đánh giá
            </button>
          </div>
        `;
        document.querySelector('#noReviewsWriteBtn')?.addEventListener('click', openReviewForm);
      } else {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        const end = start + ITEMS_PER_PAGE;
        const pageReviews = reviewsData.slice(start, end);

        pageReviews.forEach(review => {
          reviewsList.appendChild(createReviewElement(review));
        });

        setupPagination(reviewsData.length);
        setupFilters();
      }
    }, 1000); // Simulate API delay
  };

  // Get sample reviews
  const getSampleReviews = (productName) => [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      date: '2025-02-15',
      rating: 5,
      title: `Sản phẩm tuyệt vời - ${productName}`,
      content: 'Sản phẩm có hiệu năng mạnh mẽ, camera chụp ảnh sắc nét, và pin dùng cả ngày.',
      helpful: 24,
      verified: true,
      photos: ['https://picsum.photos/id/1/300/200', 'https://picsum.photos/id/20/300/200'],
    },
    {
      id: 2,
      name: 'Trần Thị B',
      date: '2025-02-10',
      rating: 4,
      title: `Hài lòng với ${productName}`,
      content: 'Thiết kế đẹp, hiệu năng tốt, nhưng pin hơi tụt nhanh khi chơi game.',
      helpful: 12,
      verified: true,
      photos: [],
    },
    {
      id: 3,
      name: 'Phạm Văn C',
      date: '2025-02-05',
      rating: 5,
      title: `Xứng đáng với giá tiền - ${productName}`,
      content: 'Sản phẩm mượt mà, camera chụp ảnh đẹp, rất đáng để nâng cấp.',
      helpful: 8,
      verified: true,
      photos: ['https://picsum.photos/id/35/300/200'],
    },
    {
      id: 4,
      name: 'Hoàng Thị D',
      date: '2025-01-30',
      rating: 3,
      title: `Tạm ổn - ${productName}`,
      content: 'Sản phẩm ổn nhưng pin không như kỳ vọng, cần cải thiện.',
      helpful: 5,
      verified: false,
      photos: [],
    },
    {
      id: 5,
      name: 'Lê Văn E',
      date: '2025-01-25',
      rating: 5,
      title: `Nâng cấp đáng giá - ${productName}`,
      content: 'Hiệu năng và camera cải thiện rõ rệt, rất hài lòng.',
      helpful: 15,
      verified: true,
      photos: ['https://picsum.photos/id/42/300/200', 'https://picsum.photos/id/48/300/200'],
    },
  ];

  // Create review element
  const createReviewElement = (review) => {
    const reviewElement = document.createElement('div');
    reviewElement.className = 'review-item';
    reviewElement.dataset.rating = review.rating;
    reviewElement.dataset.hasPhoto = review.photos.length > 0 ? 'true' : 'false';

    const reviewDate = new Date(review.date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    reviewElement.innerHTML = `
      <div class="review-header">
        <div class="review-rating">${generateStarRating(review.rating)}</div>
        <div class="review-verified ${review.verified ? '' : 'd-none'}">
          <i class="fas fa-check-circle"></i> Đã mua hàng
        </div>
      </div>
      <h5 class="review-title">${review.title}</h5>
      <div class="review-meta">
        <span class="review-author">${review.name}</span>
        <span class="review-date">${reviewDate}</span>
      </div>
      <div class="review-content">${review.content}</div>
      ${review.photos.length ? `
        <div class="review-photos">
          ${review.photos.map(photo => `
            <div class="review-photo">
              <img src="${photo}" alt="Ảnh đánh giá" class="review-photo-img" loading="lazy">
            </div>
          `).join('')}
        </div>
      ` : ''}
      <div class="review-actions">
        <button class="btn btn-sm btn-light review-helpful-btn" data-review-id="${review.id}">
          <i class="far fa-thumbs-up me-1"></i> Hữu ích (${review.helpful})
        </button>
        <button class="btn btn-sm btn-light review-report-btn" data-review-id="${review.id}">
          <i class="far fa-flag me-1"></i> Báo cáo
        </button>
      </div>
    `;

    reviewElement.querySelector('.review-helpful-btn')?.addEventListener('click', () =>
      markReviewHelpful(review.id, reviewElement.querySelector('.review-helpful-btn'))
    );
    reviewElement.querySelector('.review-report-btn')?.addEventListener('click', () =>
      reportReview(review.id)
    );
    reviewElement.querySelectorAll('.review-photo-img').forEach(photo =>
      photo.addEventListener('click', () => showReviewPhotoModal(photo.src))
    );

    return reviewElement;
  };

  // Setup pagination
  const setupPagination = (totalReviews) => {
    const paginationContainer = document.querySelector(selectors.reviewsPagination);
    if (!paginationContainer) return;

    const totalPages = Math.ceil(totalReviews / ITEMS_PER_PAGE);
    paginationContainer.innerHTML = `
      <nav aria-label="Phân trang đánh giá">
        <ul class="pagination justify-content-center">
          <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" aria-label="Trang trước">
              <span aria-hidden="true">«</span>
            </a>
          </li>
          ${Array.from({ length: totalPages }, (_, i) => `
            <li class="page-item ${currentPage === i + 1 ? 'active' : ''}">
              <a class="page-link" href="#" data-page="${i + 1}">${i + 1}</a>
            </li>
          `).join('')}
          <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" aria-label="Trang sau">
              <span aria-hidden="true">»</span>
            </a>
          </li>
        </ul>
      </nav>
    `;

    paginationContainer.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.dataset.page || (link.getAttribute('aria-label') === 'Trang trước' ? currentPage - 1 : currentPage + 1);
        if (page && page >= 1 && page <= totalPages) {
          currentPage = parseInt(page);
          loadProductReviews();
        }
      });
    });
  };

  // Setup review filters
  const setupFilters = () => {
    const filterTags = document.querySelectorAll(`${selectors.filterTags} .filter-tag`);
    filterTags.forEach(tag => {
      tag.addEventListener('click', () => {
        filterTags.forEach(t => t.classList.remove('active'));
        tag.classList.add('active');
        filterReviews(tag.dataset.filter);
      });
    });

    const sortSelect = document.querySelector(selectors.reviewsSort);
    sortSelect?.addEventListener('change', () => sortReviews(sortSelect.value));
  };

  // Filter reviews
  const filterReviews = (filter) => {
    const reviewsList = document.querySelector(selectors.reviewsList);
    if (!reviewsList) return;

    const reviews = reviewsList.querySelectorAll('.review-item');
    let visibleCount = 0;

    reviews.forEach(review => {
      const shouldShow =
        filter === 'all' ||
        (filter === 'has_photo' && review.dataset.hasPhoto === 'true') ||
        (Number.isInteger(parseInt(filter)) && review.dataset.rating === filter);

      review.style.display = shouldShow ? 'block' : 'none';
      if (shouldShow) visibleCount++;
    });

    const filterTitle = document.querySelector('.filter-title');
    if (filterTitle) filterTitle.textContent = `${visibleCount} đánh giá`;
  };

  // Sort reviews
  const sortReviews = (sortBy) => {
    const reviewsList = document.querySelector(selectors.reviewsList);
    if (!reviewsList) return;

    const reviews = Array.from(reviewsList.querySelectorAll('.review-item'));
    reviews.sort((a, b) => {
      const dateA = new Date(a.querySelector('.review-date').textContent);
      const dateB = new Date(b.querySelector('.review-date').textContent);
      const ratingA = parseInt(a.dataset.rating);
      const ratingB = parseInt(b.dataset.rating);

      switch (sortBy) {
        case 'newest': return dateB - dateA;
        case 'oldest': return dateA - dateB;
        case 'highest': return ratingB - ratingA;
        case 'lowest': return ratingA - ratingB;
        default: return 0;
      }
    });

    reviewsList.innerHTML = '';
    reviews.forEach(review => reviewsList.appendChild(review));
  };

  // Mark review as helpful
  const markReviewHelpful = (reviewId, button) => {
    if (button.classList.contains('active')) return;

    button.classList.add('active');
    const count = parseInt(button.textContent.match(/\d+/)[0]) + 1;
    button.innerHTML = `<i class="fas fa-thumbs-up me-1"></i> Hữu ích (${count})`;

    const helpfulReviews = JSON.parse(localStorage.getItem('helpfulReviews') || '[]');
    helpfulReviews.push(reviewId);
    localStorage.setItem('helpfulReviews', JSON.stringify(helpfulReviews));
  };

  // Report review
  const reportReview = (reviewId) => {
    const reportModal = document.createElement('div');
    reportModal.className = 'modal fade';
    reportModal.id = 'reportModal';
    reportModal.setAttribute('tabindex', '-1');
    reportModal.setAttribute('aria-hidden', 'true');
    reportModal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Báo cáo đánh giá</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Lý do báo cáo?</p>
            ${['inappropriate', 'spam', 'fake', 'other'].map((reason, i) => `
              <div class="form-check mb-2">
                <input class="form-check-input" type="radio" name="reportReason" id="reportReason${i + 1}" value="${reason}" ${i === 0 ? 'checked' : ''}>
                <label class="form-check-label" for="reportReason${i + 1}">
                  ${reason === 'inappropriate' ? 'Nội dung không phù hợp' :
                    reason === 'spam' ? 'Spam hoặc quảng cáo' :
                    reason === 'fake' ? 'Thông tin giả mạo' : 'Lý do khác'}
                </label>
              </div>
            `).join('')}
            <div class="mb-3">
              <label for="reportComment" class="form-label">Chi tiết (không bắt buộc)</label>
              <textarea class="form-control" id="reportComment" rows="3" placeholder="Mô tả chi tiết lý do báo cáo"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-danger" id="submitReportBtn">Gửi báo cáo</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(reportModal);
    const modal = new bootstrap.Modal(reportModal);
    modal.show();

    reportModal.querySelector('#submitReportBtn').addEventListener('click', () => {
      modal.hide();
      showToast('Cảm ơn bạn đã báo cáo. Chúng tôi sẽ xem xét trong thời gian sớm nhất.', 'success');
      setTimeout(() => reportModal.remove(), 1000);
    });

    reportModal.addEventListener('hidden.bs.modal', () => reportModal.remove());
  };

  // Show review photo modal
  const showReviewPhotoModal = (imageSrc) => {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'reviewPhotoModal';
    modal.setAttribute('tabindex', '-1');
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML = `
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <div class="modal-body p-0">
            <button type="button" class="btn-close position-absolute end-0 top-0 m-3" data-bs-dismiss="modal" aria-label="Close"></button>
            <img src="${imageSrc}" class="img-fluid review-photo-full" alt="Ảnh đánh giá">
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    modal.addEventListener('hidden.bs.modal', () => modal.remove());
  };

  // Setup review form
  const setupReviewForm = () => {
    const writeReviewBtn = document.querySelector(selectors.writeReviewBtn);
    writeReviewBtn?.addEventListener('click', openReviewForm);

    const ratingStars = document.querySelectorAll('.rating-input i');
    const ratingInput = document.querySelector(selectors.ratingInput);

    ratingStars.forEach(star => {
      star.addEventListener('mouseover', () =>
        updateRatingStars(ratingStars, parseInt(star.dataset.rating), 'hover')
      );
      star.addEventListener('mouseout', () =>
        updateRatingStars(ratingStars, parseInt(ratingInput.value), 'selected')
      );
      star.addEventListener('click', () => {
        const rating = parseInt(star.dataset.rating);
        ratingInput.value = rating;
        updateRatingStars(ratingStars, rating, 'selected');
        ratingInput.dispatchEvent(new Event('change')); // Trigger validation
      });
    });

    const photoInput = document.querySelector(selectors.reviewPhotos);
    const photosPreview = document.querySelector(selectors.photosPreview);
    let selectedPhotos = [];

    if (photoInput && photosPreview) {
      photoInput.addEventListener('change', () => {
        if (photoInput.files.length > 5) {
          showToast('Tối đa 5 ảnh được phép tải lên.', 'error');
          photoInput.value = '';
          return;
        }

        photosPreview.innerHTML = '';
        selectedPhotos = Array.from(photoInput.files);

        selectedPhotos.forEach((file, index) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'review-photo-preview-item';
            previewItem.innerHTML = `
              <img src="${e.target.result}" alt="Ảnh xem trước ${index + 1}">
              <button type="button" class="remove-photo-btn" data-index="${index}">
                <i class="fas fa-times"></i>
              </button>
            `;
            photosPreview.appendChild(previewItem);

            previewItem.querySelector('.remove-photo-btn').addEventListener('click', () => {
              selectedPhotos.splice(index, 1);
              previewItem.remove();
              updateFileInput(selectedPhotos, photoInput);
            });
          };
          reader.readAsDataURL(file);
        });
      });
    }

    const reviewForm = document.querySelector(selectors.reviewForm);
    if (reviewForm) {
      reviewForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateReviewForm()) submitReview();
      });
    }
  };

  // Update file input with new files
  const updateFileInput = (files, input) => {
    const dataTransfer = new DataTransfer();
    files.forEach(file => dataTransfer.items.add(file));
    input.files = dataTransfer.files;
  };

  // Update rating stars
  const updateRatingStars = (stars, rating, state) => {
    stars.forEach(star => {
      const starRating = parseInt(star.dataset.rating);
      star.className = starRating <= rating ? 'fas fa-star' : 'far fa-star';
      star.setAttribute('aria-checked', starRating === rating && state === 'selected' ? 'true' : 'false');
      if (state === 'hover' && starRating <= rating) {
        star.classList.add('hover');
      } else {
        star.classList.remove('hover');
      }
    });
  };

  // Open review form
  const openReviewForm = () => {
    const modal = new bootstrap.Modal(document.querySelector(selectors.reviewModal));
    modal.show();

    const savedInfo = JSON.parse(localStorage.getItem('reviewerInfo') || '{}');
    document.querySelector(selectors.reviewName).value = savedInfo.name || '';
    document.querySelector(selectors.reviewEmail).value = savedInfo.email || '';
    document.querySelector(selectors.saveReviewInfo).checked = savedInfo.saveInfo || false;
  };

  // Validate review form
  const validateReviewForm = () => {
    const form = document.querySelector(selectors.reviewForm);
    if (!form) return false;

    form.classList.add('was-validated');
    return form.checkValidity();
  };

  // Submit review
  const submitReview = () => {
    const rating = document.querySelector(selectors.ratingInput).value;
    const title = document.querySelector(selectors.reviewTitle).value;
    const content = document.querySelector(selectors.reviewContent).value;
    const name = document.querySelector(selectors.reviewName).value;
    const email = document.querySelector(selectors.reviewEmail).value;
    const saveInfo = document.querySelector(selectors.saveReviewInfo).checked;

    if (saveInfo) {
      localStorage.setItem('reviewerInfo', JSON.stringify({ name, email, saveInfo }));
    } else {
      localStorage.removeItem('reviewerInfo');
    }

    const modal = bootstrap.Modal.getInstance(document.querySelector(selectors.reviewModal));
    modal.hide();

    showToast('Cảm ơn bạn đã đánh giá! Đánh giá sẽ được hiển thị sau khi kiểm duyệt.', 'success');

    const form = document.querySelector(selectors.reviewForm);
    form.reset();
    document.querySelectorAll('.rating-input i').forEach(star => (star.className = 'far fa-star'));
    document.querySelector(selectors.ratingInput).value = '0';
    document.querySelector(selectors.photosPreview).innerHTML = '';
  };

  // Add rating summary to product meta
  const addRatingSummary = () => {
    const productMeta = document.querySelector(selectors.productMeta);
    if (!productMeta) return;

    const viewReviewsLink = document.createElement('a');
    viewReviewsLink.href = '#reviews';
    viewReviewsLink.className = 'view-reviews-link';
    viewReviewsLink.innerHTML = 'Xem tất cả đánh giá <i class="fas fa-angle-right"></i>';
    viewReviewsLink.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('#reviews-tab')?.click();
      document.querySelector(selectors.reviewsList)?.scrollIntoView({ behavior: 'smooth' });
    });

    productMeta.appendChild(viewReviewsLink);
  };

  // Show toast notification
  const showToast = (message, type) => {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed bottom-0 end-0 m-3`;
    toast.setAttribute('role', 'alert');
    toast.style.zIndex = '1050';
    toast.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 150);
    }, 5000);
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => RatingReview.init());