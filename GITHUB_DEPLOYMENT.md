# GitHub Deployment Setup

This guide will help you set up automated deployment to GitHub with Vercel integration.

## Prerequisites

1. **GitHub Repository**: Your code should be in a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Convex Account**: Sign up at [convex.dev](https://convex.dev)
4. **Resend Account**: Sign up at [resend.com](https://resend.com)

## Quick Setup Steps

### 1. Fork or Clone Repository

```bash
# Clone this repository
git clone https://github.com/your-username/checkout-system.git
cd checkout-system

# Or fork it on GitHub and clone your fork
```

### 2. Set Up Vercel Project

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy

### 3. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

#### Required Secrets
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
CONVEX_DEPLOY_KEY=your_convex_deploy_key
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=your-deployment-name
PRODUCTION_URL=https://your-domain.com
```

#### How to Get These Values

**Vercel Token:**
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token
3. Copy the token value

**Vercel Org ID and Project ID:**
1. In your Vercel project dashboard
2. Go to Settings → General
3. Copy "Project ID" and "Team ID" (if using a team)

**Convex Deploy Key:**
1. Go to [dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Go to Settings → Deploy Keys
4. Create a new deploy key

### 4. Set Up Environment Variables in Vercel

In your Vercel project dashboard → Settings → Environment Variables:

#### Production Environment
```
NODE_ENV=production
CONVEX_DEPLOYMENT=your-prod-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud
RESEND_API_KEY=re_your_production_api_key
EMAIL_FROM_ADDRESS=noreply@your-domain.com
EMAIL_FROM_NAME=Your Store Name
```

#### Preview Environment (for PR deployments)
```
NODE_ENV=production
CONVEX_DEPLOYMENT=your-preview-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-preview-deployment.convex.cloud
RESEND_API_KEY=re_your_staging_api_key
EMAIL_FROM_ADDRESS=noreply@staging.your-domain.com
EMAIL_FROM_NAME=Your Store Name (Staging)
```

### 5. Configure Custom Domain (Optional)

1. In Vercel project → Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Update `PRODUCTION_URL` secret with your custom domain

## Deployment Workflow

### Automatic Deployments

- **Pull Requests**: Creates preview deployments automatically
- **Main Branch**: Deploys to production automatically
- **All Deployments**: Run tests, linting, and type checking first

### Manual Deployment

```bash
# Deploy to production manually
vercel --prod

# Deploy Convex functions
npx convex deploy --prod
```

## Monitoring and Maintenance

### Health Checks

The deployment includes automatic health checks:
- API endpoint health: `/api/health`
- Convex connection test
- Resend service test

### Performance Monitoring

- Lighthouse audits run on every production deployment
- Core Web Vitals tracking
- Bundle size analysis

### Error Tracking

Set up Sentry for error tracking (optional):

1. Create Sentry project
2. Add `SENTRY_DSN` to environment variables
3. Uncomment Sentry configuration in the code

## Troubleshooting

### Common Issues

**Build Failures:**
- Check environment variables are set correctly
- Verify Convex deployment is accessible
- Check for TypeScript errors

**Deployment Failures:**
- Verify Vercel token has correct permissions
- Check Convex deploy key is valid
- Ensure all required secrets are set

**Runtime Errors:**
- Check Vercel function logs
- Verify external service connectivity
- Review Sentry error reports (if configured)

### Getting Help

1. Check the [deployment documentation](./docs/DEPLOYMENT.md)
2. Review Vercel deployment logs
3. Check GitHub Actions workflow logs
4. Contact support if needed

## Security Notes

- Never commit API keys or secrets to the repository
- Use environment variables for all sensitive data
- Regularly rotate API keys and deploy keys
- Monitor access logs for suspicious activity

## Next Steps

After successful deployment:

1. Test the checkout flow end-to-end
2. Set up monitoring and alerts
3. Configure backup procedures
4. Plan for regular maintenance updates

Your checkout system should now be automatically deployed to GitHub with Vercel! 🚀