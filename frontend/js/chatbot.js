/* chatbot.js - Button-driven floating chatbot */
(function() {
  // --- Create and Inject Chatbot HTML ---
  const fab = document.createElement('button');
  fab.className = 'chatbot-fab';
  fab.id = 'chatbot-fab';
  fab.innerHTML = '💬';
  document.body.appendChild(fab);

  const panel = document.createElement('div');
  panel.className = 'chatbot-panel';
  panel.id = 'chatbot-panel';
  panel.innerHTML = `
    <div class="chatbot-header">
      <strong>Travel Bot</strong>
      <button id="chat-close" class="chat-close-btn">✕</button>
    </div>
    <div class="chatbot-body" id="chat-body"></div>
  `;
  document.body.appendChild(panel);

  const chatBody = panel.querySelector('#chat-body');
  const closeBtn = panel.querySelector('#chat-close');

  // --- Helper Functions for Rendering Content ---
  function clearChatBody() {
    chatBody.innerHTML = '';
  }

  function renderBotMessage(htmlContent) {
    const msg = document.createElement('div');
    msg.className = 'chat-message bot';
    msg.innerHTML = htmlContent;
    chatBody.appendChild(msg);
    scrollToBottom();
  }

  function renderButtons(buttons) {
    const btnContainer = document.createElement('div');
    btnContainer.className = 'chat-button-container';
    buttons.forEach(btnInfo => {
      const btn = document.createElement('button');
      btn.className = 'btn-chat-option';
      btn.textContent = btnInfo.text;
      btn.dataset.action = btnInfo.action; // Store action in data attribute
      if (btnInfo.payload) {
        btn.dataset.payload = btnInfo.payload; // Store optional payload
      }
      btnContainer.appendChild(btn);
    });
    chatBody.appendChild(btnContainer);
    scrollToBottom();
  }
  
  function scrollToBottom() {
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // --- Conversation Flow & Logic ---
  const actions = {
    'show-main-menu': () => {
      clearChatBody();
      renderBotMessage("How can I help you?");
      renderButtons([
        { text: "🚖 Transportation", action: 'show-transport-menu' },
        { text: "🙏 Basic Thai Phrases", action: 'show-thai-menu' },
        { text: "⚠️ Emergency Info", action: 'show-emergency-menu' },
        { text: "🍜 Local Food", action: 'show-food-menu' }
      ]);
    },
    'show-transport-menu': () => {
      clearChatBody();
      renderBotMessage("What would you like to know about transportation?");
      renderButtons([
        { text: "Getting around the city", action: 'show-info', payload: '<strong>The BTS Skytrain and MRT subway</strong> are the fastest and cheapest ways to get around Bangkok, avoiding the notorious traffic jams.' },
        { text: "Airport to City", action: 'show-info', payload: 'Take the <strong>Airport Rail Link (ARL)</strong> for a quick and affordable trip to the city center. Alternatively, find <strong>official taxis</strong> on the 1st floor of the airport. Ride-hailing apps like Grab are also convenient.' },
        { text: "Taxi Tips", action: 'show-info', payload: "Always insist the driver uses the meter by saying <strong>'meter on'</strong>. If the driver refuses, it's best to find another taxi to avoid being overcharged." },
        { text: "⬅️ Go Back", action: 'show-main-menu' }
      ]);
    },
    'show-thai-menu': () => {
      clearChatBody();
      renderBotMessage("Here are some useful Thai phrases.");
      renderButtons([
        { text: "Greetings", action: 'show-info', payload: 'Hello: <strong>Sawasdee krap (if you are male) / Sawasdee ka (if you are female)</strong>' },
        { text: "Thank You", action: 'show-info', payload: 'Thank you: <strong>Khop khun krap (male) / Khop khun ka (female)</strong>' },
        { text: "Asking Price", action: 'show-info', payload: 'How much is this?: <strong>Nee tao rai krap (male) / ka (female)</strong>' },
        { text: "⬅️ Go Back", action: 'show-main-menu' }
      ]);
    },
    'show-emergency-menu': () => {
      clearChatBody();
      renderBotMessage("In an emergency, use these contacts.");
      renderButtons([
        { text: "Tourist Police", action: 'show-info', payload: 'Dial <strong>1155</strong>. This is a 24/7 nationwide service for tourists.' },
        { text: "Police / Fire", action: 'show-info', payload: 'For general police emergencies, dial <strong>191</strong>. For fire, dial <strong>199</strong>.' },
        { text: "Ambulance", action: 'show-info', payload: 'For emergency medical services, dial <strong>1669</strong>.' },
        { text: "⬅️ Go Back", action: 'show-main-menu' }
      ]);
    },
    'show-food-menu': () => {
      clearChatBody();
      renderBotMessage("Here are some must-try foods in Bangkok.");
      renderButtons([
        { text: "Signature Dishes", action: 'show-info', payload: 'You have to try <strong>Pad Thai</strong> (stir-fried noodles), <strong>Tom Yum Goong</strong> (hot and sour soup), and <strong>Kuay Teow</strong> (noodle soup).' },
        { text: "Street Food Snacks", action: 'show-info', payload: 'We recommend <strong>Mango Sticky Rice</strong>, <strong>Roti</strong> (Thai-style pancake), and fresh <strong>Coconut Ice Cream</strong>.' },
        { text: "⬅️ Go Back", action: 'show-main-menu' }
      ]);
    },
    'show-info': (info) => {
      clearChatBody(); // Clear the previous menu
      renderBotMessage(info); // Show the information
      renderButtons([
        { text: "🏠 Back to Home", action: 'show-main-menu' }
      ]);
    }
  };

  // --- Event Listeners ---
  fab.addEventListener('click', () => {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      actions['show-main-menu'](); // Start the conversation
    }
  });

  closeBtn.addEventListener('click', () => panel.classList.remove('open'));

  // Use event delegation for button clicks
  chatBody.addEventListener('click', (e) => {
    if (e.target.matches('.btn-chat-option')) {
      const action = e.target.dataset.action;
      const payload = e.target.dataset.payload;
      if (actions[action]) {
        actions[action](payload); // Execute the corresponding action
      }
    }
  });

})();
