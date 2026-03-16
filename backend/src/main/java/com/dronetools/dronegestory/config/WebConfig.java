package com.dronetools.dronegestory.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.core.convert.converter.Converter;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new StringToBooleanConverter());
        registry.addConverterFactory(new StringToEnumConverterFactory());
    }

    public static class StringToBooleanConverter implements Converter<String, Boolean> {
        @Override
        public Boolean convert(String source) {
            if (source == null || source.isBlank()) return null;
            String value = source.trim().toLowerCase();
            if (value.equals("sí") || value.equals("si") || value.equals("true") || value.equals("1")) {
                return true;
            }
            if (value.equals("no") || value.equals("false") || value.equals("0")) {
                return false;
            }
            return null;
        }
    }
}
