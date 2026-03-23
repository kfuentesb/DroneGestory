package com.dronetools.dronegestory.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.core.convert.converter.Converter;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Lee la URL desde application.properties o variable de entorno APP_FRONTEND_URL
    // Si no existe, usa localhost:5173 por defecto (desarrollo)
    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Aplicar a todos los controladores
                .allowedOrigins(frontendUrl) // Solo permite tu frontend (seguridad)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToBooleanConverter());
        registry.addConverterFactory(new StringToEnumConverterFactory());
    }

    public static class StringToBooleanConverter implements Converter<String, Boolean> {
        @Override
        public Boolean convert(String source) {
            if (source == null || source.isBlank()) return null;
            String value = java.text.Normalizer.normalize(source.trim().toLowerCase(), java.text.Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "");
            if (value.equals("null")) return null;
            if (value.equals("si") || value.equals("true") || value.equals("1")) {
                return true;
            }
            if (value.equals("no") || value.equals("false") || value.equals("0")) {
                return false;
            }
            return null;
        }
    }
}