package com.giproject.dto.review;

import java.math.BigDecimal;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@Builder
public class DriverProfileCardDTO {

    private String driverId;
    private String driverName;
    private String driverProfileImage;

    private BigDecimal avgRating;
    private Long reviewCount;

    private Boolean isVerified;

    public DriverProfileCardDTO(
    	    String driverId,
    	    String driverName,
    	    String driverProfileImage,
    	    BigDecimal avgRating,
    	    Long reviewCount,
    	    Boolean isVerified
    	) {
    	    this.driverId = driverId;
    	    this.driverName = driverName;
    	    this.driverProfileImage = driverProfileImage;
    	    this.avgRating = avgRating;
    	    this.reviewCount = reviewCount;
    	    this.isVerified = isVerified;
    	}

    
    	public DriverProfileCardDTO(
    	    String driverId,
    	    String driverName,
    	    String driverProfileImage,
    	    Double avgRating,
    	    Long reviewCount,
    	    Boolean isVerified
    	) {
    	    this.driverId = driverId;
    	    this.driverName = driverName;
    	    this.driverProfileImage = driverProfileImage;
    	    this.avgRating = (avgRating == null) ? null : BigDecimal.valueOf(avgRating);
    	    this.reviewCount = reviewCount;
    	    this.isVerified = isVerified;
    	}
}