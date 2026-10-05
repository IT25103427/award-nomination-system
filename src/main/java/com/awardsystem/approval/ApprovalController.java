package com.awardsystem.approval;

import com.awardsystem.approval.dto.ReviewRequest;
import com.awardsystem.approval.dto.ReviewResponse;
import com.awardsystem.auth.User;
import com.awardsystem.auth.UserRepository;
import com.awardsystem.common.ApiResponse;
import com.awardsystem.common.AppException;
import com.awardsystem.nomination.NominationStatus;
import com.awardsystem.nomination.dto.NominationResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/approval")
public class ApprovalController {

    private final ApprovalService approvalService;
    private final UserRepository userRepository;

    public ApprovalController(ApprovalService approvalService, UserRepository userRepository) {
        this.approvalService = approvalService;
        this.userRepository = userRepository;
    }

    @GetMapping("/queue")
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<NominationResponse>>> getReviewQueue(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) NominationStatus status,
            @RequestParam(required = false) String query
    ) {
        List<NominationResponse> list = approvalService.getReviewQueue(categoryId, status, query);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/review")
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> reviewNomination(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        ReviewResponse response = approvalService.reviewNomination(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Nomination review decision recorded successfully", response));
    }

    @GetMapping("/history/{nominationId}")
    @PreAuthorize("hasAnyRole('COMMITTEE_MEMBER', 'ADMIN', 'RESULTS_OFFICER', 'PROGRAM_MANAGER')")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewHistory(@PathVariable Long nominationId) {
        List<ReviewResponse> history = approvalService.getReviewsForNomination(nominationId);
        return ResponseEntity.ok(ApiResponse.ok(history));
    }
}
