# Enactus Orientation - Real-Time Bidding App

A standalone, real-time bidding web application for Enactus freshers' orientation event. Built with React and Firebase Firestore for seamless real-time synchronization across multiple devices.

## 🚀 Features

- **Real-time Bidding**: Live updates across all devices using Firebase Firestore
- **Multi-View Interface**: 
  - Attendee view for registration and bidding
  - Admin panel for event management
  - Projector view for large-screen displays
- **Wallet System**: Automated budget distribution between team members and attendees
- **Anonymous Authentication**: Simple Firebase anonymous auth for users
- **Dark Theme**: Enactus-branded dark mode with yellow accents

## 📁 Project Structure

```
src/
├── App.jsx                      # Main app with routing and auth
├── firebase.js                  # Firebase configuration
├── components/
│   ├── Header.jsx              # Reusable header component
│   └── LoadingSpinner.jsx      # Loading component
├── hooks/
│   ├── useEventState.js        # Event state real-time listener
│   ├── useUserData.js          # User data real-time listener
│   └── useProjects.js          # Projects real-time listener
└── pages/
    ├── AdminPage.jsx           # Admin control panel
    ├── AttendeePage.jsx        # Attendee registration & bidding
    └── ProjectorPage.jsx       # Projector display view
```

## 🔧 Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Firestore Database** (start in production mode or test mode)
3. Enable **Anonymous Authentication**:
   - Go to Authentication → Sign-in method
   - Enable Anonymous authentication
4. Get your Firebase configuration:
   - Go to Project Settings → General
   - Scroll to "Your apps" and click the web icon (</>)
   - Copy the `firebaseConfig` object

### 3. Configure the Application

Open `src/firebase.js` and replace the placeholder configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};

// Update the APP_ID to your event identifier
export const APP_ID = 'enactus-orientation-2025';
```

### 4. Install Dependencies

```bash
npm install
```

Required dependencies:
- `react`
- `react-dom`
- `firebase`
- `tailwindcss` (configured)

### 5. Run the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## 🎯 Usage Guide

### Pre-Event Setup (Admin)

1. **Pre-register Team Members**:
   - Go to Firebase Console → Firestore Database
   - Create documents in `event/{APP_ID}/users/` collection
   - Add team members with:
     ```json
     {
       "name": "Team Member Name",
       "role": "team",
       "wallet": 0
     }
     ```

### Event Flow

#### Step 1: Start Registration (Admin)
- Navigate to `#/admin`
- Click "Open On-Spot Registration"
- Registration will auto-close after 10 minutes

#### Step 2: Attendee Registration
- Attendees go to the main URL (`#/`)
- Enter their name to register
- Wait for wallet distribution

#### Step 3: Distribute Wallets (Admin)
- After registration closes, click "Distribute Wallets"
- Budget distribution:
  - **60%** to team members (split equally)
  - **40%** to attendees (split equally)
  - Total budget: ₦100,000 (configurable in `firebase.js`)

#### Step 4: Add Projects (Admin)
- Enter project names and click "Add New Project"
- Add all pitching teams before starting

#### Step 5: Live Bidding
- **Admin**: Click "Start Pitch" for the first project
- **Projector** (`#/projector`): Displays the current pitch and live leaderboard
- **Attendees**: Can now place bids on the current project
- **Real-time**: All bids update instantly across all devices

#### Step 6: Next Pitch (Admin)
- Click "End Current Pitch"
- Click "Start Pitch" for the next project
- Repeat until all projects have pitched

## 🎨 Views Explained

### Attendee View (`#/` or `http://localhost:3000`)
- **Phase 1**: Registration form (when registration is open)
- **Phase 2**: Waiting screen (after registration closes)
- **Phase 3**: Bidding interface (when a pitch is active)
  - Shows current project name
  - Displays live total bid
  - Shows user's remaining wallet
  - Bid placement with validation

### Admin View (`#/admin`)
- **Registration Control**: Open/close registration
- **Wallet Distribution**: Automated budget calculation and distribution
- **Project Management**: Add new projects
- **Pitch Control**: Start/end pitches for each project
- **Status Messages**: Real-time feedback on actions

### Projector View (`#/projector`)
- **NOW PITCHING Display**: Large, prominent display of current project
- **Live Total Bid**: Updates in real-time as bids come in
- **Live Leaderboard**: All projects ranked by total bid
- **Visual Highlights**: Current pitch highlighted in yellow
- **Rank Badges**: Gold, Silver, Bronze for top 3 projects

## 🗄️ Firestore Database Structure

```
event/
└── {APP_ID}/
    ├── state/                          (Singleton document)
    │   ├── registration_open: boolean
    │   ├── current_pitch_id: string|null
    │   └── registration_expires_at: timestamp|null
    │
    ├── users/                          (Collection)
    │   └── {userId}/
    │       ├── name: string
    │       ├── role: 'team' | 'attendee'
    │       └── wallet: number
    │
    ├── projects/                       (Collection)
    │   └── {projectId}/
    │       ├── name: string
    │       └── total_bid: number
    │
    └── bids/                           (Collection - for logging)
        └── {bidId}/
            ├── userId: string
            ├── projectId: string
            ├── amount: number
            └── timestamp: serverTimestamp
```

## 🔐 Firestore Security Rules

Add these rules in Firebase Console → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /event/{eventId}/{document=**} {
      // Allow read access to all authenticated users
      allow read: if request.auth != null;
      
      // Allow write access to state document (for admin)
      allow write: if request.auth != null;
    }
  }
}
```

**Note**: For production, implement more restrictive rules based on user roles.

## ⚙️ Configuration Options

In `src/firebase.js`, you can customize:

```javascript
// Event identifier
export const APP_ID = 'enactus-orientation-2025';

// Total budget for the event
export const TOTAL_BUDGET = 100000;

// Budget split percentages
export const TEAM_BUDGET_PERCENTAGE = 0.6;    // 60% for teams
export const ATTENDEE_BUDGET_PERCENTAGE = 0.4; // 40% for attendees
```

## 🚢 Deployment

### Deploy to Netlify

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy the `build` folder to Netlify:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod
   ```

### Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

## 🎨 Styling

The app uses **Tailwind CSS** with an Enactus-branded dark theme:

- **Background**: `bg-gray-900` (dark gray/black)
- **Accent Color**: `text-yellow-400`, `bg-yellow-400` (bright yellow)
- **Font**: System sans-serif (Inter recommended)

To customize styles, modify the Tailwind classes in the component files.

## 🐛 Troubleshooting

### Issue: "Firebase not initialized"
- Ensure you've replaced the `firebaseConfig` in `src/firebase.js`
- Check that Firebase services are enabled in the console

### Issue: "No users found for wallet distribution"
- Pre-register at least one team member in Firestore
- Ensure attendees have registered during the registration phase

### Issue: "Bids not updating in real-time"
- Check your internet connection
- Verify Firestore is enabled and has correct security rules
- Check browser console for errors

### Issue: "Anonymous authentication failed"
- Ensure Anonymous auth is enabled in Firebase Console
- Check Firebase project settings

## 📝 License

This project is created for the Enactus orientation event. Feel free to modify and use for your events.

## 🤝 Support

For issues or questions, please contact the development team or refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ for Enactus Orientation 2025**
