# FridgeMagic

FridgeMagic is a full-stack recipe app featuring Chef Zara. Choose a meal type, cuisine, calorie target and diet, then enter ingredients you have on hand. The app asks Google Gemini to generate a recipe and guides you through cooking it one step at a time.

Generated recipes are not saved automatically. Sign in to save a recipe to your personal recipe book, then view or delete it later.

## Features

- Sign up and log in with JWT authentication.
- Generate recipes from meal, cuisine, calorie, diet and ingredient preferences.
- Ask for another recipe using the same preferences and ingredients, or keep the preferences and enter new ingredients.
- Follow guided cooking steps with one timer for the current step.
- Save, browse and delete personal recipes.
- Switch between dark and light themes.
- Interact with the animated Botanical Storybook Chef Zara.

Recipe nutrition and calorie values are generated estimates, not verified dietary or medical advice. Confirm ingredients and allergen information independently.

## Technology

- **Client:** React 18, Vite, React Router, Axios
- **Server:** Node.js, Express 4, Mongoose, MongoDB, JWT, bcryptjs
- **Recipe generation:** Google Gemini API

The client and server have separate `package.json` files and lockfiles. Install and run each from its own directory; there is no root npm manifest.

## Requirements

- Node.js 18 or newer
- MongoDB Atlas cluster or another MongoDB connection string
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

### 1. Configure MongoDB

Create a MongoDB database and a database user, then copy the connection string. Use a strong database password and restrict Atlas Network Access to your development or deployment IP addresses rather than allowing access from everywhere.

The app's suggested database name is `chefapp`.

### 2. Configure and run the server

From the project directory:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Edit `server/.env` and set your values:

```dotenv
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-host>/chefapp?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.6-flash
```

Keep the real `.env` file private; it is excluded by `server/.gitignore`. `GEMINI_MODEL` is optional and defaults to `gemini-3.6-flash`. Choose a model that is available to your API key.

Start the server:

```powershell
npm run dev
```

The server listens on port `5000` by default. Its health endpoint is `http://localhost:5000/api/health`.
For local development, the API allows the Vite origin at `http://localhost:5173`. `CLIENT_ORIGIN` is only needed when the client is hosted on another origin.

### 3. Configure and run the client

Open a second terminal at the project directory:

```powershell
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to `http://localhost:5000` as configured in `client/vite.config.js`.

## Deploy on Render

The root `render.yaml` defines a Render web service for the API and a static site for the client. Push the project to GitHub, then in Render choose **New + → Blueprint**, select the repository, and apply the blueprint.

During setup, provide the API service's `MONGODB_URI` and `GEMINI_API_KEY`. Render generates `JWT_SECRET`; the other service settings are declared in `render.yaml`. The static client gets the API hostname from the web service and the server allows the static site's origin.

Before deploying:

1. In MongoDB Atlas, configure **Network Access** to allow connections from Render. Render's free instances do not have a fixed outbound IP, so Atlas may require `0.0.0.0/0`; use a dedicated database user with a strong password and least-privilege access.
2. Keep API keys, the MongoDB connection string and JWT secret in Render's environment settings only. Never commit them to GitHub.
3. If you rename the `fridgemagic-client` static service, update `CLIENT_ORIGIN` on the `fridgemagic-api` service to the new `https://<service-name>.onrender.com` address.

After deployment, check `https://<api-service>.onrender.com/api/health`, then open the static-site URL. Render's free web services may sleep when idle, so the first API request after inactivity can take longer.

## Scripts

### Client (`client/`)

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production client build in `client/dist` |
| `npm run preview` | Preview the production build locally |

### Server (`server/`)

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API with Node.js |

## API overview

All API routes are mounted by `server/index.js`.

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/health` | No | Check that the API is responding |
| `POST` | `/api/auth/signup` | No | Create an account |
| `POST` | `/api/auth/login` | No | Log in and receive a JWT |
| `POST` | `/api/chef/generate` | Yes | Generate a recipe with Gemini |
| `GET` | `/api/recipes` | Yes | List the signed-in user's saved recipes |
| `POST` | `/api/recipes` | Yes | Save a recipe |
| `DELETE` | `/api/recipes/:id` | Yes | Delete one of the signed-in user's recipes |

Authenticated routes expect an `Authorization: Bearer <token>` header. Login and signup tokens expire after seven days.

## Project structure

```text
client/
  index.html
  vite.config.js
  src/
    api.js                           Shared API client (Render host or Vite proxy)
    App.jsx                         Routes and authentication guards
    main.jsx                        React entry point
    index.css                       Global styles and theme variables
    components/
      ChefCharacter.jsx             Interactive Botanical Storybook chef
      RecipeCard.jsx                Recipe details and guided cooking steps
      SpeechBubble.jsx              Chef speech bubble
      StarsBg.jsx                   Decorative animated background
      StepTimer.jsx                 Timer for the active cooking step
      ThemeToggle.jsx               Dark/light theme control
    context/
      AuthContext.jsx               Authentication and session state
      ThemeContext.jsx              Theme state and persistence
    pages/
      AuthPage.jsx                  Login and signup
      ChefPage.jsx                  Recipe preference and generation flow
      SavedRecipesPage.jsx          Saved recipe book

server/
  index.js                          Express app, middleware, routes and DB connection
  .env.example                      Environment variable template
  .gitignore                        Excludes node_modules, .env and chef.db
  middleware/
    auth.js                         JWT verification
  models/
    Recipe.js                       Saved recipe schema
    User.js                          User schema and password hashing
  routes/
    auth.js                         Signup and login endpoints
    chef.js                         Gemini recipe generation endpoint
    recipes.js                      Save, list and delete recipe endpoints
```

## Troubleshooting

- **MongoDB connection fails:** Check `MONGODB_URI`, database credentials and Atlas Network Access.
- **The client cannot reach the API:** Run the server on port `5000` and the Vite client on port `5173`; those are the current Vite proxy settings.
- **Render reports a CORS error:** Set `CLIENT_ORIGIN` on the API service to the exact deployed static-site origin (including `https://`), then redeploy the API.
- **Invalid or expired token:** Log in again. The client clears an invalid session after an authenticated API request returns `401`.
- **Gemini model unavailable:** Set `GEMINI_MODEL` in `server/.env` to a model available to your API key, then restart the server.
- **Gemini returns `429`:** The API key has reached a request or quota limit. Check the quota and retry later.
- **Gemini returns `503`:** The generation service may be temporarily busy. Retry later.
- **Generation times out:** The server's Gemini request timeout is 30 seconds; the client request timeout is 35 seconds. Check server logs and Gemini availability.
- **Generation fails:** Confirm `GEMINI_API_KEY` is set in `server/.env` and check the server terminal for the provider error.
