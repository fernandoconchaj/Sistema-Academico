package com.sistema.academico.service;

import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class FechaService {
    public LocalDate parseDate(String value, LocalDate defaultDate) {
        try { return value == null || value.isBlank() ? defaultDate : LocalDate.parse(value); }
        catch (Exception e) { return defaultDate; }
    }
}
