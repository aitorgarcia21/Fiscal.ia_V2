// Script pour générer les icônes PWA
// Nécessite sharp: npm install sharp

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Background circle -->
  <circle cx="256" cy="256" r="256" fill="#1a2942"/>
  
  <!-- Message bubble -->
  <path d="M128 160c0-17.6 14.4-32 32-32h192c17.6 0 32 14.4 32 32v128c0 17.6-14.4 32-32 32h-48l-48 48-48-48h-48c-17.6 0-32-14.4-32-32V160z" fill="#c5a572"/>
  
  <!-- Euro symbol -->
  <path d="M256 192c-17.6 0-32 14.4-32 32h-16v16h16c0 9.6 6.4 16 16 16h32v16h-32c-9.6 0-16 6.4-16 16h16c0 17.6 14.4 32 32 32s32-14.4 32-32h16v-16h-16c0-9.6-6.4-16-16-16h-32v-16h32c9.6 0 16-6.4 16-16h-16c0-17.6-14.4-32-32-32z" fill="#1a2942"/>
  
  <!-- Inner euro details -->
  <rect x="224" y="240" width="64" height="4" fill="#1a2942"/>
  <rect x="224" y="268" width="64" height="4" fill="#1a2942"/>
</svg>`;

async function generateIcons() {
  console.log('Génération des icônes PWA...');
  
  for (const size of sizes) {
    try {
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(path.join(__dirname, `icon-${size}x${size}.png`));
      
      console.log(`✓ Icône ${size}x${size} générée`);
    } catch (error) {
      console.error(`✗ Erreur pour l'icône ${size}x${size}:`, error);
    }
  }
  
  // Générer le favicon ICO
  try {
    await sharp(Buffer.from(svgContent))
      .resize(48, 48)
      .png()
      .toFile(path.join(__dirname, 'favicon-48.png'));
    
    console.log('✓ Favicon PNG 48x48 généré');
    console.log('Note: Convertissez favicon-48.png en favicon.ico avec un outil en ligne');
  } catch (error) {
    console.error('✗ Erreur pour le favicon:', error);
  }
  
  console.log('Génération terminée !');
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  generateIcons();
}

export { generateIcons };
