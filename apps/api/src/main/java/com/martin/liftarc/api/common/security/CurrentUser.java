package com.martin.liftarc.api.common.security;

public record CurrentUser(
        String userId,
        String email,
        String role,
        String sessionId
) {
}