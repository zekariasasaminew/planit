# PlanIt - Academic Planning Assistant

A modern academic planning application built with Next.js, featuring course catalog integration, automated plan generation, and Learning Perspectives tracking for Augustana University.

## 🚀 Production Features

### ✨ Modern UI/UX

- **Material Design 3** styling with custom theme
- **Light/Dark mode** toggle with system preference detection
- **Responsive design** that works on all devices
- **Google-style** clean and intuitive interface

### 📚 Academic Planning

- **Interactive Dashboard** with welcome screen and quick actions
- **AI-Powered Plan Generation** with semester optimization
- **Semester-by-Semester Planner** with visual course cards
- **Prerequisites Tracking** with automatic dependency resolution
- **Learning Perspectives Integration** (PA, PH, PS, PP, PL, PN)
- **Major/Minor Support** with comprehensive course requirements

### 🎯 Key Components

- **Course Catalog Integration** with web scraping capabilities
- **Plan Generation Engine** with constraint satisfaction
- **Database Migration System** for course data management
- **User Authentication** with Google OAuth integration
- **Real-time Plan Validation** with prerequisite checking

## 🛠 Tech Stack

- **Next.js 14/15** with App Router (APIs under `src/app/api`)
- **TypeScript** for type safety
- **Material UI (MUI)** for components and styling
- **Emotion** for CSS-in-JS styling
- **Zustand** for state management (ready for integration)
- **Supabase** (Auth and Postgres)
- **Drizzle ORM** (types for schema)
- **Zod** for input validation
- **Pino** for logging
- **OpenAPI** generated from Zod
- **Vitest** and **Playwright** for tests

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with sidebar and app bar
│   ├── page.tsx           # Homepage/Dashboard
│   ├── generate/          # Plan generation wizard
│   ├── planner/           # Semester-by-semester view
│   ├── saved-plans/       # Plan management
│   ├── majors/            # Programs and requirements
│   └── settings/          # App preferences
├── components/            # Reusable UI components
│   ├── AppBar.tsx         # Top navigation bar
│   ├── Sidebar.tsx        # Collapsible sidebar menu
│   ├── SemesterCard.tsx   # Course display cards
│   ├── MajorSelector.tsx  # Major selection component
│   ├── MinorSelector.tsx  # Minor selection component
│   └── PreferenceForm.tsx # Plan preferences form
├── theme/                 # MUI theme configuration
│   ├── theme.ts           # Dark theme definition
│   └── context.tsx        # Theme provider
└── types/                 # TypeScript type definitions
    └── index.ts           # Core data types
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- A Postgres instance and Supabase project (or Supabase-hosted Postgres)

### Installation

1. **Clone the repository** (if not already done)
2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment variables** (create `.env.local`):

```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
OPENAI_API_KEY=
RATE_LIMIT_WINDOW_SEC=60
RATE_LIMIT_MAX_CALLS=10
```

4. **Run database migrations**:

```bash
npm run db:migrate
```

5. **Seed example data** (optional):

```bash
npm run db:seed
```

6. **Generate OpenAPI**:

```bash
npm run openapi:gen
```

7. **Start the development server**:

   ```bash
   npm run dev
   ```

8. **Open your browser** and navigate to [http://localhost:3000](http://localhost:3000)

## 🧪 Tests

```bash
npm run test        # unit tests
npm run test:e2e    # playwright API smoke tests
```

## 📜 Curl example (Plan Generation)

```bash
curl -X POST http://localhost:3000/api/plans/generate \
  -H "Content-Type: application/json" \
  -d '{
    "majorIds": ["<major-uuid>"],
    "takenCourseIds": [],
    "semestersRemaining": 6,
    "maxCreditsPerSemester": 15,
    "startSeason": "Fall",
    "startYear": 2024
  }'
```

## 🎨 Design Features

### Theme System

- **Custom Material Design theme** with college-appropriate colors
- **Automatic dark mode** based on system preferences
- **Persistent theme selection** using localStorage
- **Smooth transitions** and hover effects throughout

### Navigation

- **Responsive sidebar** that collapses on mobile
- **Breadcrumb navigation** with active state indicators
- **Quick actions** accessible from multiple pages
- **Floating action buttons** for primary actions

### User Experience

- **Progressive disclosure** with step-by-step flows
- **Loading states** and success/error feedback
- **Form validation** with helpful error messages
- **Accessible design** following WCAG guidelines

## 📋 Pages Overview

### 🏠 Dashboard (`/`)

- Welcome message with gradient text
- Feature highlights with animated cards
- Quick action buttons for common tasks
- Call-to-action for new users

### ⚡ Generate Plan (`/generate`)

- **4-step wizard** for plan creation:
  1. **Timeline Selection** - Start/end semesters
  2. **Academic Programs** - Major and minor selection
  3. **Preferences** - Credit limits, course timing
  4. **Review & Generate** - Final confirmation
- Form validation and error handling
- Loading states during generation

### 📅 Planner (`/planner`)

- **Horizontal semester timeline** with scroll
- **Course cards** with type indicators and credits
- **Plan insights** with requirement tracking
- **Edit capabilities** for plan modifications

### 💾 Saved Plans (`/saved-plans`)

- **Grid layout** of saved academic plans
- **Context menus** for plan management
- **Search and filtering** capabilities
- **Quick preview** of plan details

### 🎓 Majors & Requirements (`/majors`)

- **Tabbed interface** for majors and minors
- **Search functionality** across programs
- **Program cards** with department and credit info
- **Placeholder for future requirements** system

### ⚙️ Settings (`/settings`)

- **Theme toggle** with live preview
- **Placeholder settings** for future features
- **Clean list interface** with descriptions

## 🔮 Future Enhancements

This frontend is designed to integrate with:

- **GPT-4 + LangChain backend** for intelligent plan generation
- **University course databases** for real-time data
- **User authentication** and plan persistence
- **Advanced requirement tracking** and validation
- **Collaboration features** for advisor review
- **Export functionality** (PDF, calendar integration)

## 🧪 Development Notes

- **Component-based architecture** for easy testing
- **TypeScript interfaces** for all data structures
- **Consistent styling** with MUI theme system
- **Mobile-first responsive** design approach
- **Performance optimized** with Next.js features

---

## 🗄️ Data Integration

The application now integrates with real data sources:

- **Real course catalog** from Augustana College via ETL pipeline
- **Dynamic program data** fetched from Supabase database
- **User-generated plans** stored and retrieved from backend
- **Live plan generation** using actual course prerequisites and requirements

**Fully integrated system!** This application provides a complete academic planning experience with real data and intelligent plan generation.
