# 🚀 Deployment Guide

## Backend Deploy — Render / Railway / Heroku

### Render (Free Tier — Recommended)
1. Push `backend/` to a GitHub repo
2. New Web Service → connect repo
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `gunicorn app:app`
5. Add your `models/` folder (use Render Disk or bundle with repo)

### Environment variable (optional)
```
FLASK_ENV=production
```

---

## Frontend Deploy — Vercel / Netlify

### Vercel (Recommended)
1. Push `frontend/` to GitHub
2. Import on vercel.com → Framework: **Vite**
3. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
4. Update `vite.config.js` proxy OR use `axios.defaults.baseURL`

### Netlify
1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add `_redirects` file in `public/`:
   ```
   /* /index.html 200
   ```

---

## Connecting Frontend → Backend after deploy

In `frontend/src/pages/Prediction.jsx`, change:
```js
// Before (dev proxy)
await axios.post('/api/predict-multi', ...)

// After (production)
await axios.post(`${import.meta.env.VITE_API_URL}/api/predict-multi`, ...)
```

Or create `frontend/src/api.js`:
```js
import axios from 'axios'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})
export default api
```
