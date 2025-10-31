# Admin User Management Guide

## 🎯 Overview
The admin panel now has full control over all users - view, manage, reset, and delete both team members and attendees.

---

## 👥 User Management Features

### 1. **View All Registrations**
Admin sees two lists:
- **Team Members** (yellow badges)
- **Regular Attendees** (gray badges)

Each user card shows:
- Name
- User ID (first 8 characters)
- Role badge (Team/Attendee)
- Wallet status badge (if wallet given)
- Current wallet balance
- Action buttons

---

### 2. **Delete User** (Red Trash Icon)
**What it does:**
- Permanently deletes the user from the database
- Removes ALL their bids from all projects
- Refunds bid amounts back to pool
- Cannot be undone

**When to use:**
- User registered by mistake
- Duplicate registration
- User needs to be completely removed

**Process:**
1. Click red trash icon
2. Confirm deletion prompt
3. User and all their bids deleted
4. Changes take effect immediately

**Example:**
```
User: John Doe
Wallet: ₹5,000
Bids: ₹3,000 on Project A, ₹1,500 on Project B

After deletion:
- John Doe removed from database
- Project A: John's ₹3,000 bid removed
- Project B: John's ₹1,500 bid removed
- Total ₹4,500 returned to pool
```

---

### 3. **Reset Wallet** (Orange Undo Icon)
**What it does:**
- Removes all user's bids from projects
- Restores original wallet amount
- User can bid again from scratch
- User account remains active

**When to use:**
- User made wrong bids
- Want to give user fresh start
- Testing purposes
- User requests reset

**Process:**
1. Click orange undo icon
2. Confirm reset prompt
3. All bids removed
4. Wallet restored to original distributed amount
5. User can immediately start bidding again

**Example:**
```
Original wallet: ₹10,000
Spent: ₹7,000 (across 3 projects)
Current wallet: ₹3,000

After reset:
- All 3 bids removed from projects
- Wallet restored to: ₹10,000
- User starts fresh
```

---

### 4. **Toggle Role** (Blue Shield/Users Icon)
**What it does:**
- Converts Team Member ↔ Attendee
- Changes budget allocation
- Updates user privileges
- Keeps wallet and bids intact

**When to use:**
- User registered in wrong category
- Role change requested
- Adjusting team composition

**Process:**
1. Click blue icon (shield for team, users for attendee)
2. Confirm role change
3. User role updated immediately
4. Wallet amount may change based on new role allocation

**Icons:**
- **FaUserShield** (in team members list) → Change to Attendee
- **FaUsers** (in attendees list) → Change to Team Member

**Example:**
```
Team Member → Attendee:
- Original: ₹10,000 (60% share)
- Changed to: ₹6,667 (40% share)
- Role badge updates from "Team" to "Attendee"

Attendee → Team Member:
- Original: ₹6,667 (40% share)
- Changed to: ₹10,000 (60% share)
- Role badge updates from "Attendee" to "Team"
```

---

## 🎨 Visual UI Elements

### User Card Layout:
```
┌──────────────────────────────────────────────────┐
│ [Avatar] John Doe                    ₹5,000      │
│          ID: a1b2c3d4...             [🛡][↻][🗑] │
│          [Team] [Wallet Given]                   │
└──────────────────────────────────────────────────┘
```

### Badge Colors:
- **Yellow**: Team Member role
- **Gray**: Attendee role
- **Green**: Wallet already distributed
- **Blue**: Action buttons
- **Orange**: Reset action
- **Red**: Delete action

### Icons:
- **FaUserShield**: Team member (shield icon)
- **FaUsers**: Regular users/attendees
- **FaWallet**: Wallet balance indicator
- **FaUndo**: Reset wallet action
- **FaTrash**: Delete user action

---

## 🔒 Security Confirmations

All destructive actions require confirmation:

### Delete User:
```
Confirm Dialog:
"Are you sure you want to delete John Doe? 
This will remove all their bids and cannot be undone."

[Cancel] [Delete]
```

### Reset Wallet:
```
Confirm Dialog:
"Reset John Doe's wallet? 
This will clear their bids and restore their original wallet amount."

[Cancel] [Reset]
```

### Toggle Role:
```
Confirm Dialog:
"Change John Doe to Team Member?"
or
"Change John Doe to Attendee?"

[Cancel] [Change]
```

---

## 📊 Admin Dashboard Sections

### 1. **Participant Overview**
- Total participant count
- Team members count (yellow badge)
- Attendees count (gray badge)
- Visual counters

### 2. **Team Members List**
- Scrollable list (max height 96 units)
- Each member card with actions
- Yellow/gold gradient avatars
- Team badge prominent

### 3. **Attendees List**
- Scrollable list (max height 96 units)
- Each attendee card with actions
- Gray gradient avatars
- Attendee badge

### 4. **Action Buttons**
All buttons are:
- Touch-friendly (44px min height)
- Color-coded by function
- Tooltip on hover
- Smooth transitions
- Disabled during processing

---

## 🔄 Workflow Examples

### Scenario 1: Remove Duplicate Registration
```
Problem: Same person registered twice

Steps:
1. Find duplicate user in list
2. Click red trash icon
3. Confirm deletion
4. Duplicate removed
5. Original user remains

Result: Clean participant list
```

### Scenario 2: User Made Wrong Bids
```
Problem: User bid on wrong projects

Steps:
1. Find user in list
2. Click orange undo icon
3. Confirm reset
4. User's wallet restored
5. User can bid again

Result: User gets fresh start
```

### Scenario 3: Wrong Role Assignment
```
Problem: Attendee should be team member

Steps:
1. Find user in attendees list
2. Click blue shield icon
3. Confirm role change
4. User moves to team members list
5. Wallet updated to team allocation

Result: User in correct category
```

### Scenario 4: Clean Slate for Testing
```
Testing scenario:

Steps:
1. For each test user:
   - Click reset wallet
   - Restore original amounts
2. All bids cleared
3. Event ready for re-testing

Result: Fresh test environment
```

---

## ⚠️ Important Notes

### What Happens When You Delete:
✅ User document deleted from Firestore
✅ All bids removed from all projects
✅ User cannot access system anymore
❌ Cannot be undone
❌ User must re-register to participate

### What Happens When You Reset:
✅ All bids removed from projects
✅ Wallet restored to original amount
✅ User account remains active
✅ User can immediately bid again
❌ Bid history lost

### What Happens When You Toggle Role:
✅ User role flag updated
✅ Wallet amount may adjust
✅ User remains registered
✅ Bids remain intact
⚠️ Wallet doesn't auto-adjust if already distributed

---

## 💡 Best Practices

### Before Deleting:
- Confirm it's the right user
- Check if reset is better option
- Understand all bids will be removed
- Know deletion is permanent

### Before Resetting:
- Communicate with user first
- Understand their bid history will be lost
- Consider if partial reset is possible
- Know wallet returns to original amount

### Before Changing Role:
- Verify user consent
- Understand budget implications
- Check if wallet redistribution needed
- Communicate new allocation to user

### During Event:
- Minimize deletions
- Use reset for corrections
- Document role changes
- Monitor wallet distribution

---

## 🎯 Admin Panel Layout

```
┌─────────────────────────────────────────────┐
│ Participant Overview                        │
│ ├─ Team Members: [5]                        │
│ └─ Attendees: [15]                          │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Registered Team Members                     │
│ ┌────────────────────────────────────────┐ │
│ │ [👤] Alice      ₹10,000 [🛡][↻][🗑]   │ │
│ │ [👤] Bob        ₹8,500  [🛡][↻][🗑]   │ │
│ │ [👤] Carol      ₹10,000 [🛡][↻][🗑]   │ │
│ └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Registered Attendees                        │
│ ┌────────────────────────────────────────┐ │
│ │ [👤] David      ₹6,667  [🛡][↻][🗑]   │ │
│ │ [👤] Emma       ₹6,667  [🛡][↻][🗑]   │ │
│ │ [👤] Frank      ₹5,000  [🛡][↻][🗑]   │ │
│ └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 🔐 Security Features

### Access Control:
- Only admin can see these controls
- Password protected admin panel
- All actions logged in console
- Confirmation dialogs prevent accidents

### Data Protection:
- Batch operations for consistency
- Transaction-safe deletions
- Real-time state updates
- Error handling and rollback

### User Privacy:
- User IDs truncated in display
- Full IDs only in database
- Wallet amounts visible to admin only
- Bid details protected

---

## 📱 Mobile Responsive

All controls work on:
- 📱 Phones (stacked buttons)
- 📱 Tablets (partial rows)
- 💻 Desktops (full layout)
- 🖥️ Large screens (expanded)

Button sizes:
- Minimum 44px touch targets
- Clear spacing between actions
- Tooltips on hover
- Visual feedback on click

---

## ✅ Summary

**Admin Can:**
- ✅ View all team members
- ✅ View all attendees
- ✅ Delete any user permanently
- ✅ Reset any user's wallet
- ✅ Convert team ↔ attendee
- ✅ See wallet balances
- ✅ Track wallet distribution status
- ✅ Manage users mid-event

**Admin Cannot:**
- ❌ Manually adjust wallet amounts (must redistribute)
- ❌ Recover deleted users
- ❌ Undo deletions
- ❌ Edit user names directly

---

## 🎓 Quick Reference

| Action | Icon | Color | Effect |
|--------|------|-------|--------|
| Delete User | 🗑️ FaTrash | Red | Permanent removal |
| Reset Wallet | ↻ FaUndo | Orange | Restore original wallet |
| Toggle Role | 🛡️/👥 | Blue | Change team/attendee |
| View Details | - | - | See user info |

---

**Status:** ✅ Full admin control implemented
**Security:** ✅ All actions confirmed
**UI:** ✅ Professional and aesthetic
**Mobile:** ✅ Fully responsive

All user management features are production-ready!
