package com.awardsystem.notification;

import com.awardsystem.auth.User;
import com.awardsystem.auth.UserRepository;
import com.awardsystem.common.ApiResponse;
import com.awardsystem.common.AppException;
import com.awardsystem.notification.dto.ReportFilterRequest;
import com.awardsystem.notification.dto.ReportResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('PROGRAM_MANAGER')")
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(ReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ReportResponseDto>>> getAllReports() {
        List<ReportResponseDto> reports = reportService.getAllReports();
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponseDto>> getReportById(@PathVariable Long id) {
        ReportResponseDto report = reportService.getReportById(id);
        return ResponseEntity.ok(ApiResponse.ok(report));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponseDto>> generateReport(
            @Valid @RequestBody ReportFilterRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        ReportResponseDto report = reportService.generateReport(request, user);
        return ResponseEntity.ok(ApiResponse.ok("Report generated successfully", report));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponseDto>> updateAndRegenerateReport(
            @PathVariable Long id,
            @Valid @RequestBody ReportFilterRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        ReportResponseDto report = reportService.updateAndRegenerateReport(id, request, user);
        return ResponseEntity.ok(ApiResponse.ok("Report updated and regenerated successfully", report));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable Long id) {
        reportService.deleteReport(id);
        return ResponseEntity.ok(ApiResponse.ok("Report deleted successfully", null));
    }
}
