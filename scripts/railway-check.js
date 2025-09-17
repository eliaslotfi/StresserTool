#!/usr/bin/env node

/**
 * Script de vérification pour le déploiement Railway
 * Vérifie que tous les prérequis sont en place
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Vérification de la configuration Railway...\n');

const checks = [
  {
    name: 'package.json existe',
    check: () => fs.existsSync('package.json'),
    fix: 'Assurez-vous que package.json existe à la racine du projet'
  },
  {
    name: 'Scripts npm configurés',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.scripts && pkg.scripts.build && pkg.scripts.start;
    },
    fix: 'Ajoutez les scripts "build" et "start" dans package.json'
  },
  {
    name: 'Configuration Railway (auto-détection)',
    check: () => {
      // Vérifier que les fichiers TOML n'existent pas (pour éviter les conflits)
      // ou que package.json est correctement configuré pour la détection auto
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.dependencies && pkg.dependencies.next && 
             pkg.scripts && pkg.scripts.build && pkg.scripts.start;
    },
    fix: 'Railway utilisera la détection automatique basée sur package.json'
  },
  {
    name: 'Next.js configuré',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      return pkg.dependencies && pkg.dependencies.next;
    },
    fix: 'Installez Next.js avec npm install next'
  },
  {
    name: 'Système d\'authentification',
    check: () => {
      return fs.existsSync('app/api/auth/login/route.ts') &&
             fs.existsSync('components/login-form.tsx') &&
             fs.existsSync('lib/auth.ts');
    },
    fix: 'Le système d\'authentification semble manquant'
  }
];

let allPassed = true;

checks.forEach(({ name, check, fix }) => {
  const passed = check();
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}`);
  
  if (!passed) {
    console.log(`   💡 ${fix}\n`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 Toutes les vérifications sont passées !');
  console.log('🚀 Votre projet est prêt pour Railway !');
  console.log('\nÉtapes suivantes :');
  console.log('1. Push votre code sur GitHub');
  console.log('2. Connectez votre repo à Railway');
  console.log('3. Configurez les variables d\'environnement');
  console.log('4. Le déploiement se fera automatiquement !');
} else {
  console.log('⚠️  Certaines vérifications ont échoué.');
  console.log('Corrigez les problèmes ci-dessus avant de déployer.');
  process.exit(1);
}

console.log('\n📚 Consultez RAILWAY_DEPLOY.md pour plus de détails.');