# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is the **AI Automation Engineers Academy**, a web-based educational platform for the Skool Community. The project provides interactive learning experiences for AI automation, workflow optimization, and business process automation. It features a modern, futuristic blue design with glassmorphism effects.

## Commands

### Development

```bash
# Start local development server
python -m http.server 8000

# Alternative: Use Node.js http-server
npx http-server -p 8000

# Alternative: VS Code Live Server
# Right-click index.html → "Open with Live Server"
```

### Testing

```bash
# Demo access codes for testing
# DEMO2025
# AI2025
```

### Deployment

```bash
# Deploy to GitHub Pages
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main

# GitHub Pages will auto-deploy from main branch
```

## Architecture Overview

### Core Technologies

- **Frontend**: Pure HTML5, CSS3, Vanilla JavaScript
- **Styling**: Modern CSS with Glassmorphism, Gradients, Animations
- **Storage**: LocalStorage for user data persistence
- **Integration**: N8n Webhook for access validation (to be configured)

### File Structure

```
skool-community/
├── index.html              # Main Academy page
├── modules.js              # Module definitions & content
├── lead-interactive.html   # Personalized guide page
├── README.md               # Project documentation
├── CLAUDE.md               # This file
└── .gitignore             # Git ignore rules
```

### Key Components

#### 1. Authentication System (index.html:641-669)
- Email + Access Code validation
- Demo codes: `DEMO2025`, `AI2025`
- N8n webhook integration point (needs configuration)

#### 2. Interactive Cards (index.html:774-823)
- User data collection
- Goal setting
- Progress tracking with completion states
- Smooth animations

#### 3. Quiz System (index.html:831-892)
- Multiple choice questions
- Answer tracking in userData object
- Visual feedback with selection states

#### 4. Progress Tracking (index.html:700-721)
- Fixed sidebar tracker
- 5 sections with visual progress
- Smooth scroll navigation
- Completion indicators

#### 5. Personalized Content Generation
- Dynamic action plan based on user input
- Workflow suggestions per industry
- ROI calculations
- Time-saved projections

## Design System

### Color Palette

```css
/* Primary Colors */
--electric-blue: #0066FF;
--cyan-blue: #00D4FF;
--deep-blue: #0052CC;

/* Backgrounds */
--black: #000000;
--glass-bg: rgba(255,255,255,0.03);
--glass-border: rgba(0,102,255,0.2);

/* States */
--success: #00ff7f;
--error: #FF3366;
--warning: #FFA500;
```

### Typography

- **Headings**: Space Grotesk (900, 700, 500)
- **Body**: Outfit (300-900)
- **Line Heights**: 1.6-2.0 for readability

### Components

#### Glassmorphism Cards
```css
background: rgba(255,255,255,0.03);
backdrop-filter: blur(20px);
border: 1px solid rgba(0,102,255,0.2);
border-radius: 24px;
```

#### Gradient Buttons
```css
background: linear-gradient(90deg, #0066FF 0%, #00D4FF 100%);
box-shadow: 0 10px 40px rgba(0,102,255,0.4);
```

#### Hover Effects
```css
transform: translateY(-5px);
box-shadow: 0 20px 60px rgba(0,102,255,0.3);
transition: all 0.3s ease;
```

## Important Patterns

### User Data Management

All user data is stored in the `userData` object:

```javascript
userData = {
    email: '',
    businessName: '',
    industry: '',
    goals: {
        main: '',
        hours: 0
    },
    quiz: {},
    strategies: []
}
```

### LocalStorage Persistence

```javascript
// Save data
localStorage.setItem('userData', JSON.stringify(userData));

// Retrieve data
const data = JSON.parse(localStorage.getItem('userData'));
```

### Progress Tracking Algorithm

```javascript
// Calculate progress based on completed cards
const completedCards = document.querySelectorAll('.interactive-card.completed').length;
const totalCards = document.querySelectorAll('.interactive-card').length;
const progress = (completedCards / totalCards) * 100;
```

### Notification System

```javascript
showNotification('Message text');
// Auto-dismiss after 3 seconds
// Slide-up animation
```

## Key Functions

### Core Functions (index.html)

1. **`saveUserData()`** - Save business information
2. **`saveGoals()`** - Save automation goals
3. **`selectOption(element)`** - Quiz selection handler
4. **`analyzeContent()`** - Content automation analysis
5. **`generatePersonalizedContent()`** - Dynamic content generation
6. **`updateProgress()`** - Progress tracking update
7. **`showNotification(message)`** - User feedback system

## Configuration Points

### N8n Webhook Integration

Update the webhook URL in `index.html`:

```javascript
const N8N_WEBHOOK_URL = 'YOUR_WEBHOOK_URL_HERE';
```

Expected webhook response format:
```json
{
    "success": true,
    "message": "Access granted",
    "userData": { /* optional user data */ }
}
```

### Demo Access Codes

Current demo codes (can be changed in login handler):
- `DEMO2025`
- `AI2025`

## Common Tasks

### Adding New Sections

1. Add section HTML in content-wrapper
2. Update progress-tracker with new tracker-item
3. Update nav-progress if needed
4. Implement section-specific logic in JavaScript

### Modifying Color Scheme

Search and replace color values:
- `#0066FF` → Your new primary color
- `#00D4FF` → Your new accent color
- Update gradients: `linear-gradient(90deg, COLOR1, COLOR2)`

### Adding New Quiz Questions

1. Add quiz-container div
2. Add quiz-question
3. Add quiz-options with onclick="selectOption(this)"
4. Update generatePersonalizedContent() to handle new answers

## Responsive Breakpoints

```css
@media (max-width: 768px) {
    /* Mobile optimizations */
    .progress-tracker { display: none; }
    .nav-progress { display: none; }
    .section-title { font-size: 32px; }
}
```

## Performance Optimizations

- No external JavaScript libraries
- Minimal CSS (inline for faster FCP)
- LocalStorage for instant data access
- CSS animations (GPU-accelerated)
- Lazy-loaded content sections

## Security Considerations

⚠️ **Important Security Notes:**

1. **Access Code Validation**: Should be done server-side via N8n webhook
2. **No Sensitive Data**: Never store passwords or payment info in localStorage
3. **Input Sanitization**: Validate all user inputs
4. **CORS**: Configure webhook endpoint for same-origin policy
5. **HTTPS**: Always use HTTPS in production

## Testing Strategy

### Manual Testing Checklist

- [ ] Login flow with demo codes
- [ ] Form validation (all input fields)
- [ ] Quiz selection (all questions)
- [ ] Progress tracking updates
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] LocalStorage persistence (refresh page)
- [ ] Animations and transitions
- [ ] Notification system

### Browser Testing

Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Integration Points

### Planned Integrations

1. **Skool Community API** - Member validation & sync
2. **Payment Gateway** - Stripe/PayPal for premium access
3. **Email Service** - Welcome emails & notifications
4. **Analytics** - Google Analytics or custom tracking
5. **AI APIs** - ChatGPT/Claude for personalized recommendations

## Deployment Checklist

Before deploying to production:

- [ ] Update N8N_WEBHOOK_URL with production endpoint
- [ ] Remove or secure demo access codes
- [ ] Add proper error handling
- [ ] Implement rate limiting
- [ ] Add analytics tracking
- [ ] Test on all target browsers
- [ ] Optimize images and assets
- [ ] Enable HTTPS
- [ ] Configure CSP headers
- [ ] Add privacy policy & terms

## Known Issues & Limitations

- No backend validation (client-side only)
- LocalStorage limited to 5-10MB
- No multi-language support yet
- No offline functionality
- Access codes in plain text (demo only)

## Future Enhancements

- [ ] Module system with locked content
- [ ] PDF export functionality
- [ ] Video integration
- [ ] AI chatbot assistant
- [ ] Progress dashboard
- [ ] Email notifications
- [ ] Team collaboration features
- [ ] Mobile app version

## Best Practices

When working on this project:

1. **Maintain Consistency**: Follow existing naming conventions
2. **Comment Complex Logic**: Especially in generatePersonalizedContent()
3. **Test Responsiveness**: Always test on mobile
4. **Preserve Animations**: Keep transition timings consistent
5. **Update Documentation**: Keep README and CLAUDE.md in sync
6. **Version Control**: Commit often with clear messages

## Useful Resources

- [Glassmorphism Generator](https://glassmorphism.com/)
- [Gradient Generator](https://cssgradient.io/)
- [CSS Animations](https://animate.style/)
- [LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

## Support

For questions or issues:
- Check existing code patterns
- Review this CLAUDE.md file
- Consult README.md for setup
- Test with demo access codes

---

**Remember**: This is a community-focused educational platform. Keep the user experience simple, engaging, and motivating!
