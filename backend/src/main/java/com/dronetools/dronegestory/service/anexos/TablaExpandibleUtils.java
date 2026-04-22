package com.dronetools.dronegestory.service.anexos;

import com.dronetools.dronegestory.model.anexos.ItemTablaExpandible;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public final class TablaExpandibleUtils {

    private static final int MAX_ITEMS = 8;

    private TablaExpandibleUtils() {
    }

    public static String normalizeMainValue(String value, Set<String> allowedValues, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return allowedValues.contains(value) ? value : defaultValue;
    }

    public static List<ItemTablaExpandible> normalizeItems(
            String mainValue,
            Set<String> enabledMainValues,
            List<ItemTablaExpandible> items,
            Set<String> allowedItemValues,
            String defaultItemValue
    ) {
        if (!enabledMainValues.contains(mainValue) || items == null || items.isEmpty()) {
            return new ArrayList<>();
        }

        List<ItemTablaExpandible> normalized = new ArrayList<>();
        int limit = Math.min(items.size(), MAX_ITEMS);

        for (int i = 0; i < limit; i++) {
            ItemTablaExpandible item = items.get(i);
            if (item == null) {
                continue;
            }

            String descripcion = item.getDescripcion() == null ? "" : item.getDescripcion().trim();
            if (descripcion.isEmpty()) {
                continue;
            }

            String valor = item.getValor();
            if (valor == null || valor.isBlank() || !allowedItemValues.contains(valor)) {
                valor = defaultItemValue;
            }

            normalized.add(new ItemTablaExpandible(descripcion, valor));
        }

        return normalized;
    }
}
