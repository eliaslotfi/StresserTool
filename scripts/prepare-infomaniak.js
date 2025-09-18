#!/usr/bin/env node

<<<<<<< HEAD
// Ce script n'est plus utilisé. Déploiement Infomaniak supprimé.
console.log('Ce script est obsolète. Utilisez Vercel pour le déploiement.');
=======
const fs = require('fs');
const path = require('path');

console.log('🚀 Préparation du déploiement pour Infomaniak...\n');

// Vérifier que l'URL Railway est configurée
const envProd = path.join(process.cwd(), '.env.production');
if (fs.existsSync(envProd)) {
  const envContent = fs.readFileSync(envProd, 'utf8');
  if (envContent.includes('YOUR-RAILWAY-APP-URL')) {
    console.log('❌ ERREUR: Vous devez configurer votre URL Railway dans .env.production');
    console.log('   Remplacez YOUR-RAILWAY-APP-URL par votre vraie URL Railway\n');
    process.exit(1);
  }
  console.log('✅ Configuration .env.production trouvée');
} else {
  console.log('❌ ERREUR: Fichier .env.production manquant');
  process.exit(1);
}

// Vérifier que le dossier out/ existe après build
const outDir = path.join(process.cwd(), 'out');
if (fs.existsSync(outDir)) {
  console.log('✅ Dossier out/ trouvé - prêt pour upload');
  
  // Lister les fichiers principaux
  const files = fs.readdirSync(outDir);
  console.log('\n📁 Fichiers à uploader sur Infomaniak:');
  files.forEach(file => {
    const stats = fs.statSync(path.join(outDir, file));
    const type = stats.isDirectory() ? '📁' : '📄';
    console.log(`   ${type} ${file}`);
  });
  
  console.log('\n🎯 Prochaines étapes:');
  console.log('1. Connectez-vous à votre panel Infomaniak');
  console.log('2. Allez dans la gestion de fichiers de kozaki.fr');
  console.log('3. Uploadez tout le contenu du dossier out/');
  console.log('4. Configurez les variables d\'environnement si nécessaire');
  console.log('5. Testez https://kozaki.fr');
  
} else {
  console.log('❌ Dossier out/ non trouvé - exécutez d\'abord npm run build:infomaniak');
  process.exit(1);
}

console.log('\n✨ Préparation terminée !');
>>>>>>> 7eb27595690a67cfae29787d0f5aa9f617a65dbf
