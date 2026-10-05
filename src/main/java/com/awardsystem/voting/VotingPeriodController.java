package com.awardsystem.voting;

import com.awardsystem.auth.User;
import com.awardsystem.auth.UserRepository;
import com.awardsystem.common.ApiResponse;
import com.awardsystem.common.AppException;
import com.awardsystem.voting.dto.VotingPeriodRequest;
import com.awardsystem.voting.dto.VotingPeriodResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/voting-periods")
public class VotingPeriodController {

    private final VotingService votingService;
    private final UserRepository userRepository;

    public VotingPeriodController(VotingService votingService, UserRepository userRepository) {
        this.votingService = votingService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VotingPeriodResponse>>> getAllVotingPeriods() {
        List<VotingPeriodResponse> periods = votingService.getAllVotingPeriods();
        return ResponseEntity.ok(ApiResponse.ok(periods));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('PROGRAM_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VotingPeriodResponse>> createVotingPeriod(
            @Valid @RequestBody VotingPeriodRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        VotingPeriodResponse response = votingService.createVotingPeriod(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Voting period scheduled successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROGRAM_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<VotingPeriodResponse>> updateVotingPeriod(
            @PathVariable Long id,
            @Valid @RequestBody VotingPeriodRequest request
    ) {
        VotingPeriodResponse response = votingService.updateVotingPeriod(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Voting period updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('PROGRAM_MANAGER', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteVotingPeriod(@PathVariable Long id) {
        votingService.deleteVotingPeriod(id);
        return ResponseEntity.ok(ApiResponse.ok("Voting period deleted successfully", null));
    }
}
