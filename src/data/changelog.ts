export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  badge?: string;
  features: {
    icon: string;
    title: string;
    description: string;
  }[];
}

export const APP_VERSION = '1.5.0';
export const APP_BUILD_NAME = 'iPhone & Safe Areas';
export const APP_BUILD_TAG = `Build ${APP_VERSION} (24.10.) • ${APP_BUILD_NAME}`;

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: '1.5.0',
    date: '24. Oktober 2026',
    title: 'Mobile iPhone-Optimierung & Apple Safe Areas',
    badge: 'Aktuell 📱',
    features: [
      {
        icon: '📱',
        title: 'Voll adaptives TCG Pocket Duell-Layout',
        description: 'Im Hochformat auf dem iPhone verwandelt sich das Spielfeld in ein vertikales Duell (Gegner oben, Levi unten, daumen-optimierte Aktionsleiste).'
      },
      {
        icon: '🛡️',
        title: 'Apple Safe Area Insets (Notch & Dynamic Island)',
        description: 'Vollständiger Schutz vor Abschneiden durch die Notch, Dynamic Island oder den iOS-Home-Balken über native CSS env(safe-area-inset-*).'
      },
      {
        icon: '📐',
        title: '100dvh Dynamic Viewport & Rubberband-Schutz',
        description: 'Kein Ruckeln oder Springen der Safari-Adressleiste mehr dank moderner dynamischer Viewport-Höhe (100dvh).'
      },
      {
        icon: '✨',
        title: 'Bento Touch-Kacheln im Hauptmenü',
        description: 'Auf dem Handy passen alle 3 Menükacheln als elegante horizontale Touch-Karten perfekt auf das Display, ohne den Pikachu-Begleiter zu verdecken.'
      },
      {
        icon: '🔍',
        title: 'Optimierte Modale & Booster-Packs',
        description: 'Alle Dialoge (Regeln, Eltern, Kartendetails, Changelog) nutzen sichere Innenränder und flüssige Wischgesten.'
      }
    ]
  },
  {
    version: '1.4.0',
    date: '24. Oktober 2026',
    title: 'Dynamische Starter-Welten & Kindgerechte Spielbalance',
    badge: 'v1.4.0',
    features: [
      {
        icon: '🎨',
        title: '4 Dynamische Starter-Splashscreens',
        description: 'Tippe auf Bisasam (Wald), Glumanda (Vulkan), Schiggy (Ozean) oder Pikachu (Elektro-Stadion) – der gesamte Startbildschirm verwandelt sich sofort mit passendem Ruf und Amala-Begrüßung!'
      },
      {
        icon: '🗺️',
        title: 'Kanto Arena-Reise im Anime-Design',
        description: 'Große, bildschirmfüllende Kanto-Regionskarte mit leuchtenden Reiserouten, animierten Orden-Wegpunkten und Arena-Vorschau-Banner.'
      },
      {
        icon: '🛡️',
        title: 'Pikachu-Schutzschild (+20 KP)',
        description: 'Im Modus „Leicht“ erhalten alle Pokémon von Levi einen sanften Schutzschild mit +20 KP, damit Duelle länger spannend bleiben.'
      },
      {
        icon: '🤖',
        title: 'Rücksichtsvolle KI & Adaptiver Trost-Bonus',
        description: 'Der Computer vermeidet gnadenlose Sofort-K.O.s, gibt Levi Zeit zum Entwickeln und wird nach einer Niederlage spürbar nachsichtiger.'
      },
      {
        icon: '🎙️',
        title: 'Microsoft Neural AI Amala (283 Vertonungen)',
        description: 'Alle 258 Pokémon- und Trainerkarten, das Regelbuch und alle Kampf-Cues wurden mit der warmen, positiven deutschen Stimme von Amala neu vertont.'
      },
      {
        icon: '📖',
        title: 'Kindgerechtes Vorlese-Regelbuch',
        description: '7 bebilderte Kapitel mit interaktiver Sprachausgabe direkt im Hauptmenü („Spielregeln“) und im Kampf („Hilfe“) abrufbar.'
      }
    ]
  },
  {
    version: '1.3.0',
    date: '24. Oktober 2026',
    title: '10 Handgezeichnete Anime-Arenen & TCG Pocket Sound',
    features: [
      {
        icon: '🏟️',
        title: '10 Vollbild-Anime-Arenen',
        description: 'Authentische Schlachtfelder für Rocko, Misty, Major Bob, Erika, Koga, Sabrina, Pyro, Giovanni, Gary und Papas Spieltisch.'
      },
      {
        icon: '🔊',
        title: 'TCG Pocket CRIWARE SFX',
        description: 'Originalgetreue Soundeffekte für Kartenstöße, Folienaufreißen, Münzwurf und Siegesfanfaren.'
      }
    ]
  },
  {
    version: '1.2.0',
    date: '23. Oktober 2026',
    title: 'TCG Pocket Booster & 3D-Hologramme',
    features: [
      {
        icon: '🎁',
        title: 'Interaktives Booster-Öffnen',
        description: 'Wische mit dem Finger, um die Boosterpackung aufzureißen und seltene Holo-Karten mit Regenbogen-Strahlen zu enthüllen.'
      },
      {
        icon: '✨',
        title: 'Gyroskop & Drag 3D-Holo-Karten',
        description: 'Karten neigen sich im Raum und reflektieren prismatisches Licht beim Neigen des Tablets.'
      }
    ]
  },
  {
    version: '1.1.0',
    date: '22. Oktober 2026',
    title: 'PWA Offline-Paket für Amazon Fire Tab 11',
    features: [
      {
        icon: '📱',
        title: '100% Offline-Fähigkeit',
        description: 'Alle 980+ Assets, Musikstücke und Sprachzeilen werden im Browser gespeichert und laufen ganz ohne WLAN.'
      }
    ]
  },
  {
    version: '1.0.0',
    date: '20. Oktober 2026',
    title: 'Grundsteinlegung Levis Pokémon TCG',
    features: [
      {
        icon: '⚡',
        title: 'Didaktische 3-Stufen-Regeln',
        description: 'Vereinfachte TCG-Mechaniken speziell für 5-jährige Kinder (Stufe 1 bis Stufe 3) und 20-Karten-Deckbau.'
      }
    ]
  }
];
