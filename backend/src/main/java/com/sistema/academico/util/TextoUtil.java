package com.sistema.academico.util;

import org.apache.commons.lang3.StringUtils;

public class TextoUtil {
    private TextoUtil() {}

    public static String requerido(String valor, String campo) {
        if (StringUtils.isBlank(valor)) {
            throw new RuntimeException("El campo " + campo + " es obligatorio");
        }
        return StringUtils.trim(valor);
    }

    public static String opcional(String valor) {
        return StringUtils.trimToEmpty(valor);
    }
}
