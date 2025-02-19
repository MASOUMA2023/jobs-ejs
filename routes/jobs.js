
const express = require("express");
const router = express.Router();
const jobsController = require("../controllers/jobs");
const auth = require("../middleware/auth"); // auth middleware to protect routes

// GET /jobs - Show all jobs
router.get("/", auth, jobsController.getAllJobs);

// GET /jobs/new - Show form to create a new job
router.get("/new", auth, jobsController.createJobForm);

// POST /jobs - Add a new job
router.post("/", auth, jobsController.addJob);

// GET /jobs/edit/:id - Show form to edit a job
router.get("/edit/:id", auth, jobsController.editJobForm);

// PUT /jobs/update/:id - Update a job
router.put("/update/:id", auth, jobsController.updateJob);

// DELETE /jobs/delete/:id - Delete a job
router.delete("/delete/:id", auth, jobsController.deleteJob);

module.exports = router;