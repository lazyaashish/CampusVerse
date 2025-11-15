// app.js — robust event & overview loader
const API_BASE = '/api';

document.addEventListener('DOMContentLoaded', () => {
  console.log('app.js loaded — initializing UI');

  // small entrance animations
  document.querySelectorAll('.hero-card, .hero-media, .feature, .card').forEach((el,i)=>{
    el.style.opacity = 0;
    setTimeout(()=>{ el.style.transition='all .6s cubic-bezier(.2,.9,.2,1)'; el.style.opacity=1; el.style.transform='translateY(0)'; }, 120*i);
  });

  // sidebar bindings
  const side = document.querySelectorAll('.side-item');
  if(side.length){
    side.forEach(s => s.addEventListener('click', ()=>{
      side.forEach(x=>x.classList.remove('active'));
      s.classList.add('active');
      loadSection(s.dataset.page);
    }));
  }

  // login flow
  const loginBtn = document.querySelector('.btn-primary[data-action="login"]');
  if(loginBtn){
    loginBtn.addEventListener('click', ()=>{
      loginBtn.disabled = true;
      loginBtn.style.transform = 'translateY(2px) scale(.99)';
      showToast('Signing in...');
      setTimeout(()=> location.href='dashboard.html', 1200);
    });
  }

  window.showToast = (msg) => {
    const t = document.createElement('div');
    Object.assign(t.style, {position:'fixed',right:'20px',bottom:'20px',background:'linear-gradient(90deg,var(--accent2),var(--accent1))',color:'#031528',padding:'10px 14px',borderRadius:'10px',boxShadow:'0 12px 30px rgba(0,0,0,0.4)',zIndex:80});
    t.textContent = msg; document.body.appendChild(t);
    setTimeout(()=> t.style.opacity=0,1600); setTimeout(()=> t.remove(),2200);
  };

  if(document.getElementById('mainContent')) loadSection('overview');
});

function loadSection(name){
  const main = document.getElementById('mainContent');
  main.style.opacity = 0;
  setTimeout(()=>{
    if(name==='overview') loadOverview(main);
    else if(name==='events') loadEvents(main);
    else if(name==='notices') main.innerHTML = noticesHTML();
    else if(name==='clubs') main.innerHTML = clubsHTML();
    else if(name==='complaints') main.innerHTML = complaintsHTML();
    else if(name==='feedback') main.innerHTML = feedbackHTML();
    else main.innerHTML = `<p>Section ${name} not found</p>`;
    main.style.opacity = 1;
  }, 180);
}

function loadEvents(main){
  console.log('loadEvents: fetching', API_BASE + '/events');
  main.innerHTML = `<p>Loading events...</p>`;
  fetch(API_BASE + '/events')
    .then(resp => {
      console.log('events fetch status', resp.status);
      if(!resp.ok) throw new Error('HTTP ' + resp.status + ' ' + resp.statusText);
      return resp.json();
    })
    .then(data => {
      console.log('events data', data);
      if(!Array.isArray(data)) throw new Error('Invalid events data (not array)');
      main.innerHTML = eventsHTML(data);
      // trigger image loader
      setTimeout(()=> { if(window.imageLoaderForceRun) window.imageLoaderForceRun(); }, 50);
    })
    .catch(err => {
      console.error('Failed to load events:', err);
      main.innerHTML = `<div style="color:crimson"><strong>Unable to show events.</strong><div style="color:var(--muted);margin-top:6px">${escapeHtml(err.message)}</div></div>`;
    });
}

function loadOverview(main){
  console.log('loadOverview: fetching events for overview');
  main.innerHTML = `<p>Loading overview...</p>`;
  fetch(API_BASE + '/events')
    .then(resp => {
      console.log('overview fetch status', resp.status);
      if(!resp.ok) throw new Error('HTTP ' + resp.status + ' ' + resp.statusText);
      return resp.json();
    })
    .then(data => {
      if(!Array.isArray(data)) throw new Error('Invalid events data (not array)');
      main.innerHTML = overviewHTML(data);
      setTimeout(()=> { if(window.imageLoaderForceRun) window.imageLoaderForceRun(); }, 50);
    })
    .catch(err => {
      console.error('Failed to load overview:', err);
      main.innerHTML = `<div style="color:crimson"><strong>Unable to show overview.</strong><div style="color:var(--muted);margin-top:6px">${escapeHtml(err.message)}</div></div>`;
    });
}

function overviewHTML(events){
  const first = events[0] || null;
  const second = events[1] || null;
  return `
  <div class="section-grid">
    <div class="card">
      <h2>Upcoming Events</h2>
      <div class="muted">${events.length} events</div>
      <div style="margin-top:12px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${first ? `<div class="card"><img data-img="${first.image}" style="width:100%;border-radius:8px;object-fit:cover;height:180px"><strong>${escapeHtml(first.title)}</strong></div>` : ''}
        ${second ? `<div class="card"><img data-img="${second.image}" style="width:100%;border-radius:8px;object-fit:cover;height:180px"><strong>${escapeHtml(second.title)}</strong></div>` : ''}
      </div>
    </div>
    <div class="card">
      <h2>Notices</h2>
      <div class="muted">Recent notices</div>
      <ul style="margin-top:10px;color:var(--muted)">
        <li>Exam Schedule Published</li>
        <li>Library Timings Updated</li>
      </ul>
    </div>
  </div>`;
}

function eventsHTML(data){
  let html = `<h2>Events</h2><div class="grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:20px">`;
  data.forEach(ev => {
    const image = ev.image ? ev.image : 'event-sample.jpg';
    html += `<div class="card"><img data-img="${escapeHtml(image)}" style="width:100%;border-radius:8px;object-fit:cover;height:180px"><strong>${escapeHtml(ev.title)}</strong><div class="muted">${escapeHtml(ev.date || '')}</div><p>${escapeHtml(ev.description || '')}</p></div>`;
  });
  html += `</div>`;
  return html;
}

function escapeHtml(s){
  if(!s) return '';
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function noticesHTML(){ return `<h2>Notices</h2><div class="card"><h3>Exam Schedule Released</h3><div class="muted">Posted by Admin</div></div><div class="card" style="margin-top:10px"><h3>Hostel Maintenance</h3><div class="muted">Posted by Warden</div></div>`;}
function clubsHTML(){ return `<h2>Clubs & Projects</h2><div class="section-grid" style="margin-top:12px"><div class="card"><h3>Robotics Club</h3><p class="muted">24 members • Active projects</p></div><div class="card"><h3>Art Society</h3><p class="muted">18 members • Events</p></div></div>`;}
function complaintsHTML(){ return `<h2>Complaints</h2><div class="card"><p class="muted">Create a complaint to report hostel/academic issues.</p><div style="margin-top:12px"><textarea style="width:100%;padding:10px;border-radius:8px" placeholder="Describe issue"></textarea><div style="margin-top:8px"><button class="btn btn-primary" onclick="showToast('Complaint submitted')">Submit</button></div></div></div>`;}
function feedbackHTML(){ return `<h2>Feedback</h2><div class="card"><p class="muted">Share thoughts to improve campus life.</p><textarea style="width:100%;padding:10px;border-radius:8px" placeholder="Your feedback"></textarea><div style="margin-top:8px"><button class="btn btn-primary" onclick="showToast('Feedback sent')">Send</button></div></div>`;}
