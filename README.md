# ContextPulse

**Privacy-First, Real-Time Behavioral Intent Inference Engine**

ContextPulse solves the **cold-start personalization problem**. Traditional personalization systems fail for anonymous visitors because there is no login, CRM profile, cookie history, or identity graph available. 

ContextPulse infers user intent within the first few seconds of a website visit using purely anonymous behavioral signals, generating a **64-dimensional intent vector**. This vector is then evaluated by our CORE AI engine to personalize content and layout dynamically—*before* the user's identity is ever known.

Built as an enterprise-grade prototype designed for integration into platforms like **Epsilon PeopleCloud**.

## 🚀 Key Features

- **Real-Time Behavioral SDK:** Lightweight client-side collectors tracking micro-behaviors natively in the browser without impacting performance.
  - **Scroll Dynamics:** Depth, velocity, direction changes, and section dwell times.
  - **Mouse & Pointer:** Velocity, acceleration, hover targets, click hesitation, and idle time.
  - **Engagement:** Product views, CTA interactions, comparison tool usage.
  - **Contextual:** Device type, viewport, time of day, session duration.
- **64-Dimensional Vector Generation:** Features are continuously extracted, normalized, and encoded into a 64-dim mathematical representation of the current session's behavior.
- **CORE AI Neural Inference:** Maps the intent vector against 8 distinct buyer archetypes (e.g., *Comparator, Deal Seeker, Impulse Buyer, Researcher*).
- **Zero-Party / Anonymous Personalization:** Triggers dynamic UI adaptations instantly (e.g., displaying countdown timers for impulse buyers, or deep-dive specs for researchers).
- **Federated Learning Ready:** Designed with privacy-preserving edge aggregation concepts in mind.

## 💻 Tech Stack

- **Framework:** React 18 / Vite
- **Styling:** Tailwind CSS (Custom enterprise glassmorphism design system)
- **Animations & Visualizations:** Framer Motion, Recharts
- **State Management:** Zustand
- **Icons:** Lucide React

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Boredem125/ContextPulse.git
   cd ContextPulse
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

## 🧭 Navigating the Demo

The application consists of two main experiences running concurrently:

### 1. The E-Commerce Storefront (`/`)
A mock electronics store that acts as the data collection environment. 
- Use the floating **Debug Panel** to monitor your live behavioral signals.
- Use the **Intent Simulator** at the bottom to force the engine into specific archetypes and watch the UI adapt in real-time (e.g., banners, pricing, layouts).

### 2. The Enterprise Dashboard (`/dashboard`)
The command center for the ContextPulse engine.
- View live KPI metrics, session data, and the real-time event stream.
- See the 64-dim intent vector visualized via a live heatmap grid.
- Monitor CORE AI decisions, Identity resolution flows, and Simulated Federated Learning metrics across the sidebar navigation.

---

*Developed as a hackathon prototype demonstrating the future of anonymous personalization.*
