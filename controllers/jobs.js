
const Job = require("../models/Job"); // Assume we have a Job model
//const parseValidationErr = require("../util/parseValidationErr"); // Utility to parse validation errors

// Controller functions for jobs

// Show all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.render("jobs", { jobs, messages: req.flash() });
  } catch (err) {
    req.flash("error", "Unable to fetch jobs");
    res.redirect("/jobs");
  }
};

// Show form to create a new job
exports.createJobForm = (req, res) => {
  res.render("newJob");
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
    res.render("editJob", { job });
  } catch (err) {
    req.flash("error", "Error fetching job details");
    res.redirect("/jobs");
  }
};

// Update a job
exports.updateJob = async (req, res) => {
  try {console.log('update')
    const {position,company } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      req.flash("error", "Job not found");
      return res.redirect("/jobs");
    }

    job.position = position;
    job.company = company;
   
    await job.save();
    req.flash("success", "Job updated successfully");
    res.redirect("/jobs");
  } catch (err) {
    req.flash("error", "Error updating job");
    //res.redirect(`/jobs/edit/${req.params.id}`);
  }
};

// Delete a job
exports.deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    req.flash("success", "Job deleted successfully");
    res.redirect("/jobs");
  } catch (err) {
    req.flash("error", "Error deleting job");
    res.redirect("/jobs");
  }
};

