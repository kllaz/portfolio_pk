//change link style
function changeTopic (event) {
    const clickedLink = event.target;
    const activeLink = document.getElementById('active');
    const activeBlock = document.getElementById('active-block');
    const siblingBlock = clickedLink.nextElementSibling;
    const parentBlock = clickedLink.parentElement;
    const activeParentBlock = activeLink.parentElement;
    if (!clickedLink.classList.contains('active') && clickedLink.tagName === 'A') {
        clickedLink.classList.toggle('active');
        clickedLink.id = 'active';
        activeLink.removeAttribute('id');
        activeLink.classList.toggle('active');
        activeBlock.removeAttribute('id');
        siblingBlock.id = 'active-block';
        parentBlock.classList.toggle('inactive');
        activeParentBlock.classList.toggle('inactive');
    } 
    window.dispatchEvent(new CustomEvent("topicChanged", { detail: clickedLink.textContent }));
}

//set description block width
const source = document.getElementById('source');
const link = document.querySelector('.link');

function waitForTarget(className, callback) {
    const interval = setInterval(() => {
        const el = document.querySelector(className);
        if (el) {
            clearInterval(interval);
            callback(el);
        }
    }, 5);
}

waitForTarget('.target', (target) => {
    const switchBox = document.querySelector('.switch-box');
    function syncWidth() {
        const sourceWidth = source.getBoundingClientRect().width;
        target.style.width = `${sourceWidth}px`;
        if(switchBox){
            switchBox.style.width = `${(window.innerWidth - sourceWidth)/2}px`;
        }
    }

    syncWidth();

    window.addEventListener('resize', syncWidth);
    
    const observer = new ResizeObserver(syncWidth);
    observer.observe(source);
})

window.addEventListener("topicChanged", () => {
  waitForTarget('.target', (target) => {
    const switchBox = document.querySelector('.switch-box');

    function syncWidth() {
      const sourceWidth = source.getBoundingClientRect().width;
      target.style.width = `${sourceWidth}px `;
      if(switchBox){
          switchBox.style.width = `${(window.innerWidth - sourceWidth)/2}px`;
      }
    }

    syncWidth();
    window.addEventListener('resize', syncWidth);

    const observer = new ResizeObserver(syncWidth);
    observer.observe(source);
  });
});



