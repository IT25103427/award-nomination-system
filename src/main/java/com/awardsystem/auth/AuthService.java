package com.awardsystem.auth;

import com.awardsystem.auth.dto.*;
import com.awardsystem.common.AppException;
import com.awardsystem.notification.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.notificationService = notificationService;
    }

    @Transactional
    public String register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username '" + request.getUsername() + "' is already taken", HttpStatus.CONFLICT);
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email '" + request.getEmail() + "' is already registered", HttpStatus.CONFLICT);
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setMobileNumber(request.getMobileNumber().trim());
        user.setUsername(request.getUsername().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setEmailVerified(false);

        String verificationToken = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        user.setVerificationToken(verificationToken);
        userRepository.save(user);

        // Create automated notification / simulate email delivery
        notificationService.createSystemNotification(
                user,
                user.getEmail(),
                "REGISTRATION_VERIFICATION",
                "Welcome to the Award System! Your account verification code is: " + verificationToken,
                user.getId()
        );

        return verificationToken;
    }

    @Transactional
    public AuthResponse verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new AppException("Invalid or expired verification token", HttpStatus.BAD_REQUEST));

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        userRepository.save(user);

        String jwt = jwtService.generateToken(user);
        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isEmailVerified()
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String input = request.getUsername().trim();
        User user = userRepository.findByUsername(input.toLowerCase())
                .or(() -> userRepository.findByEmail(input.toLowerCase()))
                .orElseThrow(() -> new AppException("Invalid username/email or password", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AppException("Invalid username/email or password", HttpStatus.UNAUTHORIZED);
        }

        if (!user.isEmailVerified()) {
            throw new AppException("Your email address has not been verified yet. Please verify your account before logging in.", HttpStatus.FORBIDDEN);
        }

        String jwt = jwtService.generateToken(user);
        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.isEmailVerified()
        );
    }

    @Transactional
    public String requestPasswordReset(PasswordResetRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new AppException("No account found with email: " + request.getEmail(), HttpStatus.NOT_FOUND));

        String resetToken = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        user.setResetToken(resetToken);
        user.setResetTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        notificationService.createSystemNotification(
                user,
                user.getEmail(),
                "PASSWORD_RESET",
                "You requested a password reset. Your reset code is: " + resetToken + " (valid for 1 hour).",
                user.getId()
        );

        return resetToken;
    }

    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmRequest request) {
        User user = userRepository.findByResetToken(request.getToken().trim())
                .orElseThrow(() -> new AppException("Invalid password reset code", HttpStatus.BAD_REQUEST));

        if (user.getResetTokenExpiry() == null || user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new AppException("Password reset code has expired. Please request a new one.", HttpStatus.BAD_REQUEST);
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        notificationService.createSystemNotification(
                user,
                user.getEmail(),
                "PASSWORD_CHANGED",
                "Your password has been successfully reset. You can now log in with your new password.",
                user.getId()
        );
    }
}
