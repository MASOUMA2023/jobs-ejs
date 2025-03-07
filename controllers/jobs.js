
const Job = require("../models/Job"); 
//const parseValidationErr = require("../util/parseValidationErr"); // Utility to parse validation errors
const flash = require("connect-flash")


// Show all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.render("jobs", { 
      jobs, 
      csrfToken: req.csrfToken(), 
      user: req.user, 
      messages: req.flash() 
    });
  } catch (err) {
    req.flash("error", "Unable to fetch jobs");
    res.redirect("/jobs");
  }
};

// Show form to create a new job
exports.createJobForm = (req, res) => {
  res.render("newJob", { csrfToken: req.csrfToken() });
};

// Add a new job
exports.addJob = async (req, res) => {
  
  try {
    const { position,status,company} = req.body;
    const newJob = new Job({
      position,
      status,
      company,
      createdBy: req.user._id, // Assuming you're tracking the user
    });
    const nJob = await newJob
  
    nJob.save();
    req.flash("success", "Job added successfully");
    res.redirect("/jobs");
  } catch (err) {
    req.flash("error", "Error adding job");
    res.redirect("/jobs/new");
  }
};

// Show form to edit a job
exports.editJobForm = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/jobs");
    }
    res.render("editJob", { job, csrfToken: req.csrfToken() });
  } catch (err) {
    req.flash("error", "Error fetching job details");
    res.redirect("/jobs");
  }
};

// Update a job
exports.updateJob = async (req, res) => {
  try {
    const {position,company,status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/jobs");
    }

    job.position = position;
    job.company = company;
   job.status = status;
    await job.save();
    req.flash("success", "Job updated successfully");
    res.redirect("/jobs");
  } catch (err) {
    req.flash("error", "Error updating job");
    res.redirect(`/jobs/edit/${req.params.id}`);
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  console.log('delete route hit')
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/jobs");
    }
    console.log("Job found, deleting...");
    await job.deleteOne(); // Remove the job from the database
    req.flash("success", "Job deleted successfully");
    res.redirect("/jobs"); // Redirect to the jobs list page
  } catch (error) {
    console.log("Error deleting job:", error);
    req.flash("error", "Error deleting job");
    res.redirect("/jobs"); // Redirect to the jobs list page
  }
};
