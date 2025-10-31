# 🔧 Firebase Permissions Fix Guide

## Problem
You're seeing this error:
```
FirebaseError: Missing or insufficient permissions
```

This happens because Firestore security rules are blocking read/write operations.

## Quick Fix (5 minutes)

### Step 1: Open Firebase Console
1. Go to https://console.firebase.google.com
2. Select your project: **enactus-5ebcb**
3. Click on **Firestore Database** in the left menu

### Step 2: Update Security Rules
1. Click on the **Rules** tab at the top
2. Replace ALL existing rules with the rules below
3. Click **Publish**

### Step 3: Copy These Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow all authenticated users to read and write
    match /events/{eventId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Step 4: Verify Anonymous Auth is Enabled
1. Go to **Authentication** in Firebase Console
2. Click **Sign-in method** tab
3. Make sure **Anonymous** is **Enabled**
4. If not, click on it and enable it

### Step 5: Test
1. Refresh your app at http://localhost:3000
2. All errors should be gone
3. You should be able to register and use the app

---

## ⚠️ Important Notes

### For Development/Testing (Current Rules)
The rules above allow ANY authenticated user to read and write. This is fine for:
- Short-term events (1-2 hours)
- Controlled environment
- When you trust all participants

### For Production (More Secure)
If you want tighter security, use these rules instead:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Event state - anyone can read, only authenticated can write
    match /events/{eventId}/state/state {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    
    // Users - can only modify their own document
    match /events/{eventId}/users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false;
    }
    
    // Projects - anyone can read, authenticated can add bids
    match /events/{eventId}/projects/{projectId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if false;
    }
  }
}
```

---

## 🎯 Registration Control by Admin

The registration control is already in admin hands! Here's what admin controls:

### Admin Controls Everything:
1. ✅ **Open Registration** - Admin clicks button to open
2. ✅ **Close Registration** - Admin clicks button to close
3. ✅ **10-Minute Timer** - Auto-closes after 10 minutes
4. ✅ **Wallet Distribution** - Admin decides when to distribute
5. ✅ **Start/End Pitches** - Admin controls which project is active
6. ✅ **Add Projects** - Only admin can add new projects
7. ✅ **View All Users** - Admin sees all team members and attendees

### Users Cannot:
- ❌ Register when registration is closed
- ❌ Bid when no pitch is active
- ❌ Open/close registration
- ❌ Distribute wallets
- ❌ Add projects
- ❌ Start/end pitches

### Admin Password Protection:
- Admin panel protected by password: `enactus2025`
- No one can access admin panel without password
- Password stored locally after first login

---

## 📋 Quick Checklist

- [ ] Firebase Console opened
- [ ] Firestore Rules tab found
- [ ] New rules pasted and published
- [ ] Anonymous Auth enabled
- [ ] App refreshed
- [ ] Errors gone
- [ ] Registration working

---

## 🆘 Still Having Issues?

### Check Authentication:
```javascript
// Open browser console (F12)
// Type this:
firebase.auth().currentUser
// Should show a user object with uid
```

### Check Firestore Connection:
1. Open Firebase Console
2. Go to Firestore Database
3. Check if `events/enactus-orientation-2025` collection exists
4. Check if you can see data being written

### Common Issues:

**Issue:** "Auth is null"
**Fix:** Wait a few seconds, anonymous auth is initializing

**Issue:** "Still getting permission errors"
**Fix:** Make sure you clicked "Publish" after pasting rules

**Issue:** "Can't find Rules tab"
**Fix:** Make sure you're in Firestore Database, not Realtime Database

---

## 🔒 Budget Control

### Who Controls Budget Split?
**Admin controls the budget split** through the constants in `firebase.js`:

```javascript
export const TOTAL_BUDGET = 100000;
export const TEAM_BUDGET_PERCENTAGE = 0.6;  // 60% for teams
export const ATTENDEE_BUDGET_PERCENTAGE = 0.4;  // 40% for attendees
```

### To Change Budget:
1. Open `src/firebase.js`
2. Modify the constants:
   - `TOTAL_BUDGET` - Total amount available
   - `TEAM_BUDGET_PERCENTAGE` - Percentage for team members (0.6 = 60%)
   - `ATTENDEE_BUDGET_PERCENTAGE` - Percentage for attendees (0.4 = 40%)
3. Save the file
4. Refresh the app

### Examples:
```javascript
// 70% team, 30% attendees
export const TEAM_BUDGET_PERCENTAGE = 0.7;
export const ATTENDEE_BUDGET_PERCENTAGE = 0.3;

// 50% team, 50% attendees
export const TEAM_BUDGET_PERCENTAGE = 0.5;
export const ATTENDEE_BUDGET_PERCENTAGE = 0.5;

// Different total budget
export const TOTAL_BUDGET = 200000;  // ₹2 lakhs
```

---

## 📞 Need More Help?

1. Check Firebase Console for specific error messages
2. Open browser DevTools (F12) and check Console tab
3. Look for red error messages
4. Copy the full error and search for solutions

**Remember:** The permission error is normal for new Firebase projects. Just update the rules and you're good to go! 🚀
