// Francis Teams Listener - Ultra-simple
console.log('🎯 Francis Teams Assistant chargé');

let isActive = false;
let mediaRecorder = null;
let audioChunks = [];

// Détecter automatiquement Teams
function detectTeams() {
  const isTeams = window.location.hostname.includes('teams.microsoft.com');
  if (isTeams && !isActive) {
    console.log('✅ Microsoft Teams détecté - Francis prêt !');
    injectFrancisUI();
  }
}

// Injecter l'interface Francis dans Teams
function injectFrancisUI() {
  // Créer le bouton Francis
  const francisBtn = document.createElement('div');
  francisBtn.id = 'francis-teams-btn';
  francisBtn.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      background: linear-gradient(135deg, #c5a572, #e8cfa0);
      color: #162238;
      padding: 12px 16px;
      border-radius: 25px;
      font-weight: bold;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      font-family: 'Segoe UI', sans-serif;
    ">
      🎤 Francis
    </div>
  `;

  // Ajouter le bouton au DOM
  document.body.appendChild(francisBtn);

  // Gestionnaire de clic
  francisBtn.addEventListener('click', toggleFrancis);
}

// Activer/Désactiver Francis
function toggleFrancis() {
  const btn = document.getElementById('francis-teams-btn');
  
  if (!isActive) {
    // Activer Francis
    isActive = true;
    btn.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(135deg, #10B981, #059669);
        color: white;
        padding: 12px 16px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
        font-family: 'Segoe UI', sans-serif;
      ">
        🎯 Francis actif
      </div>
    `;
    
    startListening();
    showNotification('🎯 Francis activé - Écoute en cours...');
    
  } else {
    // Désactiver Francis
    isActive = false;
    btn.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(135deg, #c5a572, #e8cfa0);
        color: #162238;
        padding: 12px 16px;
        border-radius: 25px;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        font-family: 'Segoe UI', sans-serif;
      ">
        🎤 Francis
      </div>
    `;
    
    stopListening();
    showNotification('⏸️ Francis désactivé');
  }
}

// Démarrer l'écoute
function startListening() {
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        sendAudioToFrancis(audioBlob);
        audioChunks = [];
      };
      
      // Enregistrer par chunks de 3 secondes
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder && isActive) {
          mediaRecorder.stop();
          mediaRecorder.start();
        }
      }, 3000);
      
    })
    .catch(err => {
      console.error('❌ Erreur accès micro:', err);
      showNotification('❌ Accès micro refusé');
    });
}

// Arrêter l'écoute
function stopListening() {
  if (mediaRecorder) {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
  }
}

// Envoyer l'audio à Francis
function sendAudioToFrancis(audioBlob) {
  const formData = new FormData();
  formData.append('audio', audioBlob);
  
  fetch('https://api.francis.ai/teams/transcribe', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.suggestions) {
      showFrancisSuggestions(data.suggestions);
    }
  })
  .catch(err => {
    console.error('❌ Erreur envoi audio:', err);
  });
}

// Afficher les suggestions Francis
function showFrancisSuggestions(suggestions) {
  const suggestionsDiv = document.createElement('div');
  suggestionsDiv.id = 'francis-suggestions';
  suggestionsDiv.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      background: white;
      border: 2px solid #c5a572;
      border-radius: 12px;
      padding: 16px;
      max-width: 300px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.3);
      font-family: 'Segoe UI', sans-serif;
    ">
      <div style="font-weight: bold; color: #162238; margin-bottom: 8px;">
        💡 Francis suggère :
      </div>
      <div style="color: #374151; font-size: 14px;">
        ${suggestions}
      </div>
      <button onclick="this.parentElement.remove()" style="
        margin-top: 8px;
        background: #c5a572;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
      ">
        ✕
      </button>
    </div>
  `;
  
  document.body.appendChild(suggestionsDiv);
  
  // Auto-supprimer après 10 secondes
  setTimeout(() => {
    if (suggestionsDiv.parentElement) {
      suggestionsDiv.remove();
    }
  }, 10000);
}

// Afficher une notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 10000;
    background: #162238;
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: 'Segoe UI', sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 3000);
}

// CSS pour l'animation pulse
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Écouter les messages de la popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ACTIVATE_FRANCIS') {
    if (!isActive) {
      toggleFrancis();
    }
  }
});

// Détecter Teams au chargement
detectTeams();

// Détecter les changements d'URL (pour les SPA)
let currentUrl = window.location.href;
setInterval(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    detectTeams();
  }
}, 1000); 