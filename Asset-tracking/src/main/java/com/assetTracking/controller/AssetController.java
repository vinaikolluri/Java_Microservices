package com.assetTracking.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.assetTracking.model.Asset;
import com.assetTracking.service.AssetService;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    private final AssetService assetService;

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @PostMapping("/{employeeId}")
    public ResponseEntity<Asset> assignAsset(@RequestBody Asset asset, @PathVariable Long employeeId) {
        Asset savedAsset = assetService.assignAssetToEmployee(asset, employeeId);
        return new ResponseEntity<>(savedAsset, HttpStatus.CREATED);
    }

    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<Asset>> getAssetsByEmployee(@PathVariable Long employeeId) {
        List<Asset> assets = assetService.getAssetsByEmployeeId(employeeId);
        return ResponseEntity.ok(assets);
    }

    @GetMapping("/getAllAssets")
    public ResponseEntity<List<Asset>> getAllAssets() {
        List<Asset> assets = assetService.getAllAssets();
        return ResponseEntity.ok(assets);
    }
}