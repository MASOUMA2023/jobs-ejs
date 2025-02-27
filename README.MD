###### Jobs EJS App
This is a simple job listing application built with Node.js, Express, MongoDB, and EJS. The application allows users to register, log in, view, create, edit, and delete job listings.

###### Prerequisites
Before running the project, ensure that you have the following installed:

- Node.js (version 14 or higher)
- MongoDB (local instance or use MongoDB Atlas for cloud DB)

###### Setup Instructions
1. Clone the repository
2. Install dependencies
3. Environment Variables:
.env file
4. Visit the application:
http://localhost:3000



###### Folder Structure
/JOBS-EJS
  /models
    - Job.js          # Mongoose model for job listings
    - User.js         # Mongoose model for users
  /controllers
    - job.js # Controller logic for job operations
    - sessionController.js # Controller logic for authentication (register, login)
  /middleware
    - auth.js          # 
    - storeLocals.js         # 
  /db
    - connect.js          # 
  /passport
    - passportInit.js          # 
  /views
    - /partials       # Reusable partials (head.ejs, header.ejs, footer.ejs)
    - index.ejs       # Homepage view
    - jobs.ejs        # Jobs listing page
    - logon.ejs       # Login page
    - register.ejs    # Register page
    - secretWord.ejs  # Secret Word page
    - newJob.ejs     # Add New Job page
    - editJob.ejs    # Edit Job page
  /public
    - /styles/style.css   # CSS files
  /routes
    - jobs.js    # Routes for job CRUD operations
    - auth.js    # 
    - sessionRoutes.js # Routes for user registration and login
    - secretWord.js # Routes for Secret Word
  /util
    - parseValidationErr.js    # 
  - .env             # Environment variables file (DO NOT commit)
  - app.js           # Main application file
  - package.json     # Project dependencies and metadata


  ###### Features
User Registration & Authentication: Users can register, log in, and manage their sessions.
Job Listings: Users can view all job listings, add new jobs, edit existing jobs, and delete jobs.
Role-Based Access Control: Ensure that users can only manage their own job listings.


###### Dependencies
The following NPM packages are used in this project:

express: Web framework for Node.js
mongoose: MongoDB object modeling
ejs: Template engine for rendering views
bcryptjs: For hashing passwords
passport: Authentication middleware
express-session: For session management
dotenv: Loads environment variables from .env file
mongoose: MongoDB ORM to interact with the database


###### Security
Passwords are hashed using bcryptjs.
The app uses helmet and xss-clean to enhance security.