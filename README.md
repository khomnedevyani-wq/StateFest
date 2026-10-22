# StateFest — State-Level Event Management System

> **“One State. Countless Talents. One Platform.”**

[![Node.js Version](https://img.shields.io/badge/Node.js-v20+-brightgreen.svg)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.19+-blue.svg)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-green.svg)](https://www.mongodb.com)
[![Bootstrap 5](https://img.shields.io/badge/Bootstrap-5.3-purple.svg)](https://getbootstrap.com)
[![Security](https://img.shields.io/badge/Security-bcrypt%20%2B%20JWT-red.svg)](https://jwt.io)
[![License](https://img.shields.io/badge/License-Academic%20Project-lightgrey.svg)]()

A complete, full-stack state-level collegiate event management web application engineered for college IT projects (TYBSc IT / BCA / MCA / BTech). **StateFest** unites universities, engineering institutes, and degree colleges across Maharashtra into a single verified digital platform for technical hackathons, cultural festivals, athletic tournaments, and academic symposiums.

---

## 📋 Table of Contents
1. [Key Features](#-key-features)
2. [Technology Stack](#-technology-stack)
3. [Database Design & Collections](#-database-design--collections)
4. [Project Folder Structure](#-project-folder-structure)
5. [Prerequisites & Installation](#-prerequisites--installation)
6. [Demo Accounts for Examination / Viva](#-demo-accounts-for-examination--viva)
7. [REST API Documentation](#-rest-api-documentation)
8. [Security Implementations](#-security-implementations)
9. [College Project Viva Q&A Guide](#-college-project-viva-qa-guide)
10. [Deployment Guide](#-deployment-guide)

---

## 🌟 Key Features

### 1. Public Portal & Landing Page (`index.html`)
* **Live Counter**: Realtime platform statistics retrieved directly from MongoDB aggregation (Active Events, Registered Students, Total Bookings, Participating Colleges).
* **Multi-Category Navigation**: Quick filters for Technical, Cultural, Sports, Workshops, and Academic festivals.
* **Maharashtra Collegiate Network**: Showcases premier institutes such as VJTI Mumbai, COEP Pune, SPIT Mumbai, Mithibai College, PICT Pune, Walchand Sangli, and GECA.
* **Testimonials & FAQs**: Realistic collegiate participant feedback and support channels.

### 2. Event Discovery (`events.html`)
* **Realtime Search**: Filter events by title keyword or organizer college.
* **Multi-Filter Engine**: Filter by event category and Maharashtra city (Mumbai, Pune, Sangli, Aurangabad, etc.).
* **Dynamic Sorting**: Sort by upcoming date soonest, latest date, fee (free/paid), and popularity.
* **Seat Capacity Tracker**: Visual progress meter showing remaining seats vs maximum participant capacity.
* **Graceful Empty State**: Friendly UI when no events match the selected criteria.

### 3. Event Details & One-Click Registration (`event-details.html`)
* Dynamic rendering of banner, venue, host college, date/time, fee badge, full description, eligibility criteria, and rules list.
* Related event suggestions from the same category.
* **Student Registration Modal**: Prefills verified student profile from the active JWT session.
* **Unique Pass ID Generator**: Generates verifiable unique codes (e.g. `SF-2026-XXXXXX`).
* **Concurrency Protection**: Enforces server-side deadline checks, capacity limits, and compound unique constraints to block duplicate registrations.

### 4. Student Dashboard (`student-dashboard.html`)
* **Profile Overview**: Displays student college, course, year, email, and phone with in-place profile editor modal.
* **Booking Metrics**: Summary cards for Total Bookings, Upcoming Events, and Past Events.
* **Active Passes Table**: Pass ID, event details, date, venue, and status badge.
* **Digital Entry Pass**: High-resolution printable pass with barcode and college ID verification instructions.
* **Cancellation Flow**: Allows students to release seats back to the college capacity pool with confirmation.

### 5. Administrator Control Center (`admin-dashboard.html`)
* **Role-Based Authorization (RBAC)**: Protected server routes restricted to users with `role: 'admin'`.
* **Events Management**: Complete CRUD operations (Create new event modal, Edit event, Delete with cascade registration removal).
* **Registrations & Status Manager**: View all statewide registrations, filter by status (`confirmed`, `attended`, `cancelled`), and change attendee status.
* **One-Click CSV Export**: Downloads complete registration database to `statefest-registrations.csv` for spot desk verification.
* **Student Directory**: Comprehensive list of all registered collegiate students.
* **Inquiry Inbox**: Review messages submitted through the public contact form with direct mailto reply.

---

## 💻 Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Font Awesome 6.5, Google Fonts |
| **Backend** | Node.js (v20+), Express.js (v4.19+), REST API Architecture |
| **Database** | MongoDB, Mongoose ODM (v8.3+) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs (10 salt rounds), Role-Based Access Control |
| **Security & Utilities** | express-rate-limit, cors, dotenv, morgan |

---

## 🗄 Database Design & Collections

The MongoDB database `statefest` consists of 4 normalized collections:

### 1. `users`
* `name`: String, required
* `email`: String, required, unique, lowercase
* `passwordHash`: String, required (bcrypt salted hash)
* `phone`: String, required (10-digit mobile)
* `college`: String, required
* `course`: String, required
* `academicYear`: String, enum: `['First Year (FY)', 'Second Year (SY)', 'Third Year (TY)', 'Final Year', 'Postgraduate (PG)']`
* `role`: String, enum: `['student', 'admin']`, default: `'student'`
* `createdAt`: Date, default: `Date.now`

### 2. `events`
* `title`: String, required
* `slug`: String, lowercase
* `description`: String, required
* `category`: String, enum: `['Technical', 'Cultural', 'Sports', 'Workshops', 'Academic']`
* `bannerImage`: String (URL)
* `date`: Date, required
* `startTime`: String
* `endTime`: String
* `venue`: String, required
* `city`: String, required
* `organizerCollege`: String, required
* `registrationFee`: Number, default: `0`
* `registrationDeadline`: Date, required
* `maxParticipants`: Number, default: `100`
* `registeredCount`: Number, default: `0`
* `eligibility`: String
* `rules`: [String]
* `status`: String, enum: `['upcoming', 'ongoing', 'completed', 'cancelled']`

### 3. `registrations`
* `registrationId`: String, required, unique (e.g. `SF-2026-XXXXXX`)
* `userId`: ObjectId (ref: `User`), required
* `eventId`: ObjectId (ref: `Event`), required
* `status`: String, enum: `['confirmed', 'cancelled', 'attended']`, default: `'confirmed'`
* `registeredAt`: Date, default: `Date.now`
* **Compound Unique Index**: `{ userId: 1, eventId: 1 }` (guarantees that a student can never book the same event twice at database level).

### 4. `contactmessages`
* `name`: String, required
* `email`: String, required
* `subject`: String, required
* `message`: String, required
* `createdAt`: Date, default: `Date.now`

---

## 📁 Project Folder Structure

```
SEMS/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose connection handler
│   ├── controllers/
│   │   ├── adminController.js    # Stats, users directory & CSV export
│   │   ├── authController.js     # Register, login, me
│   │   ├── contactController.js  # Submit inquiry & admin retrieval
│   │   ├── eventController.js    # CRUD, search, filter, sort
│   │   ├── registrationController.js # Event booking, duplicate guard, cancel
│   │   └── userController.js     # Profile retrieval & update
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & adminOnly guard
│   │   └── errorMiddleware.js    # 404 & centralized error handler
│   ├── models/
│   │   ├── ContactMessage.js     # Inquiry schema
│   │   ├── Event.js              # Event schema with compound index
│   │   ├── Registration.js       # Booking schema with unique compound index
│   │   └── User.js               # Student & Admin schema with bcrypt
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   ├── contactRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── userRoutes.js
│   ├── scripts/
│   │   ├── createAdmin.js        # Seeds default admin & demo student
│   │   ├── seedEvents.js         # Seeds 10 realistic Maharashtra college events
│   │   └── testSuite.js          # Automated end-to-end test suite
│   ├── .env                      # Local environment configuration
│   ├── .env.example              # Placeholder template for Git
│   ├── package.json              # Backend dependencies
│   └── server.js                 # Express server & static asset mount
├── frontend/
│   ├── css/
│   │   └── style.css             # Theme (Navy #0f172a, Purple #6366f1, White)
│   ├── js/
│   │   ├── admin-dashboard.js    # Admin events CRUD, registrations, CSV
│   │   ├── app.js                # Navbar auth state, alert toast, formatters
│   │   ├── auth.js               # Register & login form handlers
│   │   ├── events.js             # Catalog search, filter, sort
│   │   ├── registrations.js      # Details view, confirmation modal
│   │   └── student-dashboard.js  # Student passes, cancellation, print pass
│   ├── about.html                # About project & benefits
│   ├── admin-dashboard.html      # Protected Admin portal
│   ├── contact.html              # Contact form & collegiate directory
│   ├── event-details.html        # Dynamic event page & booking modal
│   ├── events.html               # Explore & filter events
│   ├── index.html                # Landing homepage & live stats
│   ├── login.html                # Login screen with quick demo autofill
│   ├── register.html             # Student registration form
│   └── student-dashboard.html    # Protected student pass center
├── .gitignore                    # Git ignore file (node_modules, .env)
├── package.json                  # Root runner package
└── README.md                     # Documentation & viva guide
```

---

## 🚀 Prerequisites & Installation

### Step 1: Install Node.js
Ensure Node.js (version 18, 20, or 24) is installed.
Verify with:
```bash
node -v
npm -v
```

### Step 2: Ensure MongoDB is Running
StateFest connects to MongoDB on default port `27017` or MongoDB Atlas.
To test local MongoDB connection in PowerShell:
```powershell
Get-Service -Name "*mongo*"
```
*(MongoDB Server service should be `Running`)*

### Step 3: Install Dependencies
Open your terminal in the project directory:
```bash
cd backend
npm install
```

### Step 4: Seed Sample Demonstration Events
Populate the database with 10 realistic events across Maharashtra colleges (VJTI, COEP, SPIT, Mithibai, SPPU, PICT, Walchand, Ruia, MIT-WPU, GECA):
```bash
node scripts/seedEvents.js
```

### Step 5: Initialize Demo Accounts
Seed the Administrator and Demo Student credentials:
```bash
node scripts/createAdmin.js
```

### Step 6: Start the Express Server
```bash
node server.js
```
The server will boot and display:
```
=======================================================
 StateFest Server Running in development mode
 Web Application: http://localhost:5000
 API Endpoint:    http://localhost:5000/api/health
=======================================================
[MongoDB] Connected successfully to host: 127.0.0.1, database: statefest
```

### Step 7: Open in Browser
Open your browser and navigate to:
**[http://localhost:5000](http://localhost:5000)**

---

## 🔑 Demo Accounts for Examination / Viva

For quick demonstration to your faculty examiner, click the autofill buttons on `login.html` or use the following credentials:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@statefest.in` | `Admin@123` | Full access to Admin Panel, Create/Edit/Delete events, View all registrations, Export CSV, Manage inquiries |
| **Demo Student** | `student@demo.com` | `Pass@123` | Book events, view digital passes, cancel registrations, edit student profile |

---

## 📡 REST API Documentation

### Authentication Routes (`/api/auth`)
* `POST /api/auth/register` — Register a new student account (bcrypt hashed)
* `POST /api/auth/login` — Authenticate student or admin and return JWT token
* `POST /api/auth/logout` — Logout user session
* `GET /api/auth/me` *(Protected)* — Retrieve active user session profile

### Events Routes (`/api/events`)
* `GET /api/events` — Retrieve events with search (`?search=`), category filter (`?category=`), city (`?city=`), and sorting (`?sort=`)
* `GET /api/events/featured` — Retrieve top 6 upcoming featured events for homepage
* `GET /api/events/stats` — Retrieve aggregate platform metrics
* `GET /api/events/:id` — Retrieve full event details and related events
* `POST /api/events` *(Admin Only)* — Create a new collegiate event
* `PUT /api/events/:id` *(Admin Only)* — Update existing event
* `DELETE /api/events/:id` *(Admin Only)* — Delete event and cascade delete its registrations

### Registrations Routes (`/api/registrations`)
* `POST /api/registrations` *(Student)* — Register for an event (verifies deadline, capacity & duplicates)
* `GET /api/registrations/my` *(Student)* — Get current student's registered passes
* `DELETE /api/registrations/:id` *(Owner or Admin)* — Cancel booking and restore seat capacity
* `GET /api/registrations` *(Admin Only)* — View all statewide registrations with search/filter
* `PUT /api/registrations/:id/status` *(Admin Only)* — Update registration status (`confirmed`, `attended`, `cancelled`)

### Admin Routes (`/api/admin`)
* `GET /api/admin/stats` *(Admin Only)* — Detailed dashboard metrics
* `GET /api/admin/users` *(Admin Only)* — Searchable list of registered students
* `GET /api/admin/export/csv` *(Admin Only)* — Stream and download all registrations as CSV

### Contact Routes (`/api/contact`)
* `POST /api/contact` — Submit public inquiry (recorded in MongoDB)
* `GET /api/contact` *(Admin Only)* — Retrieve all received inquiries

---

## 🔒 Security Implementations

1. **Password Encryption with bcryptjs**: Passwords are never stored in plain text. Salting (10 rounds) and one-way hashing protect against rainbow table attacks.
2. **JWT Authentication**: Stateless, signed tokens ensure tamper-proof sessions.
3. **Server-Side Role-Based Authorization (RBAC)**: Protected routes verify `req.user.role === 'admin'`. Frontend button hiding is augmented by strict server guards returning `403 Forbidden`.
4. **Brute Force Rate Limiting**: Authentication endpoints use `express-rate-limit` (30 attempts per 15-minute window per IP).
5. **Database Concurrency & Duplicate Prevention**: Compound unique index `{ userId: 1, eventId: 1 }` prevents double registration even under race conditions.
6. **Input Validation**: Sanitization and regex checking for emails, 10-digit phone numbers, and positive numbers.
7. **Environment Variables**: MongoDB URIs and secrets are isolated in `.env` and kept out of version control.

---

## 🎓 College Project Viva Q&A Guide

**Q1: What is the main objective of the StateFest project?**
> *Answer:* StateFest is a centralized, state-level Event Management System built to eliminate fragmented manual registrations and Google Forms across colleges in Maharashtra. It automates event discovery, enforces registration deadlines, prevents duplicate seat bookings, generates digital entry passes with unique IDs, and provides administrative oversight with CSV exports.

**Q2: How does the application prevent duplicate registrations?**
> *Answer:* At the database layer, Mongoose applies a compound unique index on `{ userId: 1, eventId: 1 }`. At the application controller layer, the server executes an explicit check before insertion and catches MongoDB duplicate key error code `11000` to provide an informative user message.

**Q3: How is authentication and role-based access control implemented?**
> *Answer:* We use bcryptjs with 10 salt rounds to hash passwords before saving them. On login, the server verifies the hash and generates a signed JSON Web Token (JWT) containing the user ID and role (`student` or `admin`). An Express middleware (`authMiddleware.js`) intercepts requests, verifies the token, and verifies that only admins can access `/api/admin/*` and event modification routes.

**Q4: How are race conditions and seat capacity handled?**
> *Answer:* When a registration occurs, the server atomically checks `registeredCount < maxParticipants` and updates the count using MongoDB's `$inc: { registeredCount: 1 }`. If a student cancels, `$inc: { registeredCount: -1 }` immediately restores the seat.

**Q5: Why did you choose MongoDB over a traditional SQL database?**
> *Answer:* Event data is semi-structured — different events have varied rules, eligibility criteria, and varying metadata (such as workshop prerequisites or sport team rules). MongoDB's flexible BSON document model allows arrays of strings for rules and embedded timestamps without complicated join tables, while Mongoose provides strict schema validation where needed.

**Q6: How does the CSV export feature work?**
> *Answer:* In `adminController.js`, `exportRegistrationsCSV` queries the registrations collection with `.populate('userId')` and `.populate('eventId')`. It formats the fields into CSV standard text, escapes quotes, and sets the HTTP headers `Content-Type: text/csv` and `Content-Disposition: attachment; filename="statefest-registrations.csv"`.

**Q7: How is the frontend rendered?**
> *Answer:* The frontend is built using standard HTML5, CSS3, JavaScript (ES6+ Fetch API), and Bootstrap 5. It uses asynchronous HTTP requests to communicate with our Express REST API, rendering cards and tables dynamically without page reloads.

**Q8: What happens when an event deadline passes?**
> *Answer:* The server compares `new Date(event.registrationDeadline) < new Date()`. If true, the server rejects the registration with a `400 Bad Request`. On the frontend, the "Register" button is automatically disabled and displays "Registration Deadline Expired".

**Q9: How are sensitive credentials protected in Git?**
> *Answer:* All database connection strings, JWT secrets, and port numbers are stored in a `.env` file that is ignored by Git via `.gitignore`. A `.env.example` file is committed to guide developers on configuring their local environment.

**Q10: Can this system be scaled to other states?**
> *Answer:* Yes. The architecture is modular: the `city` and `organizerCollege` fields are dynamic database properties. To expand beyond Maharashtra, one can add a `state` attribute to events and users or configure multi-tenancy.

---

## 🌐 Deployment Guide

### Deploying the Database to MongoDB Atlas
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user and allow Network Access (`0.0.0.0/0`).
3. Copy the connection URI:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/statefest?retryWrites=true&w=majority`
4. Replace `MONGODB_URI` in `backend/.env`.

### Deploying the Application to Render / Railway
1. Push the code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of StateFest"
   git branch -M main
   git remote add origin https://github.com/<your-username>/statefest.git
   git push -u origin main
   ```
2. Log into [Render](https://render.com) and create a **New Web Service**.
3. Select your repository and specify:
   * **Root Directory**: `backend`
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
4. Add Environment Variables:
   * `NODE_ENV`: `production`
   * `MONGODB_URI`: *Your Atlas URI*
   * `JWT_SECRET`: *Your Secure Secret*
5. Since the Express server serves the `frontend/` directory statically, the complete website and backend will run on a single unified URL!

---

*StateFest — Engineered with pride for Maharashtra Higher & Technical Education.*
