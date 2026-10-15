package com.ezeiatech.inventory.util;

import org.springframework.web.util.HtmlUtils;

public final class InputSanitizer {
    private InputSanitizer() {}

    public static String clean(String value) {
        if (value == null) return null;
        String noControlChars = value.replaceAll("\\p{Cntrl}", "").trim();
        return HtmlUtils.htmlEscape(noControlChars);
    }
}