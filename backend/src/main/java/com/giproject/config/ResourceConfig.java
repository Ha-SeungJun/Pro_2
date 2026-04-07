// src/main/java/com/giproject/config/ResourceConfig.java
package com.giproject.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
@Configuration
public class ResourceConfig implements WebMvcConfigurer {

	@Value("${upload.path:../uploads}")
	private String uploadPath;

	private Path resolveUploadRoot() {
	    Path root = Paths.get(uploadPath).toAbsolutePath().normalize();
	    if (!Files.isDirectory(root)) {
	        try { Files.createDirectories(root); } catch (IOException e) {}
	    }
	    return root;
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
