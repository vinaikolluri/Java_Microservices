package com.notification.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "otps")
public class OtpEntity {
    @Id
    private String email;
    
    private String otp;
    
    private LocalDateTime expiryTime;
}