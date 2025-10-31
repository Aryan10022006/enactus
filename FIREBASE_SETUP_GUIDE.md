# Firebase Setup Guide - Step by Step

## 📋 Complete Checklist

Follow these steps in order to set up Firebase for your bidding app:

---

## Step 1: Create Firebase Project

1. Go to **Firebase Console**: https://console.firebase.google.com/
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `Enactus-Bidding` (or your preferred name)
4. Click **Continue**
5. (Optional) Disable Google Analytics or keep it enabled
6. Click **Create project**
7. Wait for project creation (takes ~30 seconds)
8. Click **Continue** when ready

---

## Step 2: Register Your Web App

1. In your Firebase project dashboard, click the **Web icon** `</>`
   - It's in the center of the screen under "Get started by adding Firebase to your app"
   - Or find it in Project Settings
2. Enter app nickname: `Bidding App` (any name you want)
3. **Don't check** "Also set up Firebase Hosting" (unless you want to use it later)
4. Click **Register app**
5. **IMPORTANT**: Copy the `firebaseConfig` object that appears
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyA...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```
6. Click **Continue to console**

---

## Step 3: Enable Firestore Database

### 3.1 Create Database

1. In the left sidebar, click **"Build"** to expand it
2. Click **"Firestore Database"**
3. Click **"Create database"** button
4. Choose location:
   - **Production mode** (recommended for now)
   - Or **Test mode** if you want open access for 30 days
5. Select a location closest to your users (e.g., `us-central` or `asia-south1`)
6. Click **Enable**
7. Wait for database creation (~1-2 minutes)

### 3.2 Set Security Rules

1. Once database is created, click the **"Rules"** tab at the top
2. Replace the existing rules with these:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /event/{eventId}/{document=**} {
      // Allow all authenticated users to read and write
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **Publish**

**Note**: These are development-friendly rules. For production, use the more restrictive rules from `FIRESTORE_RULES.md`.

---

## Step 4: Enable Anonymous Authentication

### 4.1 Go to Authentication

1. In the left sidebar, under **"Build"**, click **"Authentication"**
2. Click **"Get started"** button (if it's your first time)

### 4.2 Enable Anonymous Sign-In

1. Click the **"Sign-in method"** tab at the top
2. You'll see a list of sign-in providers
3. Find **"Anonymous"** in the list (usually near the bottom of "Native providers")
4. Click on **"Anonymous"** row
5. Click the **Enable** toggle switch to turn it ON
6. Click **Save**

✅ **Anonymous authentication is now enabled!**

---

## Step 5: Pre-Register Team Members (Optional but Recommended)

Before the event, you should pre-register team members so they get the higher wallet allocation.

### 5.1 Go to Firestore

1. Click **"Firestore Database"** in the left sidebar
2. Click **"Start collection"** button

### 5.2 Create Event Structure

1. **Collection ID**: `event`
2. Click **Next**
3. **Document ID**: `enactus-orientation-2025` (or whatever you set as APP_ID)
4. Click **Next** (we'll add fields later)
5. Click **Save**

### 5.3 Add State Document

1. Click on the `enactus-orientation-2025` document you just created
2. Click **"+ Start collection"**
3. **Collection ID**: `state`
4. Click **Next**
5. **Document ID**: `state` (or use auto-ID)
6. Add fields:
   - Field: `registration_open` | Type: `boolean` | Value: `false`
   - Field: `current_pitch_id` | Type: `string` | Value: `null`
7. Click **Save**

### 5.4 Add Team Members

1. In the `enactus-orientation-2025` document view
2. Click **"+ Start collection"**
3. **Collection ID**: `users`
4. Click **Next**
5. For each team member:
   - **Document ID**: Click **"Auto-ID"** (generates random ID)
   - Add fields:
     - Field: `name` | Type: `string` | Value: `Team Member Name`
     - Field: `role` | Type: `string` | Value: `team`
     - Field: `wallet` | Type: `number` | Value: `0`
   - Click **Save**
6. Repeat for all team members

**Example structure**:
```
event/
  enactus-orientation-2025/
    state/
      state: { registration_open: false, current_pitch_id: null }
    users/
      randomId1: { name: "John Doe", role: "team", wallet: 0 }
      randomId2: { name: "Jane Smith", role: "team", wallet: 0 }
```

---

## Step 6: Configure Your App

### 6.1 Update firebase.js

1. Open `src/firebase.js` in your project
2. Find the `firebaseConfig` object (lines 13-19)
3. Replace it with the config you copied in **Step 2**:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",              // Paste your actual key
  authDomain: "your-project.firebaseapp.com",  // Paste your actual domain
  projectId: "your-project-id",                // Paste your actual ID
  storageBucket: "your-project.appspot.com",   // Paste your actual bucket
  messagingSenderId: "123456789",              // Paste your actual ID
  appId: "1:123456789:web:abc123"              // Paste your actual app ID
};
```

### 6.2 Update APP_ID (if needed)

If you used a different document ID in Firestore, update line 23:

```javascript
export const APP_ID = 'enactus-orientation-2025';  // Match your Firestore document ID
```

---

## Step 7: Test Your Setup

### 7.1 Start the App

```bash
npm start
```

### 7.2 Test Each View

1. **Test Attendee View** (`http://localhost:3000/`):
   - Open in browser
   - Check browser console for errors
   - Should show "Loading..." then registration form or waiting screen

2. **Test Admin View** (`http://localhost:3000/#/admin`):
   - Open in browser
   - Should see admin controls
   - Try clicking "Open Registration"

3. **Test Projector View** (`http://localhost:3000/#/projector`):
   - Open in browser
   - Should show "Waiting for the next pitch..." message

### 7.3 Check Browser Console

1. Press **F12** to open Developer Tools
2. Click **Console** tab
3. Look for any errors:
   - ❌ Red errors = something is wrong
   - ✅ No errors = setup successful!

---

## 🚨 Common Issues & Solutions

### Issue: "FirebaseError: Missing or insufficient permissions"

**Solution**: Check Firestore security rules
- Make sure you published the rules in Step 3.2
- Verify anonymous auth is enabled in Step 4.2

### Issue: "FirebaseError: Firebase: Error (auth/configuration-not-found)"

**Solution**: Firebase config is incorrect
- Double-check you copied the entire `firebaseConfig` object
- Make sure all fields are filled in `src/firebase.js`

### Issue: "Cannot read properties of undefined"

**Solution**: Firebase not initialized properly
- Verify you replaced the placeholder config with your actual Firebase config
- Check that you didn't miss any fields

### Issue: No data showing up

**Solution**: Check APP_ID matches
- The `APP_ID` in `src/firebase.js` must match your Firestore document ID
- Default is `enactus-orientation-2025`

---

## ✅ Verification Checklist

Before the event, verify:

- [ ] Firebase project created
- [ ] Web app registered and config copied
- [ ] Firestore Database enabled
- [ ] Security rules published
- [ ] Anonymous authentication enabled
- [ ] Event structure created in Firestore (`event/{APP_ID}/state`)
- [ ] Team members pre-registered with `role: "team"`
- [ ] `src/firebase.js` updated with actual config
- [ ] `APP_ID` matches Firestore document ID
- [ ] `npm install` completed successfully
- [ ] `npm start` runs without errors
- [ ] All three views load correctly
- [ ] No errors in browser console

---

## 📸 Visual Guide Summary

### Firebase Console Navigation:
```
Firebase Console (console.firebase.google.com)
├── Project Overview
├── Build (expand this)
│   ├── Authentication
│   │   └── Sign-in method → Enable "Anonymous"
│   ├── Firestore Database
│   │   ├── Data → Create structure
│   │   └── Rules → Set permissions
│   └── Storage (not needed)
└── Project Settings → Your apps → Web app config
```

### Firestore Structure to Create:
```
event/
  {APP_ID}/                          ← Document (e.g., "enactus-orientation-2025")
    state/                           ← Collection
      state/                         ← Document
        registration_open: false
        current_pitch_id: null
    users/                           ← Collection
      {randomId}/                    ← Document (auto-generated)
        name: "Team Member Name"
        role: "team"
        wallet: 0
```

---

## 🎯 What Happens After Setup

Once configured:

1. **Anonymous Auth**: Users automatically get a unique ID when they open the app
2. **Firestore**: Real-time listeners start syncing data
3. **Registration**: Attendees can register when admin opens it
4. **Bidding**: Everything updates live across all devices

---

## 🆘 Need Help?

If you encounter issues:

1. Check the **browser console** (F12) for error messages
2. Verify **all steps** were completed in order
3. Double-check **Firebase config** is correct
4. Ensure **Firestore rules** are published
5. Confirm **Anonymous auth** is enabled

---

**Next**: Once setup is complete, run `npm start` and test all three views!

Good luck with your Enactus orientation event! 🎉
