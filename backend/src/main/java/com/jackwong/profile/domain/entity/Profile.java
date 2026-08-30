// backend/src/main/java/com/jackwong/profile/domain/entity/Profile.java
package com.jackwong.profile.domain.entity;

import com.jackwong.profile.domain.converter.LocalizedTextConverter;
import com.jackwong.profile.domain.vo.LocalizedText;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Root aggregate of the site: identity, contact channels, and the ordered collections of
 * work experience, education, and certifications.
 */
@Entity
@Table(name = "profile")
@Getter
@Setter
@NoArgsConstructor
public class Profile extends AuditableEntity {

    @Column(name = "slug", nullable = false, length = 64)
    private String slug;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "full_name_i18n", columnDefinition = "TEXT")
    private LocalizedText localizedFullName;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "headline_i18n", columnDefinition = "TEXT")
    private LocalizedText headline;

    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "job_title_i18n", columnDefinition = "TEXT")
    private LocalizedText jobTitle;

    @Column(name = "company_name", length = 160)
    private String companyName;

    @Column(name = "location", length = 160)
    private String location;

    /** Markdown (GFM) biography rendered by the public site and the split-pane editor. */
    @Convert(converter = LocalizedTextConverter.class)
    @Column(name = "summary_i18n", columnDefinition = "TEXT")
    private LocalizedText summary;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "email", length = 190)
    private String email;

    @Column(name = "phone", length = 40)
    private String phone;

    @Column(name = "facebook_url", length = 512)
    private String facebookUrl;

    @Column(name = "instagram_url", length = 512)
    private String instagramUrl;

    @Column(name = "xiaohongshu_url", length = 512)
    private String xiaohongshuUrl;

    @Column(name = "linkedin_url", length = 512)
    private String linkedinUrl;

    @Column(name = "github_url", length = 512)
    private String githubUrl;

    @Column(name = "website_url", length = 512)
    private String websiteUrl;

    @Column(name = "published", nullable = false)
    private boolean published = true;

    @Version
    @Column(name = "optlock_version", nullable = false)
    private long optlockVersion;

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, startDate DESC")
    private List<Experience> experiences = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, endDate DESC")
    private List<Education> educations = new ArrayList<>();

    @OneToMany(mappedBy = "profile", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC, issueDate DESC")
    private List<Certification> certifications = new ArrayList<>();

    public void addExperience(Experience experience) {
        experience.setProfile(this);
        experiences.add(experience);
    }

    public void removeExperience(Experience experience) {
        experiences.remove(experience);
        experience.setProfile(null);
    }

    public void addEducation(Education education) {
        education.setProfile(this);
        educations.add(education);
    }

    public void removeEducation(Education education) {
        educations.remove(education);
        education.setProfile(null);
    }

    public void addCertification(Certification certification) {
        certification.setProfile(this);
        certifications.add(certification);
    }

    public void removeCertification(Certification certification) {
        certifications.remove(certification);
        certification.setProfile(null);
    }
}
