package com.ezeiatech.inventory.security;

import com.ezeiatech.inventory.exception.ApiException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;

import static org.junit.jupiter.api.Assertions.*;

class LoginRateLimiterTest {

    static class MutableClock extends Clock {
        private Instant now = Instant.parse("2026-01-01T00:00:00Z");
        void advance(Duration d) { now = now.plus(d); }
        @Override public ZoneId getZone() { return ZoneOffset.UTC; }
        @Override public Clock withZone(ZoneId zone) { return this; }
        @Override public Instant instant() { return now; }
    }

    private MutableClock clock;
    private LoginRateLimiter limiter;

    @BeforeEach
    void setUp() {
        clock = new MutableClock();
        limiter = new LoginRateLimiter(3, 5, 900, clock);
    }

    private void fail(String ip, String email, int times) {
        for (int i = 0; i < times; i++) limiter.recordFailure(ip, email);
    }

    @Test
    void blocksAfterMaxFailuresForSameIpAndEmail() {
        fail("1.1.1.1", "a@test.com", 3);
        ApiException ex = assertThrows(ApiException.class,
                () -> limiter.checkAllowed("1.1.1.1", "a@test.com"));
        assertEquals(HttpStatus.TOO_MANY_REQUESTS, ex.getStatus());
    }

    @Test
    void allowsBelowLimit() {
        fail("1.1.1.1", "a@test.com", 2);
        assertDoesNotThrow(() -> limiter.checkAllowed("1.1.1.1", "a@test.com"));
    }

    @Test
    void otherEmailFromSameIpNotBlockedByEmailLimit() {
        fail("1.1.1.1", "a@test.com", 3);
        assertDoesNotThrow(() -> limiter.checkAllowed("1.1.1.1", "b@test.com"));
    }

    @Test
    void ipLimitBlocksEvenWithDifferentEmails() {
        for (int i = 0; i < 5; i++) limiter.recordFailure("2.2.2.2", "u" + i + "@test.com");
        assertThrows(ApiException.class,
                () -> limiter.checkAllowed("2.2.2.2", "new@test.com"));
    }

    @Test
    void differentIpNotAffected() {
        fail("1.1.1.1", "a@test.com", 3);
        assertDoesNotThrow(() -> limiter.checkAllowed("9.9.9.9", "a@test.com"));
    }

    @Test
    void unblocksAfterWindowExpires() {
        fail("1.1.1.1", "a@test.com", 3);
        clock.advance(Duration.ofSeconds(901));
        assertDoesNotThrow(() -> limiter.checkAllowed("1.1.1.1", "a@test.com"));
    }

    @Test
    void resetClearsEmailCounter() {
        fail("1.1.1.1", "a@test.com", 2);
        limiter.reset("1.1.1.1", "a@test.com");
        fail("1.1.1.1", "a@test.com", 2);
        assertDoesNotThrow(() -> limiter.checkAllowed("1.1.1.1", "a@test.com"));
    }
}