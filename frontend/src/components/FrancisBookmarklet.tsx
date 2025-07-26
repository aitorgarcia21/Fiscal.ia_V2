import React, { useState } from 'react';
import { Copy, CheckCircle, Bookmark, Zap, Globe, MessageSquare, Euro } from 'lucide-react';

interface FrancisBookmarkletProps {
  className?: string;
}

export const FrancisBookmarklet: React.FC<FrancisBookmarkletProps> = ({ className = "" }) => {
  const [copied, setCopied] = useState(false);

  // Code JavaScript du bookmarklet Francis
  const francisBookmarkletCode = `
(function() {
  if (window.francisLoaded) return;
  window.francisLoaded = true;
  
  // Injection CSS Francis
  const francisStyles = \`
    #francis-overlay {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 999999;
      background: linear-gradient(135deg, #162238, #0A192F);
      border: 2px solid #c5a572;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      width: 320px;
      font-family: system-ui, -apple-system, sans-serif;
      color: white;
    }
    #francis-toggle {
      background: linear-gradient(135deg, #c5a572, #e8cfa0);
      color: #162238;
      border: none;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      width: 100%;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    #francis-status {
      font-size: 14px;
      color: #c5a572;
      text-align: center;
    }
    #francis-transcript {
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 12px;
      margin: 12px 0;
      min-height: 60px;
      font-size: 14px;
      line-height: 1.4;
    }
  \`;
  
  // Injection du CSS
  const styleSheet = document.createElement('style');
  styleSheet.textContent = francisStyles;
  document.head.appendChild(styleSheet);
  
  // Interface Francis
  const francisHTML = \`
    <div id="francis-overlay">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
        <div style="background: #c5a572; padding: 4px; border-radius: 6px;">💬</div>
        <div style="background: #c5a572; padding: 4px; border-radius: 6px;">€</div>
        <strong>Francis Assistant</strong>
      </div>
      <button id="francis-toggle">
        🎤 Activer l'écoute Francis
      </button>
      <div id="francis-status">Prêt à analyser vos entretiens</div>
      <div id="francis-transcript" style="display: none;">
        <strong>Transcription en cours...</strong>
        <div id="transcript-content"></div>
      </div>
    </div>
  \`;
  
  // Injection dans la page
  document.body.insertAdjacentHTML('beforeend', francisHTML);
  
  // Variables globales
  let isListening = false;
  let recognition = null;
  
  // Gestion de la reconnaissance vocale
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'fr-FR';
    
    recognition.onresult = function(event) {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      
      document.getElementById('transcript-content').textContent = transcript;
      
      // Simulation analyse Francis (appel API réel possible ici)
      if (transcript.length > 50) {
        analyzeFrancisContent(transcript);
      }
    };
    
    recognition.onerror = function(event) {
      document.getElementById('francis-status').textContent = 'Erreur: ' + event.error;
    };
  }
  
  // Analyse du contenu par Francis
  function analyzeFrancisContent(transcript) {
    // Simulation extraction d'entités
    const entities = {
      nom: extractName(transcript),
      revenus: extractRevenue(transcript),
      age: extractAge(transcript),
      situation: extractSituation(transcript)
    };
    
    // Remplissage automatique des champs
    fillFormFields(entities);
  }
  
  // Extraction nom
  function extractName(text) {
    const namePatterns = [
      /je m'appelle ([A-ZÀ-Ÿ][a-zà-ÿ]+ [A-ZÀ-Ÿ][a-zà-ÿ]+)/i,
      /nom.*?([A-ZÀ-Ÿ][a-zà-ÿ]+ [A-ZÀ-Ÿ][a-zà-ÿ]+)/i,
      /monsieur ([A-ZÀ-Ÿ][a-zà-ÿ]+)/i
    ];
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  }
  
  // Extraction revenus
  function extractRevenue(text) {
    const revenuePatterns = [
      /(\\d+)\\s*k€?/i,
      /(\\d+)\\s*000\\s*euros?/i,
      /revenus?.*?(\\d+)/i
    ];
    
    for (const pattern of revenuePatterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseInt(match[1]);
        if (text.includes('k')) amount *= 1000;
        return amount;
      }
    }
    return null;
  }
  
  // Extraction âge
  function extractAge(text) {
    const ageMatch = text.match(/(\\d+)\\s*ans?/i);
    return ageMatch ? parseInt(ageMatch[1]) : null;
  }
  
  // Extraction situation
  function extractSituation(text) {
    if (/marié/i.test(text)) return 'Marié(e)';
    if (/célibataire/i.test(text)) return 'Célibataire';
    if (/divorcé/i.test(text)) return 'Divorcé(e)';
    return null;
  }
  
  // Remplissage automatique des champs
  function fillFormFields(entities) {
    const fieldMappings = {
      nom: ['name', 'nom', 'lastname', 'nom_client'],
      prenom: ['firstname', 'prenom', 'prénom'],
      age: ['age', 'âge'],
      revenus: ['revenue', 'revenus', 'income', 'revenu'],
      situation: ['situation', 'status', 'marital']
    };
    
    Object.entries(entities).forEach(([key, value]) => {
      if (value && fieldMappings[key]) {
        fieldMappings[key].forEach(fieldName => {
          const field = document.querySelector(\`input[name*="\${fieldName}"], select[name*="\${fieldName}"], textarea[name*="\${fieldName}"]\`);
          if (field) {
            field.value = value;
            field.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    });
  }
  
  // Gestion du bouton Francis
  document.getElementById('francis-toggle').onclick = function() {
    if (!isListening) {
      if (recognition) {
        recognition.start();
        isListening = true;
        this.textContent = '🔴 Arrêter l\\'écoute';
        document.getElementById('francis-status').textContent = 'Francis écoute en temps réel...';
        document.getElementById('francis-transcript').style.display = 'block';
      } else {
        alert('Reconnaissance vocale non supportée par votre navigateur');
      }
    } else {
      if (recognition) {
        recognition.stop();
        isListening = false;
        this.textContent = '🎤 Activer l\\'écoute Francis';
        document.getElementById('francis-status').textContent = 'Écoute arrêtée';
      }
    }
  };
  
  console.log('🎉 Francis Bookmarklet chargé avec succès !');
})();`.trim();

  const bookmarkletUri = `javascript:${encodeURIComponent(francisBookmarkletCode)}`;

  const handleCopyBookmarklet = async () => {
    try {
      await navigator.clipboard.writeText(bookmarkletUri);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erreur copie:', err);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-[#162238] to-[#0A192F] rounded-xl p-6 border border-[#c5a572]/20 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2 bg-[#c5a572]/10 px-3 py-1.5 rounded-lg">
          <Bookmark className="h-5 w-5 text-[#c5a572]" />
          <span className="text-[#c5a572] font-medium">Bookmarklet</span>
        </div>
        <div className="flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg">
          <Zap className="h-4 w-4 text-green-400" />
          <span className="text-green-400 text-sm font-medium">Installation Instantanée</span>
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-[#c5a572]" />
        <Euro className="h-5 w-5 text-[#c5a572]" />
        Francis Bookmarklet
      </h3>
      
      <p className="text-gray-300 mb-4 text-sm leading-relaxed">
        Solution <strong>100% compatible</strong> tous navigateurs ! 
        <span className="text-[#c5a572]">Aucune extension nécessaire</span> - Francis fonctionne immédiatement sur tous vos sites.
      </p>
      
      <div className="bg-[#0A192F]/50 rounded-lg p-4 mb-4 border border-[#c5a572]/10">
        <h4 className="text-white font-medium mb-2 flex items-center gap-2">
          <Globe className="h-4 w-4 text-green-400" />
          Compatible 100% :
        </h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• ✅ <strong>Tous navigateurs</strong> : Chrome, Safari, Firefox, Edge...</li>
          <li>• ✅ <strong>Tous sites web</strong> : CRM, formulaires, plateformes...</li>
          <li>• ✅ <strong>Aucune installation</strong> : Fonctionne immédiatement</li>
          <li>• ✅ <strong>Reconnaissance vocale</strong> + auto-remplissage</li>
          <li>• ✅ <strong>Zero configuration</strong> : Glisser-déposer dans favoris</li>
        </ul>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={handleCopyBookmarklet}
          className={`
            w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold text-lg
            transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
            ${copied 
              ? 'bg-green-600 hover:bg-green-700 text-white' 
              : 'bg-gradient-to-r from-[#c5a572] to-[#e6c890] hover:from-[#e6c890] hover:to-[#c5a572] text-[#162238]'
            }
            shadow-lg hover:shadow-xl
          `}
        >
          {copied ? (
            <>
              <CheckCircle className="h-5 w-5" />
              <span>Copié !</span>
            </>
          ) : (
            <>
              <Copy className="h-5 w-5" />
              <span>Copier Francis Bookmarklet</span>
            </>
          )}
        </button>
        
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
          <h5 className="text-orange-400 font-medium text-sm mb-2">📋 Instructions rapides :</h5>
          <ol className="text-gray-300 text-xs space-y-1">
            <li>1. Cliquez "Copier Francis Bookmarklet"</li>
            <li>2. Créez un nouveau favori dans votre navigateur</li>
            <li>3. Collez le code dans l'URL du favori</li>
            <li>4. Nommez-le "🎤 Francis" et sauvegardez</li>
            <li>5. Sur n'importe quel site : cliquez le favori !</li>
          </ol>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-gray-400 text-xs">
          Compatible: Chrome, Safari, Firefox, Edge, Opera • Tous OS
        </p>
        <p className="text-[#c5a572] text-xs mt-1">
          ⚡ Francis apparaît instantanément sur TOUS vos sites web
        </p>
      </div>
    </div>
  );
};

export default FrancisBookmarklet;
