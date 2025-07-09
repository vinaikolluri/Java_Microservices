package com.example.auth.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TemporaryAccessRequestDto {
    private Long employeeId;
    private LocalDateTime endTime;
    private String reason;
}