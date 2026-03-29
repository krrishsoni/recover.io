# 🛡️ RecoverAI: Intelligent Post-Op Recovery Management

> **"Recover faster, safer, and smarter."**

RecoverAI is a state-of-the-art, AI-powered healthcare platform designed to bridge the gap between post-operative patients and their caregivers. By leveraging real-time data synchronization and advanced Large Language Models, RecoverAI ensures a proactive and transparent recovery journey.

---

## 🌟 Key Features

### 👨‍⚕️ For Caregivers (The Command Center)
- **Live Ward Monitoring**: A dynamic, Bento-style dashboard providing real-time visibility into every patient's recovery status.
- **AI Intelligence (NVIDIA Llama 3.1)**: Ask complex ward-level questions like *"Who had the highest pain today?"* or *"Summarize patient check-ins."*
- **One-Click Medical Reports**: Generate professional medical summaries via voice commands, saved directly to patient records.
- **Smart Alerts**: Instant visual indicators for critical metrics like high fever, severe pain, or wound health warnings.

### 🤕 For Patients (Your Personal Recovery Guide)
- **Intuitive Check-ins**: Log pain, mood, temperature, and symptoms in seconds via a mobile-optimized interface.
- **Daily Task Roadmap**: Never miss a medication or exercise with a personalized, guided checklist.
- **24/7 Recovery Partner AI**: Chat with a medical-trained AI to answer concerns (*"Is my swelling normal?"*) and receive emotional support.
- **Gamified Progress**: Earn XP, maintain streaks, and celebrate milestones to stay motivated during difficult recovery phases.

---

## 🛠️ Technology Stack

RecoverAI uses a premium, high-performance tech stack for a seamless user experience:

- **Frontend Core**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Real-time Engine**: [Firebase Cloud Firestore](https://firebase.google.com/)
- **Identity & Security**: [Firebase Auth](https://firebase.google.com/docs/auth)
- **Medical AI (NIM)**: [NVIDIA NVIDIA Llama 3.1 8B](https://www.nvidia.com/en-us/ai-data-science/generative-ai/nim/)
- **Voice Recognition**: [Vosk Browser](https://alphacephei.com/vosk/) (Offline-first speech-to-text)
- **Visual Systems**: [Recharts](https://recharts.org/) (Data Trends) & [Framer Motion](https://www.framer.com/motion/) (Micro-animations)
- **Design Language**: Glassmorphism with [Tailwind CSS](https://tailwindcss.com/)

---

## 📑 Core Functionality

### 1. Unified AI Assistant
A single, role-aware AI component serves both roles. It automatically switches context based on the logged-in user, ensuring strict data privacy for patients and comprehensive data access for caregivers.

### 2. Patient Enrollment & Sync
Registering a new patient immediately populates the caregiver's dashboard via real-time listeners. No refreshing is ever required to see new data.

### 3. Trend Analytics
RecoverAI plots daily metrics over time, allowing caregivers to identify recovery patterns and intervene before complications arise.

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Project Credentials
- NVIDIA NIM API Key

### Installation & Launch
1. **Clone & Install**:
   ```bash
   git clone [repository-url]
   cd recoverai-app
   npm install
   ```
2. **Setup Environment**:
   Create a `.env` file in the root:
   ```env
   VITE_FIREBASE_API_KEY=your_key
   VITE_NVIDIA_API_KEY=your_key
   ```
3. **Run**:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment
RecoverAI is optimized for **Vercel**. 
The project includes a `vercel.json` file to handle **Edge Network Proxying**, which bypasses CORS restrictions and ensures the AI chatbot works flawlessly on mobile devices.

---
*Created with ❤️ by the RecoverAI Team.*
