import { useState, useCallback } from 'react';
import { ClientProfile } from '../types/clientProfile';

export function useVoiceFiller(initialProfile: Partial<ClientProfile>) {
  const [profile, setProfile] = useState<Partial<ClientProfile>>(initialProfile);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  
  const MAX_CONTEXT_TURNS = 3; // Garde les 3 dernières phrases

  /**
   * 🚀 FRANCIS IA - SYSTÈME D'EXTRACTION SÉMANTIQUE ULTRA-AVANCÉ
   * Comprendrai TOUT avec l'IA contextuelle multi-tour !
   */

  /**
   * 🎯 FRANCIS COACH PROACTIF - SUGGESTIONS INTELLIGENTES ÉTAPES GUIDÉES
   */
  const computeProactiveSuggestions = useCallback((currentProfile: Partial<ClientProfile>): {
    nextQuestions: string[];
    completionRate: number;
    inconsistencies: string[];
    stage: string;
  } => {
    const suggestions: string[] = [];
    const inconsistencies: string[] = [];
    let filledFields = 0;
    const totalFields = 12; // Nombre total de champs principaux
    
    // 📋 ÉTAPES GUIDÉES INTELLIGENTES
    
    // 1️⃣ IDENTITÉ
    if (!currentProfile.nom_client) {
      suggestions.push("👤 Demandez : 'Pouvez-vous me dire votre nom de famille ?'");
    } else filledFields++;
    
    if (!currentProfile.prenom_client) {
      suggestions.push("👤 Demandez : 'Et votre prénom ?'");
    } else filledFields++;
    
    if (!currentProfile.date_naissance_client) {
      suggestions.push("🎂 Demandez : 'Quelle est votre date de naissance ?'");
    } else filledFields++;
    
    // 2️⃣ SITUATION FAMILIALE
    if (!currentProfile.situation_maritale_client) {
      suggestions.push("💒 Demandez : 'Êtes-vous marié(e), célibataire, divorcé(e) ?'");
    } else filledFields++;
    
    if (!currentProfile.nombre_enfants_a_charge_client) {
      suggestions.push("👶 Demandez : 'Avez-vous des enfants à charge ?'");
    } else filledFields++;
    
    // 3️⃣ ACTIVITÉ PROFESSIONNELLE
    if (!currentProfile.profession_client1) {
      suggestions.push("💼 Demandez : 'Quelle est votre profession ?'");
    } else filledFields++;
    
    if (!currentProfile.revenu_net_annuel_client1) {
      suggestions.push("💰 Demandez : 'Quels sont vos revenus nets annuels ?'");
    } else filledFields++;
    
    // 4️⃣ PATRIMOINE IMMOBILIER
    if (!currentProfile.residence_principale_details) {
      suggestions.push("🏠 Demandez : 'Quelle est la valeur de votre résidence principale ?'");
    } else filledFields++;
    
    if (!currentProfile.autres_biens_immobiliers_details) {
      suggestions.push("🏢 Demandez : 'Avez-vous d'autres biens immobiliers (locatif, terrain) ?'");
    } else filledFields++;
    
    // 5️⃣ SITUATION FINANCIÈRE
    if (!currentProfile.comptes_courants_solde_total_estime && !currentProfile.livrets_epargne_details) {
      suggestions.push("💳 Demandez : 'Quel montant avez-vous en épargne (livrets, comptes) ?'");
    } else filledFields++;
    
    if (!currentProfile.assurance_vie_details && !currentProfile.compte_titres_valeur_estimee) {
      suggestions.push("📈 Demandez : 'Avez-vous des investissements (actions, assurance-vie, SCPI) ?'");
    } else filledFields++;
    
    if (!currentProfile.credits_consommation_encours_total) {
      suggestions.push("🏦 Demandez : 'Avez-vous des crédits en cours (immobilier, conso) ?'");
    } else filledFields++;
    
    // 🚨 DÉTECTION D'INCOHÉRENCES INTELLIGENTES
    if (currentProfile.situation_maritale_client === 'Célibataire' && 
        currentProfile.nombre_enfants_a_charge_client && 
        currentProfile.nombre_enfants_a_charge_client > 0) {
      inconsistencies.push('⚠️ Vérifiez : Célibataire avec enfants (parent solo ?)');
    }
    
    // Vérification des revenus vs patrimoine
    if (currentProfile.revenu_net_annuel_client1 && 
        typeof currentProfile.revenu_net_annuel_client1 === 'number' &&
        currentProfile.revenu_net_annuel_client1 < 30000 && 
        (currentProfile.compte_titres_valeur_estimee && 
         typeof currentProfile.compte_titres_valeur_estimee === 'number' &&
         currentProfile.compte_titres_valeur_estimee > 50000)) {
      inconsistencies.push('⚠️ Vérifiez : Revenus modestes mais gros investissements');
    }
    
    // 📊 ÉTAPES INTELLIGENTES
    let stage = 'Début d\'entretien';
    const completionRate = (filledFields / totalFields) * 100;
    
    if (completionRate < 25) stage = '1️⃣ Identité et situation';
    else if (completionRate < 50) stage = '2️⃣ Activité professionnelle';
    else if (completionRate < 75) stage = '3️⃣ Patrimoine immobilier';
    else if (completionRate < 90) stage = '4️⃣ Situation financière';
    else stage = '✅ Profil complet - Analyse fiscale';
    
    return {
      nextQuestions: suggestions.slice(0, 3), // Limite à 3 suggestions max
      completionRate: Math.round(completionRate),
      inconsistencies,
      stage
    };
  }, []);

  /**
   * 🤖 FRANCIS IA SÉMANTIQUE - ANALYSE CONTEXTUELLE MULTI-TOUR
   * Utilise l'historique des conversations pour une compréhension parfaite
   */
  const analyzeWithFrancisAI = useCallback(async (text: string, history: string[]): Promise<Partial<ClientProfile>> => {
    try {
      const contextWithHistory = history.length > 0 
        ? history.join(' | ') + ' | ' + text
        : text;
      
      console.log('🧠 Francis IA analyse avec contexte:', {
        currentText: text,
        history: history,
        fullContext: contextWithHistory
      });
      
      const response = await fetch('/api/test-francis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: `🧠 FRANCIS - EXPERT CONTEXTUEL MULTI-TOUR ULTRA-POINTU
          
          MISSION: Analyser cette conversation avec CONTEXTE COMPLET pour extraction parfaite.
          
          CONTEXTE CONVERSATIONNEL: "${contextWithHistory}"
          PHRASE ACTUELLE: "${text}"
          
          🚀 INTELLIGENCE CONTEXTUELLE RÉVOLUTIONNAIRE:
          ✅ ANALYSE NARRATIVE: comprend le fil de l'entretien sur plusieurs phrases
          ✅ RECONSTITUTION: "Je suis..." + "euh..." + "Jean Dupont" = extraction complète
          ✅ MÉMOIRE CONVERSATIONNELLE: utilise l'historique pour disambiguïser
          ✅ CORRECTION CONTEXTUELLE: corrige avec l'aide du contexte précédent
          
          🧠 INTELLIGENCE MAXIMALE REQUISE:
          Tu es le MEILLEUR LINGUISTE CONTEXTUEL au monde ! Ton travail est de comprendre
          les conversations humaines même quand elles sont hésitantes, mal articulées,
          coupées, avec des "euh", des répétitions, des corrections, etc.
          
          🚫 REJETTE ABSOLUMENT:
          - Interjections: euh, ah, oh, hein, bon, alors, voilà, ben
          - Questions: c'est quoi, comment, pourquoi, qu'est-ce que
          - Temporel: jour, heure, maintenant, aujourd'hui
          - Non-sens: aberrant, bizarre, wtf, expressions émotionnelles
          - Hésitations pures sans contenu informatif
          
          🎯 CHAMPS AUTORISÉS ULTRA-COMPLETS:
          - nom_client: NOMS DE FAMILLE français (même déformés phonétiquement)
          - prenom_client: PRÉNOMS français (même mal articulés)
          - situation_maritale_client: "Marié(e)", "Célibataire", "Divorcé(e)", "Pacsé(e)", "Veuf/Veuve"
          - revenu_net_annuel_client1: chiffres + mots revenus/salaire/euros
          - nombre_enfants_client: chiffres + mots enfant/gosse/petit
          - date_naissance_client: date de naissance format DD/MM/YYYY
          - profession_client1: métiers/jobs (pas générique comme "travail")
          - residence_principale_details: chiffres + mots maison/appartement/résidence/immobilier
          - credits_consommation_encours_total: chiffres + mots crédit/prêt/emprunt/dette
          - comptes_courants_solde_total_estime: chiffres + mots épargne/livret/compte/économies
          - assurance_vie_details: chiffres + mots actions/assurance-vie/SCPI/bourse
          - autres_biens_immobiliers_details: chiffres + mots locatif/investissement/terrain/propriété
          
          📝 EXEMPLES OBLIGATOIRES - APPRENDS CES PATTERNS :
          
          💒 STATUT MATRIMONIAL :
          "vous êtes mariés" → {"situation_maritale_client": "Marié(e)"}
          "nous sommes mariés" → {"situation_maritale_client": "Marié(e)"}
          "je suis marié" → {"situation_maritale_client": "Marié(e)"}
          "mariée depuis" → {"situation_maritale_client": "Marié(e)"}
          "célibataire" → {"situation_maritale_client": "Célibataire"}
          "divorcé" → {"situation_maritale_client": "Divorcé(e)"}
          "pacsé" → {"situation_maritale_client": "Pacsé(e)"}
          
          💼 NOMS :
          Contexte: "Je suis... euh... comment dire" | Actuel: "Jean Dupont"
          → {"prenom_client": "Jean", "nom_client": "DUPONT"}
          
          FORMAT RÉPONSE: JSON pur seulement - PAS DE TEXTE EN PLUS
          SI AUCUNE INFO FISCALE VALIDE: {}
          
          SOIS LE MEILLEUR LINGUISTE CONTEXTUEL AU MONDE ! 🔥`
        })
      });

      let extractedData: Partial<ClientProfile> = {};
      
      if (response.ok) {
        const result = await response.text();
        console.log('🤖 Francis IA réponse brute:', result);
        
        try {
          const jsonMatch = result.match(/\{[^{}]*\}/);
          if (jsonMatch) {
            extractedData = JSON.parse(jsonMatch[0]);
            console.log('🎯 Francis IA extraction réussie:', extractedData);
          }
        } catch (e) {
          console.log('🤖 Francis IA: Pas de JSON valide dans la réponse');
        }
      } else {
        console.error('Erreur API Francis:', response.status);
      }
      
      return extractedData;
    } catch (error) {
      console.error('Erreur Francis IA:', error);
      return {};
    }
  }, []);

  /**
   * Traitement d'un snippet de transcript - VERSION CONTEXTUELLE MULTI-TOUR
   */
  const handleTranscript = useCallback(
    async (text: string) => {
      if (!text) return;
      
      // 🧠 GESTION MÉMOIRE CONVERSATIONNELLE
      const updatedHistory = [...conversationHistory];
      
      // Ajouter la nouvelle phrase et garder seulement les N dernières
      updatedHistory.push(text);
      if (updatedHistory.length > MAX_CONTEXT_TURNS) {
        updatedHistory.shift(); // Supprimer la plus ancienne
      }
      
      // Mettre à jour l'historique
      setConversationHistory(updatedHistory);
      
      console.log('🧠 Francis IA analyse CONTEXTUELLE:', {
        currentText: text,
        conversationHistory: updatedHistory,
        contextDepth: updatedHistory.length
      });
      
      let updated: Partial<ClientProfile> = { ...profile };
      let matched = false;
      let matchDetails: string[] = [];

      try {
        // 🧠 PHASE RÉVOLUTIONNAIRE: ANALYSE CONTEXTUELLE MULTI-TOUR
        const aiExtractedData = await analyzeWithFrancisAI(text, updatedHistory);
        
        // Appliquer les données extraites par l'IA
        Object.entries(aiExtractedData).forEach(([key, value]) => {
          if (value && typeof value === 'string' && value.trim() !== '') {
            const cleanValue = value.trim();
            // Validation finale de sécurité
            if (cleanValue.length >= 2 && cleanValue.length <= 50) {
              (updated as any)[key] = cleanValue;
              matched = true;
              matchDetails.push(`🤖 IA ${key}: ${cleanValue}`);
              console.log(`🤖 Francis IA a trouvé ${key}:`, cleanValue);
            }
          }
        });

        if (matched) {
          console.log('🎯 Francis IA CONTEXTUELLE met à jour le profil:', matchDetails);
          setProfile(updated);
          const proactiveData = computeProactiveSuggestions(updated);
          setSuggestions(proactiveData.nextQuestions);
          
          // Log coaching proactif
          console.log('🎯 Francis COACH PROACTIF:', {
            stage: proactiveData.stage,
            completion: proactiveData.completionRate + '%',
            suggestions: proactiveData.nextQuestions,
            inconsistencies: proactiveData.inconsistencies
          });
        } else {
          console.log('🧠 Francis IA CONTEXTUELLE: Aucune information fiscale pertinente détectée dans ce contexte');
        }
      } catch (e) {
        console.error('Erreur Francis IA CONTEXTUELLE:', e);
      }
    },
    [profile, computeProactiveSuggestions, analyzeWithFrancisAI, conversationHistory, setConversationHistory, MAX_CONTEXT_TURNS]
  );

  return { profile, suggestions, handleTranscript };
}
