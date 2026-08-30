// backend/src/main/java/com/jackwong/profile/service/CertificationService.java
package com.jackwong.profile.service;

import com.jackwong.profile.api.dto.request.CertificationRequest;
import com.jackwong.profile.api.dto.request.ReorderRequest;
import com.jackwong.profile.api.dto.response.CertificationResponse;
import com.jackwong.profile.api.mapper.CertificationMapper;
import com.jackwong.profile.common.api.ErrorCode;
import com.jackwong.profile.common.exception.BusinessException;
import com.jackwong.profile.common.exception.ResourceNotFoundException;
import com.jackwong.profile.domain.entity.Certification;
import com.jackwong.profile.domain.entity.Profile;
import com.jackwong.profile.repository.CertificationRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business operations over professional credentials.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CertificationService {

    private final CertificationRepository certificationRepository;
    private final CertificationMapper certificationMapper;
    private final ProfileService profileService;

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public List<CertificationResponse> listByProfile(Long profileId) {
        return certificationMapper.toResponseList(
                certificationRepository.findByProfileIdOrderByDisplayOrderAscIssueDateDesc(profileId));
    }

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public CertificationResponse getById(Long profileId, Long certificationId) {
        return certificationMapper.toResponse(requireCertification(profileId, certificationId));
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public CertificationResponse create(Long profileId, CertificationRequest request) {
        validate(request);
        Profile profile = profileService.requireProfile(profileId);

        Certification certification = new Certification();
        certificationMapper.updateFromRequest(request, certification);
        certification.setDisplayOrder(certificationRepository.findMaxDisplayOrder(profileId) + 1);
        profile.addCertification(certification);

        Certification saved = certificationRepository.save(certification);
        log.info("Created certification id={} issuer={} for profile={}", saved.getId(),
                saved.getIssuingOrganization(), profileId);
        return certificationMapper.toResponse(saved);
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public CertificationResponse update(Long profileId, Long certificationId, CertificationRequest request) {
        validate(request);
        Certification certification = requireCertification(profileId, certificationId);
        certificationMapper.updateFromRequest(request, certification);
        log.info("Updated certification id={} for profile={}", certificationId, profileId);
        return certificationMapper.toResponse(certification);
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public void delete(Long profileId, Long certificationId) {
        certificationRepository.delete(requireCertification(profileId, certificationId));
        log.info("Deleted certification id={} for profile={}", certificationId, profileId);
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public List<CertificationResponse> reorder(Long profileId, ReorderRequest request) {
        List<Certification> existing =
                certificationRepository.findByProfileIdOrderByDisplayOrderAscIssueDateDesc(profileId);
        Map<Long, Certification> byId = existing.stream()
                .collect(Collectors.toMap(Certification::getId, Function.identity()));

        Set<Long> requested = new HashSet<>(request.orderedIds());
        if (requested.size() != request.orderedIds().size() || !requested.equals(byId.keySet())) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "orderedIds must list every certification of the profile exactly once");
        }

        int order = 0;
        for (Long id : request.orderedIds()) {
            byId.get(id).setDisplayOrder(order++);
        }
        return certificationMapper.toResponseList(
                certificationRepository.findByProfileIdOrderByDisplayOrderAscIssueDateDesc(profileId));
    }

    private void validate(CertificationRequest request) {
        if (request.name() == null || request.name().isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED,
                    "Certification name requires at least one translation");
        }
        if (request.issueDate() != null && request.expirationDate() != null
                && request.expirationDate().isBefore(request.issueDate())) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "Certification expiration date must not precede the issue date");
        }
    }

    private Certification requireCertification(Long profileId, Long certificationId) {
        return certificationRepository.findByIdAndProfileId(certificationId, profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Certification", certificationId));
    }
}
