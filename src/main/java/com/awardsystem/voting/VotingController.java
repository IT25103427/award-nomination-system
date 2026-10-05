package com.awardsystem.voting;

import com.awardsystem.auth.User;
import com.awardsystem.auth.UserRepository;
import com.awardsystem.common.ApiResponse;
import com.awardsystem.common.AppException;
import com.awardsystem.voting.dto.BallotCategoryDto;
import com.awardsystem.voting.dto.VoteCastRequest;
import com.awardsystem.voting.dto.VoterStatusResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/voting")
public class VotingController {

    private final VotingService votingService;
    private final UserRepository userRepository;

    public VotingController(VotingService votingService, UserRepository userRepository) {
        this.votingService = votingService;
        this.userRepository = userRepository;
    }

    @GetMapping("/ballot")
    public ResponseEntity<ApiResponse<List<BallotCategoryDto>>> getBallot(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = null;
        if (userDetails != null) {
            user = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
        }
        List<BallotCategoryDto> ballot = votingService.getBallot(user);
        return ResponseEntity.ok(ApiResponse.ok(ballot));
    }

    @PostMapping("/cast")
    @PreAuthorize("hasRole('VOTER')")
    public ResponseEntity<ApiResponse<Void>> castVote(
            @Valid @RequestBody VoteCastRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        votingService.castVote(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Vote cast successfully. Your vote has been recorded and locked.", null));
    }

    @GetMapping("/my-status")
    @PreAuthorize("hasRole('VOTER')")
    public ResponseEntity<ApiResponse<List<VoterStatusResponse>>> getMyVotes(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<VoterStatusResponse> myVotes = votingService.getMyVotes(user);
        return ResponseEntity.ok(ApiResponse.ok(myVotes));
    }
}
