(function(){
  const baseMeta = document.querySelector('meta[name="assets-base"]');
  const BASE = baseMeta ? baseMeta.content.replace(/\/+$/,'') : 'assets';
  function setImg(img){
    const fname = img.getAttribute('data-img');
    if(!fname) return;
    const src = BASE + '/' + fname;
    if(img.getAttribute('src') !== src){
      img.setAttribute('src', src);
    }
    img.onerror = ()=> {
      // fallback to event-sample.jpg if available
      img.src = BASE + '/event-sample.jpg';
    };
  }
  function init(){
    document.querySelectorAll('img[data-img]').forEach(setImg);
  }
  window.imageLoaderForceRun = init;
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();