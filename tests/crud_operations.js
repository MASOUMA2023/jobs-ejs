const Job = require("../models/Job");
const { seed_db, testUserPassword } = require("../util/seed_db");
const get_chai = require("../util/get_chai"); // Assume get_chai provides chai and request
const app = require("../app"); // Your Express app
const request = require("supertest");

describe("CRUD Operations for Jobs", function () {
  let csrfToken, csrfCookie, sessionCookie, testUser;

  // before hook for setting up the test environment
  before(async () => {
    const { expect, request } = await get_chai();
    // Step 1: Seed the database
    testUser = await seed_db();

    // Step 2: Log in and get CSRF token and session cookie
    let req = request(app).get("/session/logon").send();
    let res = await req;
    const textNoLineEnd = res.text.replaceAll("\n", "");
    csrfToken = /_csrf\" value=\"(.*?)\"/.exec(textNoLineEnd)[1];

    // Get the cookies from the response headers
    let cookies = res.headers["set-cookie"];
    csrfCookie = cookies.find((element) => element.startsWith("csrfToken"));

    // Prepare login data
    const dataToPost = {
      email: testUser.email,
      password: testUserPassword,
      _csrf: csrfToken,
    };

    req = request(app)
      .post("/session/logon")
      .set("Cookie", csrfCookie)
      .set("content-type", "application/x-www-form-urlencoded")
      .redirects(0)
      .send(dataToPost);
    res = await req;

    // Get the session cookie
    cookies = res.headers["set-cookie"];
    sessionCookie = cookies.find((element) => element.startsWith("connect.sid"));

    // Assertions to check the cookies and CSRF token
    expect(csrfToken).to.not.be.undefined;
    expect(sessionCookie).to.not.be.undefined;
    expect(csrfCookie).to.not.be.undefined;
  });

  // Test: Get the job list and check the number of entries
  it("should fetch the job list and return 20 entries", async () => {
    const res = await request(app)
      .get("/jobs")
      .set("Cookie", sessionCookie)
      .set("CSRF-Token", csrfToken);

    // Check the page content for job entries
    const pageParts = res.text.split("<tr>");
    // The number of <tr> should be 21 because of the header row + 20 jobs
    expect(pageParts.length).to.equal(21);
  });

  // Test: Add a new job entry
  it("should add a new job entry and increase the count to 21", async () => {
    const newJob = {
      title: "New Software Engineer",
      description: "Develop amazing software",
      location: "Remote",
      _csrf: csrfToken, // CSRF token required for POST requests
    };

    // Send a POST request to add the job
    const res = await request(app)
      .post("/jobs")
      .set("Cookie", sessionCookie)
      .set("CSRF-Token", csrfToken)
      .send(newJob);

    // Check the response status and job count
    expect(res.status).to.equal(302); // Assuming it redirects after adding the job

    // Verify the job count in the database
    const jobs = await Job.find({ createdBy: testUser._id });
    expect(jobs.length).to.equal(21); // The count should be 21 after adding the new job
  });
});