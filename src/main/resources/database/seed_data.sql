-- ==========================================================
-- AWARD NOMINATION AND VOTING SYSTEM
-- Seed Data Script (MySQL Workbench Compatible)
-- Default Password for all seed users: password123
-- BCrypt Hash: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
-- ==========================================================

USE award_system_db;

SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------------------------------------
-- 1. SEED USERS (1 Admin + 5 Other Distinct Roles)
-- ----------------------------------------------------------
INSERT INTO users (id, full_name, email, mobile_number, username, password_hash, role, is_email_verified, created_at)
VALUES
  (1, 'System Administrator', 'admin@awards.org', '+1-555-0101', 'admin',
   '$2a$10$cnbKE4ah7tvb8BPe3UOxy.0JrBUDWdZEjhRjhSaE0ak7DSb3NiXh6', 'ADMIN', TRUE, NOW()),

  (2, 'Sarah Jenkins (Nominator)', 'nominator@awards.org', '+1-555-0102', 'nominator',
   '$2a$10$cnbKE4ah7tvb8BPe3UOxy.0JrBUDWdZEjhRjhSaE0ak7DSb3NiXh6', 'NOMINATOR', TRUE, NOW()),

  (3, 'Dr. Aris Thorne (Committee)', 'committee@awards.org', '+1-555-0103', 'committee',
   '$2a$10$cnbKE4ah7tvb8BPe3UOxy.0JrBUDWdZEjhRjhSaE0ak7DSb3NiXh6', 'COMMITTEE_MEMBER', TRUE, NOW()),

  (4, 'Marcus Chen (Voter)', 'voter@awards.org', '+1-555-0104', 'voter',
   '$2a$10$cnbKE4ah7tvb8BPe3UOxy.0JrBUDWdZEjhRjhSaE0ak7DSb3NiXh6', 'VOTER', TRUE, NOW()),

  (5, 'Elena Rostova (Results Officer)', 'officer@awards.org', '+1-555-0105', 'officer',
   '$2a$10$cnbKE4ah7tvb8BPe3UOxy.0JrBUDWdZEjhRjhSaE0ak7DSb3NiXh6', 'RESULTS_OFFICER', TRUE, NOW()),

  (6, 'David Sterling (Program Manager)', 'manager@awards.org', '+1-555-0106', 'manager',
   '$2a$10$cnbKE4ah7tvb8BPe3UOxy.0JrBUDWdZEjhRjhSaE0ak7DSb3NiXh6', 'PROGRAM_MANAGER', TRUE, NOW()),

  (7, 'Alex Rivera (Voter 2)', 'voter2@awards.org', '+1-555-0107', 'voter2',
   '$2a$10$cnbKE4ah7tvb8BPe3UOxy.0JrBUDWdZEjhRjhSaE0ak7DSb3NiXh6', 'VOTER', TRUE, NOW());

-- ----------------------------------------------------------
-- 2. SEED AWARD CATEGORIES (3 core categories)
-- ----------------------------------------------------------
INSERT INTO award_categories (id, name, description, eligibility_criteria, is_active, created_by, created_at)
VALUES
  (1, 'Best Employee',
   'Recognizes exceptional daily performance, teamwork, integrity, and consistent value addition to the organization.',
   'Full-time employee for at least 12 months with clean disciplinary record.',
   TRUE, 1, NOW()),

  (2, 'Best Innovator',
   'Honors novel initiatives, patent contributions, software breakthroughs, or disruptive ideas that improved organizational processes.',
   'Individual or technical contributor who conceptualized and deployed a documented innovation within the past 12 months.',
   TRUE, 1, NOW()),

  (3, 'Outstanding Team',
   'Celebrates cross-functional units or project teams that demonstrated flawless collaboration and delivered high-impact deliverables.',
   'Project team comprising at least 3 members with demonstrable milestone deliveries on or ahead of schedule.',
   TRUE, 1, NOW());

-- ----------------------------------------------------------
-- 3. SEED NOMINATIONS (Diverse realistic statuses)
-- Note: Nominees are third parties without logins!
-- ----------------------------------------------------------
INSERT INTO nominations (id, reference_number, nominator_id, category_id, nominee_name, nominee_email, nominee_phone, nominee_org, justification, status, submitted_at)
VALUES
  (1, 'NOM-2026-0811', 2, 1, 'Alice Morgan', 'alice.morgan@enterprise.com', '+1-555-9001', 'Operations & Logistics',
   'Alice restructured the regional warehouse routing model, reducing dispatch turnaround times by 34% while maintaining a 99.8% customer satisfaction score.',
   'APPROVED', DATE_SUB(NOW(), INTERVAL 5 DAY)),

  (2, 'NOM-2026-0812', 2, 1, 'Brian O\'Connor', 'brian.oc@enterprise.com', '+1-555-9002', 'Customer Success',
   'Brian mentored 14 junior support leads and resolved over 1,200 critical escalation incidents without missing an SLA in Q1 and Q2.',
   'APPROVED', DATE_SUB(NOW(), INTERVAL 4 DAY)),

  (3, 'NOM-2026-0813', 2, 2, 'Clara Zhang', 'clara.zhang@enterprise.com', '+1-555-9003', 'R&D Labs',
   'Clara spearheaded the machine learning automated data reconciliation pipeline, eliminating 200 hours of weekly manual cross-verification.',
   'APPROVED', DATE_SUB(NOW(), INTERVAL 3 DAY)),

  (4, 'NOM-2026-0814', 2, 2, 'Daniel Vance', 'daniel.vance@enterprise.com', '+1-555-9004', 'Cloud Infrastructure',
   'Daniel architected a distributed multi-region failover cluster that achieved 99.999% uptime during prime customer audit windows.',
   'PENDING', DATE_SUB(NOW(), INTERVAL 2 DAY)),

  (5, 'NOM-2026-0815', 2, 3, 'Project Titan Delivery Squad', 'titan.lead@enterprise.com', '+1-555-9005', 'Core Product Engineering',
   'A 6-person tiger team that delivered the complete zero-trust authentication migration ahead of strict regulatory deadlines.',
   'PENDING', DATE_SUB(NOW(), INTERVAL 1 DAY)),

  (6, 'NOM-2026-0816', 2, 1, 'Edward Norton', 'edward.n@enterprise.com', '+1-555-9006', 'Facilities',
   'Nomination lacks documented impact metrics and submitted after internal department cap.',
   'REJECTED', DATE_SUB(NOW(), INTERVAL 6 DAY)),

  (7, 'NOM-2026-0817', 2, 3, 'Legacy Support Group', 'legacy.support@enterprise.com', '+1-555-9007', 'IT Support',
   'Withdrawn by nominator Sarah Jenkins to re-file with updated team member citations next cycle.',
   'WITHDRAWN', DATE_SUB(NOW(), INTERVAL 7 DAY));

-- ----------------------------------------------------------
-- 4. SEED NOMINATION REVIEWS (Audit Trail)
-- ----------------------------------------------------------
INSERT INTO nomination_reviews (id, nomination_id, reviewed_by, decision, comments, decided_at)
VALUES
  (1, 1, 3, 'APPROVED', 'Exemplary operational metrics verified with department head.', DATE_SUB(NOW(), INTERVAL 4 DAY)),
  (2, 2, 3, 'APPROVED', 'Strong peer endorsements and customer impact documented.', DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (3, 3, 1, 'APPROVED', 'Breakthrough confirmed with patent and deployment logs.', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (4, 6, 3, 'REJECTED', 'Insufficient evidence submitted; does not meet the 12-month tenure criteria.', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- ----------------------------------------------------------
-- 5. SEED SUPPORTING DOCUMENTS
-- ----------------------------------------------------------
INSERT INTO supporting_documents (id, nomination_id, file_name, file_path, file_type, file_size, uploaded_at)
VALUES
  (1, 1, 'alice_morgan_kpi_report.pdf', 'uploads/nominations/alice_morgan_kpi_report.pdf', 'application/pdf', 1452800, DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (2, 2, 'brian_support_metrics.pdf', 'uploads/nominations/brian_support_metrics.pdf', 'application/pdf', 985600, DATE_SUB(NOW(), INTERVAL 4 DAY)),
  (3, 3, 'ml_pipeline_whitepaper.pdf', 'uploads/nominations/ml_pipeline_whitepaper.pdf', 'application/pdf', 2548000, DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (4, 4, 'distributed_mesh_architecture.pdf', 'uploads/nominations/distributed_mesh_architecture.pdf', 'application/pdf', 3120000, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- ----------------------------------------------------------
-- 6. SEED VOTING PERIODS
-- ----------------------------------------------------------
INSERT INTO voting_periods (id, category_id, start_date, end_date, status, set_by)
VALUES
  (1, NULL, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 'OPEN', 6),
  (2, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 'OPEN', 6),
  (3, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 'OPEN', 6);

-- ----------------------------------------------------------
-- 7. SEED VOTES (Respecting unique constraint (voter_id, category_id))
-- ----------------------------------------------------------
INSERT INTO votes (id, voter_id, nomination_id, category_id, cast_at)
VALUES
  (1, 4, 1, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)), -- Voter Marcus Chen voted for Alice Morgan in Category 1
  (2, 7, 2, 1, DATE_SUB(NOW(), INTERVAL 1 DAY)); -- Voter Alex Rivera voted for Brian O'Connor in Category 1

-- ----------------------------------------------------------
-- 8. SEED NOTIFICATIONS
-- ----------------------------------------------------------
INSERT INTO notifications (id, user_id, recipient_email, type, message, related_entity_id, is_read, created_at)
VALUES
  (1, 2, 'nominator@awards.org', 'NOMINATION_SUBMITTED', 'Your nomination for Alice Morgan has been submitted with tracking ID NOM-2026-0811.', 1, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (2, 2, 'nominator@awards.org', 'NOMINATION_APPROVED', 'Congratulations! Your nomination NOM-2026-0811 (Alice Morgan) has been approved by the committee.', 1, FALSE, DATE_SUB(NOW(), INTERVAL 4 DAY)),
  (3, 4, 'voter@awards.org', 'VOTING_OPENED', 'Annual Award Voting is now OPEN! Cast your ballot for the approved finalists.', 1, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (4, 3, 'committee@awards.org', 'REVIEW_REQUIRED', 'New nomination NOM-2026-0814 (Daniel Vance) is waiting for committee review.', 4, FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (5, NULL, 'alice.morgan@enterprise.com', 'NOMINEE_STATUS', 'You have been nominated for Best Employee! Track your status with reference code NOM-2026-0811.', 1, FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY));

SET FOREIGN_KEY_CHECKS = 1;
