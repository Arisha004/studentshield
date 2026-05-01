# 🛡️ StudentShield AI

> **Securing the Next Generation of Digital Citizens.**

StudentShield AI is a state-of-the-art fraud detection platform specifically engineered for students. By leveraging **Gemini AI**, it provides real-time protection against recruitment scams, phishing attempts, and social engineering attacks that target the academic community.

---

## 🚀 Problem Statement
Students are the **#1 target** for cyber-criminals due to financial pressure, high-volume job searching, and the frequent use of new digital platforms. Existing security tools often miss the nuanced "human" element of student-targeted scams like fake tuition emails or deceptive remote job offers. **StudentShield AI closes this gap.**

---

## ✨ Key Features

![StudentShield Landing Page](https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=2070)
*Visual representation of our high-impact security interface.*

- **🔍 AI Pre-Scanner:** Real-time text and vision analysis of suspicious messages (emails, WhatsApp, SMS).
- **👔 Recruiter Audit:** Forensic identity check of recruiters to prevent ID theft and resume harvesting.
- **🌐 URL Forensic Engine:** Deep technical analysis of links to catch typosquatting and malicious redirects.
- **📱 Mobile-First Design:** Full responsive support for students to check threats on the go.
- **🧠 Academy:** Interactive vulnerability quizzes to educate users on emerging scam trends.
- **📢 Community Wall:** Live, anonymous feed for reporting campus-specific threats.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS
- **AI Engine:** Google Gemini (Generative AI SDK)
- **Animations:** Motion (Framer Motion)
- **Icons:** Lucide React
- **Deployment:** Optimized for Google Cloud Run

---

## 📦 Setup & Installation

### Prerequisites
- Node.js (v18+)
- NPM or PNPM
- A Gemini API Key (from Google AI Studio)

### Steps
1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/student-shield-ai.git
   cd student-shield-ai
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   VITE_APP_NAME=StudentShield
   ```

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

---

## ☁️ Deployment (Google Cloud Run)

This project is container-ready. To deploy to Google Cloud Run:

1. **Build the container image:**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/studentshield
   ```

2. **Deploy to Cloud Run:**
   ```bash
   gcloud run deploy studentshield \
     --image gcr.io/YOUR_PROJECT_ID/studentshield \
     --platform managed \
     --allow-unauthenticated \
     --set-env-vars="GEMINI_API_KEY=your_key"
   ```

---

## 🏆 Hackathon: AI-SEEKHO 2026
**Developed with ♥ by Arisha Mumtaz**

---

## 🎨 Design Philosophy
The UI follows a **"Technical Elegance"** aesthetic—clean, authoritative, and fast. We use a glass-card system with high-contrast typography to ensure critical security information is always readable.

---

© 2026 StudentShield AI | Created by Arisha Mumtaz for AI-SEEKHO 2026.
