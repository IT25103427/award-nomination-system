package com.awardsystem.config;

import com.awardsystem.approval.NominationReview;
import com.awardsystem.approval.NominationReviewRepository;
import com.awardsystem.approval.ReviewDecision;
import com.awardsystem.auth.Role;
import com.awardsystem.auth.User;
import com.awardsystem.auth.UserRepository;
import com.awardsystem.category.AwardCategory;
import com.awardsystem.category.CategoryRepository;
import com.awardsystem.nomination.Nomination;
import com.awardsystem.nomination.NominationRepository;
import com.awardsystem.nomination.NominationStatus;
import com.awardsystem.notification.Notification;
import com.awardsystem.notification.NotificationRepository;
import com.awardsystem.voting.PeriodStatus;
import com.awardsystem.voting.Vote;
import com.awardsystem.voting.VoteRepository;
import com.awardsystem.voting.VotingPeriod;
import com.awardsystem.voting.VotingPeriodRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final NominationRepository nominationRepository;
    private final NominationReviewRepository reviewRepository;
    private final VoteRepository voteRepository;
    private final VotingPeriodRepository votingPeriodRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           NominationRepository nominationRepository,
                           NominationReviewRepository reviewRepository,
                           VoteRepository voteRepository,
                           VotingPeriodRepository votingPeriodRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.nominationRepository = nominationRepository;
        this.reviewRepository = reviewRepository;
        this.voteRepository = voteRepository;
        this.votingPeriodRepository = votingPeriodRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return; // Already initialized
        }

        System.out.println("Initializing Award Nomination System sample dataset...");
        String encodedPass = passwordEncoder.encode("password123");

        // 1. Users
        User admin = userRepository.save(new User("System Administrator", "admin@awards.org", "+1-555-0101", "admin", encodedPass, Role.ADMIN, true));
        User nominator = userRepository.save(new User("Sarah Jenkins", "nominator@awards.org", "+1-555-0102", "nominator", encodedPass, Role.NOMINATOR, true));
        User committee = userRepository.save(new User("Dr. Aris Thorne", "committee@awards.org", "+1-555-0103", "committee", encodedPass, Role.COMMITTEE_MEMBER, true));
        User voter = userRepository.save(new User("Marcus Chen", "voter@awards.org", "+1-555-0104", "voter", encodedPass, Role.VOTER, true));
        User officer = userRepository.save(new User("Elena Rostova", "officer@awards.org", "+1-555-0105", "officer", encodedPass, Role.RESULTS_OFFICER, true));
        User manager = userRepository.save(new User("David Sterling", "manager@awards.org", "+1-555-0106", "manager", encodedPass, Role.PROGRAM_MANAGER, true));
        User voter2 = userRepository.save(new User("Alex Rivera", "voter2@awards.org", "+1-555-0107", "voter2", encodedPass, Role.VOTER, true));

        // 2. Categories
        AwardCategory cat1 = categoryRepository.save(new AwardCategory("Best Employee", "Recognizes exceptional daily performance, teamwork, integrity, and consistent value addition.", "Full-time employee for at least 12 months with clean record.", true, admin));
        AwardCategory cat2 = categoryRepository.save(new AwardCategory("Best Innovator", "Honors novel initiatives, software breakthroughs, or disruptive ideas that improved workflows.", "Deployed a documented innovation within the past 12 months.", true, admin));
        AwardCategory cat3 = categoryRepository.save(new AwardCategory("Outstanding Team", "Celebrates cross-functional units that demonstrated flawless collaboration and delivered high impact.", "Project team comprising at least 3 members with demonstrable milestones.", true, admin));

        // 3. Nominations
        Nomination nom1 = new Nomination();
        nom1.setReferenceNumber("NOM-2026-0811");
        nom1.setNominator(nominator);
        nom1.setCategory(cat1);
        nom1.setNomineeName("Alice Morgan");
        nom1.setNomineeEmail("alice.morgan@enterprise.com");
        nom1.setNomineePhone("+1-555-9001");
        nom1.setNomineeOrg("Operations & Logistics");
        nom1.setJustification("Alice restructured regional routing, reducing turnaround times by 34% with a 99.8% satisfaction score.");
        nom1.setStatus(NominationStatus.APPROVED);
        nom1 = nominationRepository.save(nom1);

        Nomination nom2 = new Nomination();
        nom2.setReferenceNumber("NOM-2026-0812");
        nom2.setNominator(nominator);
        nom2.setCategory(cat1);
        nom2.setNomineeName("Brian O'Connor");
        nom2.setNomineeEmail("brian.oc@enterprise.com");
        nom2.setNomineePhone("+1-555-9002");
        nom2.setNomineeOrg("Customer Success");
        nom2.setJustification("Brian mentored 14 junior support leads and resolved over 1,200 critical escalation incidents without SLA miss.");
        nom2.setStatus(NominationStatus.APPROVED);
        nom2 = nominationRepository.save(nom2);

        Nomination nom3 = new Nomination();
        nom3.setReferenceNumber("NOM-2026-0813");
        nom3.setNominator(nominator);
        nom3.setCategory(cat2);
        nom3.setNomineeName("Clara Zhang");
        nom3.setNomineeEmail("clara.zhang@enterprise.com");
        nom3.setNomineePhone("+1-555-9003");
        nom3.setNomineeOrg("R&D Labs");
        nom3.setJustification("Clara spearheaded the automated data reconciliation pipeline, eliminating 200 hours of weekly manual work.");
        nom3.setStatus(NominationStatus.APPROVED);
        nom3 = nominationRepository.save(nom3);

        Nomination nom4 = new Nomination();
        nom4.setReferenceNumber("NOM-2026-0814");
        nom4.setNominator(nominator);
        nom4.setCategory(cat2);
        nom4.setNomineeName("Daniel Vance");
        nom4.setNomineeEmail("daniel.vance@enterprise.com");
        nom4.setNomineePhone("+1-555-9004");
        nom4.setNomineeOrg("Cloud Infrastructure");
        nom4.setJustification("Daniel architected a distributed failover cluster that achieved 99.999% uptime during prime audit windows.");
        nom4.setStatus(NominationStatus.PENDING);
        nom4 = nominationRepository.save(nom4);

        Nomination nom5 = new Nomination();
        nom5.setReferenceNumber("NOM-2026-0815");
        nom5.setNominator(nominator);
        nom5.setCategory(cat3);
        nom5.setNomineeName("Project Titan Squad");
        nom5.setNomineeEmail("titan.lead@enterprise.com");
        nom5.setNomineePhone("+1-555-9005");
        nom5.setNomineeOrg("Product Engineering");
        nom5.setJustification("Delivered the complete zero-trust authentication migration ahead of strict regulatory deadlines.");
        nom5.setStatus(NominationStatus.PENDING);
        nom5 = nominationRepository.save(nom5);

        Nomination nom6 = new Nomination();
        nom6.setReferenceNumber("NOM-2026-0816");
        nom6.setNominator(nominator);
        nom6.setCategory(cat1);
        nom6.setNomineeName("Edward Norton");
        nom6.setNomineeEmail("edward.n@enterprise.com");
        nom6.setNomineePhone("+1-555-9006");
        nom6.setNomineeOrg("Facilities");
        nom6.setJustification("Nomination lacks documented impact metrics.");
        nom6.setStatus(NominationStatus.REJECTED);
        nom6 = nominationRepository.save(nom6);

        Nomination nom7 = new Nomination();
        nom7.setReferenceNumber("NOM-2026-0817");
        nom7.setNominator(nominator);
        nom7.setCategory(cat3);
        nom7.setNomineeName("Legacy Support Group");
        nom7.setNomineeEmail("legacy.support@enterprise.com");
        nom7.setNomineePhone("+1-555-9007");
        nom7.setNomineeOrg("IT Support");
        nom7.setJustification("Withdrawn by nominator to resubmit next cycle.");
        nom7.setStatus(NominationStatus.WITHDRAWN);
        nom7 = nominationRepository.save(nom7);

        // 4. Reviews audit
        reviewRepository.save(new NominationReview(nom1, committee, ReviewDecision.APPROVED, "Exemplary operational metrics verified with department head."));
        reviewRepository.save(new NominationReview(nom2, committee, ReviewDecision.APPROVED, "Strong peer endorsements and customer impact documented."));
        reviewRepository.save(new NominationReview(nom3, admin, ReviewDecision.APPROVED, "Breakthrough confirmed with patent and deployment logs."));
        reviewRepository.save(new NominationReview(nom6, committee, ReviewDecision.REJECTED, "Insufficient evidence; does not meet the 12-month tenure criteria."));

        // 5. Voting Period (OPEN)
        LocalDateTime now = LocalDateTime.now();
        votingPeriodRepository.save(new VotingPeriod(null, now.minusDays(2), now.plusDays(5), PeriodStatus.OPEN, manager));
        votingPeriodRepository.save(new VotingPeriod(cat1, now.minusDays(2), now.plusDays(5), PeriodStatus.OPEN, manager));
        votingPeriodRepository.save(new VotingPeriod(cat2, now.minusDays(2), now.plusDays(5), PeriodStatus.OPEN, manager));

        // 6. Sample Votes
        voteRepository.save(new Vote(voter, nom1, cat1));
        voteRepository.save(new Vote(voter2, nom2, cat1));

        // 7. Notifications
        notificationRepository.save(new Notification(nominator, nominator.getEmail(), "NOMINATION_SUBMITTED", "Your nomination for Alice Morgan has been submitted with tracking ID NOM-2026-0811.", nom1.getId()));
        notificationRepository.save(new Notification(nominator, nominator.getEmail(), "NOMINATION_APPROVED", "Congratulations! Your nomination NOM-2026-0811 (Alice Morgan) has been approved by the committee.", nom1.getId()));
        notificationRepository.save(new Notification(voter, voter.getEmail(), "VOTING_OPENED", "Annual Award Voting is now OPEN! Cast your ballot for the approved finalists.", null));
        notificationRepository.save(new Notification(committee, committee.getEmail(), "REVIEW_REQUIRED", "New nomination NOM-2026-0814 (Daniel Vance) is waiting for committee review.", nom4.getId()));

        System.out.println("Award Nomination System sample dataset successfully seeded!");
    }
}
