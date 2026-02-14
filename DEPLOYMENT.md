# DEPLOYMENT GUIDE - Vercel

## Overview
Deploy your full-stack accounting system to production.

## Architecture
- Frontend: Vercel (React + Vite)
- Backend: Vercel Serverless Functions (Express)
- Database: MongoDB Atlas (Free Tier)

---

## STEP 1: MongoDB Atlas Setup

1. Go to https://www.mongodb.com/atlas
2. Create Free Account
3. Create New Cluster (M0 - Free Tier)
4. Database Access:
   - Create User: `app_user`
   - Password: Generate secure password
   - Role: Read and Write to Any Database
5. Network Access:
   - Add IP: `0.0.0.0/0` (allow all IPs)
6. Get Connection String:
   ```
   mongodb+srv://app_user:PASSWORD@cluster0.xxxxx.mongodb.net/accounting_system?retryWrites=true&w=majority
   ```

---

## STEP 2: Deploy Backend to Vercel

### Install Vercel CLI
```bash
npm i -g vercel
```

### Deploy Backend
```bash
cd backend

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [your-account]
# - Link to existing project? No
# - Project name? accounting-system-backend
# - Directory? ./
```

### Set Environment Variables
```bash
# After deployment, add environment variables
vercel env add NODE_ENV
# Value: production

vercel env add MONGO_URI
# Value: your_mongodb_atlas_connection_string

vercel env add JWT_SECRET
# Value: your_super_secret_jwt_key_min_32_chars

vercel env add PORT
# Value: 5000
```

### Redeploy with Environment Variables
```bash
vercel --prod
```

**Note the deployed URL:** `https://accounting-system-backend-xxxxx.vercel.app`

---

## STEP 3: Update Frontend API URL

Edit `frontend/.env.production`:
```env
VITE_API_URL=https://accounting-system-backend-xxxxx.vercel.app/api
```

Or create `.env` file:
```bash
cd frontend
echo "VITE_API_URL=https://accounting-system-backend-xxxxx.vercel.app/api" > .env
```

Also update `backend/server.js` CORS:
```javascript
const corsOptions = {
  origin: [
    'https://accounting-system-frontend-xxxxx.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
};
```

---

## STEP 4: Deploy Frontend to Vercel

```bash
cd frontend

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Project name? accounting-system-frontend
```

### Set Environment Variables
```bash
vercel env add VITE_API_URL
# Value: https://accounting-system-backend-xxxxx.vercel.app/api
```

### Deploy to Production
```bash
vercel --prod
```

**Your app is now live!**
- Frontend: `https://accounting-system-frontend-xxxxx.vercel.app`
- Backend: `https://accounting-system-backend-xxxxx.vercel.app`

---

## STEP 5: Seed Production Database

```bash
# Update backend/.env temporarily with production MongoDB URI
# Then run:
cd backend
npm run seed
```

Or use Vercel CLI to run seed:
```bash
vercel --prod
# Then in Vercel Dashboard → Functions → Run seed.js
```

---

## STEP 6: Verify Deployment

1. Visit Frontend URL
2. Login with:
   - admin@example.com / admin123
   - user1@example.com / user123
3. Test all features:
   - Create transactions
   - Manage users (admin only)
   - View audit logs

---

## IMPORTANT NOTES

### CORS Issues
If you get CORS errors:
1. Update `backend/server.js` with your exact Vercel URLs
2. Redeploy backend: `vercel --prod`

### Environment Variables
- Never commit `.env` files
- Always use `vercel env add` for production secrets
- Use strong JWT_SECRET (min 32 characters)

### Database
- MongoDB Atlas free tier has limitations
- For production with many users, consider paid tier
- Regular backups recommended

### Custom Domain (Optional)
```bash
# Add custom domain
vercel domains add your-domain.com
# Then update DNS records as instructed
```

---

## TROUBLESHOOTING

### Build Fails
```bash
# Check build locally first
cd frontend
npm run build

# Check for errors and fix
```

### API Not Connecting
1. Check Vercel Functions logs in Dashboard
2. Verify CORS origins match exactly
3. Check environment variables are set

### Database Connection Fails
1. Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
2. Check connection string format
3. Ensure database user has correct permissions

---

## UPDATING DEPLOYMENT

### Update Frontend
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push
vercel --prod
```

### Update Backend
```bash
cd backend
git add .
git commit -m "Update backend"
git push
vercel --prod
```

---

## SECURITY CHECKLIST

- [ ] Strong JWT_SECRET (random 32+ chars)
- [ ] MongoDB password is strong
- [ ] CORS origins restricted to your domains
- [ ] Environment variables not in git
- [ ] HTTPS only (Vercel provides this)
- [ ] Remove test data before production

---

## COSTS

- **Vercel**: Free tier (generous limits)
- **MongoDB Atlas**: Free tier (512MB storage)
- **Total Monthly**: $0 for small usage

Upgrade when you need:
- More database storage
- More Vercel function executions
- Custom domains with SSL

---

## SUPPORT

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Issues: Check Vercel Dashboard logs
