# Student Management Frontend

React + Vite + Tailwind CSS frontend for the Express student API.

## Run

```bash
npm install
```

Create `.env` in the project root (copy `.env.example`) and set your backend URL:

```env
VITE_API_BASE_URL=http://localhost:5000
```

Then run:

```bash
npm run dev
```

Open the Vite URL shown in the terminal (normally http://localhost:5173).

## API routes currently connected

| Feature | Method | Endpoint |
|---|---|---|
| Add student | POST | `/student/add` |
| All students | GET | `/student/all` |
| Single student | GET | `/student/:id` |
| Update attendance | PUT | `/student/update/:id` |
| Delete student | DELETE | `/student/:id` |

## Expected payloads

Add student currently sends:

```json
{ "name": "Student Name", "email": "student@example.com" }
```

Attendance currently sends:

```json
{
  "attendanceStatus": "Present",
  "homeWork": "Completed",
  "date": "2026-11-17"
}
```

The UI accepts common list response shapes (`[]`, `{data: []}`, `{students: []}`), and reads student IDs from `_id`, `id`, or `studentId`.

## Important backend notes

1. Enable CORS in Express so the Vite app at `http://localhost:5173` can call the API. For example:

```js
const cors = require("cors");
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
```

Install CORS in the backend if needed: `npm install cors`.

2. The frontend follows the routes you supplied. Your earlier backend discussion also mentioned `DELETE /student/delete/:id` and a separate `POST /attendance/add`; if those are the actual routes in your current server, update `src/api.js` accordingly.
3. If your Student model expects `fullName` instead of `name`, change the add payload in `src/api.js` / `src/App.jsx` from `name` to `fullName`.
4. Attendance update is assumed to use `PUT`. If your Express route uses `PATCH` or a different request body, change that one API call to match.

## Files

- `src/App.jsx` — dashboard, student list, add/view/delete, attendance form
- `src/api.js` — centralized API endpoints and response parsing
- `src/index.css` — Tailwind import and base styles
