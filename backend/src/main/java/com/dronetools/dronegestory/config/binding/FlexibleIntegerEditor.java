package com.dronetools.dronegestory.config.binding;

import java.beans.PropertyEditorSupport;

public class FlexibleIntegerEditor extends PropertyEditorSupport {
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

        setValue(Integer.valueOf(trimmed));
    }
}
