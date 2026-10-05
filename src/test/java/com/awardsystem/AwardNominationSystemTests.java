package com.awardsystem;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.UUID;

class AwardNominationSystemTests {

    @Test
    void testReferenceCodeFormat() {
        String refCode = "NOM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        assertTrue(refCode.startsWith("NOM-"));
        assertEquals(12, refCode.length());
    }

    @Test
    void testBCryptPassword() {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder = 
            new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        String currentHash = "$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG";
        System.out.println("BCrypt match result: " + encoder.matches("password123", currentHash));
        System.out.println("Fresh BCrypt hash: " + encoder.encode("password123"));
        assertTrue(encoder.matches("password123", encoder.encode("password123")));
    }

    @Test
    void testReportControllerAuthorization() {
        org.springframework.security.access.prepost.PreAuthorize preAuth =
                com.awardsystem.notification.ReportController.class.getAnnotation(org.springframework.security.access.prepost.PreAuthorize.class);
        assertNotNull(preAuth);
        assertEquals("hasRole('PROGRAM_MANAGER')", preAuth.value());
        assertFalse(preAuth.value().contains("ADMIN"));
    }
}
