package com.dronetools.dronegestory.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.core.convert.converter.ConverterFactory;

public class StringToEnumConverterFactory implements ConverterFactory<String, Enum> {

    @Override
    public <T extends Enum> Converter<String, T> getConverter(Class<T> targetType) {
        return new StringToEnumConverter<>(targetType);
    }

    private static class StringToEnumConverter<T extends Enum> implements Converter<String, T> {
        private final Class<T> enumType;

        private StringToEnumConverter(Class<T> enumType) {
            this.enumType = enumType;
        }

        @Override
        public T convert(String source) {
            if (source == null) {
                return null;
            }

            String trimmed = source.trim();
            if (trimmed.isEmpty() || "null".equalsIgnoreCase(trimmed)) {
                return null;
            }

            try {
                return (T) Enum.valueOf(enumType, trimmed);
            } catch (IllegalArgumentException ex) {
                String normalized = normalize(trimmed);
                for (T constant : enumType.getEnumConstants()) {
                    String constantName = normalize(constant.name());
                    if (constantName.equalsIgnoreCase(normalized)) {
                        return constant;
                    }
                }
                throw ex;
            }
        }

        private String normalize(String value) {
            String normalized = java.text.Normalizer.normalize(value, java.text.Normalizer.Form.NFD)
                    .replaceAll("\\p{M}", "");
            normalized = normalized.trim().replace(' ', '_').replace('-', '_');
            return normalized;
        }
    }
}
