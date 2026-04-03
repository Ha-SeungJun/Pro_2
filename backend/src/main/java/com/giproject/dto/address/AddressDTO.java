package com.giproject.dto.address;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 주소 관련 요청/응답 DTO 모음
 */
public class AddressDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimpleAddressRequest {
        @NotBlank(message = "address는 비어 있을 수 없습니다.")
        private String address;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SimpleAddressResponse {
        private String result;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchAddressRequest {
        @NotNull(message = "addresses는 null일 수 없습니다.")
        private List<String> addresses;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchAddressResponse {
        private List<String> results;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteRequest {
        @NotBlank(message = "route는 비어 있을 수 없습니다.")
        private String route;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteResponse {
        private String from;
        private String to;
    }
}