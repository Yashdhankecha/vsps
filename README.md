# VSPS — Vanasol Satavis Patidar Samaj (Community Hall Management System)

A full-stack web application for managing a community hall (Sabhagruh) — covering hall bookings, Samuh Lagan registrations, event management, content administration, committee operations, student awards, and more.

**Live URL:** [https://vansolsamaj.netlify.app](https://vansolsamaj.netlify.app)  
**Backend API:** [https://vsps.onrender.com](https://vsps.onrender.com)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Features](#features)
  - [Authentication & User Management](#1-authentication--user-management)
  - [Hall Booking System](#2-hall-booking-system)
  - [Samuh Lagan (Community Marriage) Booking](#3-samuh-lagan-community-marriage-booking)
  - [Event Categories & Pricing](#4-event-categories--pricing)
  - [Home Content Management](#5-home-content-management)
  - [Gallery & Media](#6-gallery--media)
  - [Reviews & Testimonials](#7-reviews--testimonials)
  - [Contact & Inquiry Management](#8-contact--inquiry-management)
  - [Resources & Articles](#9-resources--articles)
  - [Student Award Registration](#10-student-award-registration)
  - [Committee Module](#11-committee-module)
  - [Admin Panel](#12-admin-panel)
  - [Live Streaming](#13-live-streaming)
  - [Custom Form Builder](#14-custom-form-builder)
- [Role-Based Access Control](#role-based-access-control)
- [Backend API Overview](#backend-api-overview)
- [Security](#security)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)

---

## Project Overview

VSPS is a community hall and samaj management platform built to digitize operations for a village-based social organization. It enables citizens to book the hall, register for community events, submit awards, and interact with the organization, while admins manage content, users, bookings, and reports — all from a centralized dashboard.

---

## Tech Stack

### Frontend (`/client`)
| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router v6 | Client-side routing |
| Tailwind CSS | Utility-first styling |
| Material UI (MUI) | Component library |
| Axios | HTTP client |
| Recharts | Charts & analytics |
| React Big Calendar | Booking calendar view |
| React Hot Toast / Toastify | Notifications |
| React Icons / Heroicons | Icon sets |
| jsPDF | PDF generation |

### Backend (`/server`)
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Authentication tokens |
| bcryptjs | Password hashing |
| Multer | File uploads (images, PDFs) |
| Cloudinary | Cloud image/media storage |
| Nodemailer | Email delivery (OTP, notifications) |
| Helmet | HTTP security headers |
| express-rate-limit | Rate limiting |
| express-mongo-sanitize | NoSQL injection protection |
| xss-clean | XSS attack prevention |
| hpp | HTTP parameter pollution protection |
| Twilio | SMS notifications |

---

## Folder Structure

```
vsps/
├── client/                     # React frontend (Vite)
│   └── src/
│       ├── pages/              # All page-level components
│       │   ├── adminpanel/     # Admin dashboard pages
│       │   └── committee/      # Committee member pages
│       ├── components/         # Reusable UI components
│       │   ├── admin/          # Admin layout components
│       │   └── user/           # User-facing components
│       ├── api/                # API call definitions
│       ├── contexts/           # React context providers
│       ├── hooks/              # Custom React hooks
│       ├── services/           # Service layer abstractions
│       └── utils/              # Utility functions
│
└── server/                     # Node.js + Express backend
    ├── controllers/            # Business logic per feature
    ├── models/                 # Mongoose data models
    ├── routes/                 # Express route definitions
    ├── middleware/             # Auth, upload, rate limiter
    ├── config/                 # DB connection config
    ├── services/               # Reusable service logic
    ├── validators/             # Input validation rules
    ├── utils/                  # Utility helpers
    └── scripts/                # Seed scripts
```

---

## Features

### 1. Authentication & User Management

**Files:** `authController.js`, `userController.js`, `Auth.jsx`, `ForgotPassword.jsx`, `ResetPassword.jsx`, `ProfileSettings.jsx`  
**Model:** `User.js`  
**Routes:** `/api/auth`, `/api/users`

- **Registration with OTP Verification** — Users register with username, email, and password. A 6-digit OTP is sent via Gmail SMTP to verify the email address before activation.
- **Login with JWT** — Authenticated sessions are token-based (1-hour expiry). Role information is embedded in the token payload.
- **Forgot / Reset Password** — OTP-based password recovery flow. OTP is valid for 10 minutes.
- **Resend OTP** — Users can request a new OTP if the previous one expired.
- **Profile Management** — Users can update their phone, company, address, profile image (via Cloudinary), and notification preferences.
- **Password History** — Last 5 password hashes are stored to prevent reuse.
- **Roles:** `user`, `admin`, `superadmin`, `usermanager`, `contentmanager`, `formmanager`, `bookingmanager`, `contactmanager`, `committeemember`
- **Village Association** — Users can have a village name linked to their account.
- **Notification Preferences** — Email and SMS notification toggles per user.

---

### 2. Hall Booking System

**Files:** `bookingController.js`, `bookingRoutes.js`, `Booking.jsx`, `RecentBookings.jsx`, `BookingManagement.jsx`, `BookedDatesCalendar.jsx`  
**Model:** `Booking.js`  
**Routes:** `/api/bookings`

- **New Booking Form** — Collect booker's first name, surname, email, phone, event type, date, village name, guest count, and additional services needed.
- **Document Upload** — Booking requires uploading an identity/event document (Aadhar Card, PAN Card, Passport, Event Invitation, Marriage Certificate, etc.) as proof.
- **Samaj Member Pricing** — Bookings by Samaj (community) members receive preferential rates.
- **Booking Status Workflow** — `Pending → Approved → Booked` or `Rejected` with a rejection reason.
- **My Bookings (User View)** — Users can view their recent bookings and current status.
- **Admin Booking Management** — Admins can view all bookings, filter by status/date, approve or reject with reasons.
- **Booked Dates Calendar** — A visual calendar shows unavailable dates to prevent conflicts.
- **Additional Services** — Multi-select add-ons (e.g., catering, decoration, AV equipment).

---

### 3. Samuh Lagan (Community Marriage) Booking

**Files:** `samuhLagan.js` (routes), `SamuhLaganBooking.jsx`, `BookVillageEvent.jsx`  
**Model:** `SamuhLagan.js`  
**Routes:** `/api/bookings/samuh-lagan`

- **Dedicated Marriage Registration** — Separate module for community (Samuh) marriages organized by the samaj.
- **Bride & Groom Details** — Full profiles for both parties: name, father's name, mother's name, age, contact, email, address, photo, and supporting documents.
- **Ceremony Date Selection** — Date picker for ceremony scheduling.
- **Status Lifecycle** — `pending → approved → confirmed → rejected` with reason tracking.
- **Payment Status** — Tracks payment status (`pending` / `paid`).
- **Authentication Required** — Only logged-in users can submit Samuh Lagan applications.

---

### 4. Event Categories & Pricing

**Files:** `eventCategoryController.js`, `eventCategoryRoutes.js`, `EventCategories.jsx`  
**Model:** `EventCategory.js`  
**Routes:** `/api/content/event-categories`

- **Event Types** — Categorized venue offerings (e.g., weddings, corporate events, social gatherings) each with title, description, icon, capacity, and image.
- **Membership-Based Pricing** — Dual pricing for Samaj members vs. non-members.
- **Feature Lists** — Per-category bullet features (what's included).
- **Packages** — Multiple booking packages per event category with name, price, and included items. Popular packages are flagged.
- **Ordering & Active Status** — Categories can be toggled active/inactive and ordered.
- **Admin CRUD** — Full create, read, update, delete management from the admin panel.

---

### 5. Home Content Management

**Files:** `homeContentController.js`, `homeContentRoutes.js`, `Home.jsx`, `ContentManagement.jsx`  
**Model:** `HomeContent.js`  
**Routes:** `/api/content`

- **Hero Slider** — Manage dynamic hero banner slides (title, description, image, active flag, order).
- **Introduction Section** — Editable heading, description, and highlight cards (icon + title + subtitle).
- **Downloadable Document** — A document (e.g., brochure/rules PDF) linkable from the introduction section.
- **About Section** — Heading, description, image, and feature cards with icons.
- **Leadership Section** — Team members with name, position, image, and bio displayed on the homepage.
- **CMS-Driven** — All homepage content is database-driven and fully editable via the admin panel without code changes.

---

### 6. Gallery & Media

**Files:** `contentController.js`, `contentRoutes.js`, `Gallery.jsx`, `VideoManagement.jsx`  
**Model:** `GalleryItem.js`  
**Routes:** `/api/content`

- **Image Gallery** — Upload and display images organized by category/event.
- **Video Management** — Upload and manage event videos.
- **Intro Video** — A featured introduction video displayed on the homepage (`IntroVideo.jsx`).
- **Cloudinary Integration** — Images and videos are uploaded to and served from Cloudinary.
- **Admin Upload** — Drag-and-drop file uploads from the admin panel.

---

### 7. Reviews & Testimonials

**Files:** `reviewController.js`, `reviewRoutes.js`, `SubmitReview.jsx`, `Testimonials.jsx`, `Reviews.jsx`  
**Model:** `Review.js`  
**Routes:** `/api/reviews`

- **Submit Review** — Users submit reviews with their name, email, event type (wedding, corporate, birthday, social, other), event date, star rating (1–5), title, review text, and optional photos.
- **Approval Workflow** — Reviews require admin approval before appearing publicly.
- **Testimonials Page** — Displays all approved reviews to visitors.
- **Admin Reviews Panel** — Admins can view, approve, or delete reviews.
- **Image Attachments** — Reviewers can attach photos with Cloudinary storage.

---

### 8. Contact & Inquiry Management

**Files:** `contactController.js`, `contactRoutes.js`, `Contact.jsx`, `ContactManagement.jsx`  
**Model:** `Contact.js`  
**Routes:** `/api/contacts`

- **Contact Form** — Public contact form for general inquiries (name, email, phone, message).
- **Automatic Email Notification** — Admin receives an email notification on new inquiry submission.
- **Contact Management** — Admin panel view to read, reply to, and manage all inquiries.
- **Status Tracking** — Track whether contacts have been responded to.

---

### 9. Resources & Articles

**Files:** `contentController.js`, `Resources.jsx`  
**Model:** `Resource.js`  
**Routes:** `/api/content`

- **Downloadable Resources** — Planning guides, decoration ideas, checklists, and other resources available for download.
- **Categories** — Resources are organized into `planning`, `decoration`, `checklists`, and `guides`.
- **Download Count** — Tracks how many times each resource has been downloaded.
- **Articles** — Featured articles/blogs with title, excerpt, full content, image, read time, category, and view count.
- **Featured Articles** — Certain articles can be flagged as featured for homepage/highlight display.

---

### 10. Student Award Registration

**Files:** `studentAwardRoutes.js`, `StudentAwardRegistration.jsx`  
**Model:** `StudentAward.js`  
**Routes:** `/api/student-awards`

- **Academic Excellence Awards** — Community students can register their academic achievements for recognition.
- **Student Details** — Name, contact, email, address, school name, standard (grade), board, exam year, total percentage.
- **Marksheet Upload** — Applicants must upload their marksheet as proof.
- **Eligibility** — Students with 85%+ or first/second/third rank in their exam are eligible.
- **Approval Workflow** — `pending → approved / rejected` by admin with rejection reasons.
- **Rank Tracking** — First, second, third rank distinctions stored for awards ceremony planning.

---

### 11. Committee Module

**Files:** `committeeController.js`, `committeeRoutes.js`, `CommitteeDashboard.jsx`, `CommitteeMembersList.jsx`, `VillageMembers.jsx`, `VillagerApproval.jsx`, `AddVillageMember.jsx`, `BookVillageEvent.jsx`  
**Routes:** `/api/committee`

- **Committee Dashboard** — Dedicated dashboard for committee members.
- **Village Member Management** — Add, view, and manage village members within the committee's jurisdiction.
- **Villager Approval** — Approve or reject new villager applications.
- **Committee Members List** — View all committee members with roles.
- **Book Village Events** — Committee members can book the hall for officially sanctioned village events.
- **Role-Protected Routes** — `CommitteeMemberRoute.jsx` ensures only `committeemember` role can access.
- **Sidebar Navigation** — Dedicated `CommitteeMemberSidebar.jsx` for the committee interface.

---

### 12. Admin Panel

**Files:** `Dashboard.jsx`, `BookingManagement.jsx`, `ContactManagement.jsx`, `ContentManagement.jsx`, `FormManagement.jsx`, `FormResponses.jsx`, `Users.jsx`, `Reviews.jsx`, `Settings.jsx`, `VideoManagement.jsx`, `BookedDatesCalendar.jsx`, `LiveStreams.jsx`  
**Components:** `AdminSidebar.jsx`, `AdminHeader.jsx`, `AdminPageContainer.jsx`

- **Dashboard Overview** — Key metrics and statistics at a glance (total bookings, pending items, contacts, reviews).
- **User Management** — View all registered users, change roles, activate/deactivate accounts, search and filter.
- **Booking Management** — Full booking list with status filters, approve/reject actions, and booking details modal.
- **Contact Management** — Centralized contact/inquiry inbox with reply and status management.
- **Content Management** — Edit all homepage sections (hero, introduction, about, leadership), gallery images, and videos from a single interface.
- **Event Category Management** — Create, edit, and delete event categories and their pricing packages.
- **Form Builder & Responses** — Create custom forms, publish them, and view/export collected responses as PDF.
- **Reviews Moderation** — Approve or reject user-submitted reviews.
- **Settings Page** — Admin-level application settings.
- **Booked Dates Calendar** — Visual calendar showing all confirmed bookings to aid scheduling.
- **Live Streams Management** — Manage live stream links for events.
- **Role-Based Admin Routes** — `AdminRoute.jsx`, `BookingManagerRoute.jsx`, `UserManagerRoute.jsx`, `ContentManagerRoute.jsx`, `ContactManagerRoute.jsx`, `FormManagerRoute.jsx` protect panel pages by role.

---

### 13. Live Streaming

**Files:** `LiveStreams.jsx` (admin), `LiveStreaming.jsx` (public page)  
**Routes:** `/api/content`

- **Live Stream Links** — Admin can publish YouTube or streaming links for ongoing events.
- **Public Viewing Page** — Visitors can access the live stream from the website.

---

### 14. Custom Form Builder

**Files:** `formRoutes.js`, `FormManagement.jsx`, `FormResponses.jsx`  
**Model:** `Form.js`  
**Routes:** `/api/admin/forms`

- **Dynamic Form Creation** — Admins can build custom multi-field forms (text, dropdowns, checkboxes, etc.) without code.
- **Form Publishing** — Forms can be published or drafted.
- **Response Collection** — All form submissions are stored and viewable in the admin panel.
- **PDF Export** — Form responses can be exported as a PDF using jsPDF and jsPDF-AutoTable.

---

## Role-Based Access Control

| Role | Access |
|---|---|
| `user` | Public booking, Samuh Lagan, student awards, reviews, contact form |
| `committeemember` | Committee dashboard, village member management, village event booking |
| `bookingmanager` | Booking management in admin panel |
| `contactmanager` | Contact/inquiry management |
| `contentmanager` | Content, gallery, events, home page management |
| `formmanager` | Form builder and responses |
| `usermanager` | User listing and role management |
| `admin` | Full admin panel access |
| `superadmin` | All access + system-level settings |

---

## Backend API Overview

| Prefix | Module |
|---|---|
| `/api/auth` | Register, login, OTP verify, forgot/reset password |
| `/api/users` | User profile, settings, role management |
| `/api/bookings` | Hall bookings CRUD |
| `/api/bookings/samuh-lagan` | Samuh Lagan (community marriage) bookings |
| `/api/contacts` | Contact form submissions |
| `/api/content` | Home content, gallery, categories, videos |
| `/api/admin/forms` | Custom form builder and submissions |
| `/api/reviews` | Review submit, approve, fetch |
| `/api/student-awards` | Student award registrations |
| `/api/committee` | Committee member operations |
| `/uploads` | Static file serving for uploaded images and PDFs |

---

## Security

The backend implements multiple security layers:

- **Helmet** — Sets secure HTTP headers (CSP, XSS protection, etc.)
- **rate-limit** — 1000 requests per 10 minutes per IP on all `/api` routes
- **express-mongo-sanitize** — Strips `$` and `.` from user input to prevent NoSQL injection
- **xss-clean** — Sanitizes request body, query, and params to strip XSS payloads
- **hpp** — Prevents HTTP parameter pollution attacks
- **CORS** — Allowlist-only origins (Netlify, Render, localhost)
- **JWT Auth Middleware** — Protected routes require a valid Bearer token
- **Password Hashing** — bcryptjs with salt rounds of 10
- **Password History** — Prevents reuse of last 5 passwords
- **Body Size Limiting** — Max 50 KB JSON body to prevent large payload attacks

---

## Environment Variables

### Server (`server/.env`)
```env
PORT=3001
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
EMAIL_FROM=your_gmail_address
FRONTEND_URL=http://localhost:5173
BASE_URL=http://localhost:3001
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:3001/api
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Gmail account with App Password enabled (for OTP emails)

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/vsps.git
cd vsps
```

### 2. Install Root Dependencies
```bash
npm install
```

### 3. Setup & Run the Backend
```bash
cd server
npm install
# Create server/.env with the variables above
npm run dev
```
Server starts on `http://localhost:3001`

### 4. Setup & Run the Frontend
```bash
cd client
npm install
# Create client/.env with VITE_API_URL
npm run dev
```
Frontend starts on `http://localhost:5173`

### 5. Seed Initial Data (Optional)
```bash
cd server
npm run seed
```

---

## Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for full instructions on deploying the backend to Render and the frontend to Netlify.

---

> Built with ❤️ for the Van Sol Samaj community.
