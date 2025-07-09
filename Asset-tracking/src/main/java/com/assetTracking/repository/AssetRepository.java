package com.assetTracking.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.assetTracking.model.Asset;

import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByEmployeeId(Long employeeId);
}