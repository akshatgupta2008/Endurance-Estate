# Real Estate Marketplace 🏡

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![Docker](https://img.shields.io/badge/Docker-20.10-blue?logo=docker)

A modern, full-stack real estate platform featuring AI-powered price predictions, property auctions, and secure blockchain-based agreement generation.

## ✨ Key Features

*   **Property Listings**: Browse, search, and filter properties for sale, rent, or auction.
*   **AI Price Prediction**: Get an estimated market value for a property based on its features using a machine learning model.
*   **Blockchain Agreements**: Generate, sign, and verify property agreements on the blockchain for enhanced security and transparency.
*   **Maintenance Portal**: A dedicated system for tenants to submit maintenance requests and for owners to manage them.
*   **User Authentication**: Secure user sign-up and login functionality powered by Firebase.
*   **Responsive UI**: A clean and modern user interface built with Next.js and Tailwind CSS.

## 🏗️ Architecture & Tech Stack

This project uses a microservices-oriented architecture, containerized with Docker for consistency and ease of deployment. The frontend is a Next.js application, which communicates with a separate Python backend for machine learning tasks.

### Architecture Diagram

```
+------------------------+      +-------------------------+
|      End User          |      |       Firebase          |
| (Web Browser)          |      | (Authentication & DB)   |
+------------------------+      +-------------------------+
           ^                            ^      ^
           |                            |      |
           v                            |      |
+------------------------+              |      |
|  Frontend (Next.js)    |              |      |
|  - UI Components       |--------------+      |
|  - Page Routing        |                     |
|  - API Routes          |                     |
+------------------------+                     |
           |                                   |
           | (HTTP API Call)                   |
           v                                   v
+------------------------+      +-------------------------+
|  Backend (Python/FastAPI)|    | Blockchain Interaction  |
|  - ML Price Prediction |      | (Ethers.js in Frontend) |
+------------------------+      +-------------------------+

```

### Tech Stack

*   **Frontend**: [Next.js](https://nextjs.org/) (React), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com/)
*   **Backend (ML)**: [Python](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Scikit-learn](https://scikit-learn.org/)
*   **Database & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Firebase Auth)
*   **Blockchain**: [Ethers.js](https://ethers.io/) (for frontend interaction)
*   **Containerization**: [Docker](https://www.docker.com/), [Docker Compose](https://docs.docker.com/compose/)

### 📂 Folder Structure

```
/
├── src/
│   ├── app/                # Next.js App Router: Pages and API routes
│   │   ├── api/            # Next.js API endpoints
│   │   └── (pages)/        # UI pages for different routes
│   ├── components/         # Reusable React components
│   ├── firebase/           # Firebase configuration and initialization
│   ├── utils/              # Utility functions (e.g., blockchain.js)
│   └── app.py              # FastAPI application entry point
├── public/                 # Static assets (images, models)
├── house_price_model.pkl   # Pre-trained machine learning model
├── Dockerfile              # Docker config for the Next.js frontend
├── Dockerfile.python       # Docker config for the Python backend
└── docker-compose.yml      # Defines and runs the multi-container setup
```

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

*   [Git](https://git-scm.com/)
*   [Node.js](https://nodejs.org/) (v18 or later)
*   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose

### Installation & Setup


1.  **Firebase Configuration:**
    *   Create a new project on the [Firebase Console](https://console.firebase.google.com/).
    *   Go to **Project settings** > **Service accounts** and generate a new private key. This will download a JSON file.
    *   Go to **Project settings** > **General** and find your web app's Firebase configuration object.
    *   Update the configuration in `src/firebase/firebase.ts` with your project's credentials.

2.  **Environment Variables:**
    Create a `.env.local` file in the root directory for your frontend environment variables (if any).
    ```
    NEXT_PUBLIC_API_URL=http://localhost:8000
    ```

3.  **Run with Docker Compose:**
    This is the simplest way to start the entire application (frontend and backend).
    ```bash
    docker-compose up --build -d
    ```

    *   The frontend will be available at `http://localhost:3000`.
    *   The backend API will be available at `http://localhost:8000`.

## 🔌 API Endpoints

The application exposes two sets of APIs: the Python backend for ML and Next.js API routes for server-side frontend tasks.

### Python (FastAPI) Backend

Base URL: `http://localhost:8000`

| Method | Endpoint      | Description                                       |
| :----- | :------------ | :------------------------------------------------ |
| `POST` | `/predict`    | Predicts house price based on input features.     |
| `GET`  | `/docs`       | Serves interactive API documentation (Swagger UI).|

**POST `/predict`**

*   **Request Body**:
    ```json
    {
      "location": "Sample Location",
      "bhk": 3,
      "bath": 2,
      "sqft": 1500
    }
    ```
*   **Success Response (200)**:
    ```json
    {
      "prediction": 5500000
    }
    ```

### Next.js API Routes

Base URL: `http://localhost:3000/api`

| Method | Endpoint                  | Description                               |
| :----- | :------------------------ | :---------------------------------------- |
| `POST` | `/price-predict`          | A proxy to the Python backend's `/predict` endpoint. |
| `POST` | `/send-mtnc-to-owner`     | Submits a maintenance request from a tenant to a property owner. |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/YourFeature`).
6.  Open a Pull Request.

## 📜 License

This project is licensed under the MIT License. See the `LICENSE` file for details.
