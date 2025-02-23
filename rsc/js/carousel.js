export function initCarousel() {
  console.log('initCarousel called')
  const btnPrev = document.getElementById('img-prev');
  const btnNext = document.getElementById('img-next');
  const carouselContainer = document.querySelector('.carousel-container');

  if (!btnPrev || !btnNext || !carouselContainer) {
    console.error('Carousel elements not found.');
    return;
  }

  btnNext.addEventListener('click', () => {
    const itemWidth = carouselContainer.querySelector('.slide-item').clientWidth;
    carouselContainer.scrollLeft += itemWidth;
  });

  btnPrev.addEventListener('click', () => {
    const itemWidth = carouselContainer.querySelector('.slide-item').clientWidth;
    carouselContainer.scrollLeft -= itemWidth;
  });
}

  // if you have an array of image filenames or some API endpoint.
  const images = [
    '/rsc/images/me.jpg',
    '/rsc/images/vincent.jpg',
    '/rsc/images/announcement.jpg'
  ]