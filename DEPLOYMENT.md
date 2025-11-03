# Deployment Guide for Audiophile E-commerce Website

## Prerequisites

1. ✅ Completed development setup (see SETUP.md)
2. ✅ Convex deployment configured
3. ✅ Resend API key configured
4. ✅ Code pushed to GitHub repository

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Select your repository

2. **Configure Project Settings**
   - Framework Preset: Next.js
   - Root Directory: `.` (root)
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add the following:
     ```
     NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
     RESEND_API_KEY=your_resend_api_key
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your site will be live at `your-project.vercel.app`

5. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add your custom domain

### Option 2: Deploy to Netlify

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Sign in with GitHub
   - Click "New site from Git"
   - Select your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: `.`

3. **Add Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
     RESEND_API_KEY=your_resend_api_key
     ```

4. **Deploy**
   - Click "Deploy site"
   - Your site will be live at `your-site.netlify.app`

## Post-Deployment Checklist

- [ ] Verify Convex connection works
- [ ] Test checkout flow
- [ ] Verify email sending works
- [ ] Test on mobile devices
- [ ] Check all images load correctly
- [ ] Verify form validation works
- [ ] Test accessibility features

## Troubleshooting

### Images Not Loading

If images don't load after deployment:

1. Ensure `assets/` folder is in repository root
2. Images should be accessible at `/assets/...`
3. Check browser console for 404 errors
4. Verify file paths in `assets/db.json`

### Environment Variables Not Working

- Double-check variable names (case-sensitive)
- Redeploy after adding/changing variables
- Check Vercel/Netlify logs for errors

### Convex Connection Issues

- Verify `NEXT_PUBLIC_CONVEX_URL` is correct
- Check Convex dashboard for deployment status
- Ensure Convex deployment is active

### Email Not Sending

- Verify `RESEND_API_KEY` is correct
- Check Resend dashboard for API key status
- Verify sender email domain is verified
- Check server logs for error messages

## Performance Optimization

1. **Image Optimization**
   - Images are already configured for optimization
   - Consider using Next.js Image component for better performance

2. **Caching**
   - Vercel/Netlify automatically cache static assets
   - API routes are cached appropriately

3. **Bundle Size**
   - Run `npm run build` locally to check bundle size
   - Optimize if bundle is too large

## Monitoring

- Set up error tracking (e.g., Sentry)
- Monitor Convex dashboard for errors
- Check Resend dashboard for email delivery rates
- Monitor site performance with Vercel/Netlify analytics

## Backup Strategy

1. **Code**: GitHub repository serves as backup
2. **Database**: Convex automatically backs up data
3. **Environment Variables**: Document all variables

## Rollback Procedure

If deployment fails:

1. Go to deployment history
2. Select previous successful deployment
3. Click "Redeploy"
4. Or revert code changes in GitHub

---

**Note**: Make sure to test thoroughly in production environment before sharing with users.


