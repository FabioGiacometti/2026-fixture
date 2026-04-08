# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Environment variables and Vercel environments

This app now supports **Development**, **Preview**, and **Production** environment variables through Vite and Vercel.

### Required variables

Create these keys locally in `.env.local` or in the Vercel dashboard:

```bash
VITE_API_BASE_URL=
VITE_ANALYTICS_ENABLED=false
VITE_APP_ENV=development
```

### Recommended Vercel values

| Environment | `VITE_API_BASE_URL` | `VITE_ANALYTICS_ENABLED` | `VITE_APP_ENV` |
|---|---|---|---|
| Development | `/` or local API URL | `false` | `development` |
| Preview | `/` or staging API URL | `true` | `preview` |
| Production | `/` or production API URL | `true` | `production` |

> Leave `VITE_API_BASE_URL` empty or set it to `/` when the frontend and the Vercel API routes are hosted together.

### Local setup

```sh
cp .env.example .env.local
npm i
npm run dev
```

### Vercel setup

1. Open your Vercel project.
2. Go to **Settings → Environment Variables**.
3. Add the same keys for **Development**, **Preview**, and **Production**.
4. Keep `main` as the production branch and use branch deployments for previews.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
