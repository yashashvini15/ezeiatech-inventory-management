package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.AuthResponse;
import com.ezeiatech.inventory.dto.LoginRequest;
import com.ezeiatech.inventory.entity.Role;
import com.ezeiatech.inventory.entity.User;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.UserRepository;
import com.ezeiatech.inventory.security.JwtService;
import com.ezeiatech.inventory.security.LoginRateLimiter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    private static final String IP = "1.1.1.1";

    @Mock UserRepository userRepository;
    @Mock
    JwtService jwtService;

    private final PasswordEncoder encoder = new BCryptPasswordEncoder();
    private AuthService authService;
    private User user;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, encoder, jwtService,
                new LoginRateLimiter(5, 20, 900));
        user = new User();
        user.setName("Test");
        user.setEmail("a@test.com");
        user.setPassword(encoder.encode("Correct#123"));
        user.setRole(Role.CUSTOMER);
    }

    private LoginRequest req(String email, String password) {
        LoginRequest r = new LoginRequest();
        r.setEmail(email);
        r.setPassword(password);
        return r;
    }

    @Test
    void loginSuccessReturnsToken() {
        when(userRepository.findByEmail("a@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken("a@test.com", "CUSTOMER")).thenReturn("tok");

        AuthResponse res = authService.login(req("A@Test.com ", "Correct#123"), IP);

        assertEquals("tok", res.getToken());
    }

    @Test
    void wrongPasswordGives401() {
        when(userRepository.findByEmail("a@test.com")).thenReturn(Optional.of(user));

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(req("a@test.com", "wrong-pass"), IP));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    void unknownEmailGivesSameMessage() {
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(req("nobody@test.com", "whatever123"), IP));

        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatus());
        assertEquals("Invalid email or password", ex.getMessage());
    }

    @Test
    void blockedAfterFiveFailuresEvenWithCorrectPassword() {
        when(userRepository.findByEmail("a@test.com")).thenReturn(Optional.of(user));

        for (int i = 0; i < 5; i++) {
            assertThrows(ApiException.class,
                    () -> authService.login(req("a@test.com", "wrong-pass"), IP));
        }
        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(req("a@test.com", "Correct#123"), IP));

        assertEquals(HttpStatus.TOO_MANY_REQUESTS, ex.getStatus());
        verify(userRepository, times(5)).findByEmail("a@test.com"); // 6th par DB hit hi nahi hua
    }

    @Test
    void successfulLoginResetsFailureCounter() {
        when(userRepository.findByEmail("a@test.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(anyString(), anyString())).thenReturn("tok");

        for (int i = 0; i < 4; i++) {
            assertThrows(ApiException.class,
                    () -> authService.login(req("a@test.com", "wrong-pass"), IP));
        }
        authService.login(req("a@test.com", "Correct#123"), IP); // reset
        for (int i = 0; i < 4; i++) {
            assertThrows(ApiException.class,
                    () -> authService.login(req("a@test.com", "wrong-pass"), IP));
        }
        // yaha tak 429 nahi aaya = counter reset hua
        assertDoesNotThrow(() -> authService.login(req("a@test.com", "Correct#123"), IP));
    }
}