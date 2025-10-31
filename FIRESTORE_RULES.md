# Firebase Security Rules

Use these Firestore security rules for production deployment.

## Copy these rules to Firebase Console → Firestore Database → Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Event data rules
    match /event/{eventId}/{document=**} {
      // Allow all authenticated users to read
      allow read: if request.auth != null;
      
      // Allow authenticated users to write to their own user document
      allow create, update: if request.auth != null 
        && request.resource.data.keys().hasAll(['name', 'role', 'wallet'])
        && request.auth.uid == request.resource.id;
      
      // State document - allow all authenticated users to read/write (admin only in production)
      match /state {
        allow read: if request.auth != null;
        allow write: if request.auth != null; // TODO: Restrict to admin users only
      }
      
      // Projects - allow authenticated users to read, admins to write
      match /projects/{projectId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null; // TODO: Restrict to admin users only
      }
      
      // Users - allow read for authenticated, write for own document
      match /users/{userId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null && request.auth.uid == userId;
        allow update: if request.auth != null; // Needed for transactions
      }
      
      // Bids - allow authenticated users to create, all to read
      match /bids/{bidId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null 
          && request.resource.data.userId == request.auth.uid;
      }
    }
  }
}
```

## Development Rules (Less Restrictive)

For testing and development, you can use simpler rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /event/{eventId}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Important Notes

1. **Authentication Required**: All rules require `request.auth != null`, meaning users must be signed in (even anonymously)
2. **Admin Protection**: In production, implement proper admin role checking for state and project modifications
3. **Transaction Support**: User wallet updates allow writes from any authenticated user to support Firestore transactions
4. **Bid Logging**: Users can only create bids with their own userId

## Implementing Admin Roles (Advanced)

To restrict admin operations, add a custom claim or admin role field:

```javascript
// Add this function to check admin status
function isAdmin() {
  return request.auth.token.admin == true;
}

// Use in rules
match /state {
  allow read: if request.auth != null;
  allow write: if isAdmin();
}
```

Set admin custom claims using Firebase Admin SDK or Firebase Functions.
