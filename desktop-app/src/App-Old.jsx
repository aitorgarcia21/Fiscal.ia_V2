import React, { useState, useEffect, useRef } from 'react';
import TitleBar from './components/TitleBar';
import francisLogo from './assets/francis-logo.svg';
import './francis-ultra-epure.css';

const App = () => {
  const [isListening, setIsListening] = useState(true); // ÉCOUTE PERMANENTE
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [status, setStatus] = useState('🎤 Francis écoute en permanence');
  const [extractedData, setExtractedData] = useState({});
  const [isMinimized, setIsMinimized] = useState(false);
  const [openWindows, setOpenWindows] = useState([]);
  const [selectedWindow, setSelectedWindow] = useState(null);
  const [showWindowSelector, setShowWindowSelector] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecording, setCurrentRecording] = useState(null);
  const [francisSession, setFrancisSession] = useState(null);
  const recognitionRef = useRef(null);
  const hotKeyRef = useRef(null);

  useEffect(() => {
    // Initialiser la reconnaissance vocale PERMANENTE (comme Francis.ia)
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'fr-FR';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
        setInterimTranscript(interimTranscript);
        
        // Analyser et extraire les données en temps réel
        const fullText = transcript + finalTranscript + interimTranscript;
        if (fullText.length > 20) {
          analyzeAndExtract(fullText);
        }
      };

      recognitionRef.current.onstart = () => {
        setStatus('🎤 Francis écoute en permanence');
        setIsListening(true);
      };

      recognitionRef.current.onend = () => {
        // REDÉMARRAGE AUTOMATIQUE (comme Francis.ia)
        if (isListening) {
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (error) {
              console.log('Redémarrage reconnaissance vocale');
            }
          }, 100);
        }
      };

      recognitionRef.current.onerror = (event) => {
        setStatus(`Erreur: ${event.error}`);
        setIsListening(false);
      };
    } else {
      setStatus('❌ Reconnaissance vocale non supportée');
    }

    // Écouter les hotkeys globaux via IPC
    if (window.electronAPI) {
      window.electronAPI.onGlobalHotkey((action) => {
        if (action === 'toggle-francis') {
          toggleListening();
        } else if (action === 'minimize-francis') {
          toggleMinimized();
        }
      });
    }

    // Initialiser la session Francis
    initializeFrancisSession();

    // DÉMARRER L'ÉCOUTE AUTOMATIQUEMENT (comme Francis.ia)
    setTimeout(() => {
      if (recognitionRef.current && !isListening) {
        try {
          recognitionRef.current.start();
          setStatus('🎤 Francis démarré automatiquement');
        } catch (error) {
          console.log('Démarrage automatique reconnaissance:', error);
        }
      }
    }, 1000);

    return () => {
      // Ne jamais arrêter complètement la reconnaissance
      if (isRecording && currentRecording) {
        stopAudioRecording();
      }
    };
  }, []);

  // Initialiser la session Francis
  const initializeFrancisSession = async () => {
    if (window.electronAPI && window.electronAPI.getFrancisSession) {
      try {
        const result = await window.electronAPI.getFrancisSession();
        if (result.success) {
          setFrancisSession(result.session);
          setStatus('🔗 Session Francis connectée');
        } else {
          setStatus('⚠️ Session Francis non disponible');
        }
      } catch (error) {
        console.error('Erreur initialisation session:', error);
      }
    }
  };

  // Obtenir les fenêtres ouvertes
  const getOpenWindows = async () => {
    if (window.electronAPI && window.electronAPI.getOpenWindows) {
      try {
        const result = await window.electronAPI.getOpenWindows();
        if (result.success) {
          setOpenWindows(result.windows);
          return result.windows;
        }
      } catch (error) {
        console.error('Erreur récupération fenêtres:', error);
      }
    }
    return [];
  };

  // Démarrer l'enregistrement audio réel
  const startAudioRecording = async () => {
    if (window.electronAPI && window.electronAPI.startRecording) {
      try {
        const result = await window.electronAPI.startRecording();
        if (result.success) {
          setIsRecording(true);
          setCurrentRecording(result.recording);
          setStatus('🔴 Enregistrement audio en cours...');
        } else {
          setStatus('❌ Erreur démarrage enregistrement');
        }
      } catch (error) {
        console.error('Erreur démarrage enregistrement:', error);
      }
    }
  };

  // Arrêter l'enregistrement audio réel
  const stopAudioRecording = async () => {
    if (window.electronAPI && window.electronAPI.stopRecording) {
      try {
        const result = await window.electronAPI.stopRecording();
        if (result.success) {
          setIsRecording(false);
          setCurrentRecording(result.recording);
          setStatus('✅ Enregistrement sauvegardé');
          
          // Synchroniser avec le site Francis
          await syncToFrancis(result.recording);
        } else {
          setStatus('❌ Erreur arrêt enregistrement');
        }
      } catch (error) {
        console.error('Erreur arrêt enregistrement:', error);
      }
    }
  };

  // Synchroniser avec le site Francis
  const syncToFrancis = async (recording = null) => {
    if (window.electronAPI && window.electronAPI.syncToWebsite) {
      try {
        const syncData = {
          transcript,
          extractedData,
          recordingId: recording?.id || null
        };
        
        const result = await window.electronAPI.syncToWebsite(syncData);
        if (result.success) {
          setStatus('🌐 Synchronisé avec Francis.ia');
        } else {
          setStatus('⚠️ Échec synchronisation site');
        }
      } catch (error) {
        console.error('Erreur synchronisation:', error);
      }
    }
  };

  // Francis écoute TOUJOURS (comme sur Francis.ia)
  const restartListening = () => {
    if (!recognitionRef.current) return;
    
    try {
      // Redémarrer seulement si nécessaire
      if (!isListening) {
        recognitionRef.current.start();
        setStatus('🎤 Francis redémarré');
      } else {
        setStatus('🎤 Francis écoute en permanence');
      }
    } catch (error) {
      console.log('Redémarrage Francis:', error);
      setTimeout(() => restartListening(), 1000);
    }
  };

  // Fonction pour nettoyer la transcription
  const clearTranscript = () => {
    setTranscript('');
    setInterimTranscript('');
    setExtractedData({});
    setStatus('🎤 Transcription effacée - Francis continue d\'écouter');
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
  };

  // Afficher le sélecteur de fenêtres
  const openWindowSelector = async () => {
    if (!Object.values(extractedData).some(v => v)) {
      setStatus('⚠️ Aucune donnée à injecter');
      return;
    }

    const windows = await getOpenWindows();
    if (windows.length === 0) {
      setStatus('❌ Aucune fenêtre détectée');
      return;
    }

    setShowWindowSelector(true);
  };

  // Injecter dans la fenêtre sélectionnée
  const injectToSelectedWindow = async (windowInfo) => {
    if (window.electronAPI && window.electronAPI.injectToWindow) {
      try {
        setStatus('📋 Injection en cours...');
        const result = await window.electronAPI.injectToWindow(windowInfo, extractedData);
        
        if (result.success) {
          setStatus(`✅ Données injectées dans ${windowInfo.app}`);
          setShowWindowSelector(false);
          
          // Synchroniser avec Francis
          await syncToFrancis();
        } else {
          setStatus(`❌ Échec injection: ${result.error || 'Erreur inconnue'}`);
        }
      } catch (error) {
        setStatus('❌ Erreur injection');
        console.error('Erreur injection:', error);
      }
    }
  };

  // Rétrocompatibilité: remplir la page active
  const fillCurrentPage = async () => {
    if (Object.values(extractedData).some(v => v)) {
      if (window.electronAPI) {
        const success = await window.electronAPI.injectFormData(extractedData);
        if (success) {
          setStatus('✅ Données injectées dans le CRM');
          await syncToFrancis();
        } else {
          setStatus('❌ Échec de l\'injection');
        }
      }
    } else {
      setStatus('⚠️ Aucune donnée à injecter');
    }
  };

  const analyzeAndExtract = (text) => {
    const data = {
      nom: extractName(text),
      age: extractAge(text),
      revenus: extractRevenue(text),
      situation: extractMaritalStatus(text)
    };
    
    setExtractedData(data);
    
    // Envoyer les données au processus principal pour injection
    if (window.electronAPI && Object.values(data).some(v => v)) {
      window.electronAPI.injectFormData(data);
    }
  };

  const extractName = (text) => {
    const patterns = [
      /je m'appelle ([A-ZÀ-Ÿ][a-zà-ÿ]+ [A-ZÀ-Ÿ][a-zà-ÿ]+)/i,
      /nom.*?([A-ZÀ-Ÿ][a-zà-ÿ]+ [A-ZÀ-Ÿ][a-zà-ÿ]+)/i,
      /monsieur ([A-ZÀ-Ÿ][a-zà-ÿ]+ [A-ZÀ-Ÿ][a-zà-ÿ]+)/i,
      /madame ([A-ZÀ-Ÿ][a-zà-ÿ]+ [A-ZÀ-Ÿ][a-zà-ÿ]+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const extractAge = (text) => {
    const match = text.match(/(\d+)\s*ans?/i);
    return match ? parseInt(match[1]) : null;
  };

  const extractRevenue = (text) => {
    const patterns = [
      /(\d+)\s*k€?/i,
      /(\d+)\s*000\s*euros?/i,
      /revenus?.*?(\d+)/i,
      /salaire.*?(\d+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        let amount = parseInt(match[1]);
        if (text.includes('k')) amount *= 1000;
        return amount;
      }
    }
    return null;
  };

  const extractMaritalStatus = (text) => {
    if (/marié/i.test(text)) return 'Marié(e)';
    if (/célibataire/i.test(text)) return 'Célibataire';
    if (/divorcé/i.test(text)) return 'Divorcé(e)';
    if (/veuf|veuve/i.test(text)) return 'Veuf/Veuve';
    return null;
  };

  if (isMinimized) {
    return (
      <div className="francis-minimized" onClick={toggleMinimized}>
        <div className="francis-mini-icon">
          <div className="pulse-ring"></div>
          <div className="francis-avatar">
            <img src={francisLogo} alt="Francis" className="avatar-logo" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="francis-app">
      <div className="glass-container ultra-epure">
        {/* HEADER CENTRÉ */}
        <div className="francis-header centered">
          <img src={francisLogo} alt="Francis" className="francis-logo-large" />
          <h1 className="francis-title-epure">Francis</h1>
          <div className="francis-subtitle-epure">Assistant CGP universel</div>
        </div>

        {/* BADGE ÉCOUTE CENTRÉ */}
        <div className="francis-listening-badge">
          <span className="pulse-dot-epure"></span>
          <span className="badge-text">ÉCOUTE ACTIVE</span>
        </div>

        {/* TRANSCRIPTION LIVE CENTRÉE */}
        <div className="transcription-epure">
          {transcript && (
            <div className="final-transcript-epure">{transcript}</div>
          )}
          {interimTranscript && (
            <div className="interim-transcript-epure">{interimTranscript}<span className="cursor-blink-epure">|</span></div>
          )}
          {!transcript && !interimTranscript && (
            <div className="transcript-placeholder-epure">Parlez, Francis écoute…</div>
          )}
        </div>

        {/* DONNÉES EXTRAITES - épuré */}
        {Object.values(extractedData).some(v => v) && (
          <div className="extraction-epure">
            {extractedData.nom && <div className="data-badge"><span>👤</span> {extractedData.nom}</div>}
            {extractedData.age && <div className="data-badge"><span>🎂</span> {extractedData.age} ans</div>}
            {extractedData.revenus && <div className="data-badge"><span>💰</span> {extractedData.revenus.toLocaleString()} €</div>}
            {extractedData.situation && <div className="data-badge"><span>💍</span> {extractedData.situation}</div>}
          </div>
        )}

        {/* BOUTON CRM ULTRA CENTRÉ */}
        <div className="crm-actions-epure">
          <button 
            className={`crm-fill-btn-epure ${Object.values(extractedData).some(v => v) ? 'active' : 'disabled'}`}
            onClick={fillCurrentPage}
            disabled={!Object.values(extractedData).some(v => v)}
          >
            <span className="btn-icon">📋</span>
            <span className="btn-title">Remplir la page</span>
          </button>
        </div>

        {/* BOUTON EFFACER DISCRET */}
        <div className="francis-controls-epure">
          <button 
            onClick={clearTranscript}
            className="clear-btn-epure"
            title="Effacer la transcription"
          >
            🗑️
          </button>
        </div>

        {/* AIDE ULTRA DISCRÈTE EN BAS */}
        <div className="help-epure">
          <kbd>F8</kbd> pour masquer ou afficher Francis
        </div>
      </div>
    </div>
    </>
  );
            <div className="status-pulse"></div>
            <div className="status-text">{status}</div>
          </div>
        </div>

        {/* Contrôles simplifiés */}
        <div className="francis-controls">
          <button 
            onClick={clearTranscript}
            className="control-btn clear-btn"
            title="Effacer la transcription"
          >
            🗑️ Effacer
          </button>
        </div>

        {/* Retranscription LIVE - Zone principale */}
        <div className="transcription-live">
          <div className="live-header">
            <img src={francisLogo} alt="Francis" className="live-logo" />
            <div className="live-info">
              <h3>🔴 TRANSCRIPTION EN DIRECT</h3>
              <div className="live-status">{status}</div>
            </div>
          </div>
          
          <div className="live-transcript-area">
            {transcript && (
              <div className="final-transcript">
                {transcript}
              </div>
            )}
            {interimTranscript && (
              <div className="interim-transcript">
                {interimTranscript}
                <span className="cursor-blink">|</span>
              </div>
            )}
            {!transcript && !interimTranscript && (
              <div className="transcript-placeholder">
                Appuyez sur F8 et commencez à parler...
              </div>
            )}
          </div>
        </div>

        {/* Données extraites avec grille moderne */}
        {Object.values(extractedData).some(v => v) && (
          <div className="extraction-section animate-in">
            <div className="section-header success">
              <span className="section-icon">✨</span>
              <h3>Données détectées</h3>
            </div>
            <div className="data-cards">
              {extractedData.nom && (
                <div className="data-card">
                  <div className="card-icon">👤</div>
                  <div className="card-content">
                    <span className="card-label">Nom</span>
                    <span className="card-value">{extractedData.nom}</span>
                  </div>
                </div>
              )}
              {extractedData.age && (
                <div className="data-card">
                  <div className="card-icon">🎂</div>
                  <div className="card-content">
                    <span className="card-label">Âge</span>
                    <span className="card-value">{extractedData.age} ans</span>
                  </div>
                </div>
              )}
              {extractedData.revenus && (
                <div className="data-card">
                  <div className="card-icon">💰</div>
                  <div className="card-content">
                    <span className="card-label">Revenus</span>
                    <span className="card-value">{extractedData.revenus.toLocaleString()} €</span>
                  </div>
                </div>
              )}
              {extractedData.situation && (
                <div className="data-card">
                  <div className="card-icon">💍</div>
                  <div className="card-content">
                    <span className="card-label">Situation</span>
                    <span className="card-value">{extractedData.situation}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions CRM - Bouton principal */}
        <div className="crm-actions">
          <button 
            className={`crm-fill-btn ${Object.values(extractedData).some(v => v) ? 'active' : 'disabled'}`}
            onClick={fillCurrentPage}
            disabled={!Object.values(extractedData).some(v => v)}
          >
            <div className="btn-icon">📋</div>
            <div className="btn-content">
              <span className="btn-title">Remplir la page</span>
              <span className="btn-subtitle">Injecter dans le CRM</span>
            </div>
            <div className="btn-arrow">→</div>
          </button>
        </div>

        {/* Instructions avec design moderne */}
        <div className="help-section">
          <div className="help-content">
            <div className="help-item">
              <kbd className="hotkey">F8</kbd>
              <span>Activer/Désactiver</span>
            </div>
            <div className="help-item">
              <kbd className="hotkey">⌘⇧F</kbd>
              <span>Minimiser</span>
            </div>
          </div>
        </div>
      </div>
    </div>
      
    <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        /* Variables CSS pour cohérence */
        :root {
          --francis-primary: #c5a572;
          --francis-primary-light: #e8cfa0;
          --francis-primary-dark: #a08751;
          --francis-secondary: #162238;
          --francis-secondary-light: #1e2a3a;
          --francis-accent: #0A192F;
          --francis-success: #27ae60;
          --francis-error: #e74c3c;
          --francis-warning: #f39c12;
          --francis-glass: rgba(255, 255, 255, 0.1);
          --francis-glass-border: rgba(255, 255, 255, 0.2);
          --francis-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          --francis-shadow-light: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        /* Reset et base */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        html, body, #root {
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: transparent;
        }
        
        /* Francis App Container */
        .francis-app {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
        }
        
        .glass-container {
          width: 380px;
          max-height: 90vh;
          background: linear-gradient(135deg, var(--francis-glass), rgba(22, 34, 56, 0.95));
          backdrop-filter: blur(20px);
          border-radius: 20px;
          border: 1px solid var(--francis-glass-border);
          box-shadow: var(--francis-shadow);
          overflow: hidden;
          overflow-y: auto;
          animation: slideIn 0.3s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Header */
        .francis-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--francis-glass-border);
          background: linear-gradient(135deg, var(--francis-primary), var(--francis-primary-light));
        }
        
        .francis-brand {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .brand-logo {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .francis-official-logo {
          width: 48px;
          height: 45px;
          filter: drop-shadow(0 4px 8px rgba(194, 162, 115, 0.3));
          transition: all 0.3s ease;
        }
        
        .francis-official-logo:hover {
          transform: scale(1.05);
          filter: drop-shadow(0 6px 12px rgba(194, 162, 115, 0.5));
        }
        
        .brand-icon-group {
          display: flex;
          gap: 6px;
        }
        
        .brand-icon {
          position: relative;
          width: 32px;
          height: 32px;
          background: var(--francis-secondary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          animation: iconGlow 2s ease-in-out infinite alternate;
        }
        
        @keyframes iconGlow {
          from { box-shadow: 0 0 5px rgba(197, 165, 114, 0.3); }
          to { box-shadow: 0 0 15px rgba(197, 165, 114, 0.6); }
        }
        
        .brand-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--francis-secondary);
          margin: 0;
        }
        
        .brand-subtitle {
          font-size: 12px;
          color: var(--francis-secondary);
          opacity: 0.8;
          margin: 0;
          font-weight: 500;
        }
        
        .minimize-btn {
          width: 28px;
          height: 28px;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 6px;
          color: var(--francis-secondary);
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        
        .minimize-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: scale(1.1);
        }
        
        /* Status Section */
        .status-section {
          padding: 16px 24px;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: var(--francis-glass);
          border-radius: 12px;
          border: 1px solid var(--francis-glass-border);
          position: relative;
        }
        
        .status-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--francis-primary);
        }
        
        .status-indicator.active .status-pulse {
          background: var(--francis-success);
          animation: pulse 1.5s ease-in-out infinite;
        }
        
        .status-text {
          font-size: 14px;
          color: white;
          font-weight: 500;
        }
        
        /* Main Controls */
        .main-controls {
          padding: 0 24px 20px;
        }
        
        .voice-control {
          position: relative;
          width: 100%;
          height: 60px;
          border: none;
          border-radius: 16px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .button-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--francis-primary), var(--francis-primary-light));
          transition: all 0.3s ease;
        }
        
        .voice-control.recording .button-bg {
          background: linear-gradient(135deg, var(--francis-error), #c0392b);
        }
        
        .button-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 100%;
          color: white;
          font-weight: 600;
          font-size: 16px;
        }
        
        .button-icon {
          font-size: 20px;
        }
        
        .voice-control:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(197, 165, 114, 0.4);
        }
        
        /* Sections */
        .transcript-section,
        .extraction-section {
          margin: 0 24px 16px;
          background: var(--francis-glass);
          border-radius: 12px;
          border: 1px solid var(--francis-glass-border);
          overflow: hidden;
        }
        
        .animate-in {
          animation: slideInUp 0.3s ease-out;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
        }
        
        .section-header h3 {
          font-size: 14px;
          color: white;
          margin: 0;
          font-weight: 600;
        }
        
        .section-icon {
          font-size: 16px;
        }
        
        .transcript-content {
          padding: 16px;
        }
        
        .transcript-content p {
          color: white;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }
        
        /* Data Cards */
        .data-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 16px;
        }
        
        .data-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
        }
        
        .data-card:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-1px);
        }
        
        .card-icon {
          font-size: 18px;
        }
        
        .card-content {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .card-label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          font-weight: 500;
        }
        
        .card-value {
          font-size: 12px;
          color: white;
          font-weight: 600;
        }
        
        /* Actions CRM - Bouton principal */
        .crm-actions {
          margin: 24px 0;
          display: flex;
          justify-content: center;
        }
        
        .crm-fill-btn {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 28px;
          background: linear-gradient(135deg, var(--francis-primary), var(--francis-primary-light));
          border: none;
          border-radius: 16px;
          color: var(--francis-secondary);
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 8px 25px rgba(194, 162, 115, 0.4);
          min-width: 280px;
        }
        
        .crm-fill-btn:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 35px rgba(194, 162, 115, 0.6);
          background: linear-gradient(135deg, var(--francis-primary-light), var(--francis-primary));
        }
        
        .crm-fill-btn.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(194, 162, 115, 0.3);
        }
        
        .crm-fill-btn .btn-icon {
          font-size: 24px;
        }
        
        .crm-fill-btn .btn-content {
          display: flex;
          flex-direction: column;
          text-align: left;
        }
        
        .crm-fill-btn .btn-title {
          font-size: 16px;
          font-weight: 700;
        }
        
        .crm-fill-btn .btn-subtitle {
          font-size: 12px;
          opacity: 0.8;
          font-weight: 500;
        }
        
        .crm-fill-btn .btn-arrow {
          font-size: 20px;
          font-weight: bold;
          transition: transform 0.3s ease;
        }
        
        .crm-fill-btn:hover:not(.disabled) .btn-arrow {
          transform: translateX(4px);
        }

        /* Help Section */
        .help-section {
          padding: 16px 24px 24px;
          border-top: 1px solid var(--francis-glass-border);
        }
        
        .help-content {
          display: flex;
          justify-content: space-around;
          gap: 16px;
        }
        
        .help-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        
        .hotkey {
          background: var(--francis-glass);
          color: var(--francis-primary);
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid var(--francis-glass-border);
          font-family: 'Inter', monospace;
        }
        
        .help-item span {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
        }
        
        /* Minimized State */
        .francis-minimized {
          position: fixed;
          top: 20px;
          right: 20px;
          width: 70px;
          height: 70px;
          cursor: pointer;
          z-index: 999999;
        }
        
        .francis-mini-icon {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid var(--francis-primary);
          border-radius: 50%;
          animation: pulsering 2s cubic-bezier(0.25, 0, 0, 1) infinite;
        }
        
        @keyframes pulsering {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.2);
            opacity: 0;
          }
        }
        
        .francis-avatar {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--francis-secondary), var(--francis-accent));
          border: 2px solid var(--francis-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 2px;
          box-shadow: var(--francis-shadow);
          transition: all 0.3s ease;
        }
        
        .francis-minimized:hover .francis-avatar {
          transform: scale(1.1);
          box-shadow: 0 8px 25px rgba(197, 165, 114, 0.4);
        }
        
        .avatar-logo {
          width: 24px;
          height: 22px;
          filter: drop-shadow(0 2px 4px rgba(194, 162, 115, 0.5));
        }
        
        .avatar-icon,
        .avatar-currency {
          font-size: 16px;
          color: var(--francis-primary);
          font-weight: bold;
        }
        
        /* Scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--francis-primary);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: var(--francis-primary-light);
        }
      `}</style>
    </>
  );
};

export default App;
