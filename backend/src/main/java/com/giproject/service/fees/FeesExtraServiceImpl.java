package com.giproject.service.fees;

import com.giproject.dto.fees.FeesExtraDTO;
import com.giproject.entity.fees.FeesExtra;
import com.giproject.repository.fees.FeesExtraRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Log4j2
@Transactional
public class FeesExtraServiceImpl implements FeesExtraService {

	private final FeesExtraRepository extraRepository;

    private static String trim(String s) { return s == null ? "" : s.trim(); }

    @Override
    @Transactional(readOnly = true)
    public List<String> getRowNames() {
        return extraRepository.findDistinctTitles().stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .sorted()
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<List<String>> getGrid() {
        List<String> rows = getRowNames();
        Map<String, FeesExtra> byTitle = extraRepository.findAll().stream()
                .filter(e -> e.getExtraChargeTitle() != null)
                .collect(Collectors.toMap(e -> e.getExtraChargeTitle().trim(), e -> e, (a, b) -> a));

        List<List<String>> grid = new ArrayList<>();
        for (String t : rows) {
            FeesExtra fe = byTitle.get(t);
            String price = (fe != null && fe.getExtraCharge() != null) ? fe.getExtraCharge().stripTrailingZeros().toPlainString() : "";
            grid.add(new ArrayList<>(List.of(price)));
        }
        return grid;
    }

    @Override
    public FeesExtraDTO saveCell(String title, BigDecimal price) {
        String t = trim(title);
        if (t.isEmpty()) throw new IllegalArgumentException("title is required");

        FeesExtra fe = extraRepository.findByExtraChargeTitle(t)
                .orElseGet(() -> FeesExtra.builder()
                        .extraChargeTitle(t)
                        .extraCharge(BigDecimal.ZERO)
                        .build());

        fe.setExtraCharge(price == null ? BigDecimal.ZERO : price);
        fe.setUpdatedAt(LocalDateTime.now());
        return entityToDTO(extraRepository.save(fe));
    }

    @Override
    public void addRow(String title) {
        String t = trim(title);
        if (t.isEmpty()) return;
        extraRepository.findByExtraChargeTitle(t).orElseGet(() ->
        extraRepository.save(FeesExtra.builder()
                        .extraChargeTitle(t)
                        .extraCharge(BigDecimal.ZERO)
                        .updatedAt(LocalDateTime.now())
                        .build())
        );
    }

    @Override
    public void deleteRow(String title) {
        String t = trim(title);
        if (t.isEmpty()) return;
        extraRepository.deleteByExtraChargeTitle(t);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeesExtraDTO> findAllAsDto() {
        return extraRepository.findAll().stream()
                .map(this::entityToDTO)
                .collect(Collectors.toList());
    }
}