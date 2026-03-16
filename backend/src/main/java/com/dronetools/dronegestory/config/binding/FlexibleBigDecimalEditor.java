package com.dronetools.dronegestory.config.binding;

import java.beans.PropertyEditorSupport;
import java.math.BigDecimal;

public class FlexibleBigDecimalEditor extends PropertyEditorSupport {
    @Override
    public void setAsText(String text) throws IllegalArgumentException {
        if (text == null) {
            setValue(null);
            return;
        }

        String trimmed = text.trim();
        if (trimmed.isEmpty() || "null".equalsIgnoreCase(trimmed)) {
            setValue(null);
            return;
        }

        String normalized = trimmed.replace(",", ".");
        setValue(new BigDecimal(normalized));
    }
}
