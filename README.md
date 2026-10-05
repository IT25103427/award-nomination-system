# Web-Based Award Nomination and Voting System

An enterprise-grade, full-stack web platform replacing traditional paper and email-based award processes. The system automates candidate nomination submission, committee review and approval, single-vote balloting per category, independent tally reconciliation and sign-off, and final winner publication — backed by automated notifications and comprehensive audit trails.

---

## 🏗️ System Architecture & Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Spring Boot 3.3.4 (Java 17/21/25), Spring Security 6, Spring Data JPA, JWT (JJWT), Springdoc OpenAPI / Swagger 3
- **Database**: MySQL 8.x (Workbench compatible), InnoDB, utf8mb4 charset (with H2 in-memory profile for instant standalone demos)
- **Directory Structure**:
  ```text
  award-nomination-system/
  ├── database/
  │   ├── schema.sql           # Complete MySQL Workbench DDL script
  │   └── seed_data.sql        # Realistic sample data for all 6 roles
  ├── backend/
  │   ├── pom.xml              # Maven dependencies (JPA, Security, JWT, Swagger)
  │   ├── mvnw / mvnw.cmd      # Maven Wrapper
  │   └── src/main/java/com/awardsystem/
  │       ├── auth/            # Module 1: Registration, Login, JWT, Users
  │       ├── category/        # Module 2: Award Categories CRUD
  │       ├── nomination/      # Module 3: Submissions, Documents, Public Lookup
  │       ├── approval/        # Module 4: Committee Review Queue & Audit Log
  │       ├── voting/          # Module 5: Ballots, Voting Windows, Immutable Votes
  │       ├── results/         # Module 6: Officer Tallies Audit & Winner Publishing
  │       ├── notification/    # Module 7: Alerts & Admin Dynamic Reports
  │       └── config/          # SecurityConfig, CorsConfig, DataInitializer
  └── frontend/
      ├── src/
      │   ├── context/         # AuthContext with 15-min Inactivity Auto-logout
      │   ├── modules/         # Modular pages for each user role & feature
      │   └── components/      # Common UI (Navbar, Sidebar, Badges, Modals)
      └── package.json
  ```

---

## 👥 User Roles & Access Privileges

| Role | Username | Password | Key Responsibilities & Capabilities |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `password123` | System management, category CRUD, spam/invalid nomination deletion, user roles, system compliance reports |
| **Nominator** | `nominator` | `password123` | Submits candidate nominations with supporting files, generates tracking reference, edits/withdraws pending submissions |
| **Committee Member**| `committee` | `password123` | Reviews nomination dossiers, verifies eligibility, records Approve/Reject decisions with audit trail comments |
| **Voter** | `voter` | `password123` | Casts exactly ONE immutable vote per category; tracks personal voting participation |
| **Voter 2** | `voter2` | `password123` | Second registered voter for community balloting demonstrations |
| **Results Officer** | `officer` | `password123` | Reconciles automated candidate tallies against raw DB vote transactions, flags discrepancies, signs off verified tallies |
| **Program Manager** | `manager` | `password123` | Schedules voting windows, monitors participation metrics, publishes verified final winners |
| *Public (No Login)*| *Guest* | *None* | Uses the **Public Status Lookup** page with a reference ID or browses the **Official Winners Gallery** |

*Note: Nominees are third parties who never register; they track their nomination using their tracking reference code.*

---

## 🗄️ Database Setup (MySQL Workbench)

1. Start your local **MySQL Server** (port `3306`).
2. Open **MySQL Workbench** and connect to your instance.
3. Open `database/schema.sql` and click **Execute (⚡)**.
   - Creates database `award_system_db`.
   - Creates all 11 tables with foreign keys and the critical unique constraint:
     ```sql
     CONSTRAINT uq_voter_category UNIQUE (voter_id, category_id)
     ```
4. Open `database/seed_data.sql` and click **Execute (⚡)**.
   - Populates the 6 accounts, 3 award categories ("Best Employee", "Best Innovator", "Outstanding Team"), and sample nominations in various statuses (`PENDING`, `APPROVED`, `REJECTED`, `WITHDRAWN`).

---

## ⚙️ Backend Setup (Spring Boot)

### 1. Database Connection Configuration
Check `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/award_system_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
```
*(Update username and password to match your MySQL credentials).*

### 2. Build & Run
Open a terminal in `backend/`:
```bash
# Using the included Maven Wrapper
./mvnw clean compile
./mvnw spring-boot:run
```
*(On Windows PowerShell: `.\mvnw.cmd spring-boot:run`)*

### 3. Standalone Fallback (No MySQL required)
If you wish to test immediately without starting a MySQL service, run with the `h2` profile:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=h2
```
The application will auto-seed all 6 roles and sample data into an in-memory database!

### 4. Interactive API Documentation (Swagger UI)
Once started, navigate to:
```text
http://localhost:8080/swagger-ui.html
```

---

## 💻 Frontend Setup (React)

Open a terminal in `frontend/`:
```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```
Open your browser at:
```text
http://localhost:5173
```

> **Pro-Tip for Quick Grading / Evaluation**:  
> The Login Page includes a **"1-Click Quick Demo Sign In"** panel. Click any of the 6 roles to log in instantly without typing credentials!

---

## 🔄 End-to-End Workflow Verification

### Step 1: Public Tracking (No Login)
1. Go to `http://localhost:5173`.
2. Click **Status Lookup** in the top navigation.
3. Enter reference number `NOM-2026-0811` or click one of the quick chips.
4. Observe the lifecycle stepper displaying submission date, category, and approved status.

### Step 2: Nominator Workflow
1. Click **Sign In** -> click **Nominator** in the 1-Click box.
2. Click **Submit Nomination**.
3. Choose category "Best Innovator", enter candidate name, email, justification, and attach a PDF document.
4. Submit -> Receive on-screen confirmation with new tracking code (e.g. `NOM-2026-XXXX`).
5. Open **My Submissions** to verify status shows `PENDING REVIEW`. You can edit details or withdraw before review.

### Step 3: Committee Evaluation
1. Log in as **Committee Member** (`committee`).
2. Go to **Nomination Review Queue**.
3. Filter by `PENDING`. Open candidate dossier and download supporting attachments.
4. Click **Approve Candidate** or **Reject with Comments**.
5. Formally submit -> updates nomination status to `APPROVED`, sends automated notification to nominator, and creates an entry in `nomination_reviews` audit trail.

### Step 4: Voter Balloting
1. Log in as **Voter** (`voter`).
2. Go to **Official Voting Booth**.
3. Observe approved finalists grouped by award category.
4. Cast a vote for a finalist. The category locks with a green **"VOTED"** badge.
5. Attempting to vote again is blocked by the UI, the Spring Boot validation, and the database unique constraint `uq_voter_category`.
6. Click **My Ballot History** to review permanent vote timestamp receipts.

### Step 5: Results Officer Audit & Sign-off
1. Log in as **Results Officer** (`officer`).
2. Go to **Audit & Verify Vote Tallies**.
3. Review the side-by-side table comparing automated candidate tallies against raw database votes.
4. If an anomaly is found, click **Flag / Escalate Discrepancy** to notify Admin.
5. If accurate, click **Sign Off Verified Results**. This sets the status to `VERIFIED`.

### Step 6: Program Manager Publishing
1. Log in as **Program Manager** (`manager`).
2. Observe verified categories on the dashboard.
3. Click **Publish Official Winner**.
4. The declared winner is immediately broadcast to the public and displays on the **Announced Winners Gallery**!

### Step 7: Administrator Oversight & Reporting
1. Log in as **Administrator** (`admin`).
2. Go to **Award Categories** to add, edit, or deactivate categories.
3. Go to **System Reports** -> Click **Generate New Report** -> select `NOMINATIONS` or `VOTING` -> generate audit breakdown.
4. Use **Re-filter & Regenerate** to update report parameters dynamically.
5. Open **User Directory** to promote or change user roles.
