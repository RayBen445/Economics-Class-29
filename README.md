<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# LAUTECH Economics Portal - Modern Firebase Edition

A modern, TypeScript-first community portal for LAUTECH Economics Class of '29, featuring Firebase authentication, Firestore database, and role-based access control.

## 🚀 Features

### Authentication & Security
- **Firebase Authentication** with email/password
- **Email Verification** required for account access
- **Password Reset** functionality
- **Password Visibility Toggle** with eye icon for enhanced UX
- **Role-Based Access Control** (Student, Admin, Class President)
- **Auth State Persistence** across sessions

### User Management
- **Firestore User Profiles** with real-time sync
- **Profile Management** with editable user information
- **Profile Image Upload** with live preview and validation
- **Role-based UI** showing/hiding features based on permissions
- **Account Status Management** (active, suspended, banned)

### Modern UI/UX
- **Responsive Design** that works on all devices
- **Loading States** and error handling throughout
- **Toast Notifications** for user feedback
- **Clean, Modern Interface** with intuitive navigation
- **Email Verification Prompts** with resend functionality
- **Interactive Profile Image Upload** with hover effects and live preview
- **Password Visibility Toggle** for improved accessibility and usability

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Firebase (Authentication + Firestore)
- **UI:** Custom CSS with modern design principles
- **Notifications:** React Hot Toast
- **State Management:** React Hooks + Firebase Realtime Updates

## 📋 Prerequisites

- Node.js (v16 or higher)
- Firebase account and project
- Git

## 🔧 Firebase Setup

1. **Create a Firebase Project:**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Create a project"
   - Follow the setup wizard

2. **Enable Authentication:**
   - In Firebase Console, go to "Authentication" → "Sign-in method"
   - Enable "Email/Password" provider
   - Configure authorized domains if needed

3. **Set up Firestore Database:**
   - Go to "Firestore Database"
   - Click "Create database"
   - Choose "Start in test mode" for development
   - Select a location close to your users

4. **Get Firebase Configuration:**
   - Go to Project Settings → General → Your apps
   - Click "Add app" → Web app
   - Copy the configuration object

## 💻 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RayBen445/Economics-Class-29.git
   cd Economics-Class-29
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure Firebase:**
   Edit `.env.local` with your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   ```

## 👤 User Roles

### Student (Default)
- View announcements and content
- Manage personal profile
- Access student features

### Admin
- Full access to admin panel
- User management capabilities
- Content moderation
- System settings

### Class President
- Elevated permissions
- Can manage class-specific content
- Access during maintenance mode

## 🔐 Security Features

- **Email Verification:** All users must verify their email before accessing the portal
- **Password Security:** Firebase handles secure password storage and validation
- **Role-Based Routes:** Certain pages restricted based on user role
- **Session Management:** Automatic auth state persistence and cleanup
- **Error Handling:** Comprehensive error handling with user-friendly messages

## 📱 Responsive Design

The portal is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📟 Tablets (768px+)
- 💻 Desktop computers (1024px+)

## 🎨 Modern UI Components

- **Loading Spinners:** Elegant loading states
- **Toast Notifications:** Non-intrusive user feedback
- **Email Verification Prompts:** Clear verification workflow
- **Profile Management:** Intuitive profile editing
- **Error Boundaries:** Graceful error handling

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── LoadingSpinner.tsx
│   ├── ProtectedRoute.tsx
│   ├── SignInForm.tsx
│   ├── SignUpForm.tsx
│   ├── ForgotPasswordForm.tsx
│   └── EmailVerificationPrompt.tsx
├── pages/              # Page components
│   ├── AuthPage.tsx
│   └── ProfilePage.tsx
├── hooks/              # Custom React hooks
│   ├── useFirebaseAuth.ts
│   ├── useProfile.ts
│   └── useLocalStorage.ts
├── utils/              # Utility functions
│   ├── firebase.ts     # Firebase configuration and helpers
│   ├── constants.ts    # App constants
│   └── fileUtils.ts    # File handling utilities
├── types/              # TypeScript type definitions
│   └── index.ts
└── styles/             # CSS and styling
    └── index.ts
```

## 🚀 Deployment

This project is optimized for deployment on:

- **Vercel** (recommended)
- **Netlify**
- **Firebase Hosting**
- Any static hosting service

### Vercel Deployment

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 🔄 Migration from Legacy Version

This version maintains backward compatibility while adding modern Firebase features:

- **Legacy localStorage data** can be manually migrated to Firestore
- **User accounts** need to be recreated with email verification
- **Admin accounts** should be set up with the designated admin email

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team
- Check the documentation

## 📄 License

This project is private and intended for LAUTECH Economics Class of '29.

## 🙏 Acknowledgments

- LAUTECH Economics Department
- Class of '29 community
- Firebase team for excellent documentation
- React and TypeScript communities
