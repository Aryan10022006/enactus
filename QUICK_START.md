# 🚀 Quick Start Guide - Enactus Bidding Platform

## ✨ What's New in v2.0

### 🎯 Team Member Access
- Special login for team members with secret code
- 60% of total budget allocated to team members
- 40% allocated to regular attendees

### 📱 Mobile Responsive
- Optimized for smartphones and tablets
- Touch-friendly buttons and inputs
- Works on all screen sizes

### 🎨 Professional UI
- Replaced emojis with high-quality icons
- Modern, clean interface
- Consistent design language

## 🔐 Access Information

### For Team Members
- **URL:** `http://localhost:3000/#/team`
- **Secret Code:** `enactus2025team`
- **Benefits:** Get 60% share of total budget

### For Attendees
- **URL:** `http://localhost:3000/#/`
- **Registration:** Name only
- **Benefits:** Get 40% share of total budget

### For Admin
- **URL:** `http://localhost:3000/#/admin`
- **Password:** `enactus2025`
- **Access:** Full event control

### For Projector Display
- **URL:** `http://localhost:3000/#/projector`
- **Purpose:** Large screen display for audience

## 📋 Event Flow

### 1. Pre-Event Setup (Admin)
```
1. Navigate to /#/admin
2. Enter password: enactus2025
3. Add projects with descriptions
4. Open registration (auto-closes in 10 min)
```

### 2. Team Member Registration
```
1. Share secret code: enactus2025team
2. Team members go to /#/team
3. Enter secret code
4. Register with name
```

### 3. Attendee Registration
```
1. Attendees go to /#/
2. Register with name
3. Wait for wallet distribution
```

### 4. Wallet Distribution (Admin)
```
1. Close registration
2. Click "Distribute Wallets Now"
3. 60% split among team members
4. 40% split among attendees
```

### 5. Bidding Phase
```
For each project:
1. Admin clicks "Start Pitch"
2. Users place/update bids
3. Real-time leaderboard updates
4. Admin clicks "End Pitch"
5. Repeat for next project
```

### 6. Display Results
```
1. Open /#/projector on large screen
2. Shows current pitch
3. Shows live leaderboard
4. Auto-updates in real-time
```

## 💰 Budget Example

**Total Budget:** ₹100,000

**Scenario:** 3 Team Members + 7 Attendees

```
Team Member Pool: ₹60,000 (60%)
├─ Team Member 1: ₹20,000
├─ Team Member 2: ₹20,000
└─ Team Member 3: ₹20,000

Attendee Pool: ₹40,000 (40%)
├─ Attendee 1: ₹5,714
├─ Attendee 2: ₹5,714
├─ Attendee 3: ₹5,714
├─ Attendee 4: ₹5,714
├─ Attendee 5: ₹5,714
├─ Attendee 6: ₹5,714
└─ Attendee 7: ₹5,716
```

## 📱 Mobile Usage Tips

### For Best Experience:
- Use portrait mode for registration
- Use landscape for bidding (optional)
- Ensure stable internet connection
- Keep screen brightness up
- Disable auto-lock during event

### Touch Gestures:
- Tap buttons (44px minimum size)
- Scroll through leaderboards
- Pinch to zoom on projector (if needed)

## 🔧 Admin Controls

### Registration Control
- **Open:** Starts 10-minute registration window
- **Close:** Manually close anytime
- **Auto-close:** Happens after 10 minutes

### Team Member Management
- View all registered team members
- See wallet balances
- Monitor team vs attendee count

### Wallet Distribution
- Must close registration first
- Automatically splits 60/40
- Cannot be undone (refresh page if error)

### Project Management
- Add projects with name and description
- Start pitch (only one active at a time)
- End pitch (stops bidding for that project)

## 🎯 Bidding Rules

### All Users Can:
- Bid on active pitches only
- Update/change bids anytime
- Get refund when updating bid
- See real-time leaderboard

### Restrictions:
- Can't bid more than wallet balance
- Can't bid on inactive projects
- Can't bid negative amounts
- Must wait for pitch to start

## 📊 Leaderboard Features

### Attendee/Team View:
- Shows current bids for active pitch
- Highlights your bid
- Shows team member badges
- Real-time updates

### Projector View:
- Shows all projects ranked by total bids
- Highlights currently pitching project
- Shows bid counts
- Large, readable text for audience

## 🐛 Troubleshooting

### Can't Login
```
Team: Check secret code (case-sensitive)
Admin: Check password (case-sensitive)
Both: Try clearing localStorage
```

### Wallet Not Received
```
1. Check if registration is closed
2. Wait for admin to distribute
3. Refresh page
4. Check Firebase connection
```

### Bidding Not Working
```
1. Check internet connection
2. Verify pitch is active (admin started it)
3. Check wallet balance
4. Try smaller bid amount
5. Refresh page
```

### Firebase Errors
```
1. Check Firebase console
2. Verify anonymous auth is enabled
3. Check Firestore rules
4. Verify API key is correct
```

## 🔒 Security Notes

### For Production:
1. **Change Secret Codes:**
   - Admin password in `AdminLogin.jsx`
   - Team secret code in `TeamMemberLogin.jsx`

2. **Update Firebase Rules:**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /events/{eventId}/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
     }
   }
   ```

3. **Environment Variables:**
   - Move Firebase config to `.env`
   - Never commit secrets to git

## 📞 Support Contacts

**Technical Issues:**
- Check console errors (F12)
- Review Firebase logs
- Contact developer

**Event Management:**
- Contact admin
- Reference this guide
- Check TEAM_MEMBER_GUIDE.md

## 🎓 Training Checklist

### Before Event:
- [ ] Test all routes work
- [ ] Verify Firebase connection
- [ ] Test on mobile devices
- [ ] Practice admin workflow
- [ ] Test projector display
- [ ] Charge all devices
- [ ] Prepare backup plan

### During Event:
- [ ] Admin device ready
- [ ] Projector connected
- [ ] WiFi stable
- [ ] Backup hotspot available
- [ ] Support person available

### After Event:
- [ ] Export results (if needed)
- [ ] Announce winners
- [ ] Collect feedback
- [ ] Archive data

## 📈 Success Metrics

Track these during event:
- Total participants (team + attendees)
- Total bids placed
- Average bid amount
- Participation rate
- Technical issues count

## 🎉 Tips for Smooth Event

1. **Start Early:** Begin 15 min before scheduled time
2. **Test First:** Do a dry run with test users
3. **Monitor Closely:** Watch for connection issues
4. **Communicate:** Announce each phase clearly
5. **Have Backup:** Paper forms if tech fails
6. **Stay Calm:** Technical issues happen, have a plan

## 📚 Additional Resources

- `README.md` - General project info
- `FIREBASE_SETUP_GUIDE.md` - Firebase configuration
- `TEAM_MEMBER_GUIDE.md` - Detailed team member docs
- `UPDATE_SUMMARY.md` - Complete changelog

---

**Version:** 2.0
**Last Updated:** October 31, 2025
**Platform:** React + Firebase + Tailwind CSS

**Good luck with your event! 🚀**
