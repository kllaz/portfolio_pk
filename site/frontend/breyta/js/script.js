//vue activate
const app = Vue.createApp({
    components:{
        ReportSlider
    }
});

app.mount('#app');

const slider = Vue.createApp({
    components:{
        FlowSlider
    }
});

slider.mount('#slider');

//open analysis
//const clickToOpen = document.getElementById('openAnalysis');
function openAnalysis () {
    const clickToOpen = document.getElementById('openAnalysis');
    const fullAnalysis = document.getElementById('fullAnalysis');
    const changeContent = document.getElementById('changeContent');
    const svg = document.getElementById('svg');
    if(clickToOpen.classList.contains('open')){
        clickToOpen.classList.toggle('open');
        clickToOpen.classList.toggle('hide');
        changeContent.textContent = "Hide full analysis";
        fullAnalysis.style.display = "block";
        svg.style.transform = 'rotate(180deg)';
    } else if(clickToOpen.classList.contains('hide')){
        clickToOpen.classList.toggle('open');
        clickToOpen.classList.toggle('hide');
        changeContent.textContent = "See full analysis";
        fullAnalysis.style.display = "none";
        svg.style.transform = 'rotate(0deg)';
    }
}