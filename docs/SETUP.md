# GEO Optimizer - Detailed Setup Guide

This guide provides step-by-step instructions for setting up GEO Optimizer for local development and production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Supabase Setup](#supabase-setup)
4. [Apify Setup](#apify-setup)
5. [AI Provider Setup](#ai-provider-setup)
6. [Running the Application](#running-the-application)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

| Software | Version | Installation |
|----------|---------|--------------|
| **Node.js** | 18.17+ | [Download](https://nodejs.org/) or use [nvm](https://github.com/nvm-sh/nvm) |
| **pnpm** | 8.0+ | `npm install -g pnpm` |
| **Git** | Latest | [Download](https://git-scm.com/) |

### Required Accounts

| Service | Purpose | Sign Up |
|---------|---------|---------|
| **Supabase** | Database, Auth, Storage | [supabase.com](https://supabase.com/) |
| **Apify** | Web Crawling | [apify.com](https://apify.com/) |
| **OpenAI** or **Anthropic** | AI Analysis | [openai.com](https://openai.com/) / [anthropic.com](https://anthropic.com/) |

### Optional Tools

- **Supabase CLI** - For database migrations: `npm install -g supabase`
- **VS Code** - Recommended editor with extensions:
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/yourusername/geo-optimizer.git
cd geo-optimizer
```

### Step 2: Install Dependencies

```bash
pnpm install
```

This will install all required dependencies including:
- Next.js 16 and React 19
- Supabase client libraries
- UI components (shadcn/ui, Radix UI)
- Utility libraries (Zod, Tailwind, etc.)

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` in your editor and fill in the required values (see sections below for how to obtain each value).

---

## Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign in
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `geo-optimizer` (or your preferred name)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose the closest to your users
4. Click **"Create new project"**
5. Wait for the project to be provisioned (1-2 minutes)

### Step 2: Get API Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values to your `.env.local`:

```bash
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co

# anon/public key (safe for browser)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (server-side only, keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> ⚠️ **Security Note**: Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code or commit it to version control.

### Step 3: Run Database Migrations

#### Option A: Using Supabase CLI (Recommended)

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
   (Find your project ref in the Supabase dashboard URL)

4. Push migrations:
   ```bash
   supabase db push
   ```

#### Option B: Manual SQL Execution

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **"New query"**
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **"Run"**

### Step 4: Configure Authentication (Optional)

If you want to enable OAuth providers:

1. Go to **Authentication** → **Providers**
2. Enable desired providers (Google, GitHub, etc.)
3. Configure OAuth credentials for each provider

### Step 5: Verify Setup

1. Go to **Table Editor** in your Supabase dashboard
2. You should see the following tables:
   - `profiles`
   - `sites`
   - `audits`
   - `brand_voices`
   - `simulations`
   - `recommendations`
   - `contents`
   - `jobs`
   - `alerts`

---

## Apify Setup

Apify is used for web crawling to analyze website content.

### Step 1: Create an Apify Account

1. Go to [apify.com](https://apify.com/) and sign up
2. Verify your email address

### Step 2: Get Your API Token

1. Go to **Settings** → **Integrations**
2. Copy your **Personal API token**
3. Add to `.env.local`:

```bash
APIFY_TOKEN=apify_api_your-token-here
```

### Step 3: Understand Usage Limits

Apify offers a free tier with:
- $5 free platform credits monthly
- Sufficient for development and testing

For production, consider:
- **Pay-as-you-go**: ~$0.25-0.50 per 1000 pages crawled
- **Subscription plans**: For higher volumes

### Step 4: Test the Integration (Optional)

You can test the Apify integration using mock mode:

```bash
# In .env.local
MOCK_EXTERNAL_SERVICES=true
```

This will use mock data instead of making real API calls.

---

## AI Provider Setup

GEO Optimizer supports both OpenAI and Anthropic for AI analysis.

### Option A: OpenAI Setup

1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign in or create an account
3. Navigate to **API Keys**
4. Click **"Create new secret key"**
5. Copy the key and add to `.env.local`:

```bash
OPENAI_API_KEY=sk-your-openai-api-key
AI_PROVIDER=openai
```

**Recommended Models:**
- `gpt-4o` - Best quality, higher cost
- `gpt-4o-mini` - Good balance of quality and cost

### Option B: Anthropic Setup

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign in or create an account
3. Navigate to **API Keys**
4. Click **"Create Key"**
5. Copy the key and add to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key
AI_PROVIDER=anthropic
```

**Recommended Models:**
- `claude-3-5-sonnet` - Best balance of quality and speed
- `claude-3-opus` - Highest quality

### Cost Considerations

| Provider | Model | Input (1M tokens) | Output (1M tokens) |
|----------|-------|-------------------|-------------------|
| OpenAI | gpt-4o | $2.50 | $10.00 |
| OpenAI | gpt-4o-mini | $0.15 | $0.60 |
| Anthropic | claude-3-5-sonnet | $3.00 | $15.00 |
| Anthropic | claude-3-opus | $15.00 | $75.00 |

---

## Running the Application

### Development Mode

```bash
pnpm dev
```

This starts the development server at [http://localhost:3000](http://localhost:3000) with:
- Hot Module Replacement (HMR)
- Error overlay
- Fast Refresh

### Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Other Commands

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint:fix

# Type checking
pnpm type-check

# Clean build artifacts
pnpm clean
```

---

## Production Deployment

### Deploy to Vercel (Recommended)

Vercel is the easiest way to deploy Next.js applications.

#### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

#### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com/) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `pnpm build` (default)
   - **Output Directory**: `.next` (default)

#### Step 3: Configure Environment Variables

In Vercel project settings, add all environment variables from `.env.local`:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `APIFY_TOKEN` | Your Apify token |
| `OPENAI_API_KEY` | Your OpenAI key |
| `NEXT_PUBLIC_APP_URL` | Your production URL |

#### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete.

### Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test authentication flow
- [ ] Test database connectivity
- [ ] Update webhook URLs in Apify
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring/alerts (optional)

### Alternative Deployment Options

#### Docker

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

#### Self-Hosted

For self-hosted deployments:

1. Build the application:
   ```bash
   pnpm build
   ```

2. Start with PM2:
   ```bash
   npm install -g pm2
   pm2 start npm --name "geo-optimizer" -- start
   ```

3. Configure reverse proxy (nginx):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## Troubleshooting

### Common Issues

#### "Missing Supabase environment variables"

**Problem**: Application fails to start with Supabase error.

**Solution**: Ensure all Supabase variables are set in `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

#### "APIFY_TOKEN environment variable is not set"

**Problem**: Crawling features don't work.

**Solution**: Either:
1. Add your Apify token to `.env.local`
2. Enable mock mode: `MOCK_EXTERNAL_SERVICES=true`

#### Database tables not found

**Problem**: Queries fail with "relation does not exist" errors.

**Solution**: Run the database migrations:
```bash
supabase db push
# Or manually run the SQL in supabase/migrations/
```

#### Authentication not working

**Problem**: Users can't sign up or log in.

**Solution**:
1. Check Supabase Auth settings
2. Verify redirect URLs are configured
3. Check browser console for errors

#### Build fails with TypeScript errors

**Problem**: `pnpm build` fails with type errors.

**Solution**:
```bash
# Check for type errors
pnpm type-check

# Fix common issues
pnpm lint:fix
```

### Getting Help

If you're still having issues:

1. Check the [GitHub Issues](https://github.com/yourusername/geo-optimizer/issues)
2. Search existing discussions
3. Create a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (OS, Node version, etc.)

---

## Next Steps

After completing setup:

1. **Explore the Dashboard**: Navigate to `/setup` to add your first site
2. **Run a GEO Audit**: Analyze your website's AI visibility
3. **Configure Brand Voice**: Define how AI should represent your brand
4. **Review Documentation**: Check out the [Architecture Guide](./architecture.md)

Happy optimizing! 🚀
