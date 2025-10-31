# Deployment Guide - Enactus Bidding App

## 🚀 Quick Deploy Checklist

### Pre-Deployment (5 minutes)
- [ ] Firebase project created
- [ ] Firestore database initialized
- [ ] Anonymous authentication enabled
- [ ] Security rules configured
- [ ] Logo added to `public/images/logotab.png`
- [ ] Environment variables set

---

## 1️⃣ Firebase Setup

### Create Firebase Project
1. Go to https://console.firebase.google.com
2. Click "Add Project"
3. Name: `enactus-bidding` (or your choice)
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Enable Firestore
1. In Firebase Console, click "Firestore Database"
2. Click "Create Database"
3. Choose "Start in production mode"
4. Select location (closest to your users)
5. Click "Enable"

### Enable Anonymous Authentication
1. Click "Authentication" in sidebar
2. Click "Get Started"
3. Click "Sign-in method" tab
4. Click "Anonymous"
5. Toggle "Enable"
6. Click "Save"

### Configure Security Rules
1. Go to Firestore Database
2. Click "Rules" tab
3. Replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /events/{eventId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click "Publish"

### Get Firebase Config
1. Click gear icon → Project Settings
2. Scroll to "Your apps"
3. Click web icon (</>) 
4. Register app name: "Enactus Bidding"
5. Copy the `firebaseConfig` object

---

## 2️⃣ Update Firebase Configuration

### Edit `src/firebase.js`:

Replace the config section with your Firebase credentials:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

**IMPORTANT:** Never commit real credentials to public repositories!

---

## 3️⃣ Add Logo

1. Place your Enactus logo at: `public/images/logotab.png`
2. Recommended size: 512x512px or larger
3. Format: PNG with transparent background
4. File name must be exactly: `logotab.png` (lowercase)

---

## 4️⃣ Change Default Passwords

### Admin Password (src/components/AdminLogin.jsx)
```javascript
// Line 14
if (password === 'enactus2025') {  // ← Change this
```

### Team Member Code (src/components/TeamMemberLogin.jsx)
```javascript
// Line 14
if (secretCode === 'enactus2025team') {  // ← Change this
```

**Recommendation:** Use strong, unique passwords!

---

## 5️⃣ Build for Production

```bash
# Install dependencies (if not already)
npm install

# Create production build
npm run build
```

This creates an optimized `build` folder.

---

## 6️⃣ Deploy to Firebase Hosting

### Install Firebase CLI
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Initialize Firebase Hosting
```bash
firebase init hosting
```

Answer prompts:
- Use existing project: Select your project
- Public directory: `build`
- Single-page app: `Yes`
- Overwrite index.html: `No`
- Set up automatic builds: `No`

### Deploy
```bash
npm run build
firebase deploy
```

Your app will be live at: `https://YOUR_PROJECT_ID.firebaseapp.com`

---

## 7️⃣ Alternative Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
1. Go to https://app.netlify.com
2. Drag `build` folder to deploy
3. Or connect GitHub repo

### GitHub Pages
```bash
npm install --save-dev gh-pages
```

Add to `package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/enactus-bidding",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

Deploy:
```bash
npm run deploy
```

---

## 8️⃣ Environment Variables (Optional)

### For production environments:

Create `.env.production`:
```bash
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

Update `src/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};
```

**Note:** Add `.env.production` to `.gitignore`!

---

## 9️⃣ Test Deployment

### Before Event:
1. Open deployed URL
2. Test admin login: `/#/admin`
3. Open registration
4. Register test users
5. Distribute wallets
6. Add test projects
7. Start a pitch
8. Place test bids
9. Check projector view: `/#/projector`

### Performance Check:
- Load time < 3 seconds
- Real-time updates working
- Mobile responsive
- All routes working

---

## 🔟 Production Checklist

### Security:
- [ ] Changed admin password
- [ ] Changed team member code
- [ ] Firebase security rules published
- [ ] Anonymous auth enabled
- [ ] API keys not in public repo

### Assets:
- [ ] Logo added and displays correctly
- [ ] All icons showing (no emojis)
- [ ] Responsive on mobile/tablet/desktop
- [ ] Animations smooth

### Functionality:
- [ ] Registration works
- [ ] Wallet distribution works
- [ ] Bidding works
- [ ] Real-time updates work
- [ ] Admin controls work
- [ ] Team member login works
- [ ] Projector view works

### User Management:
- [ ] Delete user works
- [ ] Reset wallet works
- [ ] Toggle role works
- [ ] All confirmations show

### Performance:
- [ ] Build size optimized
- [ ] Images optimized
- [ ] No console errors
- [ ] Fast load times

---

## 📱 Share URLs with Users

### For Attendees:
```
https://YOUR_DOMAIN.com/#/
```

### For Team Members:
```
https://YOUR_DOMAIN.com/#/team
Secret Code: [your-team-code]
```

### For Admin:
```
https://YOUR_DOMAIN.com/#/admin
Password: [your-admin-password]
```

### For Projector:
```
https://YOUR_DOMAIN.com/#/projector
```

---

## 🔧 Post-Deployment Configuration

### 1. Initialize Event State
First time deployment, manually create document in Firestore:

**Collection:** `events/default/state`
**Document ID:** `state`
**Fields:**
```json
{
  "registration_open": false,
  "current_pitch_id": null,
  "registration_expires_at": null
}
```

### 2. Budget Configuration
Default values in code:
- Total Budget: ₹100,000
- Team Members: 60%
- Attendees: 40%

Change in `src/firebase.js` before deployment if needed.

---

## 🚨 Common Deployment Issues

### Issue: "Module not found"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: "Firebase not initialized"
**Solution:** Check `src/firebase.js` has correct config

### Issue: "Permission denied"
**Solution:** Check Firestore rules are published

### Issue: Logo not showing
**Solution:** 
- Verify file at `public/images/logotab.png`
- Check filename is lowercase
- Clear browser cache

### Issue: Blank page after deploy
**Solution:**
- Check browser console for errors
- Verify build was successful
- Check routing configuration

---

## 📊 Monitoring & Analytics

### Firebase Console:
- Authentication: Track user count
- Firestore: Monitor database usage
- Hosting: Check bandwidth usage

### Performance:
- Lighthouse score in Chrome DevTools
- Real User Monitoring
- Error tracking

---

## 🔄 Update Deployment

### After making changes:

```bash
# Test locally
npm start

# Build new version
npm run build

# Deploy update
firebase deploy
# or
vercel --prod
# or
npm run deploy
```

Changes go live immediately!

---

## 💾 Backup Strategy

### Export Firestore Data:
```bash
firebase firestore:export gs://YOUR_BUCKET/backups/$(date +%Y%m%d)
```

### Regular Backups:
- Before event: Export initial state
- After event: Export final results
- Weekly: Export user data

---

## 📞 Support During Event

### Emergency Access:
1. Admin Panel: `/#/admin`
2. Firebase Console: https://console.firebase.google.com
3. Hosting Dashboard: Check deployment status

### Quick Fixes:
- Registration stuck: Toggle open/close
- User issues: Use delete/reset controls
- Projector frozen: Refresh page
- Connection issues: Check Firebase status

---

## ✅ Final Pre-Event Checklist

**24 Hours Before:**
- [ ] Test full event flow
- [ ] Verify all passwords work
- [ ] Check mobile responsiveness
- [ ] Test with multiple devices
- [ ] Backup Firestore data

**1 Hour Before:**
- [ ] Close registration
- [ ] Clear test data
- [ ] Initialize fresh state
- [ ] Test projector on display
- [ ] Share URLs with team

**During Event:**
- [ ] Monitor Firebase console
- [ ] Have admin panel open
- [ ] Keep backup plan ready
- [ ] Track user count

**After Event:**
- [ ] Export final data
- [ ] Close registration
- [ ] Backup results
- [ ] Generate reports

---

## 🎉 You're Ready!

Your Enactus Bidding App is:
- ✅ Secure and production-ready
- ✅ Mobile responsive
- ✅ Real-time enabled
- ✅ Admin-controlled
- ✅ Professional UI
- ✅ Fully featured

**Deploy command:**
```bash
npm run build && firebase deploy
```

**Live URL:** Will be provided after deployment

**Good luck with your Enactus orientation event! 🚀**
