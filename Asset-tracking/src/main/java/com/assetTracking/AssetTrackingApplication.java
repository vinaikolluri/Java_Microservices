package com.assetTracking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AssetTrackingApplication {

	public static void main(String[] args) {
		SpringApplication.run(AssetTrackingApplication.class, args);
	}

}
