# SprintDesk — Interview Guide

A simple guide to help you explain the project during your interview.

---

## 🎙️ 1. Project Pitch (Summary)
**SprintDesk** is a sprint management board designed for software development teams. It is built using **React 18** and **TypeScript** with a clean layout, responsive charts, and role-based permissions.

---

## 🏗️ 2. Key Features

### 🔒 A. Register & Login Flow
- **Local Database**: Users register by creating a username/email and password, which are saved in local storage.
- **Custom Admin Account**: The system includes a pre-configured Admin account:
  - **Email**: `aryanagarwal610@gmail.com`
  - **Password**: `7teSy0@1`
- **Silent Refresh Interceptor**: If a token expires (401 error), an Axios interceptor silently refreshes it behind the scenes without logging the user out.

### 📋 B. Kanban Sprint Board & Permissions
- **Drag-and-Drop**: Built using `@dnd-kit/core` with smooth animations.
- **Undo Action**: A floating button lets you instantly undo a card movement or task deletion.
- **Role-Based Access**:
  - **Admins** have full access to edit, assign, or delete any task.
  - **Users** can only edit their own tasks. Opening other users' tasks shows them as read-only (disabled fields), and the delete option is hidden.

### 🔔 C. Performance-Optimized Polling
- Polling fetches posts every 10 seconds to simulate notifications.
- **Auto-Pause**: Polling pauses when you switch tabs to save memory, and resumes when you switch back.
- **Toast Alerts**: Shows floating toasts for new notifications if the main bell dropdown is closed.

---

## 📂 3. Tech Stack & Directory Structure
- **Global State**: Zustand (persisted in local storage).
- **Styling**: Tailwind CSS (custom glassmorphism panels & dark/light mode toggle).
- **Charts**: Recharts (velocity bars, status donuts, trends).
- **Directory Layout**:
  - `/api`: Axios settings & auth token interceptors.
  - `/components/ui`: Custom components (Buttons, Inputs, Modals, Tables, Toasts).
  - `/features`: Specific pages (Kanban Board, LoginPage, Analytics, Notifications).
  - `/store`: Zustand state files.

---

## 🧠 4. Common Interview Questions & Answers

### Q1: Why use Zustand instead of Redux?
> *"Zustand is much lighter and requires less boilerplate code. You define actions directly in the store, and it persists states automatically without wrapping the whole app in Providers."*

### Q2: Why did you choose `@dnd-kit` for drag-and-drop?
> *"It is lightweight, supports modern touch and keyboard sensors, and integrates easily with React compared to older, heavier libraries like react-beautiful-dnd."*

### Q3: How did you verify the app's code quality?
> *1. **Strict TypeScript**: Configured strict compilation parameters to catch issues early.*
> *2. **Vitest Unit Tests**: Wrote tests covering the auth interceptor, Zustand board store moves, and toast hooks.*
> *3. **Production Builds**: Validated that the code bundles cleanly with route-level lazy loading.*
