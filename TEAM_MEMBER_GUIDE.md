# Team Member Access Guide

## Overview
Team members have special access to the bidding platform with enhanced privileges:
- **60% of total budget** (vs 40% for regular attendees)
- Separate login with secret code
- Same bidding capabilities as attendees

## How to Access

### Team Member URL
```
https://your-app-url.com/#/team
```

### Secret Code
```
enactus2025team
```

**Important:** Keep this code confidential and only share with authorized team members.

## Team Member Flow

### 1. Login
- Navigate to `/#/team`
- Enter the secret code: `enactus2025team`
- Click "Join as Team Member"

### 2. Registration
- Enter your name
- Click "Join Event"
- Your profile is marked as a team member automatically

### 3. Wait for Wallet Distribution
- Admin closes registration
- Admin distributes wallets
- Team members receive 60% share of total budget
- Regular attendees receive 40% share

### 4. Bidding
- Same interface as regular attendees
- Place bids on active pitches
- Update bids anytime during a pitch
- View real-time leaderboard

## Budget Distribution Example

**Total Budget:** ₹100,000

**Scenario 1: 2 Team Members + 8 Attendees**
- Team pool: ₹60,000 (60%)
- Attendee pool: ₹40,000 (40%)
- Each team member: ₹30,000
- Each attendee: ₹5,000

**Scenario 2: 5 Team Members + 15 Attendees**
- Team pool: ₹60,000 (60%)
- Attendee pool: ₹40,000 (40%)
- Each team member: ₹12,000
- Each attendee: ₹2,667

## Admin Management

### View Team Members
Admins can see:
- List of all registered team members
- Their wallet balances
- Team vs Attendee count

### Distribute Wallets
When admin clicks "Distribute Wallets Now":
1. Total budget is split 60/40
2. Team member pool divided equally among team members
3. Attendee pool divided equally among attendees
4. Wallets updated in real-time

## Features

### Team Member Identification
- Yellow badge on leaderboard
- "Team Member" label visible to all participants
- Special icon in bid lists

### Bidding Rules
- Can bid on any active pitch
- Can update/change bids
- Previous bid amount refunded when updating
- Can't bid more than wallet balance

### Logout
- Team members can logout anytime
- Session persists in browser (localStorage)
- Logout redirects to home page

## Technical Details

### Authentication
- Secret code stored in component: `enactus2025team`
- Session stored in localStorage: `teamAuth`
- No backend password verification (client-side only)

### Database Flag
Users are stored with:
```javascript
{
  name: "Team Member Name",
  wallet: 12000,
  isTeamMember: true,
  registeredAt: "2025-10-31T..."
}
```

### Routing
- Team login: `/#/team` (shows TeamMemberLogin)
- After authentication: Shows TeamMemberPage
- Authenticated state persists across page refreshes

## Security Considerations

1. **Change Secret Code:** Update `TEAM_SECRET_CODE` in `TeamMemberLogin.jsx`
2. **Backend Validation:** Consider adding server-side validation
3. **Code Rotation:** Change secret code for each event
4. **Access Control:** Monitor who has access to the code

## Troubleshooting

### Can't Login
- Check if secret code is correct
- Clear browser localStorage
- Try incognito/private mode

### Wallet Not Distributed
- Wait for admin to close registration
- Admin must click "Distribute Wallets Now"
- Check that registration is closed

### Bidding Issues
- Ensure pitch is active
- Check wallet balance
- Verify bid amount is positive
- Check internet connection

## Mobile Responsiveness

The team member interface is fully responsive:
- Touch-friendly buttons (min 44px height)
- Optimized for mobile screens
- Works on all device sizes
- Tested on iOS and Android browsers

## Support

For technical issues or questions, contact the admin or developer.
