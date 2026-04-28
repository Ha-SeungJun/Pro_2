package com.giproject.config;

import java.util.concurrent.TimeUnit;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/g2i4/uploads/**")
                .addResourceLocations("classpath:/static/uploads/")
                .addResourceLocations("file:../uploads/")
                .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS));

        registry.addResourceHandler("/review/**")
                .addResourceLocations("file:///C:/upload/review/")
                .setCacheControl(CacheControl.maxAge(30, TimeUnit.DAYS));
    }
    
}
