# Second Brain AI — Backend

Node.js + Express backend for authentication, image upload, chat journaling, and AI query mode.

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT auth (`jsonwebtoken`)
- Password hashing (`bcryptjs`)
- Cloudinary image upload (`cloudinary`, `express-fileupload`)

## Project Structure

```text
Backend/
  src/
    config/
      db.js
      cloudinary.js
    controllers/
      auth.controller.js
      upload.controller.js
      chat.controller.js
      query.controller.js
    middleware/
      auth.middleware.js
    models/
      User.js
      Chat.js
      ChatRecord.js
    routes/
      auth.routes.js
      upload.routes.js
      chat.routes.js
      query.routes.js
    index.js
  postman/
    Second Brain AI.postman_collection.json
  .env
  package.json
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create/update `.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

3. Ensure `express-fileupload` is configured with temp file support in `src/index.js`:

```js
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
```

> This is **required** for direct Cloudinary uploads via `file.tempFilePath` (no base64 encoding).

4. Run server:

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

## API Endpoints

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Health

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/` | ❌ | Server health check |

---

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/signup` | ❌ | Register a new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get logged-in user profile |

**Signup / Login body:**
```json
{ "fullName": "Aritra Das", "email": "aritra@example.com", "password": "secret123" }
```

---

### Upload

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/upload/image` | ✅ | Upload an image directly to Cloudinary (via temp file, no base64) |

**Body:** `form-data` — field `image` (file)

> **Requires** `express-fileupload` middleware with `useTempFiles: true` so that `file.tempFilePath` is available for direct Cloudinary upload.

---

### Chat — Upload Mode

> Only **today's date** can have new entries added. Past dates are **read-only**.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/chat/entry/text` | ✅ | Add a text entry to today's chat |
| POST | `/api/chat/entry/image` | ✅ | Upload image + caption to today's chat (direct Cloudinary upload, no base64) |
| GET | `/api/chat/history` | ✅ | Get list of all dates with entries (newest first) |
| GET | `/api/chat/:date` | ✅ | Get all entries for a date (`YYYY-MM-DD`) |

**Add text entry body:**
```json
{ "text": "Completed the backend models for Second Brain AI" }
```

**Add image entry body:** `form-data`
| Field | Type | Description |
|-------|------|-------------|
| `image` | file | Image file — uploaded via `file.tempFilePath` directly to Cloudinary |
| `caption` | text | Optional description of the image |

**Get chat by date response:**
```json
{
  "success": true,
  "date": "2026-03-21",
  "isToday": true,
  "isPast": false,
  "totalEntries": 2,
  "entries": [
    { "order": 1, "type": "text", "content": "some text", "caption": "" },
    { "order": 2, "type": "img",  "content": "https://cloudinary.com/...", "caption": "architecture diagram" }
  ]
}
```

---

### Query Mode

> No database storage. Query is logged to the server console. RAG integration coming soon.

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/query` | ✅ | Send a query (logged on server, placeholder response) |

**Body:**
```json
{ "query": "What did I upload about the project architecture?" }
```

**Response:**
```json
{
  "success": true,
  "message": "Query received. RAG system coming soon.",
  "query": "What did I upload about the project architecture?",
  "response": "This feature is under construction. Your query has been logged.",
  "timestamp": "2026-03-21T06:50:00.000Z"
}
```

---

## Response Patterns

**Success:**
```json
{ "success": true, "message": "...", "data": {} }
```

**Error:**
```json
{ "success": false, "message": "..." }
```

---

## Testing

Import the Postman collection:

- `postman/Second Brain AI.postman_collection.json`

After importing, run **Login** first — the test script auto-sets `{{token}}` for all protected requests.

---

> Keep secrets private. Never commit real credentials to version control.
