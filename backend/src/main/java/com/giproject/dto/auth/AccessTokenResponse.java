// com.giproject.dto.auth.AccessTokenResponse
package com.giproject.dto.auth;

import lombok.*;
import java.util.List;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccessTokenResponse {
    private String tokenType;     // "Bearer"
    private String accessToken;
    private long   expiresIn;
    private List<String> roles;
}
