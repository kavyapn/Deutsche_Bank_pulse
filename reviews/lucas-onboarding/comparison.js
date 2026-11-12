const size=document.querySelector('#size');
function scaleFrames(){document.querySelectorAll('.frame-host').forEach(host=>host.style.setProperty('--scale',Math.min(1,host.getBoundingClientRect().width/(size.value==='mobile'?392:902))))}
function resize(){document.body.classList.toggle('mobile',size.value==='mobile');scaleFrames();history.replaceState(null,'','?size='+size.value)}
const params=new URLSearchParams(location.search);if(params.get('size')==='mobile')size.value='mobile';
new ResizeObserver(scaleFrames).observe(document.querySelector('.comparison'));
size.addEventListener('change',resize);
document.querySelector('#restart').addEventListener('click',()=>document.querySelectorAll('iframe').forEach(frame=>frame.src=frame.src));
resize();
