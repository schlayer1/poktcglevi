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

export const APP_VERSION = '2.2.0';
export const APP_BUILD_NAME = 'Die Große Erweiterung: Kanto-Liga, Thematische Booster, Trainingscamp & Die Johto-Reise';
export const APP_BUILD_TAG = `Build ${APP_VERSION} (28.10.) • ${APP_BUILD_NAME}`;

export const CHANGELOG_DATA: ChangelogEntry[] = [
  {
    version: '2.2.0',
    date: '28. Oktober 2026',
    title: 'Die Große Johto-Reise & Ausrüstungs-Tools (Phase 4)',
    badge: 'Mega-Update 🌟',
    features: [
      {
        icon: '🚂',
        title: 'Vollständige 2. Regionenkarte: Johto',
        description: 'Schalte nach dem Liga-Sieg die Reise nach Johto frei mit 8 neuen Arenaleitern (Falk, Kai, Bianka, Jens, Hartwig, Jasmin, Norbert, Sandra) auf einer hochauflösenden Anime-Karte!'
      },
      {
        icon: '✨',
        title: '12 neue Gen-2 Pokémon-Karten & Pichu',
        description: 'Endivie, Feurigel, Karnimani, Togepi, Ampharos, Marill, Psiana, Nachtara, Stahlos, Scherox, Lugia und Ho-Oh – inklusive offizieller Artworks und Anime-Rufe!'
      },
      {
        icon: '🥊',
        title: 'Neue Ausrüstungskarten (Pokémon-Tools)',
        description: 'Muskelband (+10 Schaden), Wundersames Amulett (+20 KP) und EP-Teiler (+1 Energie) können im Duell direkt an Pokémon angelegt werden mit sichtbarem Ausrüstungs-Abzeichen!'
      },
      {
        icon: '🏛️',
        title: 'Kanto-Finale & Indigo-Plateau Liga-Halle',
        description: 'Stelle dich Lorelei, Bruno, Agathe, Siegfried und Champ Gary in 4 thematischen Thronsälen und gewinne den goldenen 3D-Champion-Pokal und die geheime Pichu-Karte!'
      },
      {
        icon: '🔬',
        title: 'Thematische Booster & Forschungs-Quests',
        description: 'Wähle gezielt Glurak-, Pikachu- oder Mewtu-Packs und erfülle Professor Eichs Forschungsaufgaben für kostenlose Belohnungs-Booster.'
      },
      {
        icon: '🏕️',
        title: 'Trainingslager mit Ruf-Quiz & Poké-Memo',
        description: 'Trainiere spielerisch Pokémon-Rufe und Typen-Vorteile im Quiz und spiele Poké-Memo mit deinen eigenen gesammelten Karten!'
      }
    ]
  },
  {
    version: '2.1.0',
    date: '28. Oktober 2026',
    title: 'Das Pokémon Trainingscamp: Ruf- & Typen-Quiz & Poké-Memo',
    badge: 'Neu ✨',
    features: [
      {
        icon: '🎓',
        title: 'Professor Eichs Ruf- & Typen-Quiz',
        description: '5 spannende Quizrunden mit echten Pokémon-Rufen zum Anhören, Entwicklungs-Rätseln und Typen-Schwächen – inklusive Sound-Wiederholungsbutton!'
      },
      {
        icon: '🃏',
        title: 'Poké-Memo mit eigenen Karten',
        description: 'Ein farbenfrohes 12-Karten-Suchspiel mit 3D-Karten-Flips, das gezielt Pokémon aus Levis eigenem Sammelalbum verwendet und beim Treffer den jeweiligen Pokémon-Ruf abspielt.'
      },
      {
        icon: '🏕️',
        title: 'Trainingscamp-Zentrum im Hauptmenü',
        description: 'Direkt über den neuen Button „Camp 🏕️“ erreichbar – ideal für spielerische Pausen zwischen packenden Kartenduellen.'
      },
      {
        icon: '🎁',
        title: 'Extra Booster-Packs als Belohnung',
        description: 'Wer das Quiz besteht oder alle Pärchen im Memo findet, schaltet sofort 1 kostenloses Booster-Pack für seine Sammlung frei.'
      },
      {
        icon: '🎙️',
        title: 'Neue Amala-Stimmen für Trainingscamp',
        description: 'Amala begleitet das Quiz und das Memo mit motivierendem Feedback bei Treffern, Pärchen und Siegen.'
      }
    ]
  },
  {
    version: '2.0.0',
    date: '28. Oktober 2026',
    title: 'Thematische Booster-Packs & Professor Eichs Forschungs-Quests',
    badge: 'Stabil 🌟',
    features: [
      {
        icon: '🎴',
        title: 'Authentische Thematische Booster-Packs',
        description: 'Vor dem Aufreißen wählt Levi sein Wunsch-Pack (Glurak-, Pikachu-, Mewtu- oder Mew-Pack). Jedes Pack besitzt echte Typ-Wahrscheinlichkeiten (z. B. Glurak-Pack mit Feuer, Pflanze & Kampf).'
      },
      {
        icon: '🔬',
        title: 'Professor Eichs Forschungs-Labor',
        description: 'Direkt aus dem Hauptmenü und Sammelalbum erreichbar: Levi erfüllt wechselnde Forschungsaufgaben (z. B. Angriffe, Entwicklungen, Duelle mit Papa).'
      },
      {
        icon: '🎁',
        title: 'Kostenlose Belohnungs-Booster',
        description: 'Jede gelöste Forschungs-Aufgabe schenkt Levi sofort 1 frisches Booster-Pack zum Aufreißen – inklusive Konfetti-Feuerwerk und Amala-Belohnungssound!'
      },
      {
        icon: '🎙️',
        title: 'Neue Amala-Laborstimmen',
        description: 'Professor Eich und Amala begrüßen Levi persönlich im Labor und feiern jede bestandene Forschungsaufgabe.'
      }
    ]
  },
  {
    version: '1.9.0',
    date: '28. Oktober 2026',
    title: 'Top Vier Indigo Plateau, Kanto-Liga Finale & Pichu-Sonderkarte',
    badge: 'Stabil 🌟',
    features: [
      {
        icon: '🏛️',
        title: 'Indigo Plateau Liga-Halle & Top Vier',
        description: 'Vier prächtige Meisterschafts-Säle für Eis-Meisterin Lorelei (Lapras & Arktos), Faustkämpfer Bruno (Machomei), Geist-Meisterin Agathe (Gengar) und Drachen-Gebieter Siegfried (Dragoran).'
      },
      {
        icon: '🗺️',
        title: 'Stationen 9 bis 13 auf der Kanto-Reisekarte',
        description: 'Auf der Anime-Weltkarte führt die Siegesstraße nun lückenlos über die Stationen 9–13 direkt ins Indigo Plateau.'
      },
      {
        icon: '👑',
        title: 'Kanto-Champion Krönungs-Zeremonie',
        description: 'Besiegt Levi Champ Gary, erwartet ihn eine spektakuläre Siegerehrung mit goldenem 3D-Pokal, Amala-Laudatio von Prof. Eich, 2 Meister-Packs und Aufnahme in die Liga-Ruhmeshalle.'
      },
      {
        icon: '⚡',
        title: '🌟 Erstes Johto-Pokémon: Pichu-Sonderkarte',
        description: 'Als geheime Meister-Belohnung schenkt Professor Eich Levi die erste Gen-2-Sonderkarte: das entzückende Baby-Pokémon Pichu im glänzenden TCG-Pocket-Art-Design inklusive Amala-Audio!'
      },
      {
        icon: '🏆',
        title: 'Champion-Status auf Titelbildschirm & Hauptmenü',
        description: 'Levis errungener Champion-Titel und der strahlende Gold-Pokal schmücken stolz Titelbildschirm, Hauptmenü und Sammelalbum.'
      }
    ]
  },
  {
    version: '1.8.0',
    date: '26. Oktober 2026',
    title: 'UI-Hintergründe, 3D-Kartenfächer & Globaler Elternmodus',
    badge: 'Stabil 🌟',
    features: [
      {
        icon: '🏟️',
        title: 'Pokémon-Liga Stadion & Arena-Hintergründe',
        description: 'Atmosphärische, hochauflösende Hintergründe für Spielmodusauswahl (Stadion mit Flutlichtern), Deckauswahl (Stadion/Papa-Arena), Booster-Öffnen, Sammelalbum und Deckbau.'
      },
      {
        icon: '🎴',
        title: '3D-Kartenfächer beim Boosterpack-Öffnen',
        description: 'Jede aufgedeckte Karte dreht sich filmisch um, bleibt sichtbar stehen und reiht sich links in einen interaktiven Kartenfächer ein, der mit jeder aufgedeckten Karte wächst.'
      },
      {
        icon: '🛡️',
        title: 'Global erreichbarer Elternmodus',
        description: 'Einstellungen, Regelstufen (1–3), KI-Schwierigkeit und Spielstand-Verwaltung können nun von jedem Bildschirm aus (Hauptmenü, Deckauswahl, Album, Deckbau, Kampffeld) aufgerufen werden.'
      },
      {
        icon: '✨',
        title: 'Plastischer 3D-Schließen-Button (Ebenen-Design)',
        description: 'Der Schließen-Button der Karten-Detailansicht schwebt nun frei und unbeschnitten in der vorderen 3D-Ebene über dem Rahmen, während die Karte plastisch dahinter liegt.'
      },
      {
        icon: '⚡',
        title: 'Freie Start-Pokémon-Wahl zu Duellbeginn',
        description: 'Vor Kampfbeginn kann das aktive Start-Pokémon nun frei aus allen gezogenen Basis-Karten ausgewählt werden – inklusive passendem Arena-Auswahlbildschirm, Ruf-Audio und Amala-Vertonung!'
      },
      {
        icon: '🔙',
        title: 'Zurück-Navigation in der Deckauswahl',
        description: 'In der Deck- und Gegnerauswahl kann nun jederzeit per Klick auf „Zurück“ zum Hauptmenü zurückgekehrt werden.'
      }
    ]
  },
  {
    version: '1.7.0',
    date: '25. Oktober 2026',
    title: 'Gameplay-Balance, VS-Modus Fix & 3D Booster-Flip',
    features: [
      {
        icon: '🎴',
        title: 'Echter 3D-Karten-Flip (rotateY 180°)',
        description: 'Beim Antippen dreht sich die Karte jetzt filmisch und flüssig im Raum um die eigene Achse (CSS 3D-Flip) mit vergrößerten 48px-Touchzielen für alle 5 Karten.'
      },
      {
        icon: '⚔️',
        title: 'VS-Modus Schadensberechnung korrigiert',
        description: 'Papas Attackenvorschau wurde symmetrisch entkoppelt: Papas eigenes Pokémon verliert keine KP mehr bei der Attackenauswahl, sondern ausschließlich das anvisierte Pokémon des Gegners.'
      },
      {
        icon: '🔄',
        title: 'Tisch-iPad Dynamische Pokémon-Drehung',
        description: 'Im 2-Spieler-Modus am iPad dreht sich das aktive Pokémon und die Werteanzeige automatisch zu Papa um (180°), wenn Papa an der Reihe ist.'
      },
      {
        icon: '⚡',
        title: 'Intelligente, bedarfsgerechte Energiezone',
        description: 'Keine toten Runden mehr: Befindet sich Pikachu im Spiel, generiert die Energiezone gezielt die benötigte Elektro-Energie statt fremder Typen.'
      },
      {
        icon: '🧬',
        title: 'Mewtu & EX-Varianten im Sammelalbum',
        description: 'Slot #150 im 151er Kanto-Binder aggregiert jetzt alle gezogenen Mewtu- und Mewtu-ex-Karten und zeigt die glänzende EX-Version samt Stückzahl an.'
      },
      {
        icon: '🎙️',
        title: 'Audio-Rebalancing & BGM-Ducking',
        description: 'Musik und Toneffekte wurden harmonisch eingepegelt; sobald deutsche Sprachausgabe ertönt, senkt sich die Musik sanft um 75% ab.'
      }
    ]
  },
  {
    version: '1.6.0',
    date: '24. Oktober 2026',
    title: 'Authentische TCG Pocket Animationen & Mobile 3D-Bühne',
    badge: 'Stabil 🌟',
    features: [
      {
        icon: '🎴',
        title: 'Zentrierte 3D-Kartenbühne beim Booster-Öffnen',
        description: 'Kein horizontales Abschneiden von Karte 4 und 5 mehr auf dem iPhone! Die aktive Karte steht immer exakt zentriert mit riesigem Touch-Bereich, 3D-Stack-Tiefeneffekt und Wischgesten.'
      },
      {
        icon: '✨',
        title: 'Luminöse God-Rays & Sternenpartikel',
        description: 'Seltene Ziehungen (EX, Rang 2, Holos) erstrahlen nun in epischen, mehrschichtigen Sunburst-Lichtstrahlen mit aufsteigendem Sternenstaub im Stil von Pokémon TCG Pocket.'
      },
      {
        icon: '🏆',
        title: 'TCG Pocket Siegerehrung & Sequentielle Sterne',
        description: 'Vollwertiger Sieges-Screen mit goldenem 3D-Champion-Banner, rotierendem Sieges-Sunburst, Sieger-Pokémon-Spotlight und sequentiell mit Soundeffekt aufploppenden Sternen.'
      },
      {
        icon: '📱',
        title: 'Intelligente 5-Karten-Navigation',
        description: '5 interaktive Status-Chips unter der Karte ermöglichen schnelles Vor- und Zurückspringen, Wischen mit dem Daumen sowie ein sauberes 2-Spalten-Sammelgrid nach der Enthüllung.'
      }
    ]
  },
  {
    version: '1.5.1',
    date: '24. Oktober 2026',
    title: 'Repository-Bereinigung & Vercel-Speicheroptimierung',
    badge: 'Speed 🚀',
    features: [
      {
        icon: '⚡',
        title: '26+ MB Speicherplatz-Bereinigung',
        description: 'Beseitigung aller toten PNG/JPG-Duplikate, ungenutzter Audio-Dateien und Konvertierung aller 151 Pokémon-Sprites sowie Arenen in modernes, verlustfreies WebP.'
      },
      {
        icon: '📦',
        title: 'Intelligente Workbox PWA-Cache-Architektur',
        description: 'Vollständige Reduzierung des initialen Download- und Precache-Bundles von 84 MB auf ca. 33 MB durch on-demand Runtime-Caching für Sprachdateien und Schreie.'
      },
      {
        icon: '🛡️',
        title: '.vercelignore Deployment-Schutz',
        description: 'Lokale Entwickler-Skripte und Binär-Pakete werden zuverlässig vom Vercel-Cloud-Deployment ausgeschlossen.'
      }
    ]
  },
  {
    version: '1.5.0',
    date: '24. Oktober 2026',
    title: 'Mobile iPhone-Optimierung & Apple Safe Areas',
    badge: 'Mobil 📱',
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
