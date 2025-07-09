package com.example.auth.repository;

import com.example.auth.model.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {
    Optional<DeviceToken> findByToken(String token);
    
    List<DeviceToken> findByEmployeeIdAndActive(Long employeeId, boolean active);
    
    boolean existsByEmployeeIdAndActive(Long employeeId, boolean active);
}