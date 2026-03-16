package com.dronetools.dronegestory.config.binding;

import java.beans.PropertyEditorSupport;
import java.text.Normalizer;

public class FlexibleBooleanEditor extends PropertyEditorSupport {
    @Override
    public void setAsText(String text) throws IllegalArgumentException {
        if (text == null) {
            setValue(null);
            return;
        }

        String trimmed = text.trim();
        if (trimmed.isEmpty()) {
            setValue(null);
            return;
        }

        String normalized = trimmed.toLowerCase();
        normalized = Normalizer.normalize(normalized, Normalizer.Form.NFD).replaceAll("\\p{M}", "");

        if ("true".equals(normalized) || "1".equals(normalized) || "si".equals(normalized) || "s".equals(normalized) || "yes".equals(normalized) || "y".equals(normalized)) {
            setValue(Boolean.TRUE);
            return;
        }

        if ("false".equals(normalized) || "0".equals(normalized) || "no".equals(normalized) || "n".equals(normalized)) {
            setValue(Boolean.FALSE);
            return;
        }

        throw new IllegalArgumentException("Invalid boolean value: " + text);
    }
}
