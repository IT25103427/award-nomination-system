package com.awardsystem.auth;

import com.awardsystem.auth.dto.UserProfileDto;
import com.awardsystem.common.ApiResponse;
import com.awardsystem.common.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        return ResponseEntity.ok(ApiResponse.ok(UserProfileDto.fromEntity(user)));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (payload.containsKey("fullName") && !payload.get("fullName").trim().isEmpty()) {
            user.setFullName(payload.get("fullName").trim());
        }
        if (payload.containsKey("mobileNumber") && !payload.get("mobileNumber").trim().isEmpty()) {
            user.setMobileNumber(payload.get("mobileNumber").trim());
        }

        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", UserProfileDto.fromEntity(user)));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers(
            @RequestParam(required = false) Role role
    ) {
        List<User> users;
        if (role != null) {
            users = userRepository.findByRole(role);
        } else {
            users = userRepository.findAll();
        }
        List<UserProfileDto> dtos = users.stream()
                .map(UserProfileDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateUserRole(
            @PathVariable Long id,
            @RequestParam Role role
    ) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found with id: " + id, HttpStatus.NOT_FOUND));
        user.setRole(role);
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("User role updated to " + role.name(), UserProfileDto.fromEntity(user)));
    }
}
