package com.example.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;


@Data
public class ForgotPasswordDTO {
	@Email(message = "Invalid email format")
	private String email;

	@NotBlank(message = "Password is required")
	@Size(min = 8, message = "Password must be between 8 and 20 characters long")
	@Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?!.*\\s).*$", message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
	private String newPassword;

	@NotBlank(message = "Confirm password is required")
	private String confirmPassword;

	@NotNull
	private String otp;

	public boolean isPasswordMatching() {
		return newPassword != null && newPassword.equals(confirmPassword);
	}
}