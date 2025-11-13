const burger = document.querySelector('.burger');
const sidebar = document.querySelector('.sidebar-menu');
burger.addEventListener('click', function() {
  const expanded = burger.getAttribute('aria-expanded') === 'true';
  burger.setAttribute('aria-expanded', !expanded);
  sidebar.classList.toggle('open');
});

document.querySelectorAll('.sidebar-menu a').forEach(link => {
  link.addEventListener('click', () => {
    burger.setAttribute('aria-expanded', false);
    sidebar.classList.remove('open');
  });
});

(function() {
  const track = document.querySelector('.reviews-slider-track');
  const cards = Array.from(document.querySelectorAll('.review-card'));
  const leftBtn = document.querySelector('.slider-arrow-left');
  const rightBtn = document.querySelector('.slider-arrow-right');
  let current = 1; 
  function updateSlider() {
    cards.forEach((card, i) => {
      card.classList.remove('inactive');
      if (i !== current) card.classList.add('inactive');
    });

    const cardWidth = cards[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(cards[0]).marginRight) || 0.5 * cardWidth / 16;
    const offset = (cardWidth + gap) * (current - 1);
    track.style.transform = `translateX(${-offset}px)`;
  }
  leftBtn.addEventListener('click', () => {
    if (current > 0) {
      current--;
      updateSlider();
    }
  });
  rightBtn.addEventListener('click', () => {
    if (current < cards.length - 1) {
      current++;
      updateSlider();
    }
  });
  
  updateSlider();
  window.addEventListener('resize', updateSlider);
})();