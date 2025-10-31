# Pre-Deployment Checklist

## ✅ Before You Deploy

### 1. Firebase Configuration
- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Anonymous authentication enabled
- [ ] Security rules configured and published
- [ ] Firebase config added to `src/firebase.js`

### 2. Security
- [ ] Admin password changed from default
- [ ] Team member secret code changed from default
- [ ] `.env.production` not committed to Git
- [ ] API keys secured

### 3. Assets
- [ ] Logo added to `public/images/logotab.png`
- [ ] Logo file size optimized (<500KB)
- [ ] Logo displays correctly on all pages

### 4. Testing
- [ ] App runs locally without errors (`npm start`)
- [ ] Admin login works
- [ ] Team member login works
- [ ] Registration flow works
- [ ] Wallet distribution works
- [ ] Bidding works
- [ ] Real-time updates work
- [ ] Projector view works
- [ ] Mobile responsive
- [ ] All user management controls work

### 5. Build
- [ ] No compilation errors
- [ ] No console warnings (except CSS @tailwind)
- [ ] Build completes successfully (`npm run build`)
- [ ] Build size reasonable (<2MB)

---

## 🚀 Deployment Steps

### Option 1: Firebase Hosting (Recommended)

**Windows:**
```bash
deploy.bat
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

**Manual:**
```bash
npm install
npm run build
firebase deploy
```

### Option 2: Vercel
```bash
npm install -g vercel
vercel --prod
```

### Option 3: Netlify
1. Drag `build` folder to https://app.netlify.com/drop
2. Or: `npm install -g netlify-cli && netlify deploy --prod`

---

## 📋 Post-Deployment

### 1. Verify Deployment
- [ ] Visit deployed URL
- [ ] All routes work (/, /admin, /team, /projector)
- [ ] Logo displays
- [ ] No 404 errors
- [ ] Firebase connection works

### 2. Initialize Database
First deployment only - Create in Firestore:
```
Collection: events
Document: default
Subcollection: state
Document: state
Fields:
  - registration_open: false
  - current_pitch_id: null
  - registration_expires_at: null
```

### 3. Share URLs

**Attendees:**
```
https://YOUR_DOMAIN.com/#/
```

**Team Members:**
```
https://YOUR_DOMAIN.com/#/team
Code: [your-secret-code]
```

**Admin:**
```
https://YOUR_DOMAIN.com/#/admin
Password: [your-admin-password]
```

**Projector:**
```
https://YOUR_DOMAIN.com/#/projector
```

---

## 🧪 Quick Test Script

Run these tests after deployment:

### 1. Admin Panel
- Go to `/#/admin`
- Enter admin password
- Open registration
- Add a test project
- Close registration

### 2. Attendee Registration
- Go to `/#/`
- Register with test name
- Wait on wallet screen

### 3. Wallet Distribution
- Back to admin panel
- Click "Distribute Wallets"
- Verify attendee gets wallet

### 4. Bidding
- Admin: Start a pitch
- Attendee: Place a bid
- Verify bid appears

### 5. Projector
- Go to `/#/projector`
- Verify current pitch shows
- Verify leaderboard updates
- Check statistics display

### 6. Team Member
- Go to `/#/team`
- Enter secret code
- Register as team member
- Verify higher wallet amount

---

## 🔧 Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase Deploy Fails
```bash
firebase logout
firebase login
firebase deploy
```

### Logo Not Showing
- Check file exists: `public/images/logotab.png`
- Check filename is lowercase
- Clear browser cache
- Redeploy

### Real-time Not Working
- Verify Firestore rules published
- Check anonymous auth enabled
- Open browser console for errors

### Routes Not Working
- Verify `firebase.json` has rewrites
- Check single-page app configuration
- Clear CDN cache

---

## 📊 Performance Optimization

### Before Deployment:
- [ ] Optimize images (use TinyPNG)
- [ ] Remove console.logs
- [ ] Minimize bundle size
- [ ] Enable compression

### After Deployment:
- [ ] Run Lighthouse audit
- [ ] Check load time (<3s)
- [ ] Test on slow network
- [ ] Monitor Firebase quota

---

## 🔐 Security Checklist

- [ ] Firestore rules restrict to authenticated users
- [ ] Admin password is strong (>12 characters)
- [ ] Team code is unique
- [ ] No API keys in public code
- [ ] HTTPS enabled (automatic with Firebase)
- [ ] Anonymous auth rate limited

---

## 📱 Device Testing

Test on:
- [ ] iPhone (Safari)
- [ ] Android (Chrome)
- [ ] Tablet (iPad)
- [ ] Desktop (Chrome, Firefox, Edge)
- [ ] Large screen (projector/TV)

---

## 🎯 Event Day Checklist

### 2 Hours Before:
- [ ] Fresh deployment
- [ ] Clear test data
- [ ] Initialize clean state
- [ ] Test all flows
- [ ] Charge all devices

### 1 Hour Before:
- [ ] Close registration
- [ ] Share URLs with team
- [ ] Setup projector display
- [ ] Verify network connection
- [ ] Have backup internet ready

### During Event:
- [ ] Monitor Firebase console
- [ ] Keep admin panel open
- [ ] Track user registrations
- [ ] Watch for errors
- [ ] Be ready to assist users

### After Event:
- [ ] Export data from Firestore
- [ ] Close registration permanently
- [ ] Backup results
- [ ] Generate reports
- [ ] Thank participants!

---

## ✅ Final Check

Before going live:
- [ ] All items above checked
- [ ] Team briefed on URLs
- [ ] Backup plan ready
- [ ] Support person assigned
- [ ] Event flow documented

---

## 🎉 Ready to Deploy!

If all checks pass, run:
```bash
npm run build && firebase deploy
```

Your app will be live at:
```
https://YOUR_PROJECT_ID.firebaseapp.com
```

**Good luck with your event! 🚀**
