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
            if (trimmed.isEmpty()) {
                return null;
            }

            return (T) Enum.valueOf(enumType, trimmed);
        }
    }
}
