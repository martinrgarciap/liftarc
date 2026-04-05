package com.martin.liftarc.api.auth;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.martin.liftarc.api.auth.dto.MeResponse;

import jakarta.servlet.http.HttpServletRequest;

@RestController
public class MeController {

    @GetMapping("/api/me")
    public MeResponse me(
            @AuthenticationPrincipal Jwt jwt,
            HttpServletRequest request
    ) {
        return new MeResponse(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("role"),
                jwt.getClaimAsString("session_id"),
                jwt.getIssuer() != null ? jwt.getIssuer().toString() : null,
                jwt.getAudience()
        );
    }
}