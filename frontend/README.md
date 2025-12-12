<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally and deploy it to GitHub Pages.

View your app in AI Studio: https://ai.studio/apps/drive/1mp6JdLYNjY1mCSIEQ-0BgtWTGpCYjOjd

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This app is configured to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

**⚠️ Security Note:** This app uses the Gemini API key on the client side. When deploying to GitHub Pages, the API key will be embedded in the built JavaScript files. For production use, consider:
- Using API key restrictions in the Google Cloud Console to limit usage to your domain
- Implementing a backend proxy to keep the API key secure on the server side
- Monitoring API usage to detect unauthorized access

### Setup Deployment

1. Go to your repository settings on GitHub
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Add a new repository secret named `GEMINI_API_KEY` with your Gemini API key
4. Navigate to **Settings** > **Pages**
5. Under **Build and deployment**, set **Source** to "GitHub Actions"
6. Push changes to the `main` branch to trigger automatic deployment

### Manual Deployment

You can also trigger a deployment manually:
1. Go to the **Actions** tab in your GitHub repository
2. Select the "Deploy to GitHub Pages" workflow
3. Click "Run workflow" and select the branch to deploy

Once deployed, your app will be available at: `https://[your-username].github.io/flashcards/`

