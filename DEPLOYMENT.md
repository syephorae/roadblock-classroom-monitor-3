# Deploying to Netlify

This guide will walk you through deploying your roadblock-classroom-monitor-3 Next.js application to Netlify.

## Prerequisites

- A [Netlify account](https://app.netlify.com/signup) (free tier works)
- Your project pushed to a Git repository (GitHub, GitLab, or Bitbucket)
- Firebase project credentials

## Method 1: Deploy via Netlify UI (Recommended)

### Step 1: Connect Your Repository

1. Log in to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub, GitLab, or Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the `roadblock-classroom-monitor-3` repository

### Step 2: Configure Build Settings

Netlify should auto-detect your Next.js project. Verify the following settings:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 20

These settings are already configured in your `netlify.toml` file.

### Step 3: Set Environment Variables

Before deploying, you need to add your environment variables:

1. In the Netlify dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add the following:

#### Required Variables:

**`ROBLOX_SECRET_KEY`**
- Value: Your Roblox API secret key
- Scopes: All scopes

#### Firebase Admin SDK Variables:

You'll need to add your Firebase service account credentials. There are two approaches:

**Option A: Individual Variables** (Recommended for security)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (Important: Keep the `\n` newlines intact)

**Option B: Service Account JSON**
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` - The entire service account JSON as a string

> [!TIP]
> Check your `src/firebase/admin.ts` file to see which environment variable approach your code expects.

### Step 4: Deploy

1. Click **"Deploy site"**
2. Netlify will build and deploy your application
3. Wait for the deployment to complete (usually 2-5 minutes)
4. Once complete, you'll get a URL like `https://your-site-name.netlify.app`

### Step 5: Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure your DNS

---

## Method 2: Deploy via Netlify CLI

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Login to Netlify

```bash
netlify login
```

This will open a browser window for authentication.

### Step 3: Initialize Netlify Site

From your project directory:

```bash
netlify init
```

Follow the prompts:
- **Create & configure a new site**: Yes
- **Team**: Select your team
- **Site name**: Choose a unique name or leave blank for auto-generation
- **Build command**: `npm run build`
- **Publish directory**: `.next`

### Step 4: Set Environment Variables via CLI

```bash
netlify env:set ROBLOX_SECRET_KEY "your-secret-key-here"
```

Add all other required Firebase environment variables using the same command.

### Step 5: Deploy

```bash
netlify deploy --prod
```

---

## Post-Deployment Verification

After deployment, verify the following:

### 1. Site Accessibility
- Visit your Netlify URL
- Ensure the homepage loads correctly

### 2. Authentication
- Test the login functionality
- Verify Firebase authentication works

### 3. Dashboard
- Log in and navigate to the dashboard
- Check that student data loads correctly

### 4. API Routes
- Test the `/api/student-record` endpoint
- Verify it properly validates the `ROBLOX_SECRET_KEY`

### 5. Check Deployment Logs
- In Netlify dashboard, go to **Deploys** → Click on latest deploy
- Review build logs for any warnings or errors

---

## Troubleshooting

### Build Fails

**Issue**: Build fails with module not found errors
- **Solution**: Ensure all dependencies are in `package.json` (not just `devDependencies`)
- Run `npm install` locally to verify

**Issue**: TypeScript or ESLint errors during build
- **Solution**: Your `next.config.ts` already has `ignoreBuildErrors: true` and `ignoreDuringBuilds: true`, but you may want to fix these for production

### Environment Variables Not Working

**Issue**: API returns 401 Unauthorized
- **Solution**: Verify `ROBLOX_SECRET_KEY` is set correctly in Netlify
- Check that there are no extra spaces or quotes

**Issue**: Firebase connection fails
- **Solution**: Verify all Firebase environment variables are set
- Check that `FIREBASE_PRIVATE_KEY` includes proper newline characters (`\n`)

### Function Timeout

**Issue**: Netlify functions timeout (10 second default)
- **Solution**: Optimize Firebase queries or upgrade to Netlify Pro for longer timeouts

### Redirects Not Working

**Issue**: API routes return 404
- **Solution**: Verify `netlify.toml` is in the root directory
- Check that the Next.js plugin is properly installed

---

## Updating Your Deployment

### Automatic Deployments (Recommended)

Netlify automatically deploys when you push to your connected Git branch:

```bash
git add .
git commit -m "Update application"
git push origin main
```

### Manual Deployments

Using Netlify CLI:

```bash
netlify deploy --prod
```

---

## Additional Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/overview/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)

---

## Need Help?

If you encounter issues:

1. Check the [Netlify Support Forums](https://answers.netlify.com/)
2. Review your build logs in the Netlify dashboard
3. Verify all environment variables are correctly set
4. Ensure your `.env` file is NOT committed to Git (it should be in `.gitignore`)
