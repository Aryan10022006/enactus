# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Enable **Firestore Database** and **Anonymous Authentication**
4. Copy your Firebase config from Project Settings

### Step 3: Update Configuration

Open `src/firebase.js` and replace:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### Step 4: Run the App

```bash
npm start
```

Visit `http://localhost:3000`

---

## 📱 Three Views

1. **Attendee View**: `http://localhost:3000` or `http://localhost:3000/#/`
2. **Admin View**: `http://localhost:3000/#/admin`
3. **Projector View**: `http://localhost:3000/#/projector`

---

## 🎯 Event Workflow

### Before the Event
1. Pre-register team members in Firestore:
   - Collection: `event/enactus-orientation-2025/users`
   - Document ID: any unique ID
   - Fields:
     ```json
     {
       "name": "Team Member Name",
       "role": "team",
       "wallet": 0
     }
     ```

### During the Event

#### Admin Steps:
1. Open `#/admin`
2. Click "Open On-Spot Registration" (auto-closes in 10 minutes)
3. After registration closes, click "Distribute Wallets"
4. Add all projects using "Add New Project"
5. Click "Start Pitch" for the first project
6. When done, click "End Current Pitch"
7. Repeat for all projects

#### Attendee Steps:
1. Open the main URL
2. Register with their name
3. Wait for wallet distribution
4. Place bids when pitches are active

#### Projector Setup:
1. Open `#/projector` on the main screen
2. Full-screen the browser (F11)
3. Display shows live updates automatically

---

## 💰 Budget Configuration

Default: ₦100,000 total
- 60% (₦60,000) for team members
- 40% (₦40,000) for attendees

To change, edit `src/firebase.js`:
```javascript
export const TOTAL_BUDGET = 100000;
export const TEAM_BUDGET_PERCENTAGE = 0.6;
export const ATTENDEE_BUDGET_PERCENTAGE = 0.4;
```

---

## 🔥 Firebase Setup Checklist

- [ ] Create Firebase project
- [ ] Enable Firestore Database
- [ ] Enable Anonymous Authentication
- [ ] Copy Firebase config to `src/firebase.js`
- [ ] Set Firestore security rules (see README.md)
- [ ] Pre-register team members in Firestore

---

## 🐛 Common Issues

**"Firebase not initialized"**
→ Update `firebaseConfig` in `src/firebase.js`

**"No users found"**
→ Pre-register team members in Firestore console

**"Bids not updating"**
→ Check Firestore security rules and internet connection

---

## 📞 Need Help?

See the full [README.md](./README.md) for detailed documentation.
