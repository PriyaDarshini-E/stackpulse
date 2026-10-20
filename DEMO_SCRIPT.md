# 🎥 StackPulse Demo Video Recording Script

Follow this script to record a comprehensive end-to-end demo video of StackPulse.

---

## ⏱️ Video Overview & Duration
- **Recommended Duration**: 3 – 5 minutes
- **Resolution**: 1920x1080 (Full HD) or 2560x1440
- **Theme**: Dark Mode (default)

---

## 📋 Step-by-Step Walkthrough

### Act 1: Introduction & Authentication (0:00 - 0:45)
1. **Show Landing & Register**:
   - Open browser at `http://localhost:5173`.
   - Notice automatic redirect to `/login` with prompt to sign in or create an account.
   - Click **"Create an account"** (`/register`).
   - Enter `demo@stackpulse.dev` and password `Password123!`.
   - Click **"Create Account"**.
   - Show instant redirect to the **Dashboard** with user session email displayed in the header badge.

### Act 2: Developer Search & Profile Inspection (0:45 - 1:45)
1. **Explore Search Suggestions**:
   - Point out the hero title, search bar, and popular suggestions (`torvalds`, `gaearon`, `shadcn`, `sindresorhus`).
   - Click the pill for `torvalds` or type `torvalds` in the input and click **"Analyze"**.
2. **Review Profile Analytics**:
   - Show the developer header: Avatar, Name (Linus Torvalds), bio, location, and GitHub link.
   - Point out the **"DB Cached"** or **"Real-time"** indicator.
   - Highlight the 4 metric cards:
     - Followers
     - Public Repos
     - Total Stars (aggregated across all repos)
     - Sampled Commits
3. **Inspect Interactive Charts**:
   - Hover over the **Top Languages Donut Chart** (Recharts) to show percentages and byte tooltips (e.g. C, Assembly).
   - Hover over the **Recent Commit Cadence Area Chart** showing commit volume over time.
4. **Sort & Filter Repositories**:
   - Scroll down to the Public Repositories section.
   - Type `linux` in the repository filter input to demonstrate instant filtering.
   - Toggle sort between **"Most Stars"**, **"Recently Updated"**, and **"Name"**.

### Act 3: Curating & Pinning Repositories (1:45 - 2:30)
1. **Pin a Repository**:
   - Click the **"Pin"** button on the `linux` (or top) repository.
   - The **Pin Modal** opens smoothly.
   - Type a personal note: *"The legendary Linux kernel codebase. Examine memory management."*
   - Add tags: `#kernel`, `#c`, `#os`.
   - Click **"Save Pin"**.
   - Notice the button transforms to an active **"Pinned"** badge with the note and tags displayed.
2. **Visit Pins Dashboard**:
   - In the navigation bar, click **"Pins"** (`/pins`).
   - Show the newly pinned repository card with its tags, stars, and note.
   - Click the edit icon to demonstrate inline note editing, add a new tag `#systems`, and click **"Save"**.
   - Click a tag badge (e.g. `kernel`) to demonstrate instant tag filtering.

### Act 4: Multi-Developer Comparison (2:30 - 3:30)
1. **Launch Comparison**:
   - In the navigation bar, click **"Compare"** (`/compare`).
   - Observe default head-to-head comparison (`torvalds` vs `gaearon`).
   - In the "Add another GitHub username" input, enter `shadcn` and click **"Add Developer"**.
   - Notice all 3 developers fetched and compared concurrently!
2. **Inspect Comparison Table**:
   - Point out the side-by-side columns with avatars, usernames, and links.
   - Show the **"Leader"** and **"Top"** badges dynamically identifying category champions for Total Stars, Followers, and Repositories.
3. **Inspect Comparative Charts**:
   - Scroll to the **Stars & Followers Comparison Bar Chart**.
   - Scroll to the **Language Share Comparison Bar Chart** showing breakdown across the compared developers.
4. **Save the Comparison**:
   - Click **"Save Comparison"** at the top right.
   - Name it: *"Architects: Linux, React & Modern UI"*.
   - Click **"Save Comparison"**.
   - Notice the green success alert and automatic navigation to **Saved Comparisons** (`/comparisons`).

### Act 5: Saved Comparisons Management (3:30 - 4:00)
1. **Review & Reopen**:
   - View the saved comparison card showing the 3 developer avatars and creation date.
   - Click **"Reopen in Compare"**.
   - Notice it instantly opens the Compare view with `?users=torvalds,gaearon,shadcn` pre-populated.
   - Return to **Saved Comparisons** and demonstrate the rename feature (change name or delete).

### Act 6: Mobile Responsiveness (4:00 - 4:30)
1. **Inspect Mobile Viewport (375px width)**:
   - Open Chrome DevTools (`Ctrl+Shift+I` / `Cmd+Option+I`) and toggle device toolbar to **iPhone SE / 375px width**.
   - Show the mobile hamburger menu in the header opening and closing.
   - Navigate to `/developer/torvalds`:
     - Show the profile header adapting gracefully to vertical stacking.
     - Show the 2x2 metrics grid.
     - Show the charts automatically resizing to 100% width.
     - Show the repository cards and compare tables scrollable horizontally without layout breakage.

### Act 7: Conclusion & Summary (4:30 - 4:45)
- Summarize the stack: React 18, Vite, TypeScript, Tailwind, Node.js Express, PostgreSQL, Prisma, Vitest, and GitHub caching resilience.
- Log out to show protected session termination.
