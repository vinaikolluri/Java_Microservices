package com.example.auth.repository;

import com.example.auth.model.TemporaryAccess;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TemporaryAccessRepository extends JpaRepository<TemporaryAccess, Long> {
    @Query("SELECT t FROM TemporaryAccess t WHERE t.active = true AND t.endTime > :currentTime")
    List<TemporaryAccess> findAllActiveAccesses(LocalDateTime currentTime);

    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM TemporaryAccess t " +
           "WHERE t.employee.id = :employeeId AND t.active = true AND t.endTime > :currentTime")
    boolean hasActiveAccess(Long employeeId, LocalDateTime currentTime);
}