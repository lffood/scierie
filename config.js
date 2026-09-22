// =====================================================================
//  CONFIGURATION : le seul fichier à remplir (sur GitHub : crayon ✏️ puis « Commit changes »)
// =====================================================================
window.SCIERIE_CONFIG = {
  // Supabase > Project Settings > API
  SUPABASE_URL: 'https://VOTRE-PROJET.supabase.co',
  SUPABASE_ANON_KEY: 'VOTRE-CLE-ANON-PUBLIQUE',

  // Clé publique VAPID (générée avec outils/cles-vapid.html)
  VAPID_PUBLIC_KEY: '',

  // Nom affiché dans l'application
  NOM_SCIERIE: 'Scierie',

  // Teinte du petit rond « bois » à côté de chaque essence (optionnel)
  COULEURS_ESSENCES: {
    'Sapin': '#ecdcb4',
    'Douglas': '#d99a68',
    'Épicéa': '#f0e3c3',
    'Mélèze': '#cf8a55',
    'Pin': '#e6c68e',
    'Chêne': '#bf915a',
    'Hêtre': '#e2b98f',
  },
};
