# Deployment Guide

This guide will help you deploy the Parent-Teacher Contact Notebook application to various platforms.

## Prerequisites

- Supabase project set up with database schema
- Environment variables configured
- Domain name (optional but recommended)

## Vercel Deployment (Recommended)

### 1. Prepare Your Repository

1. Push your code to GitHub, GitLab, or Bitbucket
2. Ensure all environment variables are documented in `.env.example`

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your repository
4. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SENDGRID_API_KEY` (optional)
   - `FROM_EMAIL` (optional)
   - `NEXT_PUBLIC_APP_URL`

### 3. Deploy

1. Click "Deploy"
2. Wait for deployment to complete
3. Test your application at the provided URL

## Netlify Deployment

### 1. Build Configuration

Create `netlify.toml` in your project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 2. Deploy

1. Go to [netlify.com](https://netlify.com)
2. Connect your repository
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables
6. Deploy

## Railway Deployment

### 1. Connect Repository

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub
3. Select your repository

### 2. Configure Environment

1. Add environment variables in Railway dashboard
2. Set `NODE_VERSION` to `18`

### 3. Deploy

1. Railway will automatically detect Next.js
2. Deploy will start automatically
3. Get your deployment URL

## DigitalOcean App Platform

### 1. Create App

1. Go to DigitalOcean App Platform
2. Create new app from GitHub
3. Select your repository

### 2. Configure

1. Set build command: `npm run build`
2. Set run command: `npm start`
3. Add environment variables
4. Set Node.js version to 18

### 3. Deploy

1. Click "Create Resources"
2. Wait for deployment
3. Access your app

## Environment Variables

Make sure to set these in your deployment platform:

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional (for email notifications)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@yourdomain.com

# App URL (for email links)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Post-Deployment Checklist

### 1. Test Core Functionality

- [ ] User registration and login
- [ ] Dashboard access for each role
- [ ] Note creation and viewing
- [ ] Comment system
- [ ] File uploads
- [ ] PDF export
- [ ] Email notifications (if configured)

### 2. Database Setup

- [ ] Run database schema in Supabase
- [ ] Verify RLS policies are active
- [ ] Test with sample data

### 3. Storage Setup

- [ ] Create `attachments` bucket in Supabase Storage
- [ ] Set appropriate permissions
- [ ] Test file uploads

### 4. Email Configuration (Optional)

- [ ] Set up SendGrid account
- [ ] Configure email templates
- [ ] Test email notifications

### 5. Security

- [ ] Verify HTTPS is enabled
- [ ] Check environment variables are secure
- [ ] Test authentication flows
- [ ] Verify RLS policies

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure database schema is applied

3. **File Upload Issues**
   - Verify Supabase Storage bucket exists
   - Check bucket permissions
   - Verify file size limits

4. **Email Notifications Not Working**
   - Check SendGrid API key
   - Verify FROM_EMAIL is set
   - Check email templates

### Performance Optimization

1. **Enable Caching**
   - Configure CDN for static assets
   - Enable browser caching
   - Use Supabase caching

2. **Database Optimization**
   - Add appropriate indexes
   - Monitor query performance
   - Use connection pooling

3. **Image Optimization**
   - Use Next.js Image component
   - Implement lazy loading
   - Compress images

## Monitoring

### 1. Application Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor performance metrics
- Track user analytics

### 2. Database Monitoring

- Monitor Supabase usage
- Set up alerts for errors
- Track query performance

### 3. Email Monitoring

- Monitor email delivery rates
- Track bounce rates
- Set up email alerts

## Backup Strategy

1. **Database Backups**
   - Enable Supabase automatic backups
   - Set up manual backup schedule
   - Test restore procedures

2. **File Storage Backups**
   - Regular backup of Supabase Storage
   - Cross-region replication
   - Test file recovery

3. **Code Backups**
   - Version control with Git
   - Regular pushes to remote repository
   - Tag stable releases

## Scaling Considerations

1. **Database Scaling**
   - Monitor connection limits
   - Consider read replicas
   - Plan for data archiving

2. **Application Scaling**
   - Use CDN for static assets
   - Implement caching strategies
   - Consider serverless functions

3. **Storage Scaling**
   - Monitor storage usage
   - Implement file cleanup policies
   - Consider compression

## Support

For deployment issues:

1. Check the logs in your deployment platform
2. Verify environment variables
3. Test locally first
4. Check Supabase dashboard for errors
5. Review the troubleshooting section above

## Security Best Practices

1. **Environment Variables**
   - Never commit secrets to version control
   - Use platform-specific secret management
   - Rotate keys regularly

2. **Database Security**
   - Use RLS policies
   - Limit service role key usage
   - Monitor access logs

3. **Application Security**
   - Enable HTTPS
   - Implement rate limiting
   - Regular security updates
