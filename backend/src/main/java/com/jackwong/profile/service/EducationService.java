// backend/src/main/java/com/jackwong/profile/service/EducationService.java
package com.jackwong.profile.service;

import com.jackwong.profile.api.dto.request.EducationRequest;
import com.jackwong.profile.api.dto.request.ReorderRequest;
import com.jackwong.profile.api.dto.response.EducationResponse;
import com.jackwong.profile.api.mapper.EducationMapper;
import com.jackwong.profile.common.api.ErrorCode;
import com.jackwong.profile.common.exception.BusinessException;
import com.jackwong.profile.common.exception.ResourceNotFoundException;
import com.jackwong.profile.domain.entity.Education;
import com.jackwong.profile.domain.entity.Profile;
import com.jackwong.profile.repository.EducationRepository;
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
 * Business operations over academic records.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EducationService {

    private final EducationRepository educationRepository;
    private final EducationMapper educationMapper;
    private final ProfileService profileService;

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public List<EducationResponse> listByProfile(Long profileId) {
        return educationMapper.toResponseList(
                educationRepository.findByProfileIdOrderByDisplayOrderAscEndDateDesc(profileId));
    }

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public EducationResponse getById(Long profileId, Long educationId) {
        return educationMapper.toResponse(requireEducation(profileId, educationId));
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public EducationResponse create(Long profileId, EducationRequest request) {
        DateRangeValidator.validate("Education", request.startDate(), request.endDate(), false);
        Profile profile = profileService.requireProfile(profileId);

        Education education = new Education();
        educationMapper.updateFromRequest(request, education);
        education.setDisplayOrder(educationRepository.findMaxDisplayOrder(profileId) + 1);
        profile.addEducation(education);

        Education saved = educationRepository.save(education);
        log.info("Created education id={} institution={} for profile={}", saved.getId(), saved.getInstitution(),
                profileId);
        return educationMapper.toResponse(saved);
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public EducationResponse update(Long profileId, Long educationId, EducationRequest request) {
        DateRangeValidator.validate("Education", request.startDate(), request.endDate(), false);
        Education education = requireEducation(profileId, educationId);
        educationMapper.updateFromRequest(request, education);
        log.info("Updated education id={} for profile={}", educationId, profileId);
        return educationMapper.toResponse(education);
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public void delete(Long profileId, Long educationId) {
        educationRepository.delete(requireEducation(profileId, educationId));
        log.info("Deleted education id={} for profile={}", educationId, profileId);
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public List<EducationResponse> reorder(Long profileId, ReorderRequest request) {
        List<Education> existing = educationRepository.findByProfileIdOrderByDisplayOrderAscEndDateDesc(profileId);
        Map<Long, Education> byId = existing.stream()
                .collect(Collectors.toMap(Education::getId, Function.identity()));

        Set<Long> requested = new HashSet<>(request.orderedIds());
        if (requested.size() != request.orderedIds().size() || !requested.equals(byId.keySet())) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "orderedIds must list every education record of the profile exactly once");
        }

        int order = 0;
        for (Long id : request.orderedIds()) {
            byId.get(id).setDisplayOrder(order++);
        }
        return educationMapper.toResponseList(
                educationRepository.findByProfileIdOrderByDisplayOrderAscEndDateDesc(profileId));
    }

    private Education requireEducation(Long profileId, Long educationId) {
        return educationRepository.findByIdAndProfileId(educationId, profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Education", educationId));
    }
}
