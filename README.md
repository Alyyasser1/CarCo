# CarCo 🚗

An AI-powered automotive web app that helps users find their perfect car and diagnose car problems — built with React, TypeScript, Firebase, and an LLM API.

## Live Demo

🔗 [car-co-tawny.vercel.app](https://car-co-tawny.vercel.app)

## Tech Stack

- **Frontend** — React 18, TypeScript, Vite, React Router, CSS Modules
- **Auth** — Firebase Authentication (Email/Password + Google)
- **Database** — Firebase Firestore
- **AI** — OpenRouter API (meta-llama/llama-3.3-8b-instruct)
- **Deployment** — Vercel

## Features

- **Car Recommendation** — Select your preferred brands, category, year range, and requirements. The AI recommends 2-3 matching cars with specs, price range, pros, cons, and why it fits you.
- **Car Diagnosis** — Describe your car problem and get an AI diagnosis with causes, severity levels, estimated repair costs in EGP, fix steps, and whether you need a mechanic.
- **Authentication** — Email/password signup with email verification, Google sign-in, all via a modal — no separate auth page.
- **Session History** — Logged-in users get all their past recommendations and diagnoses saved to Firestore, accessible via a slide-in history drawer in the navbar.
- **Guest Access** — Users can use both services without signing in. Sessions are only saved for logged-in users.

## Notes

- Firestore is currently in test mode — security rules should be updated before any production use
- AI calls are made directly from the browser — the API key is exposed in the client. For production, proxy calls through a backend or Firebase Cloud Function
