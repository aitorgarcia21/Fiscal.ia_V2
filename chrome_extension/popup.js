// Francis Teams Assistant - Popup ultra-simple
document.addEventListener('DOMContentLoaded', function() {
  const teamsBtn = document.getElementById('teams-btn');
  const settingsBtn = document.getElementById('settings-btn');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');

  // Vérifier le statut actuel
  checkStatus();

  // Bouton principal - Activer Francis sur Teams
  teamsBtn.addEventListener('click', function() {
    // Ouvrir Teams dans un nouvel onglet
    chrome.tabs.create({ url: 'https://teams.microsoft.com' }, function(tab) {
      // Attendre que Teams se charge puis activer Francis
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id, { action: 'ACTIVATE_FRANCIS' });
      }, 2000);
    });
    
    // Feedback visuel
    teamsBtn.textContent = '🎯 Francis activé !';
    teamsBtn.style.background = 'linear-gradient(135deg, #10B981, #059669)';
    teamsBtn.style.color = 'white';
    
    setTimeout(() => {
      teamsBtn.textContent = '🎤 Activer Francis sur Teams';
      teamsBtn.style.background = 'linear-gradient(135deg, #c5a572, #e8cfa0)';
      teamsBtn.style.color = '#162238';
    }, 3000);
  });

  // Bouton paramètres
  settingsBtn.addEventListener('click', function() {
    chrome.tabs.create({ url: 'https://francis.ai/pro/teams-assistant' });
  });

  // Vérifier le statut de l'extension
  function checkStatus() {
    chrome.storage.local.get(['francisStatus', 'francisToken'], function(result) {
      if (result.francisStatus === 'active') {
        statusDot.classList.remove('inactive');
        statusText.textContent = 'Francis actif';
      } else {
        statusDot.classList.add('inactive');
        statusText.textContent = 'Prêt à écouter';
      }
    });
  }

  // Écouter les messages du content script
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'STATUS_UPDATE') {
      checkStatus();
    }
  });
});

// Animation simple pour le statut
setInterval(() => {
  const statusDot = document.getElementById('status-dot');
  if (!statusDot.classList.contains('inactive')) {
    statusDot.style.opacity = statusDot.style.opacity === '0.5' ? '1' : '0.5';
  }
}, 1000); 