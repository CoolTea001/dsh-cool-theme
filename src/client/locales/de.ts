/** German dictionary. */

import type { ThemeKey } from '../locales.js'

export const de = {
  nav: 'Design',
  'appearance.title': 'Aussehen',
  'appearance.desc': 'Dunkel / Hell / System',
  'presets.title': 'Vorlagen',
  'presets.desc': 'Beliebte Farbschemata mit einem Klick anwenden',
  'presets.disabled':
    'Eigenes Theme ist aktiv – deaktiviere es, um eine Vorlage zu wählen',
  'sidebar.title': 'Transparente Seitenleiste',
  'sidebar.desc': 'Transparenzeffekt des Seitenleistenfensters, nur unter macOS',
  'background.title': 'Hintergrundbild/-video',
  'background.add': 'Hinzufügen',
  'background.replace': 'Ersetzen',
  'background.remove': 'Entfernen',
  'background.opacity': 'Deckkraft',
  'background.blur': 'Unschärfe',
  'background.badType': 'Nur PNG / JPEG / WebP / AVIF / GIF / MP4 / WebM werden unterstützt',
  'background.tooLarge': 'Das Bild/Video ist größer als {0} MB – wähle ein anderes',
  'background.uploadFailed':
    'Theme gespeichert, aber das Hintergrundbild/-video konnte nicht hochgeladen werden',
  'scheme.light': 'Hell',
  'scheme.dark': 'Dunkel',
  'scheme.system': 'System',

  'custom.title': 'Eigenes Theme',
  'custom.toggle.desc': 'Erstelle dein eigenes Theme',
  'custom.group.seeds': 'Primär/Sekundär',
  'custom.group.shiki': 'Codeblock',
  'custom.mode.label': 'Bearbeitetes Aussehen',
  'custom.neutral.title': 'Neutral',
  'custom.neutral.desc': 'Flächen und Text. Eine Skala pro Aussehen',
  'custom.neutral.lightest': 'Hellstes Ende',
  'custom.neutral.darkest': 'Dunkelstes Ende',
  'custom.neutral.roleBackground': 'Hintergrund',
  'custom.neutral.roleForeground': 'Vordergrund',
  'custom.accent.title': 'Akzent',
  'custom.accent.desc': 'Schaltflächen und Hervorhebungen (deepseek und blue zusammengeführt)',
  'custom.green.title': 'Erfolg',
  'custom.green.desc': 'Erfolgszustände',
  'custom.amber.title': 'Warnung',
  'custom.amber.desc': 'Warnzustände',
  'custom.red.title': 'Fehler',
  'custom.red.desc': 'Fehlerzustände',
  'custom.border.title': 'Rahmen',
  'custom.border.desc':
    'Farbe und Deckkraft von Trennlinien und Konturen; der kräftigere Rahmen wird automatisch abgeleitet',
  'custom.shiki.desc': 'Farben der neun Syntax-Token',
  'custom.seed.light': 'Hell',
  'custom.seed.dark': 'Dunkel',
  'custom.save': 'Speichern',
  'custom.add': 'Eigenes Theme hinzufügen',
  'custom.edit': 'Bearbeiten',
  'custom.export': 'Exportieren',
  'custom.import': 'Theme importieren',
  'custom.name.placeholder': 'Theme-Name',
  'custom.defaultName': 'Eigenes Theme',
  'custom.inUse': 'In Verwendung',
  'custom.delete': 'Löschen',
  'custom.cancel': 'Abbrechen',
  'custom.close': 'Schließen',
  'custom.toast.saved': 'Gespeichert',
  'custom.toast.failed': 'Dateivorgang für das Theme fehlgeschlagen',
  'custom.toast.unavailable':
    'Die Theme-Datei-API ist nicht bereit – starte den DSH-Dienst neu',
  'custom.toast.exported': '„{0}“ exportiert',
  'custom.toast.imported': '„{0}“ importiert',
  'custom.importFailed.notArchive': 'Import fehlgeschlagen: kein Theme-Archiv',
  'custom.importFailed.noDocument':
    'Import fehlgeschlagen: Das Archiv enthält keine theme.json',
  'custom.importFailed.badDocument':
    'Import fehlgeschlagen: theme.json ist kein gültiges Theme',
  'custom.importFailed.tooNew':
    'Import fehlgeschlagen: Die Theme-Datei ist neuer als dieses Plugin',
  'custom.importFailed.media':
    'Import fehlgeschlagen: Das Theme enthält eine nicht unterstützte Mediendatei',
  'custom.importFailed.tooLarge':
    'Import fehlgeschlagen: Das Archiv überschreitet die Größenbeschränkung',
  'custom.importFailed.other': 'Import fehlgeschlagen: {0}',
  'custom.delete.title': 'Dieses eigene Theme löschen?',
  'custom.delete.desc': '„{0}“ wird gelöscht. Das lässt sich nicht rückgängig machen.',
  'custom.unsaved.title': 'Nicht gespeicherte Änderungen verwerfen?',
  'custom.unsaved.desc':
    'Die Änderungen an „{0}“ wurden nicht gespeichert und gehen beim Schließen der Einstellungen verloren.',
  'custom.unsaved.confirm': 'Verwerfen und schließen',
  'custom.unsaved.leaveDesc':
    'Die Änderungen an „{0}“ wurden nicht gespeichert. Verwerfen?',
  'custom.unsaved.leaveConfirm': 'Änderungen verwerfen',
  'custom.unsaved.cancel': 'Weiter bearbeiten',

  'custom.css.title': 'Eigene Styles',
  'custom.css.open': 'Stylesheet öffnen',
  'custom.css.copyPath': 'Pfad kopieren',
  'custom.css.copied': 'Pfad kopiert',
  'custom.css.copyFailed': 'Pfad konnte nicht kopiert werden',
  'custom.css.newTheme':
    'Speichere zuerst das Theme, um eigene Styles hinzuzufügen',
  'custom.css.loading': 'Wird geladen…',
  'custom.css.loadFailed': 'Stylesheet konnte nicht gelesen werden',
  'custom.css.openFailed': 'Stylesheet konnte nicht geöffnet werden',
  'custom.css.saveFailed':
    'Die Einstellung für eigene Styles konnte nicht gespeichert werden',
  'custom.css.enable': 'Eigene Styles aktivieren',
  'custom.css.tooLarge':
    'Das Stylesheet ist größer als 256 KB und wurde übersprungen; öffne es und kürze es',
  'custom.css.template.active': 'Gilt, solange dieses Theme aktiv ist.',
  'custom.css.template.variables':
    'Überschreibe bevorzugt CSS-Variablen; DSH zeichnet die Oberfläche daraus, zum Beispiel:',
  'custom.css.template.example': 'body { --dsw-alias-brand-primary: #7c5cff !important; }',
  'custom.css.template.classes':
    'Vermeide DSH-Komponentenklassen wie ._card_1pq26_9: Hash und Zeilennummer ändern sich zwischen Versionen, eine Regel kann nach einem Update nicht mehr greifen.',
  'custom.css.template.classesHint':
    'Nutze stattdessen semantische Attribute wie [data-code-block-banner] (Codeblock-Leiste), [data-terminal] (Terminal) oder [role="dialog"] (Dialoge):',
  'custom.css.template.exampleAttribute':
    '[data-code-block-banner] { background: var(--dsw-alias-bg-layer-2); }',
  'custom.css.template.dark': 'Dunkles Aussehen: html[data-ds-dark-theme] .selector { ... }',
  'custom.css.template.assets': 'Theme-Medien:',
  'custom.css.template.warning':
    'CSS kann die gesamte Oberfläche verändern; lege vor dem Bearbeiten eine Kopie an.',

  'shiki.constant': 'Konstante',
  'shiki.string': 'Zeichenkette',
  'shiki.comment': 'Kommentar',
  'shiki.keyword': 'Schlüsselwort',
  'shiki.parameter': 'Parameter',
  'shiki.function': 'Funktion',
  'shiki.string-expression': 'Template-String',
  'shiki.punctuation': 'Interpunktion',
  'shiki.link': 'Link',
} satisfies Record<ThemeKey, string>
