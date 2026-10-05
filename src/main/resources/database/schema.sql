-- ==========================================================
-- AWARD NOMINATION AND VOTING SYSTEM
-- Database Schema Script (MySQL Workbench Compatible)
-- Engine: InnoDB, Charset: utf8mb4
-- ==========================================================

CREATE DATABASE IF NOT EXISTS award_system_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE award_system_db;

-- Disable foreign key checks during drop/create
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS vote_tallies;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS voting_periods;
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS supporting_documents;
DROP TABLE IF EXISTS nomination_reviews;
DROP TABLE IF EXISTS nominations;
DROP TABLE IF EXISTS award_categories;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------
-- 1. USERS TABLE
-- ----------------------------------------------------------
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    mobile_number VARCHAR(20) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'NOMINATOR', 'VOTER', 'COMMITTEE_MEMBER', 'RESULTS_OFFICER', 'PROGRAM_MANAGER') NOT NULL,
    is_email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100) NULL,
    reset_token VARCHAR(100) NULL,
    reset_token_expiry DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_username (username),
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. AWARD CATEGORIES TABLE
-- ----------------------------------------------------------
CREATE TABLE award_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    eligibility_criteria TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_by BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. NOMINATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE nominations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_number VARCHAR(50) NOT NULL UNIQUE,
    nominator_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    nominee_name VARCHAR(150) NOT NULL,
    nominee_email VARCHAR(100) NOT NULL,
    nominee_phone VARCHAR(20),
    nominee_org VARCHAR(150),
    justification TEXT NOT NULL,
    status ENUM('PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN') DEFAULT 'PENDING',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (nominator_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES award_categories(id) ON DELETE RESTRICT,
    INDEX idx_nomination_ref (reference_number),
    INDEX idx_nomination_status (status),
    INDEX idx_nomination_category (category_id),
    INDEX idx_nomination_nominator (nominator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. NOMINATION REVIEWS TABLE (Audit trail of decisions)
-- ----------------------------------------------------------
CREATE TABLE nomination_reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nomination_id BIGINT NOT NULL,
    reviewed_by BIGINT NOT NULL,
    decision ENUM('APPROVED', 'REJECTED') NOT NULL,
    comments TEXT,
    decided_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nomination_id) REFERENCES nominations(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_review_nomination (nomination_id),
    INDEX idx_review_decision (decision)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. SUPPORTING DOCUMENTS TABLE
-- ----------------------------------------------------------
CREATE TABLE supporting_documents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nomination_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (nomination_id) REFERENCES nominations(id) ON DELETE CASCADE,
    INDEX idx_doc_nomination (nomination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. VOTES TABLE (With strict single-vote-per-category constraint)
-- ----------------------------------------------------------
CREATE TABLE votes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    voter_id BIGINT NOT NULL,
    nomination_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    cast_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (nomination_id) REFERENCES nominations(id) ON DELETE RESTRICT,
    FOREIGN KEY (category_id) REFERENCES award_categories(id) ON DELETE RESTRICT,
    -- CRITICAL REQUIREMENT: Enforce exactly one vote per voter per category
    CONSTRAINT uq_voter_category UNIQUE (voter_id, category_id),
    INDEX idx_vote_category_nomination (category_id, nomination_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 7. VOTING PERIODS TABLE
-- ----------------------------------------------------------
CREATE TABLE voting_periods (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    status ENUM('SCHEDULED', 'OPEN', 'CLOSED') DEFAULT 'SCHEDULED',
    set_by BIGINT NOT NULL,
    FOREIGN KEY (category_id) REFERENCES award_categories(id) ON DELETE SET NULL,
    FOREIGN KEY (set_by) REFERENCES users(id) ON DELETE RESTRICT,
    INDEX idx_period_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 8. RESULTS TABLE
-- ----------------------------------------------------------
CREATE TABLE results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT NOT NULL,
    winner_nomination_id BIGINT NULL,
    verification_status ENUM('PENDING', 'VERIFIED', 'DISCREPANCY') DEFAULT 'PENDING',
    verified_by BIGINT NULL,
    verified_at DATETIME NULL,
    escalation_notes TEXT NULL,
    published_at DATETIME NULL,
    FOREIGN KEY (category_id) REFERENCES award_categories(id) ON DELETE RESTRICT,
    FOREIGN KEY (winner_nomination_id) REFERENCES nominations(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_results_category (category_id),
    INDEX idx_results_status (verification_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 9. VOTE TALLIES TABLE (Audit / Cross-check)
-- ----------------------------------------------------------
CREATE TABLE vote_tallies (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    results_id BIGINT NOT NULL,
    nomination_id BIGINT NOT NULL,
    vote_count INT NOT NULL DEFAULT 0,
    FOREIGN KEY (results_id) REFERENCES results(id) ON DELETE CASCADE,
    FOREIGN KEY (nomination_id) REFERENCES nominations(id) ON DELETE CASCADE,
    INDEX idx_tally_results (results_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 10. NOTIFICATIONS TABLE
-- ----------------------------------------------------------
CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NULL,
    recipient_email VARCHAR(100) NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    related_entity_id BIGINT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_notif_user (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 11. REPORTS TABLE (Admin configurable & regenerable reports)
-- ----------------------------------------------------------
CREATE TABLE reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    parameters_json TEXT,
    data_json LONGTEXT,
    generated_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
