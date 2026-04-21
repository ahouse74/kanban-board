# Kanban Board

A polished, Linear-inspired Kanban task manager built with React, TypeScript, and Supabase.

## Features

- **Drag & drop** tasks across To Do / In Progress / In Review / Done columns
- **Guest accounts** via Supabase anonymous auth — no sign-up required
- **Labels** with custom colors and board-level filtering
- **Priority** indicators (High / Normal / Low) with color-coded cards
- **Due date** badges that highlight overdue and due-soon tasks
- **Comments** on tasks with chronological display
- **Activity log** tracking status changes and creation events
- **Search & filter** by title, priority, or label
- **Board stats** in the header (total, in-progress, done, overdue)
- **Row Level Security** — users only see their own data

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# Edit .env with your values
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run locally

```bash
npm run dev
# Open http://localhost:5173
```

## Project Structure

```
src/
├── lib/
│   └── supabase.ts          # Supabase client init
├── types/
│   └── index.ts             # All TypeScript types & config constants
├── hooks/
│   ├── useAuth.ts           # Anonymous session management
│   ├── useTasks.ts          # Full task CRUD + labels + stats
│   └── useTaskDetail.ts     # Comments + activity log for a task
├── components/
│   ├── Header.tsx           # Brand + stats bar
│   ├── Toolbar.tsx          # Search, filters, new task button
│   ├── Board.tsx            # DnD context + column layout
│   ├── Column.tsx           # Droppable column
│   ├── TaskCard.tsx         # Draggable task card
│   ├── CreateTaskModal.tsx  # New task form
│   ├── TaskDetailModal.tsx  # Task detail, edit, comments, activity
│   └── Screens.tsx          # Loading & error states
├── App.tsx                  # Root component
├── main.tsx                 # Entry point
└── index.css                # Tailwind + custom styles
```

---

## Database Schema

See `schema.sql` for the full schema. Summary:

| Table          | Purpose                                 |
|----------------|-----------------------------------------|
| `tasks`        | Core task data (title, status, priority, due_date) |
| `labels`       | User-created labels with colors         |
| `task_labels`  | Many-to-many junction (tasks ↔ labels)  |
| `comments`     | Task comments                           |
| `activity_log` | Task change history                     |

All tables have RLS enabled. Users can only access rows where `user_id = auth.uid()`.
