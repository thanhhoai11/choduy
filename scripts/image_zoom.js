/**
 * Enhanced Image Zoom Module - Anh Em Rọt Store
 * Provides advanced image zoom functionality for product detail page
 */

const ImageZoom = {
  // Active zoom container
  activeZoom: null,
  
  // Initialize image zoom
  init: function() {
    // Setup image gallery functionality
    this.setupGallery();
    
    // Setup zoom functionality
    this.setupZoom();
    
    // Setup fullscreen gallery
    this.setupFullscreenGallery();
  },
  
  // Setup image gallery
  setupGallery: function() {
    const mainImage = document.getElementById('mainImage');
    const thumbnailContainer = document.getElementById('thumbnailContainer');
    
    if (!mainImage || !thumbnailContainer) return;
    
    // Create a 360-degree view button if available
    this.add360ViewButton();
    
    // Enhanced thumbnail creation - replace the existing function
    window.displayThumbnails = (thumbnails, productName) => {
      thumbnailContainer.innerHTML = '';
      
      thumbnails.forEach((img, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail-wrapper' + (index === 0 ? ' active' : '');
        
        thumbnail.innerHTML = `
          <img src="${img}" alt="${productName} - Ảnh ${index + 1}" class="thumbnail">
        `;
        
        thumbnail.addEventListener('click', () => {
          mainImage.src = img;
          document.querySelectorAll('.thumbnail-wrapper').forEach(t => t.classList.remove('active'));
          thumbnail.classList.add('active');
          
          // Fade effect
          mainImage.style.opacity = 0;
          setTimeout(() => { mainImage.style.opacity = 1; }, 200);
          
          // Reset zoom if active
          if (this.activeZoom) {
            this.resetZoom();
          }
        });
        
        thumbnailContainer.appendChild(thumbnail);
      });
      
      // Add video thumbnail if video URL is available
      const videoUrl = document.querySelector('.product-gallery').getAttribute('data-video-url');
      if (videoUrl) {
        const videoThumbnail = document.createElement('div');
        videoThumbnail.className = 'thumbnail-wrapper video-thumbnail';
        
        videoThumbnail.innerHTML = `
          <div class="thumbnail video-thumbnail-inner">
            <i class="fas fa-play-circle"></i>
          </div>
        `;
        
        videoThumbnail.addEventListener('click', () => {
          this.showVideoModal(videoUrl, productName);
        });
        
        thumbnailContainer.appendChild(videoThumbnail);
      }
    };
  },
  
  // Add 360-degree view button
  add360ViewButton: function() {
    const galleryContainer = document.querySelector('.product-gallery');
    const has360View = galleryContainer.getAttribute('data-360-view');
    
    if (!has360View) return;
    
    const viewButton = document.createElement('div');
    viewButton.className = 'view-360-btn';
    viewButton.innerHTML = `
      <i class="fas fa-sync-alt"></i>
      <span>Xem 360°</span>
    `;
    
    viewButton.addEventListener('click', () => {
      this.show360ViewModal();
    });
    
    galleryContainer.appendChild(viewButton);
  },
  
  // Setup zoom functionality
  setupZoom: function() {
    const mainImageContainer = document.querySelector('.main-image-container');
    const mainImage = document.getElementById('mainImage');
    
    if (!mainImageContainer || !mainImage) return;
    
    // Create zoom lens
    const zoomLens = document.createElement('div');
    zoomLens.className = 'zoom-lens';
    mainImageContainer.appendChild(zoomLens);
    
    // Create zoom result container
    const zoomResult = document.createElement('div');
    zoomResult.className = 'zoom-result';
    zoomResult.style.display = 'none';
    mainImageContainer.appendChild(zoomResult);
    
    // Mouse events for zoom
    mainImageContainer.addEventListener('mousemove', (e) => {
      e.preventDefault();
      
      if (window.innerWidth < 992) return; // Don't zoom on small screens
      
      // Get cursor position
      const bounds = mainImageContainer.getBoundingClientRect();
      const x = e.clientX - bounds.left;
      const y = e.clientY - bounds.top;
      
      // Calculate position as percentage
      const xPercent = x / bounds.width * 100;
      const yPercent = y / bounds.height * 100;
      
      // Show lens and result
      zoomLens.style.display = 'block';
      zoomResult.style.display = 'block';
      
      // Position lens
      const lensSize = 100; // Size in pixels
      const lensLeft = Math.min(Math.max(x - lensSize/2, 0), bounds.width - lensSize);
      const lensTop = Math.min(Math.max(y - lensSize/2, 0), bounds.height - lensSize);
      
      zoomLens.style.left = `${lensLeft}px`;
      zoomLens.style.top = `${lensTop}px`;
      
      // Show zoomed image in result
      zoomResult.style.backgroundImage = `url('${mainImage.src}')`;
      zoomResult.style.backgroundPosition = `${xPercent}% ${yPercent}%`;
      
      // Store active zoom
      this.activeZoom = {
        lens: zoomLens,
        result: zoomResult
      };
    });
    
    mainImageContainer.addEventListener('mouseleave', () => {
      this.resetZoom();
    });
    
    // Enhance click for fullscreen
    mainImageContainer.addEventListener('click', (e) => {
      // Only trigger fullscreen if we're not using zoom
      if (window.innerWidth < 992 || e.target === mainImage) {
        this.showFullscreenGallery();
      }
    });
  },
  
  // Setup fullscreen gallery
  setupFullscreenGallery: function() {
    // Enhance the existing showImageModal function
    window.showImageModal = (imageSrc, imageAlt) => {
      // Get all images
      const images = [];
      document.querySelectorAll('.thumbnail-wrapper:not(.video-thumbnail) img').forEach(thumb => {
        images.push({
          src: thumb.src,
          alt: thumb.alt
        });
      });
      
      // Find current image index
      const currentIndex = images.findIndex(img => img.src === imageSrc);
      
      // Create gallery HTML
      const galleryHTML = `
        <div class="modal fade fullscreen-gallery" id="galleryModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-fullscreen">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">${imageAlt}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="gallery-container">
                  <div class="main-gallery-image-container">
                    <img src="${imageSrc}" alt="${imageAlt}" class="main-gallery-image" id="galleryMainImage">
                  </div>
                  <div class="gallery-thumbnails" id="galleryThumbnails"></div>
                </div>
                <div class="gallery-navigation">
                  <button class="gallery-nav-btn prev-btn" id="galleryPrevBtn">
                    <i class="fas fa-chevron-left"></i>
                  </button>
                  <button class="gallery-nav-btn next-btn" id="galleryNextBtn">
                    <i class="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
      
      document.body.insertAdjacentHTML('beforeend', galleryHTML);
      
      // Initialize modal
      const modal = new bootstrap.Modal(document.getElementById('galleryModal'));
      modal.show();
      
      // Setup gallery functionality
      const galleryMainImage = document.getElementById('galleryMainImage');
      const galleryThumbnails = document.getElementById('galleryThumbnails');
      const prevBtn = document.getElementById('galleryPrevBtn');
      const nextBtn = document.getElementById('galleryNextBtn');
      
      // Populate thumbnails
      images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = `gallery-thumbnail${index === currentIndex ? ' active' : ''}`;
        thumb.innerHTML = `<img src="${img.src}" alt="${img.alt}">`;
        
        thumb.addEventListener('click', () => {
          // Update main image
          galleryMainImage.src = img.src;
          galleryMainImage.alt = img.alt;
          
          // Update active thumbnail
          document.querySelectorAll('.gallery-thumbnail').forEach(t => t.classList.remove('active'));
          thumb.classList.add('active');
        });
        
        galleryThumbnails.appendChild(thumb);
      });
      
      // Setup navigation
      let activeIndex = currentIndex;
      
      prevBtn.addEventListener('click', () => {
        activeIndex = (activeIndex - 1 + images.length) % images.length;
        updateGalleryImage(activeIndex);
      });
      
      nextBtn.addEventListener('click', () => {
        activeIndex = (activeIndex + 1) % images.length;
        updateGalleryImage(activeIndex);
      });
      
      // Keyboard navigation
      const handleKeydown = (e) => {
        if (e.key === 'ArrowLeft') {
          prevBtn.click();
        } else if (e.key === 'ArrowRight') {
          nextBtn.click();
        } else if (e.key === 'Escape') {
          modal.hide();
        }
      };
      
      window.addEventListener('keydown', handleKeydown);
      
      // Update gallery image
      function updateGalleryImage(index) {
        galleryMainImage.src = images[index].src;
        galleryMainImage.alt = images[index].alt;
        
        document.querySelectorAll('.gallery-thumbnail').forEach((t, i) => {
          if (i === index) {
            t.classList.add('active');
            t.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          } else {
            t.classList.remove('active');
          }
        });
      }
      
      // Clean up when modal is closed
      document.getElementById('galleryModal').addEventListener('hidden.bs.modal', () => {
        window.removeEventListener('keydown', handleKeydown);
        document.getElementById('galleryModal').remove();
      });
    };
  },
  
  // Show 360 view modal
  show360ViewModal: function() {
    const galleryContainer = document.querySelector('.product-gallery');
    const view360Images = galleryContainer.getAttribute('data-360-images');
    
    if (!view360Images) return;
    
    // Try to parse 360 images JSON
    let images = [];
    try {
      images = JSON.parse(view360Images);
    } catch (e) {
      console.error('Invalid 360 view images data', e);
      return;
    }
    
    if (images.length === 0) return;
    
    // Create modal HTML
    const modalHTML = `
      <div class="modal fade" id="view360Modal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Xem 360°</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="view-360-container">
                <img src="${images[0]}" alt="360 View" id="view360Image">
                <div class="view-360-controls">
                  <div class="view-360-slider-container">
                    <input type="range" min="0" max="${images.length - 1}" value="0" class="view-360-slider" id="view360Slider">
                  </div>
                  <div class="view-360-play-container">
                    <button class="view-360-play-btn" id="view360PlayBtn">
                      <i class="fas fa-play"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize modal
    const modal = new bootstrap.Modal(document.getElementById('view360Modal'));
    modal.show();
    
    // Setup 360 view
    const view360Image = document.getElementById('view360Image');
    const view360Slider = document.getElementById('view360Slider');
    const view360PlayBtn = document.getElementById('view360PlayBtn');
    
    let isPlaying = false;
    let animationFrame;
    let currentFrame = 0;
    
    // Update image on slider change
    view360Slider.addEventListener('input', () => {
      currentFrame = parseInt(view360Slider.value);
      view360Image.src = images[currentFrame];
      
      // Stop autoplay if active
      if (isPlaying) {
        toggleAutoplay();
      }
    });
    
    // Toggle autoplay
    view360PlayBtn.addEventListener('click', toggleAutoplay);
    
    function toggleAutoplay() {
      isPlaying = !isPlaying;
      
      if (isPlaying) {
        view360PlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
        playAnimation();
      } else {
        view360PlayBtn.innerHTML = '<i class="fas fa-play"></i>';
        cancelAnimationFrame(animationFrame);
      }
    }
    
    function playAnimation() {
      // Increment frame
      currentFrame = (currentFrame + 1) % images.length;
      
      // Update image and slider
      view360Image.src = images[currentFrame];
      view360Slider.value = currentFrame;
      
      // Continue animation if still playing
      if (isPlaying) {
        animationFrame = requestAnimationFrame(() => {
          setTimeout(playAnimation, 100); // Control speed
        });
      }
    }
    
    // Cleanup on modal close
    document.getElementById('view360Modal').addEventListener('hidden.bs.modal', () => {
      if (isPlaying) {
        cancelAnimationFrame(animationFrame);
      }
      document.getElementById('view360Modal').remove();
    });
  },
  
  // Show video modal
  showVideoModal: function(videoUrl, productName) {
    // Create modal HTML
    const modalHTML = `
      <div class="modal fade" id="videoModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">${productName} - Video</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
              <div class="video-container">
                <iframe src="${videoUrl}" frameborder="0" allowfullscreen></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize modal
    const modal = new bootstrap.Modal(document.getElementById('videoModal'));
    modal.show();
    
    // Cleanup on modal close
    document.getElementById('videoModal').addEventListener('hidden.bs.modal', () => {
      document.getElementById('videoModal').remove();
    });
  },
  
  // Reset zoom
  resetZoom: function() {
    if (!this.activeZoom) return;
    
    this.activeZoom.lens.style.display = 'none';
    this.activeZoom.result.style.display = 'none';
    this.activeZoom = null;
  },
  
  // Show fullscreen gallery
  showFullscreenGallery: function() {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
      window.showImageModal(mainImage.src, mainImage.alt);
    }
  }
};

// Initialize on document load
document.addEventListener('DOMContentLoaded', () => {
  ImageZoom.init();
});