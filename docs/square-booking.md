# Square booking (`/book`)

## Primary: Square Appointments embed (live path)

**`/book`** and **`/es/book`** load the official Square Appointments buyer widget from your Square Dashboard.

```html
<script src="https://square.site/appointments/buyer/widget/81n62yjpmpqdfr/L5D6N73XD7ADG.js"></script>
```

Component: `src/components/square-appointments-embed.tsx`

### Configure in Square Seller Dashboard

1. **Appointments** → enable online booking  
2. Create services (e.g. move deposit, labor block) with **prices / deposits**  
3. Set hours + staff calendars  
4. **Online booking → Embed** → copy script (already in the component)  
5. Appointments **Plus/Premium** if you need advanced booking features  

Customers book **and** pay inside Square’s widget — no custom Checkout API required for this path.

### Local / deploy

```bash
npm run dev
# open http://localhost:3000/book
```

No Square API env vars needed for the embed alone (it talks to Square’s hosted widget).

---

## Optional: custom API deposit flow (still in repo)

Earlier custom flow (Checkout payment link → `/book/schedule`) remains under:

| Path / API | Purpose |
|------------|---------|
| `POST /api/square/deposit` | Create Checkout payment link |
| `POST /api/square/webhook` | Mark reservation paid |
| `GET /api/bookings/*` | Status / slots / confirm |

`/book/schedule` now **redirects to `/book`** (embed is canonical).

Env for custom APIs only — see `.env.example` (`SQUARE_ACCESS_TOKEN`, etc.).
