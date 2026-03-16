package com.dronetools.dronegestory.config.binding;

import java.beans.PropertyEditorSupport;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class FlexibleLocalDateEditor extends PropertyEditorSupport {
    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter SLASHED = DateTimeFormatter.ofPattern("dd/MM/yyyy");

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

        try {
            setValue(LocalDate.parse(trimmed, ISO));
        } catch (DateTimeParseException ex) {
            setValue(LocalDate.parse(trimmed, SLASHED));
        }
    }
}
