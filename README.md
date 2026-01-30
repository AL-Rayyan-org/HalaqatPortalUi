# Halaqat Management System (Hafiz) - Portal

> The internal back-office dashboard for managing the Hafiz platform, focusing on system configuration, user management, and operational oversight.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture Patterns](#architecture-patterns)
- [Development Guidelines](#development-guidelines)
- [Key Features](#key-features)
- [Available Scripts](#available-scripts)
- [Code Standards](#code-standards)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## 🎯 Overview

The Hafiz Admin Portal is a restricted-access application designed for Plutosoft internal staff. Unlike the tenant-facing application, this portal is strictly for system administration.

- **System Owner**: Full access to critical system configurations.
- **System Admin**: High-level access for user management and general settings.
- **System Teacher**: Teacher access for managing Halaqat and students.

---

## 🛠️ Tech Stack

### Core Technologies
- **React 19.0** - UI library with latest features
- **TypeScript 5.6** - Type-safe JavaScript
- **Vite 7.1** - Lightning-fast build tool and dev server
- **React Router 7.1** - Client-side routing

### UI & Styling
- **TailwindCSS v4** - Utility-first CSS framework with inline theme support
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Re-usable component library
- **Lucide React** - Icon library
- **Class Variance Authority (CVA)** - Component variant management

### State Management & Data Fetching
- **Zustand** - Lightweight state management (profile store)
- **React Hook Form** - Form state management
- **Zod** - Schema validation

### Internationalization
- **react-i18next** - i18n framework
- **i18next-browser-languagedetector** - Automatic language detection

### Development Tools
- **ESLint** - Code linting with React hooks rules
- **TypeScript ESLint** - TypeScript-specific linting
- **PostCSS** - CSS processing

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher (comes with Node.js)
- **Git**: Latest version

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone git clone https://github.com/plutosoftcom/hafiz-admin.git
   cd hafiz-admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (copy from `.env.example` if available):
   ```env
   VITE_API_URL=https://api.hafiz-internal.com/admin-v1
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:3001`

5. **Verify the setup**
   - Open your browser to `http://localhost:3001`
   - You should see the login page
   - Hot Module Replacement (HMR) should work when you edit files

---

## 📁 Project Structure

```
src/
├── features/                  # Feature-based modules
│   ├── auth/                  # Login & Security
│   ├── dashboard/             # Main Overview Stats
│   ├── admin-management/      # Internal User Management
│   ├── system-settings/       # Global System Configs
│   └── settings/              # Admin Profile Settings
│       ├── layout/            # Settings Layout (Sidebar/Tabs)
│       └── components/
│
├── shared/                    # Shared Resources
│   ├── components/
│   │   ├── guards/            # RoleGuard & ProtectedRoute
│   │   └── ui/                # shadcn/ui components
│   ├── stores/                # Zustand Stores
│   │   └── profileStore.ts    # In-memory Profile/Role store
│   ├── hooks/
│   │   ├── useUserRole.ts     # RBAC Hook
│   │   └── useI18n.ts         # Translation Hook
│   ├── services/
│   │   └── apiClient.ts       # Central Fetcher
│   └── types/                 # API Interfaces
│
├── locales/                   # i18n JSON files (en/ar)
├── styles/                    # Global CSS & Tailwind Config
├── App.tsx                    # Root Routing
└── main.tsx                   # Entry Point
```

### Understanding the Architecture

**Feature-Based Organization**: Each feature is self-contained with its own:
- **components/**: React components for that feature
- **api/**: API calls specific to the feature
- **hooks/**: Feature-specific custom hooks
- **index.ts**: Barrel export for clean imports

**Shared Resources**: Common utilities, components, and services used across features:
- **UI Components**: Reusable, accessible components following shadcn/ui patterns
- **Guards**: Route protection (authentication, authorization)
- **Hooks**: Reusable logic (i18n, admin checks, mobile detection)
- **Services**: API client and business logic

---

## 🏛️ Architecture Patterns

### 1. State Management

**Zustand Store (Profile)**
```typescript
// ❌ Never store profile in localStorage
// ✅ Always use Zustand store
import { useProfile } from '@/shared/stores/profileStore';

function Component() {
  const { profile, setProfile, clearProfile } = useProfile();
  // profile is reactive and secure
}
```

### 2. API Communication

**Centralized API Client**
```typescript
import { fetcher } from '@/shared/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';

// All APIs use this pattern
export const getData = async (): Promise<ApiResponse<DataType>> => {
  return fetcher<DataType>('/endpoint', 'GET');
};
```

**Response Format**
```typescript
{
  success: boolean,
  statusCode: number,
  message: string,
  data: T,
  paging?: { ... }
}
```

**Auto-Headers**
- `Authorization: Bearer <token>` - Auto-attached
- `Accept-Language: en|ar` - Auto-attached from localStorage

**Error Handling**
- 401 responses → Auto-logout and redirect to login
- Token and profile cleared automatically

**Welcome to the Hafiz team! Happy coding! 🎉**