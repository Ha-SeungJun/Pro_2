package com.giproject.entity.review;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "review_image")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_image_no")
    private Long reviewImageNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_no", nullable = false)
    private Review review;

    @Column(name = "image_path", nullable = false, length = 255)
    private String imagePath;

    @Column(name = "thumbnail_path", nullable = false, length = 255)
    private String thumbnailPath;

    @Column(name = "sort_order")
    private Integer sortOrder;
}