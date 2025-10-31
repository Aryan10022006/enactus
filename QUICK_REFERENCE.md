# 🚀 QUICK REFERENCE CARD

## Admin Access
```
URL: http://localhost:3000/#/admin
Password: enactus2025
```

## Three Views
```
👥 Attendee:  http://localhost:3000/
🔐 Admin:     http://localhost:3000/#/admin  (password: enactus2025)
📺 Projector: http://localhost:3000/#/projector
```

## Logo Location
```
public/images/logo.png
(500x500px PNG with transparent background)
```

## Change Password
```javascript
File: src/components/AdminLogin.jsx (line 13)
if (password === 'YOUR_PASSWORD') {
```

## Budget Settings
```javascript
File: src/firebase.js (lines 40-42)
export const TOTAL_BUDGET = 100000;
export const TEAM_BUDGET_PERCENTAGE = 0.6;
export const ATTENDEE_BUDGET_PERCENTAGE = 0.4;
```

## Firestore Structure
```
events/
  enactus-orientation-2025/
    state/
      state/
        registration_open: false
        current_pitch_id: null
    users/
      {userId}/
        name, role, wallet
    projects/
      {projectId}/
        name, total_bid
    bids/
      {bidId}/
        userId, projectId, amount, timestamp
```

## Event Flow
```
1. Admin: Open Registration
2. Attendees: Register (10 min window)
3. Admin: Close & Distribute Wallets
4. Admin: Add Projects
5. Admin: Start Pitch
6. Attendees: Place Bids
7. Admin: End Pitch
8. Repeat steps 5-7 for each project
9. Winner: Highest total bid!
```

## Important Commands
```bash
# Install
npm install

# Run
npm start

# Build for production
npm run build

# Deploy to Netlify
netlify deploy --prod

# Deploy to Vercel
vercel --prod
```

## Keyboard Shortcuts
```
F11 - Full screen (for projector view)
F12 - Open browser console (for debugging)
Ctrl+Shift+R - Hard refresh (clear cache)
```

## Support Files
```
📖 README.md - Complete docs
⚡ QUICKSTART.md - 5-min setup
🔥 FIREBASE_SETUP_GUIDE.md - Firebase steps
🎨 LOGO_SETUP.md - Logo instructions
✨ UI_ENHANCEMENTS.md - UI features
📋 FINAL_SETUP_GUIDE.md - Everything
```

## Quick Troubleshoot
```
Logo not showing → Check: public/images/logo.png
Admin locked out → Password: enactus2025 (lowercase)
Firestore error → Check Firebase config in src/firebase.js
Bids not updating → Check internet + browser console (F12)
```

## Pre-Event Checklist
```
☑ Firebase configured
☑ Logo added (public/images/logo.png)
☑ Team members pre-registered
☑ Admin password set
☑ All views tested
☑ Budget configured
```

---

**REMEMBER**: Keep admin URL secret! Only share with organizers.

**For help**: Press F12 in browser to see error messages.

**Production**: Run `npm run build` then deploy the `build` folder.

🎉 **Ready to rock your Enactus event!**
