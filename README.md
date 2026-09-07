# MERN Stack E-Commerce Website

This is the backend for a MERN stack e-commerce app. It's built with Node.js, Express, and MongoDB, and handles two main things: user accounts (registering, logging in, resetting a forgotten password) and products (creating, viewing, updating, and deleting them). Only admins are allowed to manage products — everyone else can just browse them.

## What's Under the Hood

The backend leans on a handful of well-known packages to do the heavy lifting:

- **Express** runs the server and routes requests to the right place.
- **Mongoose** talks to MongoDB for us.
- **bcryptjs** hashes passwords before they ever touch the database, so no one's real password is sitting there in plain text.
- **jsonwebtoken** creates and checks the login tokens that keep a user signed in.
- **cookie-parser** reads that token back out of the cookie sent with each request.
- **nodemailer** sends the actual email when someone requests a password reset.
- **validator** makes sure an email address at least looks like a real one before we accept it.
- **dotenv** pulls in environment variables from a config file instead of hardcoding them.
- **nodemon** just restarts the server for you automatically while you're developing, so you're not doing it by hand every time you save a file.

## How the Project's Laid Out

```
backend/
├── config/
│   ├── config.env          # your environment variables live here, kept out of Git
│   └── database.js         # connects to MongoDB
├── controllers/
│   ├── userController.js   # register, login, logout, password reset logic
│   └── productController.js# create, read, update, delete logic for products
├── middleware/
│   ├── auth.js             # checks if you're logged in, and what role you have
│   ├── catchAsyncErrors.js # catches errors from async functions automatically
│   └── error.js            # turns errors into a clean JSON response
├── models/
│   ├── userModel.js
│   └── productModel.js
├── routes/
│   ├── userRoute.js
│   └── productRoute.js
├── utils/
│   ├── apifeatures.js      # search, filtering, and pagination for the product list
│   ├── errorHandler.js     # a custom error class that carries a status code
│   ├── jwtToken.js         # builds the token and sends it back as a cookie
│   └── sendEmail.js        # handles sending emails through nodemailer
├── app.js                  # wires up Express, middleware, and the routes
└── server.js                # starts everything up and connects to the database
```

## Getting It Running

Start by cloning the repo and installing everything it needs:

```bash
git clone <your-repo-url>
cd mern-stack-e-commerce
npm install
```

Next, create a file at `backend/config/config.env` and fill it in like this:

```
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=5d
COOKIE_EXPIRE=5
SMPT_SERVICE=gmail
SMPT_MAIL=your_email_address
SMPT_PASSWORD=your_email_app_password
```

Here's what each of those is actually doing:

`PORT` is just which port your server listens on locally. `MONGODB_URI` is your database connection string, whether that's a local MongoDB instance or something hosted on Atlas. `JWT_SECRET` is the key used to sign login tokens — treat it like a password, since anyone with it could forge a valid token. `JWT_EXPIRE` decides how long a login stays valid before the token expires, and `COOKIE_EXPIRE` does the same thing for how many days the cookie sticks around in the browser. The three `SMPT_` variables are your email credentials, used purely for sending the password reset email.

This file should stay out of Git entirely — it's meant to hold real secrets, not placeholder ones.

Once that's set up, start the server:

```bash
npm run dev
```

or, without auto-restart on changes:

```bash
npm start
```

You'll know it worked if the console shows the server running and MongoDB connecting successfully.

## The Routes

Everything below sits under the `/api/v1` prefix.

### User Routes

Registering is a simple `POST /register` with a name, email, and password — the password gets hashed before it's saved, so it's never stored as plain text.

Logging in is `POST /login`, and it hands back a JWT token both as an httpOnly cookie and in the response body. Logging out is a `GET /logout`, which just clears that cookie.

Forgetting your password kicks off at `POST /password/forgot` — this generates a random token, saves a hashed version of it on the user's record, and emails the real version as a reset link. That link is only good for 10 minutes. Actually resetting the password happens at `PUT /password/reset/:token`, using the token from that email.

### Product Routes

Anyone can look at products — `GET /products` returns the full list, and it supports searching by keyword, filtering by things like price or rating, and paginating through results. `GET /product/:id` returns a single product's details.

Creating, updating, and deleting products is locked down to admins only. `POST /product/new` creates one, `PUT /product/:id` updates it, and `DELETE /product/:id` removes it — all three require the user to be logged in and to have the admin role.

## How Login and Permissions Work Together

When someone registers or logs in, the server signs a JWT with their user ID and sends it back as a cookie. From there, any route that needs a logged-in user runs it through the `isAuthenticatedUser` middleware, which pulls the token out of the cookie, verifies it, and attaches the matching user to the request. Routes that need more than "just logged in" — like the admin-only product routes — add `authorizeRoles` on top, which checks that the attached user actually has the right role before letting the request through.

## Handling Errors

Rather than sprinkling try/catch blocks through every single route, async route handlers are wrapped in a small helper that automatically catches whatever goes wrong and passes it along to Express's error-handling middleware. That middleware is what turns any error into a consistent JSON response with a proper status code and message, instead of a raw crash or an inconsistent response shape.
