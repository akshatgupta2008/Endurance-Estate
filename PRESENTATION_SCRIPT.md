# Real Estate Marketplace — 3-Person Presentation Script

Use this as a talk track + slide plan. Adjust timings depending on your required duration.

## Suggested timing
- Total: 9–12 minutes
- Speaker 1 (Backend): ~3–4 min
- Speaker 2 (Database): ~3–4 min
- Speaker 3 (Frontend + AI + Blockchain + Demo/Wrap): ~3–4 min

---

## Slide plan (who speaks + what to say)

### Slide 1 — Title + Problem (Speaker 3, 30–45s)
**Goal:** set context and what the app solves.
- “We built a full-stack real-estate marketplace that supports property listings, rentals, auctions, maintenance requests, and an AI-based price estimate.”
- “Two big gaps we targeted: estimating a fair price quickly and making agreements/maintenance workflows more transparent and trackable.”
- “We’ll split the presentation: Backend, Database, and then UI + AI/Blockchain + demo flow.”

Handoff: “I’ll hand over to Speaker 1 to cover the backend services and APIs.”

---

### Slide 2 — High-level Architecture (Speaker 1, 45–60s)
**Key message:** clean separation: Next.js UI + API routes, plus a Python ML service.
- “Frontend is Next.js (App Router).”
- “We also use Next.js API routes for server-side actions like sending emails.”
- “For price prediction, we run a separate Python/FastAPI backend so the ML model lives outside the UI runtime.”

Code anchors:
- FastAPI service: src/app.py
- Next.js API route example: src/app/api/send-mtnc-to-owner/route.ts
- Docker compose orchestration: docker-compose.yml

---

### Slide 3 — Backend Part 1: ML Prediction API (Speaker 1, 60–90s)
**Key message:** FastAPI endpoint takes structured features and returns a predicted price.
- “The ML backend is implemented in FastAPI.”
- “It loads a trained model once at startup and exposes a `/predict/` endpoint.”
- “Input fields are things like Area, Bedrooms, Bathrooms, Floors, YearBuilt, Location, Condition, Garage.”
- “Categorical values like Location and Condition are encoded before inference.”
- “We added CORS so the Next.js frontend can call it directly in dev and Docker.”

Code anchor:
- src/app.py

Optional one-liner if asked about model:
- “The model is loaded via `joblib` and used for inference. In a production system, we’d version models and validate inputs more strictly.”

---

### Slide 4 — Backend Part 2: Next.js API Routes (Speaker 1, 60–90s)
**Key message:** server-side capabilities (email) live behind `/api/*` routes.
- “We use Next.js route handlers as lightweight backend endpoints.”
- “Example: maintenance requests trigger an email to the owner using Nodemailer.”
- “This keeps secrets like email app passwords server-side via environment variables.”

Code anchor:
- src/app/api/send-mtnc-to-owner/route.ts

Handoff: “That’s the backend services layer; next Speaker 2 will cover how we store and retrieve data in Firebase/Firestore.”

---

### Slide 5 — Database Overview (Speaker 2, 45–60s)
**Key message:** Firebase = Auth-ready + Firestore for data + Storage for images.
- “We used Firebase as our managed backend data layer: Firestore for documents and Firebase Storage for property images.”
- “Firestore fits well because listings, maintenance requests, and agreements are document-shaped and evolve over time.”

Code anchors:
- Firebase initialization: src/firebase/firebase.ts

---

### Slide 6 — Firestore Collections + Data Flow (Speaker 2, 90–120s)
**Key message:** show concrete CRUD flows.
- “`properties` collection stores property listings (title, price, address, beds/baths, image URL, status, timestamps).”
- “When creating a property, we upload the image to Firebase Storage, then write the Firestore doc containing the Storage download URL.”
- “Maintenance workflow uses `maintenanceRequests` documents; tenants create requests, owners update the request status (e.g., Completed).”
- “Agreements are stored under `agreements` to keep a verifiable record of transaction metadata (agreementId, hash/tx id, parties, price, dates).”

Code anchors (examples):
- Create listing + upload image: src/app/auction-form/page.tsx
- Read listings: src/components/auction-comp/auction-list/page.tsx
- Tenant maintenance request creation: src/components/tenant/maintainance-form/page.tsx
- Owner maintenance status update: src/app/owner-maintainance/page.tsx
- Agreement property fetch: src/app/agreement/page1.tsx
- Agreement Firestore write helper: src/utils/blockchain.js

If asked about IDs:
- “Firestore document IDs are used for detail pages; the UI passes the id via query params and fetches the corresponding doc.”

Handoff: “Now that you’ve seen how data is stored, Speaker 3 will wrap up with the UI modules, AI feature integration, and blockchain agreement workflow.”

---

### Slide 7 — Frontend Modules + User Journeys (Speaker 3, 60–90s)
**Key message:** what users can do end-to-end.
- “The UI is built with Next.js pages/components and Tailwind for styling.”
- “Main user journeys include: browse listings, view details, rent/buy flow, auctions/listing creation, AI price prediction, and maintenance portal for tenant/owner.”

Code anchors (examples):
- Prediction UI: src/components/predict/page.tsx
- Property details: src/app/property-details/page.tsx
- Rentals filtered view: src/app/rental-property/page.tsx

---

### Slide 8 — AI + Blockchain Agreements + Close (Speaker 3, 90–120s)
**AI Price Prediction**
- “The prediction screen collects property features and calls the FastAPI `/predict/` endpoint.”
- “The result is returned as JSON and displayed immediately to the user.”

**Blockchain Agreements**
- “For agreements, we generate a SHA-256 hash of the agreement data and submit it to a smart contract via Ethers.js when a wallet is available.”
- “If no wallet is available, we fall back to a simulated transaction so the user flow still works for demos.”
- “We also support verification by checking the transaction receipt.”

Code anchors:
- Prediction fetch call: src/components/predict/page.tsx
- Blockchain utility: src/utils/blockchain.js
- Agreement UI + verification: src/app/agreement/page1.tsx

Close:
- “So overall: Next.js for UI and server routes, Python/FastAPI for ML inference, Firebase for persistent data + images, and blockchain to strengthen agreement integrity.”
- “Happy to walk through any one feature in more detail.”

---

## Quick “speaker cards” (one paragraph each)

### Speaker 1 — Backend (30-second summary)
“We run two backend layers: a Python/FastAPI microservice for ML inference and Next.js API routes for server-side tasks like email notifications. We handle CORS for local/Docker calls and keep credentials in environment variables.”

### Speaker 2 — Database (30-second summary)
“We use Firebase Firestore for core entities like properties, maintenance requests, and agreements, plus Firebase Storage for listing images. The UI reads/writes documents with Firestore queries, and owners can update maintenance status through Firestore updates.”

### Speaker 3 — Remaining (30-second summary)
“The Next.js UI covers listings, property details, rentals, auctions, maintenance portals, and the AI prediction page. The agreement workflow uses Ethers.js for blockchain interaction, with a simulated fallback for demos, and writes transaction metadata to Firestore.”
