/* chatbot.js - floating bottom-right chatbot (injects itself) */
(function(){
  // fab
  const fab = document.createElement('button');
  fab.className = 'chatbot-fab';
  fab.id = 'chatbot-fab';
  fab.innerText = '💬';
  document.body.appendChild(fab);

  // panel
  const panel = document.createElement('div');
  panel.className = 'chatbot-panel';
  panel.id = 'chatbot-panel';
  panel.innerHTML = `
    <div class="chatbot-header"><strong>Travel Bot</strong><button id="chat-close" style="background:transparent;border:none;cursor:pointer">✕</button></div>
    <div class="chatbot-body" id="chat-body"></div>
    <div class="chatbot-footer">
      <input id="chat-input" class="chat-input" placeholder="Ask: weather, currency, tips..." />
      <button id="chat-send" class="btn">Send</button>
    </div>
  `;
  document.body.appendChild(panel);

  const body = panel.querySelector('#chat-body');
  const input = panel.querySelector('#chat-input');
  const send = panel.querySelector('#chat-send');
  const closeBtn = panel.querySelector('#chat-close');

  function append(who, text){
    const el = document.createElement('div');
    el.style.marginBottom = '10px';
    el.innerHTML = `<strong>${who}:</strong> ${escapeHtml(text)}`;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }
  function escapeHtml(s){ return (s||'').replace(/[&<>"']/g, (m)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

  fab.addEventListener('click', ()=> {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) input.focus();
  });
  closeBtn.addEventListener('click', ()=> panel.classList.remove('open'));

  send.addEventListener('click', ()=> {
    const q = input.value.trim();
    if (!q) return;
    append('You', q);
    input.value = '';

    const m = q.toLowerCase();
    let ans = "Sorry — I only understand a few things: weather, currency, tips, login.";
    if (/hello|hi|hey/.test(m)) ans = "Hi! Ask about weather, currency converter, or type 'tips' to open the Tips page.";
    else if (m.includes('weather')) ans = "Open the Home page to view the current weather.";
    else if (m.includes('currency') || m.includes('exchange')) ans = "Use the converter on the Home page (amount/from/to → Convert).";
    else if (m.includes('tips')) ans = "Go to the Tips page to open categories like Emergency, Apps, Transport.";
    else if (m.includes('login') || m.includes('signup')) ans = "Click the hamburger menu (top-left) and choose Login or Signup.";
    append('Bot', ans);
  });

  input.addEventListener('keydown',(e)=> { if (e.key === 'Enter') send.click(); });

  // welcome
  append('Bot','Hi — I can help with weather, currency, tips, or navigation.');
})();
