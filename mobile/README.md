# BANIBS Mobile App

## Phase M1 - Mobile Shell Foundation

Lightweight React Native foundation for BANIBS platform.

### Features
- ✅ Authentication (Login/Register)
- ✅ Home Screen
- ✅ Bottom Tab Navigation
- ✅ Social Container
- ✅ Messaging Container
- ✅ Settings Container
- ✅ BANIBS UI v2.0 Theming

### Architecture
- Modular screen components
- Centralized theme system
- Context-based state management
- Lightweight and performant

### Setup
```bash
cd mobile
npm install
# or
yarn install

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Structure
```
mobile/
├── src/
│   ├── screens/          # Screen components
│   ├── components/       # Reusable UI components
│   ├── navigation/       # Navigation configuration
│   ├── contexts/         # React Context providers
│   ├── services/         # API services
│   ├── theme/            # BANIBS UI v2.0 theme
│   └── utils/            # Utility functions
├── assets/               # Images, fonts
└── index.js              # App entry point
```
