**Try it out here** : https://ai-repair-assistant-926892979671.us-west1.run.app/

**RepairALL**: AI-Powered Open Source Guide for Everyday Repairs 🛠️

RepairALL is an open-source mobile app that fights waste by making DIY repairs easy for everyone. It uses multimodal AI to turn a photo of a broken object into a visual, step-by-step repair tutorial.

The project's goal is to democratize repair knowledge, empowering users to fix what they own and promote sustainability.

<img width="300" height="800" alt="IMG_8485 (1)" src="https://github.com/user-attachments/assets/bf595460-075c-4a5e-8eb7-f91114984afe" />
<img width="300" height="800" alt="IMG_8487 3" src="https://github.com/user-attachments/assets/539cba45-42d3-40d6-9548-a06416ed7236" />

**✨ Key Features**

Photo-to-Tutorial: Upload a photo of damage (e.g., a cracked chair).

AI Analysis: The Gemini API analyzes the image and text description to diagnose the problem.

Visual Guides: Generates 3-5 personalized images and instructions, starting with a tool list, to guide the repair process.

Open Source: All code is available on GitHub under an MIT License.

**🚀 Tech Stack**
RepairALL relies on the Google Gemini API for both reasoning (generating tool lists and steps) and image generation (creating the visual guide).

AI: Google Gemini API

Authentication: Auth0

**🤝 Contribution**
We welcome contributions to fix bugs, improve the UI/UX, or refine the AI prompts. Fork the repository and open a Pull Request!

# RepairALL

**Try it out here** : https://ai-repair-assistant-926892979671.us-west1.run.app/

RepairALL is an open-source mobile app that fights waste by making DIY repairs easy for everyone. It uses multimodal AI to turn a photo of a broken object into a visual, step-by-step repair tutorial.

<img width="300" height="800" alt="IMG_8485 (1)" src="https://github.com/user-attachments/assets/bf595460-075c-4a5e-8eb7-f91114984afe" />
<img width="300" height="800" alt="IMG_8487 3" src="https://github.com/user-attachments/assets/539cba45-42d3-40d6-9548-a06416ed7236" />

## ✨ Key Features

- Photo-to-Tutorial: Upload a photo of damage (e.g., a cracked chair).
- AI Analysis: The Gemini API analyzes the image and text description to diagnose the problem.
- Visual Guides: Generates 3-5 personalized images and instructions, starting with a tool list, to guide the repair process.
- Open Source: All code is available on GitHub under an MIT License.

## 🚀 Tech Stack

- AI: Google Gemini API (Gemini 2.5 Pro + Imagen 4.0)
- Authentication: Auth0
- Frontend: React 19 + Vite + Tailwind (via CDN)

## 🤝 Contribution

We welcome contributions to fix bugs, improve the UI/UX, or refine the AI prompts. Fork the repository and open a Pull Request!

## Local development

1. Copy `.env.example` to `.env.local` and provide:
   - `GEMINI_API_KEY` – Google AI Studio key that can call Gemini 2.5 Pro and Imagen 4.0
   - `VITE_AUTH0_DOMAIN` – your Auth0 tenant domain (e.g., `solar3d.eu.auth0.com`)
   - `VITE_AUTH0_CLIENT_ID` – the SPA application client ID
2. In the Auth0 application settings, add `http://localhost:3000` to Allowed Callback URLs, Allowed Logout URLs, and Allowed Web Origins.
3. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`, log in through Auth0, and upload a photo to generate a repair guide.

### Quality checks

Run ESLint to catch issues early:

```bash
npm run lint
```
