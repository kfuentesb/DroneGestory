package com.dronetools.dronegestory.config;

import com.dronetools.dronegestory.config.binding.FlexibleBigDecimalEditor;
import com.dronetools.dronegestory.config.binding.FlexibleBooleanEditor;
import com.dronetools.dronegestory.config.binding.FlexibleIntegerEditor;
import com.dronetools.dronegestory.config.binding.FlexibleLocalDateEditor;
import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;

import java.math.BigDecimal;
import java.time.LocalDate;

@ControllerAdvice
public class WebBindingConfig {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(true));
        binder.registerCustomEditor(BigDecimal.class, new FlexibleBigDecimalEditor());
        binder.registerCustomEditor(Integer.class, new FlexibleIntegerEditor());
        binder.registerCustomEditor(Boolean.class, new FlexibleBooleanEditor());
        binder.registerCustomEditor(LocalDate.class, new FlexibleLocalDateEditor());
    }
}
