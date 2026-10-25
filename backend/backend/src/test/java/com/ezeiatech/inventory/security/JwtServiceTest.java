package com.ezeiatech.inventory.security;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    // 32 byte secrets (base64), sirf test ke liye
    private static final String SECRET = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";
    private static final String OTHER_SECRET = "QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVowMTIzNDU=";

    @Test
    void validTokenIsAcceptedAndEmailExtracted() {
        JwtService service = new JwtService(SECRET, 60_000);
        String token = service.generateToken("a@test.com", "ADMIN");

        assertTrue(service.isValid(token));
        assertEquals("a@test.com", service.extractEmail(token));
    }

    @Test
    void expiredTokenIsRejected() {
        JwtService service = new JwtService(SECRET, -1000); // pehle se expired
        String token = service.generateToken("a@test.com", "ADMIN");

        assertFalse(service.isValid(token));
    }

    @Test
    void tokenSignedWithDifferentSecretIsRejected() {
        JwtService attacker = new JwtService(OTHER_SECRET, 60_000);
        JwtService server = new JwtService(SECRET, 60_000);

        assertFalse(server.isValid(attacker.generateToken("a@test.com", "ADMIN")));
    }

    @Test
    void garbageTokenIsRejected() {
        JwtService service = new JwtService(SECRET, 60_000);

        assertFalse(service.isValid("not.a.jwt"));
        assertFalse(service.isValid(""));
    }

    @Test
    void tooShortSecretFailsAtStartup() {
        // "short" ka base64: 256 bit se chhota key allow nahi
        assertThrows(RuntimeException.class, () -> new JwtService("c2hvcnQ=", 60_000));
    }
}