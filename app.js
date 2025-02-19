const express = require("express");
require("express-async-errors");
const app = express();
//const csrf = require('csrf');  
const jobsRouter = require("./routes/jobs");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const auth = require("./middleware/auth");

app.use("/jobs", auth, jobsRouter);

app.use(helmet()); // Adds various security headers
app.use(xssClean()); // Protects against XSS attacks
app.use(rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests, please try again later."
}));


// Body parser setup
app.set("view engine", "ejs");
app.use(require("body-parser").urlencoded({ extended: true }));

// Load environment variables
require("dotenv").config(); 
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const url = process.env.MONGO_URI;

// MongoDB session store setup
const store = new MongoDBStore({
  uri: url,
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

// Session configuration
const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  store: store,
  cookie: { secure: false, sameSite: "strict" },
};

// Flash messages setup
const flash = require('connect-flash');
app.use(flash());

// Session middleware setup
app.use(session(sessionParms));

// CSRF protection setup
//const csrfProtection = csrf({cookie: true});
//app.use(csrfProtection);  

// Passport authentication
const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());

// Middleware for storing locals (storeLocals should return a middleware)
app.use(require("./middleware/storeLocals"));

// Define routes
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

// Secret word route

const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter);

// 404 error handler
app.use((req, res) => {
  res.status(404).send(`That page (${req.url}) was not found.`);
});

// Generic error handler
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

// Database connection and app start
const connectDB = require("./db/connect");
const start = async () => {
  try {
      await connectDB(url);
      const port = process.env.PORT || 3000;
      app.listen(port, () => console.log(`Server is listening on port ${port}...`));
  } catch (error) {
    console.log(error);
  }
};

start();
