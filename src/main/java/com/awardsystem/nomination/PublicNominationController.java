package com.awardsystem.nomination;

import com.awardsystem.common.ApiResponse;
import com.awardsystem.nomination.dto.PublicStatusLookupDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/nominations")
public class PublicNominationController {

    private final NominationService nominationService;

    public PublicNominationController(NominationService nominationService) {
        this.nominationService = nominationService;
    }

    @GetMapping("/lookup/{referenceNumber}")
    public ResponseEntity<ApiResponse<PublicStatusLookupDto>> lookupStatus(@PathVariable String referenceNumber) {
        PublicStatusLookupDto statusDto = nominationService.lookupPublicStatus(referenceNumber);
        return ResponseEntity.ok(ApiResponse.ok("Status retrieved successfully", statusDto));
    }
}
