package com.notification.repository;

import com.notification.entity.OtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Repository
public interface OTPRepository extends JpaRepository<OtpEntity, String> {
    
    @Query("SELECT o.otp FROM OtpEntity o WHERE o.email = ?1")
    String getOtp(String email);
    
    @Modifying
    @Transactional
    @Query("DELETE FROM OtpEntity o WHERE o.email = ?1")
    void deleteByEmail(String email);
    
    default void save(String email, String otp, LocalDateTime expiryTime) {
        OtpEntity entity = new OtpEntity();
        entity.setEmail(email);
        entity.setOtp(otp);
        entity.setExpiryTime(expiryTime);
        save(entity);
    }
}
