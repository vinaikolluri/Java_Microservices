package com.assetTracking.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class AssetRequestDTO {
	@NotBlank
	private String serialNo;
	@NotBlank
	private String brand;
	@NotBlank
	private String ram;
	@NotBlank
	private String rom;
	@NotBlank
	private String processor;
	@NotNull
	private LocalDate dateOfIssue;
	@NotNull
	private Long employeeId;
	@NotNull
	private List<String> accessories = new ArrayList<>();
}