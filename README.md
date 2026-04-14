# Task Manager Pro - Staff Engineering Challenge
A professional, cross-platform Task Management application built with **Ionic Framework** and **Angular**. This project is designed to demonstrate high-level architectural decisions, seamless Firebase integration, and a consistent user experience across web and mobile platforms.

# 🚀 Live Demo & Installation
You can download the compiled Android executable (APK) directly from the official release:
👉 https://github.com/Steveng1997/staff-engineering-assessment-mobile/releases/tag/v1.0.0

# 🛠️ Technical Stack

**Framework:** Ionic 7+ / Angular 17+ (Standalone Components).

**Bridge:** Capacitor 6.

**Backend-as-a-Service:** Firebase (Firestore & Remote Config).

**Build Toolchain:** Gradle with **Java 21 (LTS).**

# 🧠 Architectural Decisions (Staff Level)

# 1. Unified Design Language (Global MD Mode)
To ensure 100% visual consistency between the web preview and the native Android app, the project is globally configured to force **Material Design (md)**. This prevents platform-specific styling discrepancies and ensures that the UI/UX remains identical regardless of the device.

# 2. Real-time Feature Flagging
The "Delete Task" functionality is managed via **Firebase Remote Config**. This implementation allows for real-time control over app features without requiring new deployments, demonstrating a production-ready approach to feature management and A/B testing.

# 3. Responsive Layout Strategy
The application utilizes the **Ionic Grid system** to handle different screen densities. It provides a centered, readable layout on wide desktop screens while automatically adapting to a full-width touch-friendly interface on mobile devices.

# 4. Robust Build Pipeline
The environment is optimized for **Java 21**, ensuring compatibility with the latest Android Gradle Plugin (AGP) and stable jlink image transformations, avoiding common legacy toolchain conflicts.

# 📦 How to Run Locally

1. # Clone the repository:

# Bash
git clone https://github.com/Steveng1997/staff-engineering-assessment-mobile.git
cd staff-engineering-assessment-mobile

2. # Install dependencies:

# Bash
npm install

3. # Run in Web Mode:

# Bash
ionic serve


4. # Sync with Android:

# Bash
ionic build
npx cap sync android
npx cap run android
