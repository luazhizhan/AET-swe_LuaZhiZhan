# AET-swe_LuaZhiZhan

## About the project

A realtime multiplayer tic-tac-toe web application that focuses on accessibility for all users.

## Getting Started

Setup and run the project locally on your workstation.

### Installation

1. [Node.js](https://nodejs.org/en/)

### Setup

1. Create a [Firebase project](https://firebase.google.com/) with `Annoymous Authentication` and `Realtime Database`.

2. Update `Realtime Database` security rules.

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

2. Clone this repo.

3. Install packages

```bash
npm install
```

4. Create `.env` file with the following variables at the root directory of this repo. These values can be found in your Firebase project.

```text
NEXT_PUBLIC_FIREBASE_KEY=<KEY>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<DOMAIN>
NEXT_PUBLIC_FIREBASE_DATABASE_URL=<URL>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<ID>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<BUCKET>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<ID>
NEXT_PUBLIC_FIREBASE_APP_ID=<ID>
```

5. Start application in development mode

```bash
npm run dev
```

### Code analysis

`Eslint` is configured for the project. `a11y` plugin has been added to check for issues with accessbility.

```bash
npm run lint
```
