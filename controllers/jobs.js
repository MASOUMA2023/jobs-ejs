
const Job = require("../models/Job"); // Assume we have a Job model
const parseValidationErr = require("../util/parseValidationErr"); // Utility to parse validation errors

// Controller to get all jobs
exports.getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ createdBy: req.user._id }); // Get jobs created by the logged-in user
    res.render("jobs", { jobs });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Controller to show the form to create a new job
exports.createJobForm = (req, res) => {
  res.render("job", { job: null }); // Passing null to indicate it's for adding a new job
};

// Controller to add a new job
exports.addJob = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Create a new job with data from the form
    const newJob = new Job({
      title,
      description,
      createdBy: req.user._id, // Set the user who created the job
    });

    await newJob.save(); // Save job to the database
    req.flash("success", "Job added successfully");
    res.redirect("/jobs"); // Redirect to the jobs list page
  } catch (err) {
    const errors = parseValidationErr(err);
    res.render("job", { errors, job: req.body });
  }
};

// Controller to show the form to edit a job
exports.editJobForm = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, createdBy: req.user._id }); // Ensure user owns the job
    if (!job) {
      req.flash("error", "Job not found or you are not authorized to edit it.");
      return res.redirect("/jobs");
    }
    res.render("job", { job });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};

// Controller to update a job
exports.updateJob = async (req, res) => {
  try {
    const { title, description } = req.body;
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user._id }, // Ensure user owns the job
      { title, description },
      { new: true }
    );

    if (!job) {
      req.flash("error", "Job not found or you are not authorized to update it.");
      return res.redirect("/jobs");
    }

    req.flash("success", "Job updated successfully");
    res.redirect("/jobs");
  } catch (err) {
    const errors = parseValidationErr(err);
    res.render("job", { errors, job: req.body });
  }
};

// Controller to delete a job
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, createdBy: req.user._id }); // Ensure user owns the job
    if (!job) {
      req.flash("error", "Job not found or you are not authorized to delete it.");
      return res.redirect("/jobs");
    }

    req.flash("success", "Job deleted successfully");
    res.redirect("/jobs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
};
