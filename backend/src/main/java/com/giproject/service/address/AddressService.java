package com.giproject.service.address;

import java.util.regex.Pattern;
import org.springframework.stereotype.Service;

@Service
public class AddressService {

    private static boolean isBlank(String v) {
        return v == null || v.trim().isEmpty();
    }

    /**
     * 접미사 제거 없이, 앞의 두 파트만 반환.
     * 예) "대구광역시 달서구 월성동" -> "대구광역시 달서구"
     *     "대구" -> "대구"
     *     "서울특별시 강남구 역삼동" -> "서울특별시 강남구"
     */
    public String simpleAddress(String fullAddress) {
        if (isBlank(fullAddress)) return "";
        String[] parts = fullAddress.trim().split("\\s+");
        if (parts.length >= 2) {
            return (parts[0] + " " + parts[1]).trim();
        }
        return fullAddress.trim();
    }

    public String[] parseRoute(String route) {
        if (isBlank(route)) return new String[]{"", ""};
        String raw = route.trim();
        String[] seps = {"→", "->", "-", "~", "—", "–", "⟶", "⟹", "➡️"};

        for (String sep : seps) {
            if (raw.contains(sep)) {
                String[] parts = raw.split(java.util.regex.Pattern.quote(sep), 2);
                String from = simpleAddress(parts[0].trim());
                String to = parts.length > 1 ? simpleAddress(parts[1].trim()) : "";
                return new String[]{from, to};
            }
        }
        return new String[]{simpleAddress(raw), ""};
    }

    public String formatRoute(String from, String to) {
        String a = from == null ? "" : from.trim();
        String b = to == null ? "" : to.trim();
        if (!a.isEmpty() && !b.isEmpty()) return a + " → " + b;
        return !a.isEmpty() ? a : b;
    }

    public String toShortAddress(String value) {
        if (isBlank(value)) return "";
        String raw = value.trim();
        if (raw.matches(".*[→\\-~—–⟶⟹➡️].*")) {
            String[] parts = parseRoute(raw);
            return formatRoute(parts[0], parts[1]);
        }
        return simpleAddress(raw);
    }
}