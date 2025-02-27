const express = require("express");
require("express-async-errors");
const path = require('path');
const app = express();
//const csrf = require('csrf');  
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
const methodOverride = require("method-override");
// Use methodOverride to simulate DELETE and PUT requests
app.use(methodOverride("_method"));


// Session middleware setup
app.use(session(sessionParms));

// Flash messages setup
const flash = require('connect-flash');
app.use(flash());



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

app.use("/jobs", auth, jobsRouter);
// Define routes
app.get("/", (req, res) => {
  res.render("index");
});
app.use("/sessions", require("./routes/sessionRoutes"));

// Route to get the job's data and render the edit page
app.get("/jobs/edit/:id", auth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/jobs");
    }
    res.render("editJob", { job }); // Render the 'editJob' view and pass the job data
  } catch (error) {
    req.flash("error", "Error fetching job details");
    res.redirect("/jobs");
  }
});

// Route to handle updating the job's data
app.post("/jobs/update/:id", auth, async (req, res) => {
  try {
    const { position, company } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/jobs");
    }

    // Update the job with the new data
    job.position = position;
    job.company = company;

    await job.save(); // Save the updated job to the database
    req.flash("success", "Job updated successfully");
    res.redirect("/jobs"); // Redirect to the jobs list page
  } catch (error) {
    req.flash("error", "Error updating job");
    res.redirect(`/jobs/edit/${req.params.id}`);
  }
});


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
