/** French dictionary. */

import type { ThemeKey } from '../locales.js'

export const fr = {
  nav: 'Thème',
  'appearance.title': 'Apparence',
  'appearance.desc': 'Sombre / Clair / Système',
  'presets.title': 'Thèmes prédéfinis',
  'presets.desc': 'Appliquez des palettes populaires en un clic',
  'presets.disabled':
    'Le thème personnalisé est activé — désactivez-le pour choisir un prédéfini',
  'sidebar.title': 'Barre latérale transparente',
  'sidebar.desc': 'Effet de transparence du panneau latéral, macOS uniquement',
  'background.title': 'Image/vidéo d’arrière-plan',
  'background.add': 'Ajouter',
  'background.replace': 'Remplacer',
  'background.remove': 'Retirer',
  'background.opacity': 'Opacité',
  'background.blur': 'Flou',
  'background.badType': 'Seuls PNG / JPEG / WebP / AVIF / GIF / MP4 / WebM sont pris en charge',
  'background.tooLarge': 'L’image/la vidéo dépasse {0} Mo — choisissez-en une autre',
  'background.uploadFailed':
    'Thème enregistré, mais l’image/vidéo d’arrière-plan n’a pas pu être envoyée',
  'scheme.light': 'Clair',
  'scheme.dark': 'Sombre',
  'scheme.system': 'Système',

  'custom.title': 'Thème personnalisé',
  'custom.toggle.desc': 'Créez votre propre thème personnalisé',
  'custom.group.seeds': 'Principale/secondaire',
  'custom.group.shiki': 'Bloc de code',
  'custom.mode.label': 'Apparence en cours d’édition',
  'custom.neutral.title': 'Neutre',
  'custom.neutral.desc': 'Surfaces et texte. Une échelle par apparence',
  'custom.neutral.lightest': 'Extrémité la plus claire',
  'custom.neutral.darkest': 'Extrémité la plus sombre',
  'custom.neutral.roleBackground': 'Arrière-plan',
  'custom.neutral.roleForeground': 'Premier plan',
  'custom.accent.title': 'Accent',
  'custom.accent.desc': 'Boutons et mises en évidence (deepseek et blue fusionnés)',
  'custom.green.title': 'Succès',
  'custom.green.desc': 'États de succès',
  'custom.amber.title': 'Avertissement',
  'custom.amber.desc': 'États d’avertissement',
  'custom.red.title': 'Erreur',
  'custom.red.desc': 'États d’erreur',
  'custom.border.title': 'Bordure',
  'custom.border.desc':
    'Couleur et opacité des séparateurs et des contours ; la bordure la plus marquée est dérivée automatiquement',
  'custom.shiki.desc': 'Couleurs des neuf jetons de syntaxe',
  'custom.seed.light': 'Clair',
  'custom.seed.dark': 'Sombre',
  'custom.save': 'Enregistrer',
  'custom.add': 'Ajouter un thème personnalisé',
  'custom.edit': 'Modifier',
  'custom.export': 'Exporter',
  'custom.import': 'Importer un thème',
  'custom.name.placeholder': 'Nom du thème',
  'custom.defaultName': 'Thème personnalisé',
  'custom.inUse': 'Utilisé',
  'custom.delete': 'Supprimer',
  'custom.cancel': 'Annuler',
  'custom.close': 'Fermer',
  'custom.toast.saved': 'Enregistré',
  'custom.toast.failed': 'L’opération sur le fichier de thème a échoué',
  'custom.toast.unavailable':
    'L’API des fichiers de thème n’est pas prête — redémarrez le service DSH',
  'custom.toast.exported': '« {0} » exporté',
  'custom.toast.imported': '« {0} » importé',
  'custom.importFailed.notArchive': 'Échec de l’import : ce n’est pas une archive de thème',
  'custom.importFailed.noDocument':
    'Échec de l’import : l’archive ne contient pas theme.json',
  'custom.importFailed.badDocument':
    'Échec de l’import : theme.json n’est pas un thème valide',
  'custom.importFailed.tooNew':
    'Échec de l’import : le fichier de thème est plus récent que ce plugin',
  'custom.importFailed.media':
    'Échec de l’import : le thème contient un fichier multimédia non pris en charge',
  'custom.importFailed.tooLarge':
    'Échec de l’import : l’archive dépasse la limite de taille',
  'custom.importFailed.other': 'Échec de l’import : {0}',
  'custom.delete.title': 'Supprimer ce thème personnalisé ?',
  'custom.delete.desc': '« {0} » sera supprimé. Cette action est irréversible.',
  'custom.unsaved.title': 'Abandonner les modifications non enregistrées ?',
  'custom.unsaved.desc':
    'Les modifications de « {0} » n’ont pas été enregistrées et seront perdues à la fermeture des réglages.',
  'custom.unsaved.confirm': 'Abandonner et fermer',
  'custom.unsaved.leaveDesc':
    'Les modifications de « {0} » n’ont pas été enregistrées. Les abandonner ?',
  'custom.unsaved.leaveConfirm': 'Abandonner les modifications',
  'custom.unsaved.cancel': 'Continuer l’édition',

  'custom.css.title': 'Styles personnalisés',
  'custom.css.open': 'Ouvrir la feuille de styles',
  'custom.css.copyPath': 'Copier le chemin',
  'custom.css.copied': 'Chemin copié',
  'custom.css.copyFailed': 'Impossible de copier le chemin',
  'custom.css.newTheme':
    'Enregistrez d’abord le thème pour ajouter des styles personnalisés',
  'custom.css.loading': 'Chargement…',
  'custom.css.loadFailed': 'Impossible de lire la feuille de styles',
  'custom.css.openFailed': 'Impossible d’ouvrir la feuille de styles',
  'custom.css.saveFailed':
    'Impossible d’enregistrer le réglage des styles personnalisés',
  'custom.css.enable': 'Activer les styles personnalisés',
  'custom.css.tooLarge':
    'La feuille de styles dépasse 256 Ko et a été ignorée ; ouvrez-la pour la réduire',
  'custom.css.template.active': 'S’applique tant que ce thème est actif.',
  'custom.css.template.variables':
    'Privilégiez la surcharge des variables CSS ; DSH peint l’interface à partir d’elles, par exemple :',
  'custom.css.template.example': 'body { --dsw-alias-brand-primary: #7c5cff !important; }',
  'custom.css.template.classes':
    'Évitez les noms de classe des composants DSH, comme ._card_1pq26_9 : leur hachage et leur numéro de ligne changent d’une version à l’autre, une règle peut donc cesser de correspondre après une mise à jour.',
  'custom.css.template.classesHint':
    'Ciblez plutôt des attributs sémantiques, comme [data-code-block-banner] (barre du bloc de code), [data-terminal] (terminal) ou [role="dialog"] (boîtes de dialogue) :',
  'custom.css.template.exampleAttribute':
    '[data-code-block-banner] { background: var(--dsw-alias-bg-layer-2); }',
  'custom.css.template.dark': 'Apparence sombre : html[data-ds-dark-theme] .selector { ... }',
  'custom.css.template.assets': 'Médias du thème :',
  'custom.css.template.warning':
    'Le CSS peut modifier toute l’interface ; conservez une copie avant de modifier.',

  'shiki.constant': 'Constante',
  'shiki.string': 'Chaîne',
  'shiki.comment': 'Commentaire',
  'shiki.keyword': 'Mot-clé',
  'shiki.parameter': 'Paramètre',
  'shiki.function': 'Fonction',
  'shiki.string-expression': 'Chaîne de modèle',
  'shiki.punctuation': 'Ponctuation',
  'shiki.link': 'Lien',
} satisfies Record<ThemeKey, string>
