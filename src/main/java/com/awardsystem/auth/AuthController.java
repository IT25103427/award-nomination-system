package com.awardsystem.auth;

import com.awardsystem.auth.dto.*;
import com.awardsystem.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, String>>> register(@Valid @RequestBody RegisterRequest request) {
        String verificationToken = authService.register(request);
        return ResponseEntity.ok(ApiResponse.ok(
                "Registration successful. Please verify your email with the confirmation code provided.",
                Map.of(
                        "verificationCode", verificationToken,
                        "email", request.getEmail()
                )
        ));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyEmail(@RequestParam String token) {
        AuthResponse response = authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.ok("Email successfully verified. You are now logged in.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Map<String, String>>> forgotPassword(@Valid @RequestBody PasswordResetRequest request) {
        String resetToken = authService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.ok(
                "Password reset instructions and verification code sent to your email.",
                Map.of(
                        "resetCode", resetToken,
                        "email", request.getEmail()
                )
        ));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody PasswordResetConfirmRequest request) {
        authService.confirmPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.ok("Password has been reset successfully. Please log in with your new password.", null));
    }
}
