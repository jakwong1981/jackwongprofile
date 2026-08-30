// backend/src/main/java/com/jackwong/profile/service/ProfileService.java
package com.jackwong.profile.service;

import com.jackwong.profile.api.dto.request.ProfileUpdateRequest;
import com.jackwong.profile.api.dto.response.ProfileResponse;
import com.jackwong.profile.api.mapper.ProfileMapper;
import com.jackwong.profile.common.api.ErrorCode;
import com.jackwong.profile.common.exception.BusinessException;
import com.jackwong.profile.common.exception.ResourceNotFoundException;
import com.jackwong.profile.domain.entity.Profile;
import com.jackwong.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Business operations over the profile aggregate root.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final ProfileMapper profileMapper;

    /**
     * @return the single profile that backs the public site
     * @throws ResourceNotFoundException when the database holds no profile at all
     */
    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public ProfileResponse getDefaultProfile() {
        return profileMapper.toResponse(requireDefaultProfile());
    }

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public ProfileResponse getBySlug(String slug) {
        Profile profile = profileRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", slug));
        return profileMapper.toResponse(profile);
    }

    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public ProfileResponse getById(Long id) {
        return profileMapper.toResponse(requireProfile(id));
    }

    /**
     * Replaces the scalar attributes of a profile. Nested collections are untouched.
     *
     * @param id      target profile id
     * @param request validated payload
     * @return the persisted state
     * @throws BusinessException when the requested slug already belongs to another profile
     */
    @Transactional(propagation = Propagation.REQUIRED, rollbackFor = Exception.class)
    public ProfileResponse update(Long id, ProfileUpdateRequest request) {
        Profile profile = requireProfile(id);
        if (profileRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new BusinessException(ErrorCode.RESOURCE_CONFLICT,
                    "Slug '%s' is already used by another profile".formatted(request.slug()));
        }
        profileMapper.updateFromRequest(request, profile);
        log.info("Updated profile id={} slug={}", profile.getId(), profile.getSlug());
        return profileMapper.toResponse(profile);
    }

    /**
     * Loads a managed profile for use by the sub-aggregate services.
     *
     * @param id profile id
     * @return the managed entity
     */
    @Transactional(propagation = Propagation.MANDATORY, readOnly = true, rollbackFor = Exception.class)
    public Profile requireProfile(Long id) {
        return profileRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Profile", id));
    }

    /**
     * @return the id of the profile that backs the public site
     */
    @Transactional(propagation = Propagation.REQUIRED, readOnly = true, rollbackFor = Exception.class)
    public Long resolveDefaultProfileId() {
        return requireDefaultProfile().getId();
    }

    private Profile requireDefaultProfile() {
        return profileRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException("No profile has been provisioned"));
    }
}
