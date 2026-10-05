package com.awardsystem.results;

import com.awardsystem.auth.User;
import com.awardsystem.auth.UserRepository;
import com.awardsystem.common.ApiResponse;
import com.awardsystem.common.AppException;
import com.awardsystem.results.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultsController {

    private final ResultsService resultsService;
    private final UserRepository userRepository;

    public ResultsController(ResultsService resultsService, UserRepository userRepository) {
        this.resultsService = resultsService;
        this.userRepository = userRepository;
    }

    @GetMapping("/tallies")
    @PreAuthorize("hasAnyRole('RESULTS_OFFICER', 'PROGRAM_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<CategoryTallyAuditDto>>> getTallies(
            @RequestParam(required = false) Long categoryId
    ) {
        List<CategoryTallyAuditDto> list = resultsService.getAuditableTallies(categoryId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/verify")
    @PreAuthorize("hasRole('RESULTS_OFFICER')")
    public ResponseEntity<ApiResponse<CategoryTallyAuditDto>> verifyResults(
            @Valid @RequestBody VerificationSignoffRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        CategoryTallyAuditDto dto = resultsService.verifyResults(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Results verified and signed off successfully", dto));
    }

    @PostMapping("/escalate")
    @PreAuthorize("hasRole('RESULTS_OFFICER')")
    public ResponseEntity<ApiResponse<CategoryTallyAuditDto>> escalateDiscrepancy(
            @Valid @RequestBody DiscrepancyEscalationRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        CategoryTallyAuditDto dto = resultsService.escalateDiscrepancy(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Discrepancy escalated to Administrator", dto));
    }

    @PostMapping("/publish")
    @PreAuthorize("hasAnyRole('PROGRAM_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<PublishedWinnerDto>> publishWinner(
            @Valid @RequestBody PublishWinnerRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        PublishedWinnerDto dto = resultsService.publishWinner(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Final winners officially published to the public and voters!", dto));
    }

    @GetMapping("/published")
    public ResponseEntity<ApiResponse<List<PublishedWinnerDto>>> getPublishedWinners() {
        List<PublishedWinnerDto> winners = resultsService.getPublishedWinners();
        return ResponseEntity.ok(ApiResponse.ok(winners));
    }

    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('PROGRAM_MANAGER', 'ADMIN', 'RESULTS_OFFICER')")
    public ResponseEntity<ApiResponse<AwardStatisticsDto>> getStatistics() {
        AwardStatisticsDto stats = resultsService.getStatistics();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
