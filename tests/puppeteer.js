// tests/puppeteer_job_operations.js
const puppeteer = require('puppeteer');
const { expect } = require('chai');
const Job = require("../models/Job");
const { seed_db, testUserPassword } = require("../util/seed_db");

describe("puppeteer job operations", function () {
  let browser, page, csrfToken, sessionCookie, testUser;

  // Setup the browser and page before the tests
  before(async () => {
    // Seed the database
    testUser = await seed_db();

    // Launch the browser and create a new page
    browser = await puppeteer.launch({ headless: false, slowMo: 50 });
    page = await browser.newPage();

    // Go to the login page and get the CSRF token and session cookie
    await page.goto('http://localhost:3000/session/logon'); // Update with your URL

    // Extract CSRF token
    csrfToken = await page.$eval('input[name="_csrf"]', el => el.value);
    sessionCookie = await page.cookies();

    // Perform login (mocked here as a form submission)
    await page.type('input[name="email"]', testUser.email);
    await page.type('input[name="password"]', testUserPassword);
    await page.click('button[type="submit"]'); // Assuming a submit button

    // Wait for the login response
    await page.waitForNavigation();
  });

  after(async () => {
    // Close the browser after the tests
    await browser.close();
  });

  it("should load the job listings page and show 20 jobs", async () => {
    // Click the link to the jobs list page
    await page.click('a[href="/jobs"]'); // Replace with the correct selector for your jobs list link

    // Wait for the page content to load
    await page.waitForSelector('table'); // Wait for the table to appear

    // Get the HTML content of the page
    const pageContent = await page.content();
    
    // Split the content to count the number of job rows
    const pageParts = pageContent.split("<tr>");
    
    // Assert there are 21 <tr> elements (1 header row + 20 jobs)
    expect(pageParts.length).to.equal(21);
  });

  it("should load the Add A Job form", async () => {
    // Click the "Add A Job" button
    await page.click('a[href="/jobs/new"]'); // Replace with the correct selector for your "Add A Job" button

    // Wait for the job form to load
    await page.waitForSelector('form'); // Wait for the form to appear

    // Check if the form contains the expected fields and button
    const companyField = await page.$('input[name="company"]');
    const positionField = await page.$('input[name="position"]');
    const addButton = await page.$('button[type="submit"]');

    expect(companyField).to.not.be.null;
    expect(positionField).to.not.be.null;
    expect(addButton).to.not.be.null;
  });

  it("should add a new job and verify it in the database", async () => {
    // Fill in the form fields
    await page.type('input[name="company"]', "Test Company");
    await page.type('input[name="position"]', "Test Position");

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for the jobs list to come back up
    await page.waitForSelector('table'); // Wait for the table to reappear

    // Get the page content after submission
    const pageContent = await page.content();
    const successMessage = await page.$eval('.success-message', el => el.innerText); // Assuming success message has this class

    // Check the success message
    expect(successMessage).to.include("Job has been added");

    // Verify the new job exists in the database
    const jobs = await Job.find({ createdBy: testUser._id });
    expect(jobs.length).to.equal(21); // Ensure the job count has increased
    const newJob = jobs[jobs.length - 1]; // Get the latest job
    expect(newJob.company).to.equal("Test Company");
    expect(newJob.position).to.equal("Test Position");
  });
});
