package com.giproject.entity.review;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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
	
	@Column(name = "review_no",nullable = false)
	private Long reviewNo;
	
	@Column(name = "image_path", nullable = false, length = 255)
	private String imagePath;
	
	 @Column(name = "sort_order")
	 private Integer sortOrder;
}
