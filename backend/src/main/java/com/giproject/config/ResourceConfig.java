// src/main/java/com/giproject/config/ResourceConfig.java
package com.giproject.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
@Configuration
public class ResourceConfig implements WebMvcConfigurer {

    private Path resolveUploadRoot() {
        Path rootA = Paths.get("../uploads").toAbsolutePath().normalize();
        Path rootB = Paths.get("uploads").toAbsolutePath().normalize();
        if (Files.isDirectory(rootA)) return rootA;
        if (Files.isDirectory(rootB)) return rootB;
        // 없으면 rootB를 우선 생성 시도
        try {
            Files.createDirectories(rootB);
            return rootB;
        } catch (IOException e) {
            return rootA; // 최후의 fallback
        }
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path chosen = resolveUploadRoot();

        String rootUri    = chosen.toUri().toString();
        String profileUri = chosen.resolve("user_profile").toUri().toString();
        String cargoUri   = chosen.resolve("cargo").toUri().toString();

        System.out.println(">>> STATIC ROOT        = " + rootUri);
        System.out.println(">>> STATIC user_profile= " + profileUri);
        System.out.println(">>> STATIC cargo       = " + cargoUri);

        registry.addResourceHandler("/g2i4/uploads/**")
                .addResourceLocations(rootUri);

        registry.addResourceHandler("/g2i4/uploads/user_profile/**")
                .addResourceLocations(profileUri);

        registry.addResourceHandler("/g2i4/uploads/cargo/**")
                .addResourceLocations(cargoUri);
    }
}
