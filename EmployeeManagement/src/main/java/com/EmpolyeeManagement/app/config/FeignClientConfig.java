package com.EmpolyeeManagement.app.config;

import org.springframework.cloud.openfeign.EnableFeignClients;
import feign.Logger;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableFeignClients(basePackages = "com.EmpolyeeManagement.app")
public class FeignClientConfig {
    @Bean
    Logger.Level feignLoggerLevel() {
        return Logger.Level.FULL;
    }
    
}