# 🚀 Installation Francis Teams Assistant - SANS MODE DÉVELOPPEUR

## 🎯 Installation en 30 secondes

### Option 1 : Chrome Web Store (RECOMMANDÉ)
1. **Cliquer sur le lien** : [Francis Teams Assistant](https://chrome.google.com/webstore/detail/francis-teams-assistant/)
2. **Cliquer "Ajouter à Chrome"**
3. **Confirmer l'installation**
4. **C'est tout !** 🎉

### Option 2 : Installation directe (SANS MODE DÉVELOPPEUR)
1. **Télécharger** : Cliquer sur le bouton "📦 Installer Francis" ci-dessous
2. **Glisser-déposer** : Ouvrir `chrome://extensions/` et glisser le fichier ZIP
3. **Confirmer** : Cliquer "Ajouter l'extension"
4. **C'est tout !** 🎉

### Option 3 : Installation manuelle (pour experts)
1. Télécharger le fichier ZIP
2. Décompresser le dossier
3. Ouvrir `chrome://extensions/`
4. Activer le mode développeur
5. Cliquer "Charger l'extension non empaquetée"
6. Sélectionner le dossier décompressé

## 🎤 Utilisation

1. **Aller sur Microsoft Teams**
2. **Cliquer sur le bouton Francis** (apparaît automatiquement)
3. **Francis écoute et aide !**

## ✨ Fonctionnalités

- **🎯 Suggestions fiscales** en temps réel
- **📝 Transcription automatique** des conversations
- **🔒 100% confidentiel** et sécurisé
- **⚡ Détection automatique** de Teams

## 🛠️ Dépannage

**Francis n'apparaît pas ?**
- Vérifiez que vous êtes sur `teams.microsoft.com`
- Rafraîchissez la page Teams
- Vérifiez que l'extension est activée

**Francis n'écoute pas ?**
- Cliquez sur le bouton Francis pour l'activer
- Autorisez l'accès au microphone
- Vérifiez que votre micro fonctionne

## 📞 Support

- **Email** : support@francis.ai
- **Site web** : https://francis.ai
- **Documentation** : https://francis.ai/docs

---

**Francis Teams Assistant** - Votre assistant fiscal intelligent pour Microsoft Teams 🎯

## 🚀 Installation rapide

<button onclick="installFrancis()" style="
    background: linear-gradient(135deg, #c5a572, #e8cfa0);
    color: #162238;
    border: none;
    padding: 15px 30px;
    border-radius: 10px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    margin: 20px;
">
📦 Installer Francis
</button>

<script>
function installFrancis() {
    // Télécharger l'extension
    const link = document.createElement('a');
    link.href = 'francis-teams-extension.zip';
    link.download = 'francis-teams-extension.zip';
    link.click();
    
    // Instructions
    setTimeout(() => {
        alert('📦 Francis téléchargé !\n\nPour installer :\n1. Ouvrez chrome://extensions/\n2. Glissez le fichier ZIP dans la fenêtre\n3. Confirmez l\'installation\n\nC\'est tout ! 🎉');
    }, 1000);
}
</script> 