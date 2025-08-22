# Deploying Your AirChat Application

This guide provides step-by-step instructions on how to deploy your full-stack AirChat application to the internet using [Render](https://render.com/), a cloud platform that offers a generous free tier for services like this.

## Prerequisites

1.  **GitHub Repository:** Your code should be in a GitHub repository.
2.  **MongoDB Atlas Account:** You need a cloud-hosted MongoDB database. You can get a free one from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
3.  **Render Account:** Sign up for a free account on [Render](https://dashboard.render.com/register).

## Deployment Steps

### 1. Create a New Web Service on Render

-   Log in to your Render dashboard.
-   Click the **"New +"** button and select **"Web Service"**.
-   Connect your GitHub account and select the repository for this project.
-   Give your service a unique name (e.g., `airchat-app`).

### 2. Configure the Service

Render will ask for the following settings. Use these values:

-   **Region:** Choose a region closest to you.
-   **Branch:** `main` (or whichever branch has the latest code).
-   **Root Directory:** Leave this blank if your `package.json` is in the root of the repository.
-   **Runtime:** `Node` (Render should detect this automatically).
-   **Build Command:** `npm install && npm run build`
-   **Start Command:** `npm start`

### 3. Add Environment Variables

This is the most important step. You need to provide the same secrets that you have in your local `.env` file.

-   Scroll down to the **"Environment"** section.
-   Click **"Add Environment Variable"** for each of the following:

| Key             | Value                                                              | Notes                                        |
| --------------- | ------------------------------------------------------------------ | -------------------------------------------- |
| `NODE_ENV`      | `production`                                                       | **Crucial!** This tells our server to use the production build. |
| `MONGO_URI`     | `mongodb+srv://<user>:<password>@...`                             | Get this from your MongoDB Atlas dashboard.  |
| `JWT_SECRET`    | `choose_any_long_random_secret_string`                             | Make up a new, strong secret key.            |
| `GEMINI_API_KEY`| `your_google_gemini_api_key`                                       | Add your Gemini API key if you have one.     |
| `PORT`          | `10000`                                                            | Render provides the port, but it's good practice to set it. |

**Important:** For your `MONGO_URI`, make sure you have allowed access from anywhere (`0.0.0.0/0`) in the MongoDB Atlas "Network Access" settings, as you won't know Render's specific IP address.

### 4. Create the Web Service

-   Click the **"Create Web Service"** button at the bottom of the page.
-   Render will now start building and deploying your application. This may take a few minutes.
-   You can watch the progress in the "Deploy" logs.

### 5. Access Your Application

-   Once the deployment is complete and it says "Live", you will find the public URL for your application at the top of the Render dashboard (e.g., `https://airchat-app.onrender.com`).
-   Visit this URL, and your full application should be running!

Your application is now live on the internet. Any new `git push` to your main branch will automatically trigger a new deployment on Render.
