# HabiCard clone – What to do next

You’ve got the app running locally. Here’s how to make it yours and put it online for free.

---

## 1. Use the app

- **`/`** — Sign-in card. “Sign In” or “Sign Up” both go to the dashboard (no real auth yet).
- **`/dashboard`** — Habit tracker: week view, day cards, monthly/yearly stats. Tap habits to mark done/undone.

---

## 2. Customize it

| What | Where |
|------|--------|
| **Habits** (names, which are active) | `src/lib/habitData.ts` → `defaultHabits` |
| **Site title & meta** | `index.html` (e.g. change "HabiCard - Sync Your Progress") |
| **Landing copy** | `src/components/AuthCard.tsx` (heading, subtitle, button labels) |
| **Dashboard header / nav** | `src/components/DashboardHeader.tsx` |

Edits here don’t need a backend; reload or restart `npm run dev` to see them.

---

## 3. Host for free forever (laptop + Chrome, one URL)

So you can open the same app on your laptop and in Chrome on your phone:

### Quick path: Vercel (no credit card, free for personal use)

1. **Push this project to GitHub**  
   - Create a new repo on [github.com](https://github.com/new), then:
   ```bash
   cd habit-tracker
   git init
   git add .
   git commit -m "HabiCard habit tracker"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Connect and deploy on Vercel**  
   - Go to [vercel.com](https://vercel.com) and sign in with GitHub.  
   - **Add New** → **Project** → import the repo you just pushed.  
   - Leave **Root Directory** as `.` and **Framework Preset** as **Vite** (auto-detected).  
   - Click **Deploy**.

3. **Use your URL**  
   - You’ll get a link like `https://your-project.vercel.app`.  
   - Open it on your laptop or in Chrome on your phone; sign in and use the app. Same URL everywhere.

**Free forever?** The [Vercel Hobby plan](https://vercel.com/docs/plans/hobby) is free for non-commercial, personal use (no credit card). This app is a static site, so you stay within limits. As long as you use it personally, you can host it for free. See [Vercel’s plans](https://vercel.com/docs/plans) and [fair use](https://vercel.com/docs/limits/fair-use-guidelines) for details.

**Note:** The project includes a `vercel.json` so routes like `/dashboard` work when you refresh or open the link directly.

---

### Other free options

**Netlify:** Push to GitHub → [app.netlify.com](https://app.netlify.com) → Add new site → Import repo. Build: `npm run build`, Publish: `dist`. The `public/_redirects` file is copied into `dist` so `/dashboard` etc. work.

**Cloudflare Pages:** Push to GitHub → [Cloudflare Dashboard](https://dash.cloudflare.com) → Workers & Pages → Create → Pages → Connect Git. Build: `npm run build`, Output: `dist`. Add a single-page app redirect so all routes serve `index.html`.

### Option B: Netlify

1. Push to GitHub.
2. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project** → pick the repo.
3. **Build command:** `npm run build`  
   **Publish directory:** `dist`
4. Deploy.

### Option C: Cloudflare Pages

1. Push to GitHub.
2. [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select repo; **Build command:** `npm run build`, **Build output directory:** `dist`.

---

## 4. Test the production build locally

Before deploying, run:

```bash
npm run build
npm run preview
```

Then open the URL it prints (e.g. `http://localhost:4173`) to confirm everything works.

---

## 5. Later: real auth & data

Right now, sign-in only routes to the dashboard; **progress is in-memory** and is lost on refresh. To persist and sync across devices you’ll need:

- A backend or BaaS (e.g. **Supabase**, **Firebase**, or a small API).
- Auth (Supabase Auth, Firebase Auth, or similar, all have free tiers).

You can add that when you’re ready; the current UI will still work, you’ll just wire AuthCard and the habit state to your backend.

---

**TL;DR:** Change habits in `src/lib/habitData.ts`, then `npm run build` and deploy the `dist` folder to Vercel, Netlify, or Cloudflare Pages for free.
