# RecoverAI: Intelligent Post-Op Recovery Management

RecoverAI is a state-of-the-art, AI-powered recovery platform designed to bridge the gap between post-operative patients and their caregivers. By leveraging real-time data synchronization and advanced Large Language Models, RecoverAI ensures a safer, more transparent recovery process.

## 🚀 Key Features

### 👨‍⚕️ For Caregivers (Nurses & Doctors)
- **Real-time Ward Monitoring**: A live "Bento-style" dashboard that updates instantly when patients submit check-ins.
- **AI-Powered Analysis**: An integrated voice assistant (NVIDIA Llama 3.1) that can answer questions like "Which patient has the highest pain?" or "Summarize today's tasks."
- **Automatic Medical Reports**: The AI can generate and save patient progress reports directly into medical records with a single voice command.
- **Priority Alerts**: Visual cues for patients requiring immediate attention (high fever, severe pain, or wound issues).

### 🤕 For Patients
- **Daily Recovery Tracking**: Simple, intuitive forms to log pain levels, mood, temperature, and symptoms.
- **Guided Tasks**: A personalized daily checklist for medications, physical therapy, and wound care.
- **Recovery Partner AI**: A dedicated chatbot to answer recovery-related questions ("Is a 101°F fever normal?") and provide moral support.
- **Gamification**: Interactive streaks and XP systems to keep patients motivated during their recovery journey.

## 🛠️ Technology Stack

RecoverAI is built using modern, high-performance web technologies:

- **Frontend**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/) & [TypeScript](https://www.typescriptlang.org/).
- **Database & Sync**: [Firebase Firestore](https://firebase.google.com/) for real-time, cross-device data synchronization.
- **Authentication**: [Firebase Auth](https://firebase.google.com/docs/auth) for secure patient/caregiver identity management.
- **Artificial Intelligence**: 
  - **LLM**: [NVIDIA NIM](https://www.nvidia.com/en-us/ai-data-science/generative-ai/nim/) (Meta Llama 3.1 8B) for medical context processing.
  - **Speech Processing**: [Vosk Browser](https://alphacephei.com/vosk/) for high-accuracy voice-to-text.
- **Styling & Animations**: [Tailwind CSS](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/) for a premium, glassmorphic UI.
- **Data Visualization**: [Recharts](https://recharts.org/) for tracking patient recovery trends visually.

## 📑 Core Functions

### 1. Unified AI Assistant
The AI assistant is role-aware. It understands whether it's talking to a caregiver (ward-level data) or a patient (personal data). It uses a "Single Source of Truth" speech engine to prevent word duplication and ensures context-aware responses.

### 2. Live Patient Dashboard
Caregivers can click on any patient to see their full history, charts of their pain trends over time, and a list of all successful/missed tasks.

### 3. Patient Enrollment
New patients can register via the dedicated Register page, where their profile is instantly created and synced to the global caregiver dashboard.

### 4. Interactive Check-ins
Patients perform daily check-ins using a multi-step form that captures vital metrics, which are then analyzed by the AI for any red flags.

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Account
- NVIDIA NIM API Key

### Installation
1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_NVIDIA_API_KEY=your_key
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment
RecoverAI is optimized for deployment on **Vercel**. It includes a specialized `vercel.json` configuration to handle Edge Function rewrites for bypassing CORS restrictions on NVIDIA's API.

---
**RecoverAI** — *Recover faster, safer, and smarter.*
