package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.AuthResponse;
import com.ezeiatech.inventory.dto.LoginRequest;
import com.ezeiatech.inventory.dto.RegisterRequest;
import com.ezeiatech.inventory.dto.UserResponse;
import com.ezeiatech.inventory.entity.Role;
import com.ezeiatech.inventory.entity.UserStatus;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.UserRepository;
import com.ezeiatech.inventory.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import com.ezeiatech.inventory.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.ezeiatech.inventory.security.LoginRateLimiter;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LoginRateLimiter rateLimiter;
    // user na mile tab bhi bcrypt chalane ke liye (timing se email guess na ho)
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, LoginRateLimiter rateLimiter) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.rateLimiter = rateLimiter;
        this.dummyHash = passwordEncoder.encode("not-a-real-password");
    }
    @Transactional
    public UserResponse register(RegisterRequest request){
        String email = request.getEmail().trim().toLowerCase();
        if(userRepository.existsByEmail(email)){
            throw new ApiException(HttpStatus.CONFLICT, "Email already exists");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        return UserResponse.from(userRepository.save(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request, String ip) {
        String email = request.getEmail().trim().toLowerCase();
        rateLimiter.checkAllowed(ip, email);

        User user = userRepository.findByEmail(email).orElse(null);
        String hash = (user != null) ? user.getPassword() : dummyHash;
        boolean passwordOk = passwordEncoder.matches(request.getPassword(), hash);

        if (user == null || !passwordOk || user.getStatus() != UserStatus.ACTIVE) {
            rateLimiter.recordFailure(ip, email);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        rateLimiter.reset(ip, email);
        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, "Bearer", UserResponse.from(user));
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email){
        return userRepository.findByEmail(email)
                .map(UserResponse::from)
                .orElseThrow(()-> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

}
