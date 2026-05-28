# 🤖 Prepwise: AI-Powered Job Interview Preparation Platform

Prepwise is a modern, web-based interview preparation platform designed to help candidates ace their job interviews. Powered by **Vapi AI voice agents** and **Google Gemini**, Prepwise provides a realistic, real-time voice interview experience. Candidates can practice real technical, behavioral, or mixed questions and receive instant, comprehensive performance feedback to level up their skills.

---

## ⚙️ Technology Stack & Tools Used

Prepwise is built using a modern, robust, and highly responsive technology stack:

*   **Frontend Framework**: [Next.js](https://nextjs.org/) (App Router & React 19)
*   **Voice Interface**: [Vapi AI Web SDK](https://vapi.ai/) for low-latency, real-time speech-to-speech conversational agents.
*   **Database & Auth**: [Firebase](https://firebase.google.com/) (Firebase Auth for secure authentication and Firestore for storing interview history, transcript records, and feedback metrics).
*   **AI Engine**: [Google Gemini API](https://ai.google.dev/) for generating intelligent post-interview reviews and category scoring.
*   **Styling & UI Components**: [Tailwind CSS](https://tailwindcss.com/) for fluid responsive styling and modern dark-mode aesthetic, plus [Lucide React](https://lucide.dev/) icons.
*   **Validation**: [Zod](https://zod.dev/) for robust client/server data schemas.
*   **Formatting Utilities**: [Day.js](https://day.js.org/) for clean date/time rendering.

---

## 🌟 Features and Functionalities Implemented

*   🔐 **Secure Authentication**: Built-in Sign-in and Sign-up modules using Firebase Auth to keep user data and interview histories private and secure.
*   📊 **Candidate Dashboard**: A central feed display showing past interview records, custom cover illustrations, final scores, and completion statuses.
*   🎙️ **Real-time Live Audio Room**:
    *   Immersive side-by-side call panel tracking both the AI Interviewer and the user.
    *   Concentric audio wave ripple animations synced to the AI agent's speech.
    *   Active microphone indicator and clean connect/disconnect control states.
    *   Dynamic, scrollable transcript bubble showing live conversation history.
*   📈 **Instant Automated Feedback & Grading**:
    *   Overall score calculation out of 100 points.
    *   Categorized performance breakdown (e.g., communication, technical clarity, problem-solving).
    *   Actionable list of strengths and specific areas needing improvement.
    *   A cohesive summary evaluation that guides next steps.
*   🛡️ **Robust Edge Case Handling**: Improved handling for Vapi websocket errors, network disconnects, and microphone permission rejections to prevent runtime app crashes.

---

## 🚀 Installation & Execution Steps

Follow these steps to run Prepwise locally on your machine:

### Prerequisites
Make sure you have the following installed:
*   [Git](https://git-scm.com/)
*   [Node.js](https://nodejs.org/) (v18.x or higher recommended)
*   [npm](https://www.npmjs.com/) (Node Package Manager)

### 1. Clone the Repository
```bash
git clone https://github.com/adrianhajdin/ai_mock_interviews.git
cd ai_mock_interviews
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a file named `.env.local` in the root of the project and populate it with your API keys:

```env
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id
NEXT_PUBLIC_VAPI_ASSISTANT_ID=your_vapi_assistant_id

GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Firebase Client configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin configuration
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
```

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your web browser to access the application.

---

## 👥 Team Members

*   **Yash Thakur** (Lead Full-Stack Developer & AI Integrations)

---

## 🖼️ Project Screenshots & Output

Below are previews of the user interface and platform output:

| Dashboard Feed | Live Voice Interview Room |
| --- | --- |
| ![Dashboard Output Placeholder](https://placehold.co/600x400/0d0e12/ffffff?text=Dashboard+Feed+Preview) | ![Interview Room Placeholder](https://placehold.co/600x400/0d0e12/ffffff?text=Live+Voice+Interview+Room) |

| AI Performance Feedback |
| --- |
| ![Feedback Report Placeholder](https://placehold.co/1200x600/0d0e12/ffffff?text=AI+Generated+Score+Card+%26+Competency+Breakdown) |