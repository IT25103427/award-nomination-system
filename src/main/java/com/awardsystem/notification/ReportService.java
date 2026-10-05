package com.awardsystem.notification;

import com.awardsystem.auth.User;
import com.awardsystem.category.AwardCategory;
import com.awardsystem.category.CategoryRepository;
import com.awardsystem.common.AppException;
import com.awardsystem.nomination.Nomination;
import com.awardsystem.nomination.NominationRepository;
import com.awardsystem.nomination.NominationStatus;
import com.awardsystem.notification.dto.ReportFilterRequest;
import com.awardsystem.notification.dto.ReportResponseDto;
import com.awardsystem.results.Result;
import com.awardsystem.results.ResultRepository;
import com.awardsystem.results.VoteTally;
import com.awardsystem.results.VoteTallyRepository;
import com.awardsystem.voting.VoteRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class ReportService {

    private final ReportRepository reportRepository;
    private final NominationRepository nominationRepository;
    private final VoteRepository voteRepository;
    private final ResultRepository resultRepository;
    private final VoteTallyRepository voteTallyRepository;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;

    public ReportService(ReportRepository reportRepository,
                         NominationRepository nominationRepository,
                         VoteRepository voteRepository,
                         ResultRepository resultRepository,
                         VoteTallyRepository voteTallyRepository,
                         CategoryRepository categoryRepository,
                         ObjectMapper objectMapper) {
        this.reportRepository = reportRepository;
        this.nominationRepository = nominationRepository;
        this.voteRepository = voteRepository;
        this.resultRepository = resultRepository;
        this.voteTallyRepository = voteTallyRepository;
        this.categoryRepository = categoryRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<ReportResponseDto> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ReportResponseDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ReportResponseDto getReportById(Long id) {
        ReportRecord record = reportRepository.findById(id)
                .orElseThrow(() -> new AppException("Report not found with id: " + id, HttpStatus.NOT_FOUND));
        return ReportResponseDto.fromEntity(record);
    }

    @Transactional
    public ReportResponseDto generateReport(ReportFilterRequest request, User programManager) {
        String dataJson = executeReportDataQuery(request);
        String paramsJson;
        try {
            paramsJson = objectMapper.writeValueAsString(request);
        } catch (Exception e) {
            paramsJson = "{}";
        }

        ReportRecord record = new ReportRecord(
                request.getTitle().trim(),
                request.getReportType().toUpperCase(),
                paramsJson,
                dataJson,
                programManager
        );

        ReportRecord saved = reportRepository.save(record);
        return ReportResponseDto.fromEntity(saved);
    }

    @Transactional
    public ReportResponseDto updateAndRegenerateReport(Long id, ReportFilterRequest request, User programManager) {
        ReportRecord record = reportRepository.findById(id)
                .orElseThrow(() -> new AppException("Report not found with id: " + id, HttpStatus.NOT_FOUND));

        String dataJson = executeReportDataQuery(request);
        String paramsJson;
        try {
            paramsJson = objectMapper.writeValueAsString(request);
        } catch (Exception e) {
            paramsJson = "{}";
        }

        record.setTitle(request.getTitle().trim());
        record.setReportType(request.getReportType().toUpperCase());
        record.setParametersJson(paramsJson);
        record.setDataJson(dataJson);

        ReportRecord updated = reportRepository.save(record);
        return ReportResponseDto.fromEntity(updated);
    }

    @Transactional
    public void deleteReport(Long id) {
        if (!reportRepository.existsById(id)) {
            throw new AppException("Report not found with id: " + id, HttpStatus.NOT_FOUND);
        }
        reportRepository.deleteById(id);
    }

    private String executeReportDataQuery(ReportFilterRequest request) {
        Map<String, Object> data = new HashMap<>();
        data.put("reportTitle", request.getTitle());
        data.put("reportType", request.getReportType());
        data.put("generatedAt", LocalDateTime.now().toString());

        String type = request.getReportType().toUpperCase();
        if ("NOMINATIONS".equals(type)) {
            NominationStatus status = null;
            if (request.getStatus() != null && !request.getStatus().trim().isEmpty()) {
                try {
                    status = NominationStatus.valueOf(request.getStatus().toUpperCase());
                } catch (Exception ignored) {}
            }
            List<Nomination> nominations = nominationRepository.filterNominations(request.getCategoryId(), status, null);
            List<Map<String, Object>> rows = new ArrayList<>();
            for (Nomination n : nominations) {
                Map<String, Object> row = new HashMap<>();
                row.put("referenceNumber", n.getReferenceNumber());
                row.put("nomineeName", n.getNomineeName());
                row.put("nomineeEmail", n.getNomineeEmail());
                row.put("nomineeOrg", n.getNomineeOrg());
                row.put("categoryName", n.getCategory().getName());
                row.put("status", n.getStatus().name());
                row.put("submittedAt", n.getSubmittedAt().toString());
                rows.add(row);
            }
            data.put("totalNominations", rows.size());
            data.put("items", rows);

        } else if ("VOTING".equals(type)) {
            List<AwardCategory> categories = request.getCategoryId() != null
                    ? categoryRepository.findById(request.getCategoryId()).map(List::of).orElse(List.of())
                    : categoryRepository.findByIsActiveTrue();

            List<Map<String, Object>> catSummaries = new ArrayList<>();
            long totalVotesAll = 0;
            for (AwardCategory cat : categories) {
                long count = voteRepository.countByCategoryId(cat.getId());
                totalVotesAll += count;
                Map<String, Object> catMap = new HashMap<>();
                catMap.put("categoryId", cat.getId());
                catMap.put("categoryName", cat.getName());
                catMap.put("voteCount", count);

                List<Object[]> candidateVotes = voteRepository.countVotesByNominationForCategory(cat.getId());
                List<Map<String, Object>> candList = new ArrayList<>();
                for (Object[] cv : candidateVotes) {
                    Long nomId = (Long) cv[0];
                    Long cvCount = (Long) cv[1];
                    nominationRepository.findById(nomId).ifPresent(n -> {
                        Map<String, Object> cMap = new HashMap<>();
                        cMap.put("nomineeName", n.getNomineeName());
                        cMap.put("votes", cvCount);
                        candList.add(cMap);
                    });
                }
                catMap.put("candidates", candList);
                catSummaries.add(catMap);
            }
            data.put("totalVotesCast", totalVotesAll);
            data.put("categories", catSummaries);

        } else { // OUTCOMES / SUMMARY
            List<Result> results = resultRepository.findAll();
            List<Map<String, Object>> outcomeRows = new ArrayList<>();
            for (Result r : results) {
                Map<String, Object> rMap = new HashMap<>();
                rMap.put("categoryName", r.getCategory().getName());
                rMap.put("verificationStatus", r.getVerificationStatus().name());
                rMap.put("verifiedBy", r.getVerifiedBy() != null ? r.getVerifiedBy().getFullName() : "Not Verified");
                rMap.put("published", r.getPublishedAt() != null);
                rMap.put("publishedAt", r.getPublishedAt() != null ? r.getPublishedAt().toString() : null);
                if (r.getWinnerNomination() != null) {
                    rMap.put("winnerName", r.getWinnerNomination().getNomineeName());
                    rMap.put("winnerOrg", r.getWinnerNomination().getNomineeOrg());
                    rMap.put("winnerRef", r.getWinnerNomination().getReferenceNumber());
                } else {
                    rMap.put("winnerName", "TBD");
                }
                outcomeRows.add(rMap);
            }
            data.put("totalResults", outcomeRows.size());
            data.put("outcomes", outcomeRows);
        }

        try {
            return objectMapper.writeValueAsString(data);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
