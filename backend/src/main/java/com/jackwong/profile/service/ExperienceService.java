// backend/src/main/java/com/jackwong/profile/service/ExperienceService.java
package com.jackwong.profile.service;

import com.jackwong.profile.api.dto.request.ExperienceRequest;
import com.jackwong.profile.api.dto.request.PositionRequest;
import com.jackwong.profile.api.dto.request.ReorderRequest;
import com.jackwong.profile.api.dto.request.ResponsibilityRequest;
import com.jackwong.profile.api.dto.response.ExperienceResponse;
import com.jackwong.profile.api.mapper.ExperienceMapper;
import com.jackwong.profile.common.api.ErrorCode;
import com.jackwong.profile.common.exception.BusinessException;
import com.jackwong.profile.common.exception.ResourceNotFoundException;
import com.jackwong.profile.domain.entity.Experience;
import com.jackwong.profile.domain.entity.JobPosition;
import com.jackwong.profile.domain.entity.Profile;
import com.jackwong.profile.domain.entity.Responsibility;
import com.jackwong.profile.domain.vo.LocalizedText;
import com.jackwong.profile.repository.ExperienceRepository;
import java.util.ArrayList;
import java.util.HashMap;
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
 * Business operations over work experience, including the nested job titles and their
 * responsibility bullets. The submitted list order is authoritative for display order.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExperienceService {

    private final ExperienceRepository experienceRepository;
    private final ExperienceMapper experienceMapper;
    private final ProfileService profileService;

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public List<ExperienceResponse> listByProfile(Long profileId) {
        return experienceMapper.toResponseList(
                experienceRepository.findByProfileIdOrderByDisplayOrderAscStartDateDesc(profileId));
    }

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public ExperienceResponse getById(Long profileId, Long experienceId) {
        return experienceMapper.toResponse(requireExperience(profileId, experienceId));
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public ExperienceResponse create(Long profileId, ExperienceRequest request) {
        validate(request);
        Profile profile = profileService.requireProfile(profileId);

        Experience experience = new Experience();
        experienceMapper.updateFromRequest(request, experience);
        experience.setDisplayOrder(experienceRepository.findMaxDisplayOrder(profileId) + 1);
        profile.addExperience(experience);
        syncPositions(experience, request.positions());

        Experience saved = experienceRepository.save(experience);
        log.info("Created experience id={} company={} for profile={}", saved.getId(), saved.getCompanyName(),
                profileId);
        return experienceMapper.toResponse(saved);
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public ExperienceResponse update(Long profileId, Long experienceId, ExperienceRequest request) {
        validate(request);
        Experience experience = requireExperience(profileId, experienceId);
        experienceMapper.updateFromRequest(request, experience);
        syncPositions(experience, request.positions());
        log.info("Updated experience id={} for profile={}", experienceId, profileId);
        return experienceMapper.toResponse(experience);
    }

    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public void delete(Long profileId, Long experienceId) {
        Experience experience = requireExperience(profileId, experienceId);
        experienceRepository.delete(experience);
        log.info("Deleted experience id={} for profile={}", experienceId, profileId);
    }

    /**
     * Rewrites {@code displayOrder} across the sibling set. The payload must list every
     * existing row exactly once so the resulting ordering stays total.
     *
     * @param profileId owning profile
     * @param request   ids in their new order
     * @return the reordered collection
     */
    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public List<ExperienceResponse> reorder(Long profileId, ReorderRequest request) {
        List<Experience> existing = experienceRepository
                .findByProfileIdOrderByDisplayOrderAscStartDateDesc(profileId);
        Map<Long, Experience> byId = existing.stream()
                .collect(Collectors.toMap(Experience::getId, Function.identity()));

        Set<Long> requested = new HashSet<>(request.orderedIds());
        if (requested.size() != request.orderedIds().size() || !requested.equals(byId.keySet())) {
            throw new BusinessException(ErrorCode.BUSINESS_RULE_VIOLATION,
                    "orderedIds must list every experience of the profile exactly once");
        }

        int order = 0;
        for (Long id : request.orderedIds()) {
            byId.get(id).setDisplayOrder(order++);
        }
        return experienceMapper.toResponseList(
                experienceRepository.findByProfileIdOrderByDisplayOrderAscStartDateDesc(profileId));
    }

    private Experience requireExperience(Long profileId, Long experienceId) {
        return experienceRepository.findByIdAndProfileId(experienceId, profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Experience", experienceId));
    }

    private void validate(ExperienceRequest request) {
        DateRangeValidator.validate("Experience", request.startDate(), request.endDate(), request.currentRole());
        for (PositionRequest position : request.positions()) {
            DateRangeValidator.validate("Position", position.startDate(), position.endDate(), position.currentRole());
            requireTranslation(position.title(), "Position title");
            if (position.responsibilities() != null) {
                for (ResponsibilityRequest responsibility : position.responsibilities()) {
                    requireTranslation(responsibility.content(), "Responsibility content");
                }
            }
        }
    }

    private void requireTranslation(LocalizedText text, String label) {
        if (text == null || text.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_FAILED,
                    "%s requires at least one translation".formatted(label));
        }
    }

    /**
     * Reconciles the persistent position collection with the submitted list: rows referenced
     * by id are updated in place, rows without an id are created, and rows absent from the
     * payload are removed through JPA orphan removal.
     */
    private void syncPositions(Experience experience, List<PositionRequest> requests) {
        Map<Long, JobPosition> existing = new HashMap<>();
        experience.getPositions().forEach(position -> existing.put(position.getId(), position));

        List<JobPosition> resulting = new ArrayList<>(requests.size());
        int order = 0;
        for (PositionRequest request : requests) {
            JobPosition position;
            if (request.id() == null) {
                position = new JobPosition();
                position.setExperience(experience);
            } else {
                position = existing.get(request.id());
                if (position == null) {
                    throw new ResourceNotFoundException("Position", request.id());
                }
            }
            experienceMapper.updatePositionFromRequest(request, position);
            position.setDisplayOrder(order++);
            syncResponsibilities(position, request.responsibilities());
            resulting.add(position);
        }

        experience.getPositions().clear();
        experience.getPositions().addAll(resulting);
    }

    private void syncResponsibilities(JobPosition position, List<ResponsibilityRequest> requests) {
        List<ResponsibilityRequest> safeRequests = requests == null ? List.of() : requests;
        Map<Long, Responsibility> existing = new HashMap<>();
        position.getResponsibilities().forEach(item -> existing.put(item.getId(), item));

        List<Responsibility> resulting = new ArrayList<>(safeRequests.size());
        int order = 0;
        for (ResponsibilityRequest request : safeRequests) {
            Responsibility responsibility;
            if (request.id() == null) {
                responsibility = new Responsibility();
                responsibility.setPosition(position);
            } else {
                responsibility = existing.get(request.id());
                if (responsibility == null) {
                    throw new ResourceNotFoundException("Responsibility", request.id());
                }
            }
            responsibility.setContent(request.content());
            responsibility.setDisplayOrder(order++);
            resulting.add(responsibility);
        }

        position.getResponsibilities().clear();
        position.getResponsibilities().addAll(resulting);
    }
}
