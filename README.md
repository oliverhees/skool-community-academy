# AI Automation Engineers Academy - Skool Community

Eine interaktive Web-Academy für die AI Automation Engineers Skool Community. Diese Platform bietet personalisierte Lernpfade für AI-Automation und Business-Prozessoptimierung.

## Features

- **Login-System** mit Access-Code Verifizierung
- **Interaktive Module** mit Progress Tracking
- **Quiz & Assessment** zur Analyse der aktuellen Situation
- **Personalisierte Strategien** basierend auf User-Input
- **90-Tage Action Plan** für erfolgreiche AI-Automation
- **Modern UI** mit futuristischem Blau-Design

## Technologie Stack

- **HTML5** - Struktur
- **CSS3** - Modern Glassmorphism Design
- **Vanilla JavaScript** - Interaktivität & LocalStorage
- **Google Fonts** - Outfit & Space Grotesk
- **Responsive Design** - Mobile-First Approach

## Installation & Setup

### Lokale Entwicklung

1. Repository klonen:
```bash
git clone https://github.com/DEIN-USERNAME/skool-community.git
cd skool-community
```

2. Lokalen Server starten:
```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js (http-server)
npx http-server -p 8000

# Option 3: VS Code Live Server Extension
# Rechtsklick auf index.html → "Open with Live Server"
```

3. Browser öffnen:
```
http://localhost:8000
```

### Demo Access Codes

Für Testing stehen folgende Access Codes zur Verfügung:
- `DEMO2025`
- `AI2025`

## Deployment

### GitHub Pages

1. Repository-Settings öffnen
2. Pages aktivieren (Source: main branch)
3. Optional: Custom Domain konfigurieren

### Custom Domain

CNAME-Datei erstellen:
```bash
echo "deine-domain.de" > CNAME
```

## Konfiguration

### N8n Webhook Integration

In `index.html` die Webhook-URL anpassen:

```javascript
const N8N_WEBHOOK_URL = 'https://deine-n8n-instanz.de/webhook/XXXX';
```

### User Data Storage

User-Daten werden im `localStorage` gespeichert:
- E-Mail
- Business-Informationen
- Ziele & Strategien
- Quiz-Antworten

## Struktur

```
skool-community/
├── index.html              # Hauptseite mit Login & Academy
├── modules.js              # Module & Content-Definitionen
├── lead-interactive.html   # Personalisierter Guide
├── README.md               # Diese Datei
├── CLAUDE.md               # Claude Code Guidance
└── .gitignore             # Git Ignore Rules
```

## Customization

### Farbschema anpassen

Das aktuelle Farbschema nutzt futuristisches Blau:
- Primär: `#0066FF` (Electric Blue)
- Akzent: `#00D4FF` (Cyan Blue)
- Hintergrund: `#000000` (Black)

In `index.html` CSS-Variablen anpassen:

```css
background: linear-gradient(90deg, #0066FF 0%, #00D4FF 100%);
```

### Content anpassen

Content-Anpassungen in folgenden Bereichen:
1. **Section Titles** - In den `<h2 class="section-title">` Tags
2. **Descriptions** - In den `<p class="section-subtitle">` Tags
3. **Interactive Cards** - Card-Titel und Beschreibungen
4. **Quiz Questions** - In den `.quiz-container` Bereichen

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Performance

- Keine externen Dependencies außer Google Fonts
- Optimiert für schnelles Laden
- LocalStorage für Persistenz
- Responsive Images & Lazy Loading

## Security

- **Access Code Validation** via N8n Webhook
- **No sensitive data** im Client-Code
- **CORS Configuration** für API-Calls
- **Input Sanitization** für User-Input

## Roadmap

- [ ] Module-System mit locked/unlocked Content
- [ ] PDF-Export für personalisierte Guides
- [ ] Email-Benachrichtigungen
- [ ] Progress-Tracking-Dashboard
- [ ] Community-Integration (Skool API)
- [ ] Video-Content Integration
- [ ] AI-Chat-Integration

## Support & Community

Bei Fragen oder Feedback:
- Skool Community: [Link zur Community]
- GitHub Issues: [Repository Issues]

## License

© 2025 AI Automation Engineers Academy. Alle Rechte vorbehalten.

## Credits

Entwickelt mit ❤️ für die AI Automation Engineers Community
