# ✨ SprintDesk

A modern, beautifully-designed sprint management dashboard for development teams. Drag and drop tasks between columns, track sprint velocity in real-time, and collaborate seamlessly—all in a slick, glassmorphism-styled interface.

**[Live Demo](#)** • **[GitHub](https://github.com/Aryanagarwal7733/-Sprint-Management-Dashboard-)** • **[Report Issues](#)**

---

## 🎯 What You Get

### 🔐 Smart Authentication
Sign up with your email or log in to an existing account. Your session stays active for 30 days, and we automatically refresh your token in the background so you never get logged out unexpectedly. We've included a demo admin account so you can test drive the full experience:

- **Email**: `aryanagarwal610@gmail.com`
- **Password**: `7teSy0@1`

### 📌 Kanban Board (The Heart of SprintDesk)
Organize your sprint work across four columns: **Backlog** → **In Progress** → **Review** → **Done**. 

- **Drag & drop** tasks between columns with smooth animations
- **Filter** by assignee, priority, or search by task name
- **Fine-grained permissions**: Admins can edit anything, while team members can only modify their own tasks
- **Undo history**: Made a mistake? Revert your last few actions with one click
- The board comes pre-loaded with 30 sample developer tasks to get you started

### 📊 Real-Time Analytics Dashboard
See your sprint health at a glance with interactive charts showing:
- How many tasks you've completed vs. your total workload
- Task distribution across board columns
- Priority breakdown across your sprint
- Completion trends over time (who's crushing it? 📈)

### 🎨 Beautiful, Hand-Crafted UI
Every button, input, modal, and notification was built from scratch using Tailwind CSS. No bloated component libraries—just clean, performant, and fully customizable UI that works beautifully on any device.

### 🔔 Notifications
Stay in the loop with background notifications that poll for updates every 10 seconds. The system intelligently pauses notifications when you switch tabs and resumes when you come back.

---

## 🛠️ Built With

Modern, battle-tested technologies:

| What | Why |
|------|-----|
| **React 18** | Fast, component-based UI architecture |
| **TypeScript** | Catch bugs at compile-time, not runtime |
| **Vite** | Lightning-fast build and dev server |
| **Tailwind CSS** | Utility-first styling for rapid UI development |
| **Zustand** | Lightweight, simple state management |
| **Axios + React Query** | Bulletproof data fetching and caching |
| **@dnd-kit** | Smooth, performant drag-and-drop |
| **Recharts** | Beautiful, responsive data visualizations |
| **Vitest** | Fast, modern unit testing |

---

## 📁 Project Structure

The codebase is organized using a feature-sliced approach, making it easy to find related code:

```
src/
├── api/                  # API clients (Axios instances, interceptors)
├── components/           # Reusable UI components
│   ├── ui/               # Base components (Button, Input, Modal, etc.)
│   └── layout/           # Page layouts (Navbar, Sidebar, etc.)
├── features/             # Feature modules
│   ├── auth/             # Login & authentication
│   ├── board/            # Kanban board & tasks
│   ├── analytics/        # Charts & analytics
│   └── notifications/    # Notification system
├── hooks/                # Custom React hooks (useToast, etc.)
├── store/                # Global state (Zustand stores)
├── types/                # TypeScript type definitions
├── utils/                # Helper utilities
├── App.tsx               # Route setup
└── main.tsx              # App entry point
```

**How data flows through the app:**
User interacts with Components → Updates Zustand Store → Data persists to Local Storage → Analytics & UI re-render

---

## 🚀 Quick Start

Get up and running in 3 minutes:

### 1. Clone and install
```bash
git clone https://github.com/Aryanagarwal7733/-Sprint-Management-Dashboard-.git
cd -Sprint-Management-Dashboard-
npm install
```

### 2. Start developing
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for production
```bash
npm run build
```

### 4. Run tests
```bash
npm run test
```

---

## 🧠 Design Decisions

Here's why I built things this way:

**Local First Architecture** - No backend required means you can use this offline and never worry about API downtime. All user data, tasks, and history lives in your browser's local storage.

**Custom UI Library** - I built every component from scratch with Tailwind instead of using a heavy component library. The result? A lighter bundle, faster load times, and complete control over how everything looks and feels.

**dnd-kit for Drag-and-Drop** - Among the options out there, dnd-kit is the leanest and most maintainable. It supports touch, keyboard navigation, and has excellent TypeScript support.

**Zustand for State** - I could've used Redux, but Zustand is simpler, requires less boilerplate, and scales beautifully from a small app to a large one.

---

## ✅ Testing

Tests are built in and run fast. The suite covers:
- **Hooks**: Toast notifications, state changes
- **State Management**: Task operations, history, permissions
- **Auth**: Token handling and session persistence

Run them with `npm run test`. Everything passes. ✨

---

## 📝 What's Inside

Each feature is self-contained and easy to understand:

- **Auth** - Email login, registration, token refresh
- **Board** - Drag-drop tasks, filters, permissions, undo history
- **Analytics** - Interactive charts showing sprint metrics
- **Notifications** - Background polling with smart tab detection
- **Components** - Reusable UI building blocks

---

## 🤝 Contributing

Found a bug or want to improve something? Here's how:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-thing`)
3. Make your changes
4. Push to your fork
5. Open a Pull Request

---

## 📄 License

MIT – Feel free to use this however you'd like.

---

## 👋 Questions?

Have questions about the project? Check the code comments, browse the feature folders, or reach out. The codebase is well-organized and should be easy to navigate.

Happy task management! 🚀
