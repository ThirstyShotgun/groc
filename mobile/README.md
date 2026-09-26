# Prepr Mobile (Expo + React Native)

AI-powered mock interview simulator for mobile, built with **Expo SDK 57**, **Expo Router**, **Supabase**, and **Groq Cloud**.

---

## 🎨 Design Theme: "Dusky Blueberry Autumn"
The mobile app mirrors the web aesthetic using the curated palette tokens:
- **Background Primary**: Deep Dusky Blueberry (`#2E2A47`)
- **Card Surfaces**: Dusky Purple Blueberry (`#3B3560`)
- **Input / Inset Surface**: Deep Charcoal-Violet (`#242038`)
- **Primary Accent**: Warm Autumn Rust (`#C1652F`)
- **Secondary Accent**: Golden Autumn Amber (`#E0A458`)
- **Typography**: Warm Cream (`#F5EDE1`) and Dusty Lavender (`#B8AFC9`)

---

## 🚀 Key Features

1. **Landing Screen (`app/index.tsx`)**:
   - Quick role preset pills (Software Engineer, Frontend Engineer, Backend / Systems, Full-Stack, Product Manager, Data Scientist)
   - Seniority level selector (Entry-Level, Mid-Level, Senior / Staff)
   - Real-time practice streak flame badge
   - "Start Practicing" primary CTA and direct link to performance analytics

2. **Interview Simulator (`app/interview.tsx`)**:
   - **Live Groq AI Question Generation**: Dynamically generates 5 curated questions tailored to your target role and seniority.
   - **Question Classification**: Tagged as `Technical`, `Behavioral`, or `Situational`.
   - **90-Second Interview Pressure Timer**: Visual countdown ring with alert color shifts and auto-submit fallback.
   - **Immediate AI Scoring & Feedback**: Evaluated against real industry hiring criteria, delivering 0–100 score, strengths, critique, and actionable improvement recommendations.
   - **Retry Answer**: Re-attempt questions to iterate and improve without polluting the session.
   - **End-of-Round Summary**: Hiring verdict, overall average score gauge, holistic takeaway, and an accordion breakdown of every question.

3. **Performance Dashboard (`app/dashboard.tsx`)**:
   - **Key Metrics**: Total interview rounds, cumulative average score, peak score, and questions answered.
   - **Score Progression Chart**: Built with `react-native-gifted-charts`, plotting performance progression with curved amber area gradients.
   - **Historical Session Browser**: Pull-to-refresh list of all previous sessions stored in Supabase with expandable question-level deep dives.

---

## ⚙️ Environment Variables

Create `mobile/.env` (a template is provided in `mobile/.env.example`):

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
EXPO_PUBLIC_GROQ_API_KEY=gsk_...
```

> ⚠️ **Security Notice (Hackathon Shortcut)**:
> In this mobile demo, Groq API calls are made directly from the client using `EXPO_PUBLIC_GROQ_API_KEY` for speed and autonomy. In a production release, AI prompts should always be routed through your own backend proxy/Next.js API route to protect API credentials from being extracted from mobile bundles.

---

## 📱 How to Run & Test on Your Phone with Expo Go

### 1. Install the Expo Go App on Your Phone
- **iOS**: Download **Expo Go** from the Apple App Store.
- **Android**: Download **Expo Go** from the Google Play Store.

### 2. Start the Expo Dev Server
From the project root:
```bash
npm run mobile
```
Or directly from the `mobile/` directory:
```bash
cd mobile
npx expo start
```

### 3. Connect Your Phone
1. Ensure your phone and development computer are connected to the **same local Wi-Fi network**.
2. **On Android**: Open the Expo Go app and tap **"Scan QR code"**, then scan the QR code printed in your terminal.
3. **On iOS**: Open your phone's default **Camera app**, point it at the QR code in your terminal, and tap the **"Open in Expo Go"** banner.

> **Tip for Wi-Fi Isolation / Firewalls**: If your phone cannot connect over local Wi-Fi, run Expo with Tunnel mode:
> ```bash
> npx expo start --tunnel
> ```
