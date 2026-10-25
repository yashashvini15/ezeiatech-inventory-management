package com.ezeiatech.inventory.security;

import com.ezeiatech.inventory.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private record Window(long start, int count) {}

    private static final int CLEANUP_THRESHOLD = 10_000;

    private final int maxPerEmail;
    private final int maxPerIp;
    private final long windowMs;
    private final Clock clock;
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    @Autowired
    public LoginRateLimiter(@Value("${app.security.login.max-attempts}") int maxPerEmail,
                            @Value("${app.security.login.max-attempts-per-ip}") int maxPerIp,
                            @Value("${app.security.login.window-seconds}") long windowSeconds) {
        this(maxPerEmail, maxPerIp, windowSeconds, Clock.systemUTC());
    }

    // tests ke liye: fake clock de sakte hain
    LoginRateLimiter(int maxPerEmail, int maxPerIp, long windowSeconds, Clock clock) {
        this.maxPerEmail = maxPerEmail;
        this.maxPerIp = maxPerIp;
        this.windowMs = windowSeconds * 1000;
        this.clock = clock;
    }

    /** Login se PEHLE call karo: limit paar ho gayi to 429. */
    public void checkAllowed(String ip, String email) {
        if (isBlocked(ipKey(ip), maxPerIp) || isBlocked(emailKey(ip, email), maxPerEmail)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many login attempts. Try again after some time.");
        }
    }

    public void recordFailure(String ip, String email) {
        increment(ipKey(ip));
        increment(emailKey(ip, email));
    }

    public void reset(String ip, String email) {
        windows.remove(emailKey(ip, email));
    }

    private boolean isBlocked(String key, int max) {
        Window w = windows.get(key);
        if (w == null) return false;
        if (clock.millis() - w.start() >= windowMs) {
            windows.remove(key, w);
            return false;
        }
        return w.count() >= max;
    }

    private void increment(String key) {
        long now = clock.millis();
        windows.compute(key, (k, w) ->
                (w == null || now - w.start() >= windowMs)
                        ? new Window(now, 1)
                        : new Window(w.start(), w.count() + 1));
        if (windows.size() > CLEANUP_THRESHOLD) {
            windows.entrySet().removeIf(e -> now - e.getValue().start() >= windowMs);
        }
    }

    private static String ipKey(String ip) { return "ip:" + ip; }

    private static String emailKey(String ip, String email) { return "ie:" + ip + "|" + email; }
}