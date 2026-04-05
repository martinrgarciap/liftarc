package com.martin.liftarc.api.auth.dto;

import java.util.List;

public record MeResponse(
        String userId,
        String email,
        String role,
        String sessionId,
        String issuer,
        List<String> audience
) {
}