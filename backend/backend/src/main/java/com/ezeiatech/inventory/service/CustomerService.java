package com.ezeiatech.inventory.service;

import com.ezeiatech.inventory.dto.PageResponse;
import com.ezeiatech.inventory.dto.UserResponse;
import com.ezeiatech.inventory.entity.Role;
import com.ezeiatech.inventory.entity.User;
import com.ezeiatech.inventory.entity.UserStatus;
import com.ezeiatech.inventory.exception.ApiException;
import com.ezeiatech.inventory.repository.UserRepository;
import com.ezeiatech.inventory.specification.UserSpecs;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomerService {
    private static final int MAX_SEARCH_LEN = 100;

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<UserResponse> list(String search, UserStatus status, int page, int limit) {
        String q = search == null ? null : search.trim();
        if (q != null && q.length() > MAX_SEARCH_LEN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Search text too long");
        }
        PageRequest pageable = PageRequest.of(Math.max(page, 1) - 1, Math.min(Math.max(limit, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by(Sort.Direction.DESC, "id")));
        // UserResponse me password nahi hai, isliye hash kabhi bahar nahi jata
        return PageResponse.from(userRepository.findAll(UserSpecs.customers(q, status), pageable)
                .map(UserResponse::from));
    }

    @Transactional
    public UserResponse updateStatus(Long id, UserStatus status) {
        // Admin/Staff ko yahan se block nahi kar sakte: sirf CUSTOMER. Baaki ke liye 404 (existence leak nahi)
        User user = userRepository.findById(id)
                .filter(u -> u.getRole() == Role.CUSTOMER)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found"));
        user.setStatus(status);   // managed entity: commit par save. Block hote hi JwtAuthFilter agli request 401 kar deta hai
        return UserResponse.from(user);
    }
}