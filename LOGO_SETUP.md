# Logo Setup Instructions

## Adding the Enactus Logo

To use your Enactus logo in the application:

### Option 1: Create the images folder

1. Create a folder structure in your `public` directory:
   ```
   public/
   └── images/
       └── logotab.png
   ```

2. Place your Enactus logo file (PNG format recommended) as `logotab.png`

### Option 2: Use a different path

If your logo is in a different location, update the image source in these files:

- `src/components/AdminLogin.jsx` (line ~19)
- `src/components/Header.jsx` (line ~11)
- `src/pages/AdminPage.jsx` (line ~66)
- `src/pages/AttendeePage.jsx` (lines in registration/waiting/user info sections)
- `src/pages/ProjectorPage.jsx` (line ~21)

Change:
```jsx
<img src="/images/logotab.png" alt="Enactus Logo" />
```

To your logo path, for example:
```jsx
<img src="/assets/enactus-logotab.png" alt="Enactus Logo" />
```

### Option 3: Use a fallback letter

If you don't add a logo, the app will automatically show a yellow circle with the letter "E" as a fallback.

### Recommended Logo Specifications

- **Format**: PNG with transparent background
- **Size**: 500x500 pixels (square)
- **Colors**: Works best with dark or colorful logos (yellow background is used)
- **File size**: Under 100KB for fast loading

---

## Admin Password

The default admin password is: **`enactus2025`**

To change it, edit `src/components/AdminLogin.jsx` line 13:

```javascript
if (password === 'enactus2025') {  // Change this password
```

---

## Accessing the App

After adding the logo and starting the app:

### For Attendees:
- URL: `http://localhost:3000/`
- No password required

### For Admin:
- URL: `http://localhost:3000/#/admin`
- Password: `enactus2025` (or your custom password)
- The admin link is hidden from the main navigation for security

### For Projector:
- URL: `http://localhost:3000/#/projector`
- No password required
- Use full-screen mode (F11) for best display

---

## Testing the Logo

1. Place your logo at `public/images/logotab.png`
2. Run `npm start`
3. Check these pages:
   - Admin login page (before entering password)
   - Header on attendee/projector pages
   - Admin dashboard header
   - Attendee registration card
   - Projector header

If the logo doesn't appear, check the browser console (F12) for errors.

---

## UI Enhancements Added

✅ **Password-protected admin page** with animated login
✅ **Logo integration** across all pages
✅ **Gradient backgrounds** for modern look
✅ **Enhanced cards** with shadows and borders
✅ **Animated elements** (pulse, shake, float)
✅ **Emoji icons** for visual appeal
✅ **Improved typography** with better hierarchy
✅ **Responsive design** for all screen sizes
✅ **Logout functionality** for admin
✅ **Hidden admin link** from public navigation

---

**Note**: The admin URL (`#/admin`) should be kept secret and only shared with event organizers.
