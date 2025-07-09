package com.example.auth.response;

import lombok.Data;

@Data
public class NotificationResponse {
    private int id;
    private String employeeId;
    private String email;
    private String password;
}
