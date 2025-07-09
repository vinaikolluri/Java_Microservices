package com.example.auth.service;

import com.example.auth.dto.JwtAuthResponse;
import com.example.auth.dto.LoginRequest;
import com.example.auth.security.JwtTokenProvider;
import com.example.auth.model.Employee;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import com.example.auth.exception.ResourceNotFoundException;
import com.example.auth.repository.EmployeeRepository;
import com.example.auth.repository.DeviceTokenRepository;
import com.example.auth.model.DeviceToken;
import org.springframework.transaction.annotation.Transactional;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmployeeRepository employeeRepository;
    private final DeviceTokenRepository deviceTokenRepository;
    private final HttpServletRequest request;

    @Transactional
    public JwtAuthResponse login(LoginRequest loginRequest) {
        // Find employee
        Employee employee = employeeRepository.findByEmail(loginRequest.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        // Find and invalidate all previous active sessions for this user
        List<DeviceToken> activeTokens = deviceTokenRepository.findByEmployeeIdAndActive(employee.getId(), true);
        
        // Optional: Add a maximum number of simultaneous logins if needed
        if (!activeTokens.isEmpty()) {
            // Forcibly log out all existing sessions
            activeTokens.forEach(token -> {
                token.setActive(false);
                token.setLogoutReason("Logged out by new login");
            });
            deviceTokenRepository.saveAll(activeTokens);
        }

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                loginRequest.getEmail(),
                loginRequest.getPassword()
            )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate new token
        String token = jwtTokenProvider.generateToken(authentication);

        // Save new device token
        DeviceToken deviceToken = new DeviceToken();
        deviceToken.setToken(token);
        deviceToken.setEmployeeId(employee.getId());
        deviceToken.setDeviceInfo(getDeviceInfo());
        deviceToken.setLastUsed(Instant.now());
        deviceToken.setActive(true);
        deviceTokenRepository.save(deviceToken);

        return new JwtAuthResponse(token, employee);
    }

    @Transactional
    public void logout(String token) {
        DeviceToken deviceToken = deviceTokenRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invalid token"));
        deviceToken.setActive(false);
        deviceToken.setLogoutReason("User initiated logout");
        deviceTokenRepository.save(deviceToken);
        SecurityContextHolder.clearContext();
    }

    private String getDeviceInfo() {
        String userAgent = request.getHeader("User-Agent");
        String ipAddress = request.getRemoteAddr();
        return String.format("%s - %s", userAgent, ipAddress);
    }
}
