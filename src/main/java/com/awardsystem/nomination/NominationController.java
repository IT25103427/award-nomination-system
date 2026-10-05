package com.awardsystem.nomination;

import com.awardsystem.auth.User;
import com.awardsystem.auth.UserRepository;
import com.awardsystem.common.ApiResponse;
import com.awardsystem.common.AppException;
import com.awardsystem.nomination.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/nominations")
public class NominationController {

    private final NominationService nominationService;
    private final UserRepository userRepository;

    public NominationController(NominationService nominationService, UserRepository userRepository) {
        this.nominationService = nominationService;
        this.userRepository = userRepository;
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("hasAnyRole('NOMINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<NominationResponse>> submitNomination(
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("nomineeName") String nomineeName,
            @RequestParam("nomineeEmail") String nomineeEmail,
            @RequestParam(value = "nomineePhone", required = false) String nomineePhone,
            @RequestParam(value = "nomineeOrg", required = false) String nomineeOrg,
            @RequestParam("justification") String justification,
            @RequestPart(value = "files", required = false) List<MultipartFile> files,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        NominationSubmitRequest request = new NominationSubmitRequest();
        request.setCategoryId(categoryId);
        request.setNomineeName(nomineeName);
        request.setNomineeEmail(nomineeEmail);
        request.setNomineePhone(nomineePhone);
        request.setNomineeOrg(nomineeOrg);
        request.setJustification(justification);

        NominationResponse response = nominationService.submitNomination(request, files, user);
        return ResponseEntity.ok(ApiResponse.ok("Nomination submitted successfully! Tracking reference: " + response.getReferenceNumber(), response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('NOMINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<NominationResponse>>> getMyNominations(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<NominationResponse> myNominations = nominationService.getMyNominations(user);
        return ResponseEntity.ok(ApiResponse.ok(myNominations));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NominationResponse>> getNominationById(@PathVariable Long id) {
        NominationResponse nomination = nominationService.getNominationById(id);
        return ResponseEntity.ok(ApiResponse.ok(nomination));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('NOMINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<NominationResponse>> updateNomination(
            @PathVariable Long id,
            @Valid @RequestBody NominationUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        NominationResponse updated = nominationService.updateNomination(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Nomination updated successfully", updated));
    }

    @PostMapping("/{id}/withdraw")
    @PreAuthorize("hasAnyRole('NOMINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<NominationResponse>> withdrawNomination(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        NominationResponse withdrawn = nominationService.withdrawNomination(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Nomination has been withdrawn successfully", withdrawn));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteNomination(@PathVariable Long id) {
        nominationService.deleteInvalidNomination(id);
        return ResponseEntity.ok(ApiResponse.ok("Invalid nomination removed successfully", null));
    }
}
