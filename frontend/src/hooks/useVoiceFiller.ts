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
          
          🎯 CHAMPS AUTORISÉS ULTRA-COMPLETS (TOUS LES 80+ CHAMPS) :
          
          💼 IDENTITÉ :
          - nom_client: noms de famille français
          - prenom_client: prénoms français 
          - civilite_client: "Monsieur", "Madame", "Mademoiselle"
          - date_naissance_client: dates format DD/MM/YYYY
          - lieu_naissance_client: villes de naissance
          - nationalite_client: nationalités
          - numero_fiscal_client: numéros fiscaux (13 chiffres)
          
          📍 COORDONNÉES :
          - adresse_postale_client: adresses complètes
          - code_postal_client: codes postaux (5 chiffres)
          - ville_client: noms de villes
          - pays_residence_fiscale_client: pays de résidence
          - email_client: adresses email
          - telephone_principal_client: numéros de téléphone
          - telephone_secondaire_client: téléphones secondaires
          
          👨‍👩‍👧‍👦 FAMILLE :
          - situation_maritale_client: "Marié(e)", "Célibataire", "Divorcé(e)", "Pacsé(e)", "Veuf/Veuve"
          - date_mariage_pacs_client: dates mariage/PACS
          - regime_matrimonial_client: régimes matrimoniaux
          - nombre_enfants_a_charge_client: nombre d'enfants
          - details_enfants_client: âges/détails enfants
          - personnes_dependantes_client: personnes à charge
          
          💼 PROFESSION CLIENT 1 :
          - profession_client1: métiers/professions
          - statut_professionnel_client1: "Salarié", "Indépendant", "Fonctionnaire", "Retraité"
          - nom_employeur_entreprise_client1: noms employeurs
          - type_contrat_client1: "CDI", "CDD", "Freelance", "Stage"
          - revenu_net_annuel_client1: revenus annuels
          - autres_revenus_client1: revenus complémentaires
          
          💼 PROFESSION CLIENT 2 (CONJOINT) :
          - profession_client2: profession conjoint
          - statut_professionnel_client2: statut conjoint
          - nom_employeur_entreprise_client2: employeur conjoint
          - type_contrat_client2: contrat conjoint
          - revenu_net_annuel_client2: revenus conjoint
          - autres_revenus_client2: autres revenus conjoint
          
          💸 REVENUS FOYER :
          - revenus_fonciers_annuels_bruts_foyer: revenus locatifs
          - charges_foncieres_deductibles_foyer: charges déductibles
          - revenus_capitaux_mobiliers_foyer: dividendes/intérêts
          - plus_values_mobilieres_foyer: plus-values actions
          - plus_values_immobilieres_foyer: plus-values immobilier
          - benefices_industriels_commerciaux_foyer: BIC
          - benefices_non_commerciaux_foyer: BNC
          - pensions_retraites_percues_foyer: pensions retraite
          - pensions_alimentaires_percues_foyer: pensions alimentaires
          - autres_revenus_foyer_details: autres revenus
          
          🏠 PATRIMOINE IMMOBILIER :
          - residence_principale_details: résidence principale
          - residences_secondaires_details: résidences secondaires
          - investissements_locatifs_details: investissements locatifs
          - autres_biens_immobiliers_details: autres biens immobiliers
          
          💰 PATRIMOINE FINANCIER :
          - comptes_courants_solde_total_estime: comptes courants
          - livrets_epargne_details: livrets d'épargne
          - assurance_vie_details: assurances vie
          - pea_details: PEA
          - compte_titres_valeur_estimee: comptes titres
          - epargne_retraite_details: épargne retraite
          - autres_placements_financiers_details: autres placements
          - valeur_entreprise_parts_sociales: parts d'entreprises
          - comptes_courants_associes_solde: comptes courants associés
          - vehicules_valeur_estimee: véhicules
          - objets_art_valeur_estimee: objets d'art
          
          💳 DETTES :
          - credits_consommation_encours_total: crédits consommation
          - autres_dettes_details: autres dettes
          
          🎯 OBJECTIFS :
          - objectifs_fiscaux_client: objectifs fiscaux
          - objectifs_patrimoniaux_client: objectifs patrimoniaux
          - horizon_placement_client: horizon placement
          - profil_risque_investisseur_client: profil de risque
          - notes_objectifs_projets_client: notes objectifs
          
          📊 FISCAL :
          - dernier_avis_imposition_details: dernier avis d'imposition
          - tranche_marginale_imposition_estimee: TMI
          - credits_reductions_impot_recurrents: crédits d'impôt
          - ifi_concerne_client: concerné par l'IFI
          - notes_fiscales_client: notes fiscales
          
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
          
          👶 ENFANTS :
          "vous avez deux gosses" → {"nombre_enfants_a_charge_client": "2"}
          "j'ai trois enfants" → {"nombre_enfants_a_charge_client": "3"}
          "une fille" → {"nombre_enfants_a_charge_client": "1"}
          "pas d'enfants" → {"nombre_enfants_a_charge_client": "0"}
          "deux gamins" → {"nombre_enfants_a_charge_client": "2"}
          "trois petits" → {"nombre_enfants_a_charge_client": "3"}
          
          🎂 DATE NAISSANCE :
          "né le 1er mars 1980" → {"date_naissance_client": "01/03/1980"}
          "1er janvier 1975" → {"date_naissance_client": "01/01/1975"}
          "15 juin 1985" → {"date_naissance_client": "15/06/1985"}
          "je suis né en 1980" → {"date_naissance_client": "01/01/1980"}
          
          🏠 PATRIMOINE IMMOBILIER :
          "maison 300000" → {"residence_principale_details": "Maison principale 300000€"}
          "appartement 250000" → {"residence_principale_details": "Appartement principal 250000€"}
          "résidence vaut 400000" → {"residence_principale_details": "Résidence principale 400000€"}
          "chez moi 500000 euros" → {"residence_principale_details": "Résidence principale 500000€"}
          
          💍 RÉGIME MATRIMONIAL :
          "régime de la communauté" → {"regime_matrimonial_client": "Communauté réduite aux acquêts"}
          "communauté" → {"regime_matrimonial_client": "Communauté réduite aux acquêts"}
          "séparation de biens" → {"regime_matrimonial_client": "Séparation de biens"}
          "communauté universelle" → {"regime_matrimonial_client": "Communauté universelle"}
          
          💰 REVENUS :
          "je gagne 50000 euros" → {"revenu_net_annuel_client1": "50000"}
          "salaire 3000 par mois" → {"revenu_net_annuel_client1": "36000"}
          "revenus annuels 80000" → {"revenu_net_annuel_client1": "80000"}
          
          📍 COORDONNÉES COMPLÈTES :
          "j'habite 15 rue de la Paix" → {"adresse_postale_client": "15 rue de la Paix"}
          "75001 Paris" → {"code_postal_client": "75001", "ville_client": "Paris"}
          "email jean@gmail.com" → {"email_client": "jean@gmail.com"}
          "téléphone 06 12 34 56 78" → {"telephone_principal_client": "06 12 34 56 78"}
          "nationalité française" → {"nationalite_client": "Française"}
          
          💼 PROFESSION AVANCÉE :
          "avocat chez Dupont" → {"profession_client1": "Avocat", "nom_employeur_entreprise_client1": "Dupont"}
          "CDI Google" → {"type_contrat_client1": "CDI", "nom_employeur_entreprise_client1": "Google"}
          "fonctionnaire" → {"statut_professionnel_client1": "Fonctionnaire"}
          "ma femme médecin 80000" → {"profession_client2": "Médecin", "revenu_net_annuel_client2": "80000"}
          
          🏠 PATRIMOINE ÉTENDU :
          "résidence secondaire Nice" → {"residences_secondaires_details": "Résidence secondaire Nice"}
          "appartement locatif 200000" → {"investissements_locatifs_details": "Appartement locatif 200000€"}
          "revenus locatifs 1000 mois" → {"revenus_fonciers_annuels_bruts_foyer": "12000"}
          
          💰 ÉPARGNE COMPLÈTE :
          "livret A 50000" → {"livrets_epargne_details": "Livret A 50000€"}
          "assurance vie 100000" → {"assurance_vie_details": "Assurance vie 100000€"}
          "PEA 30000" → {"pea_details": "PEA 30000€"}
          "actions Total" → {"compte_titres_valeur_estimee": "Actions Total"}
          
          🎯 OBJECTIFS :
          "réduire impôts" → {"objectifs_fiscaux_client": "Réduction fiscale"}
          "achat résidence" → {"objectifs_patrimoniaux_client": "Achat résidence"}
          "placement long terme" → {"horizon_placement_client": "Long terme"}
          "profil prudent" → {"profil_risque_investisseur_client": "Prudent"}
          
          FORMAT RÉPONSE: JSON pur seulement - PAS DE TEXTE EN PLUS
          SI AUCUNE INFO FISCALE VALIDE: {}
          
          SOIS LE MEILLEUR LINGUISTE CONTEXTUEL AU MONDE ! 🔥`
        })
      });

      let extractedData: Partial<ClientProfile> = {};
      
      if (response.ok) {
        const result = await response.json();
        console.log('🤖 Francis IA réponse complète:', result);
        
        // La réponse est maintenant un objet avec answer, sources, confidence
        const francisAnswer = result.answer || '';
        console.log('🤖 Francis IA answer:', francisAnswer);
        
        try {
          // Chercher JSON dans la réponse Francis
          const jsonMatch = francisAnswer.match(/\{[^{}]*\}/);
          if (jsonMatch) {
            extractedData = JSON.parse(jsonMatch[0]);
            console.log('🎯 Francis IA extraction réussie:', extractedData);
          } else {
            console.log('🤖 Francis IA: Aucun JSON trouvé dans:', francisAnswer);
          }
        } catch (e) {
          console.log('🤖 Francis IA: Erreur parsing JSON:', e);
          console.log('🤖 Contenu à parser:', francisAnswer);
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
