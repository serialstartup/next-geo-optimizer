# Contributing to GEO Optimizer

First off, thank you for considering contributing to GEO Optimizer! 🎉

This document provides guidelines and information about contributing to this project. Following these guidelines helps communicate that you respect the time of the developers managing and developing this open source project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Code Style Guidelines](#code-style-guidelines)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to providing a welcoming and inclusive environment. By participating, you are expected to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/geo-optimizer.git
   cd geo-optimizer
   ```
3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL_OWNER/geo-optimizer.git
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```
5. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

## How Can I Contribute?

### 🐛 Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** (code snippets, screenshots)
- **Describe the behavior you observed and what you expected**
- **Include your environment details** (OS, Node.js version, browser)

### 💡 Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### 🔧 Pull Requests

1. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following our code style guidelines
3. **Write or update tests** if applicable
4. **Run linting** to ensure code quality:
   ```bash
   pnpm lint
   ```
5. **Commit your changes** following our commit message guidelines
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** against the `main` branch

## Development Setup

### Prerequisites

- Node.js 18.17 or later
- pnpm 8.0 or later
- Supabase account (for database)
- Apify account (optional, for crawling features)
- OpenAI or Anthropic API key (optional, for AI features)

### Running Locally

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run linting
pnpm lint

# Build for production
pnpm build
```

### Mock Mode

For development without external services, enable mock mode:

```bash
# In .env.local
MOCK_EXTERNAL_SERVICES=true
```

This will use mock data for Apify crawling and AI analysis.

## Code Style Guidelines

### TypeScript

- **Use TypeScript** for all new code
- **Enable strict mode** - no `any` types unless absolutely necessary
- **Define interfaces** for all data structures
- **Use type inference** where types are obvious

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
function getUser(id: any): any {
  // ...
}
```

### React Components

- **Use functional components** with hooks
- **Default to Server Components** in Next.js App Router
- **Use Client Components** only when necessary (interactivity, browser APIs)
- **Keep components small and focused**

```tsx
// ✅ Good - Server Component (default)
export default async function UserProfile({ userId }: { userId: string }) {
  const user = await getUser(userId);
  return <div>{user.name}</div>;
}

// ✅ Good - Client Component (when needed)
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

### File Naming

- **Components**: PascalCase (`UserProfile.tsx`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase for interfaces, camelCase for type files (`types/database.ts`)
- **Routes**: lowercase with hyphens (`app/(dashboard)/brand-voice/page.tsx`)

### Styling

- **Use Tailwind CSS** for styling
- **Use shadcn/ui components** when available
- **Follow mobile-first approach**
- **Use CSS variables** for theming

```tsx
// ✅ Good
<div className="flex flex-col gap-4 p-4 md:flex-row md:gap-6">
  <Card className="flex-1">
    {/* ... */}
  </Card>
</div>

// ❌ Bad - Inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### Imports

- **Group imports** in the following order:
  1. React/Next.js imports
  2. Third-party libraries
  3. Internal components
  4. Internal utilities
  5. Types
  6. Styles

```typescript
// React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Third-party
import { z } from 'zod';

// Internal components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Internal utilities
import { cn } from '@/lib/utils';

// Types
import type { User } from '@/types/database';
```

### Server Actions

- **Use Server Actions** for form submissions and data mutations
- **Validate input** with Zod schemas
- **Return typed responses**

```typescript
'use server';

import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export async function createUser(formData: FormData) {
  const validated = schema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!validated.success) {
    return { error: 'Invalid input' };
  }

  // Create user...
  return { success: true };
}
```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Performance improvement
- `test`: Adding or correcting tests
- `chore`: Changes to build process or auxiliary tools

### Examples

```bash
feat(audit): add GEO visibility score calculation

fix(auth): resolve session persistence issue on refresh

docs(readme): update installation instructions

refactor(api): extract crawl logic into separate service

chore(deps): update Next.js to 16.1.6
```

## Pull Request Process

### Before Submitting

1. **Update documentation** if you're changing functionality
2. **Add tests** for new features
3. **Run linting**: `pnpm lint`
4. **Test your changes** locally

### PR Title

Use the same format as commit messages:
```
feat(component): add new feature description
```

### PR Description

Include:
- **What** changes were made
- **Why** the changes were necessary
- **How** to test the changes
- **Screenshots** for UI changes

### Review Process

1. At least one maintainer must approve the PR
2. All CI checks must pass
3. No merge conflicts with `main`
4. Squash and merge is preferred for clean history

## Issue Reporting

### Bug Report Template

```markdown
## Bug Description
A clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g., macOS 14.0]
- Browser: [e.g., Chrome 120]
- Node.js: [e.g., 20.10.0]
```

### Feature Request Template

```markdown
## Feature Description
A clear and concise description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Any alternative solutions you've considered.

## Additional Context
Any other context or screenshots.
```

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

---

Thank you for contributing to GEO Optimizer! 🚀
