
# Signalum Marketing Site

High-performance landing page for Signalum.

## Vercel Deployment

1. Create a new project in Vercel.
2. Link the repository.
3. **CRITICAL SETTINGS:**
   - **Root Directory:** `marketing`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

## Domain Setup
- Point `signalum.xyz` to this Vercel project.
- Point `app.signalum.xyz` to the repository root project.

## Local Development
```bash
cd marketing
npm install
npm run dev
```
