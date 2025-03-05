const express = require("express");
require("express-async-errors");
const path = require('path');
const app = express(); 
const jobsRouter = require("./routes/jobs");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const auth = require("./middleware/auth");



app.use(express.static(path.join(__dirname, 'public')));// Serve static files from the 'public' directory
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
app.use(require("body-parser").json());

// Load environment variables
require("dotenv").config(); 
const session = require("express-session");
//  CSRF middleware setup
const csrf = require('csurf');


const MongoDBStore = require("connect-mongodb-session")(session);
let mongoURL = process.env.MONGO_URI;
if (process.env.NODE_ENV == "test") {
  mongoURL = process.env.MONGO_URI_TEST;
}

// MongoDB session store setup
const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: "mySessions",
});

store.on("error", function (error) {
  console.log(error);
});

// Session configuration
const sessionParms = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: store,
  cookie: { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production" // Secure cookies in production
  },
};
app.use(session(sessionParms));

// CSRF middleware configuration for production and development
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  // secure cookies in production
  },
});
app.use(csrfProtection);

// Flash messages setup
const flash = require('connect-flash');
app.use(flash());

// Passport authentication
const passport = require("passport");
const passportInit = require("./passport/passportInit");

passportInit();
app.use(passport.initialize());
app.use(passport.session());
// Middleware for storing locals (storeLocals should return a middleware)
app.use(require("./middleware/storeLocals"));

// Define routes
app.use("/jobs", auth, csrfProtection, jobsRouter);
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));


app.get("/jobs", auth, csrfProtection, async (req, res) => {
  try {
    const jobs = await Job.find();
    res.render("jobs", { 
      jobs, 
      csrfToken: req.csrfToken(), 
      user: req.user, 
      messages: req.flash() 
    });
  } catch (error) {
    req.flash("error", "Error fetching jobs");
    res.redirect("/jobs");
  }
});

// Route to get the job's data and render the edit page
app.get("/jobs/edit/:id", auth,csrfProtection, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/jobs");
    }
    res.render("editJob", { job,csrfToken: req.csrfToken() }); // Render the 'editJob' view and pass the job data
  } catch (error) {
    req.flash("error", "Error fetching job details");
    res.redirect("/jobs");
  }
});
// Route to handle updating the job's data
app.post("/jobs/update/:id", auth,csrfProtection, async (req, res) => {
  try {
    const { position, company, status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/jobs");
    }

    // Update the job with the new data
    job.position = position;
    job.company = company;
    job.status = status;

    await job.save(); // Save the updated job to the database
    req.flash("success", "Job updated successfully");
    res.redirect("/jobs"); // Redirect to the jobs list page
  } catch (error) {
    req.flash("error", "Error updating job");
    res.redirect(`/jobs/edit/${req.params.id}`);
  }
});
// CSRF TOKEN route
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
// Handle CSRF error
app.use(function (err, req, res, next) {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403);
    res.send('Invalid CSRF token');
  } else {
    next(err);
  }
});
// 404 error handler
app.use((req, res) => {
  res.status(404).send(`That page (${req.mongoURL}) was not found.`);
});

// Generic error handler
app.use((err, req, res, next) => {
  res.status(500).send(err.message);
  console.log(err);
});

app.use((req, res, next) => {
  console.log("Session:", req.session);
  console.log("CSRF Token:", req.csrfToken());
  next();
});


//seting the Content_Type
app.use((req, res, next) => {
  if (req.path == "/multiply") {
    res.set("Content-Type", "application/json");
  } else {
    res.set("Content-Type", "text/html");
  }
  next();
});


const methodOverride = require("method-override");
// Use methodOverride to simulate DELETE and PUT requests
app.use(methodOverride("_method"));


//add API
app.get("/multiply", (req, res) => {
  const result = req.query.first * req.query.second;
  if (result.isNaN) {
    result = "NaN";
  } else if (result == null) {
    result = "null";
  }
  res.json({ result: result });
});


// Secret word route
const secretWordRouter = require("./routes/secretWord");
app.use("/secretWord", auth, secretWordRouter);

// Database connection and app start
const port = process.env.PORT || 3000;
const start = () => {
  try {
    require("./db/connect")(mongoURL);
    return app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`),
    );
  } catch (error) {
    console.log(error);
  }
};

start();

module.exports = { app };
