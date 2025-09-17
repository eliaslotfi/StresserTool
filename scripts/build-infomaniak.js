#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🚀 Build pour Infomaniak - Mode statique\n');

// Sauvegarder le fichier next.config.mjs original
const originalConfig = path.join(process.cwd(), 'next.config.mjs');
const backupConfig = path.join(process.cwd(), 'next.config.mjs.backup');
const infomaniakConfig = path.join(process.cwd(), 'next.config.infomaniak.mjs');

try {
  // Backup de la config originale
  if (fs.existsSync(originalConfig)) {
    fs.copyFileSync(originalConfig, backupConfig);
    console.log('✅ Sauvegarde de next.config.mjs');
  }

  // Utiliser la config Infomaniak
  if (fs.existsSync(infomaniakConfig)) {
    fs.copyFileSync(infomaniakConfig, originalConfig);
    console.log('✅ Configuration Infomaniak activée');
  }

  // Déplacer temporairement le dossier API
  const apiDir = path.join(process.cwd(), 'app', 'api');
  const apiBackupDir = path.join(process.cwd(), 'temp_api_backup');
  
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, apiBackupDir);
    console.log('✅ Routes API temporairement désactivées');
  }

  // Nettoyer le cache Next.js
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    fs.rmSync(nextDir, { recursive: true, force: true });
    console.log('✅ Cache Next.js nettoyé');
  }

  console.log('\n🔨 Building...');
  
  // Exécuter le build
  exec('npm run build', (error, stdout, stderr) => {
    // Restaurer les fichiers
    try {
      // Restaurer le dossier API
      if (fs.existsSync(apiBackupDir)) {
        fs.renameSync(apiBackupDir, apiDir);
        console.log('✅ Routes API restaurées');
      }

      // Restaurer la config originale
      if (fs.existsSync(backupConfig)) {
        fs.copyFileSync(backupConfig, originalConfig);
        fs.unlinkSync(backupConfig);
        console.log('✅ Configuration originale restaurée');
      }
    } catch (restoreError) {
      console.error('❌ Erreur lors de la restauration:', restoreError.message);
    }

    if (error) {
      console.error('❌ Erreur de build:', error.message);
      process.exit(1);
    }

    console.log('\n✅ Build terminé avec succès!');
    console.log(stdout);
    
    if (stderr) {
      console.log('⚠️  Warnings:', stderr);
    }

    // Vérifier que le dossier out/ existe
    const outDir = path.join(process.cwd(), 'out');
    if (fs.existsSync(outDir)) {
      console.log('\n📁 Dossier out/ créé - prêt pour Infomaniak');
      
      // Lister les fichiers
      const files = fs.readdirSync(outDir);
      console.log('\n📋 Fichiers générés:');
      files.forEach(file => {
        const stats = fs.statSync(path.join(outDir, file));
        const type = stats.isDirectory() ? '📁' : '📄';
        console.log(`   ${type} ${file}`);
      });

      console.log('\n🎯 Prochaines étapes:');
      console.log('1. Uploadez le contenu du dossier out/ sur Infomaniak');
      console.log('2. Assurez-vous que index.html est à la racine de kozaki.fr');
      console.log('3. Testez https://kozaki.fr');
    } else {
      console.error('❌ Dossier out/ non créé');
      process.exit(1);
    }
  });

} catch (error) {
  console.error('❌ Erreur:', error.message);
  process.exit(1);
}