package com.assetTracking.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.assetTracking.exception.ResourceNotFoundException;
import com.assetTracking.model.Asset;
import com.assetTracking.model.Employee;
import com.assetTracking.repository.AssetRepository;
import com.assetTracking.repository.EmployeeRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;
    private final EmployeeRepository employeeRepository;

    public AssetService(AssetRepository assetRepository, EmployeeRepository employeeRepository) {
        this.assetRepository = assetRepository;
        this.employeeRepository = employeeRepository;
    }

    public Asset assignAssetToEmployee(Asset asset, Long employeeId) {
        Employee employee = employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));
        
        // Check if an asset already exists for the given employeeId
        List<Asset> existingAssets = assetRepository.findByEmployeeId(employeeId);
        if (!existingAssets.isEmpty()) {
            throw new IllegalStateException("An asset is already assigned to the employee with ID: " + employeeId);
        }

        asset.setEmployeeId(employee.getEmployeeId());
        asset.setDateOfIssue(LocalDate.now()); // Set the current date
        return assetRepository.save(asset);
    }

    public List<Asset> getAssetsByEmployeeId(Long employeeId) {
        employeeRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found with ID: " + employeeId));
        return assetRepository.findByEmployeeId(employeeId);
    }

    public List<Asset> getAllAssets() {
        return assetRepository.findAll();
    }
}