package com.giproject.controller.fees;

import com.giproject.dto.fees.FeesBasicDTO;
import com.giproject.dto.fees.FeesExtraDTO;
import com.giproject.entity.fees.FeesBasic;
import com.giproject.entity.fees.FeesExtra;
import com.giproject.repository.fees.FeesBasicRepository;
import com.giproject.repository.fees.FeesExtraRepository;
import com.giproject.service.fees.FeesBasicService;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/g2i4/admin/fees")
@Slf4j
public class FeesAdminController {

    private final FeesBasicRepository feesBasicRepository;
    private final FeesExtraRepository feesExtraRepository;
    private final FeesBasicService basicService;

    // 🚨 [진실의 단일화] 하드코딩 리스트를 비워 DB(DataLoader) 데이터만 출력되게 함
    private static final List<String> BASIC_ROWS_DEFAULT = List.of(); 
    private static final List<String> EXTRA_ROWS_DEFAULT = List.of(); 
    
    private static final List<String> BASIC_COLS = List.of("거리별 요금", "기본 요금");
    private static final List<String> EXTRA_COLS = List.of("추가요금");

    // ===== 유틸 메서드 =====
    private static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    private static List<List<String>> blankGrid(int r, int c) {
        List<List<String>> g = new ArrayList<>();
        for (int i = 0; i < r; i++)
            g.add(new ArrayList<>(Collections.nCopies(c, "")));
        return g;
    }

    private static List<String> mergedDistinct(List<String> defaults, List<String> fromDb) {
        LinkedHashSet<String> s = new LinkedHashSet<>();
        defaults.forEach(v -> s.add(trim(v)));
        fromDb.forEach(v -> {
            String t = trim(v);
            if (!t.isEmpty()) s.add(t);
        });
        return new ArrayList<>(s);
    }

    private static String firstNonEmpty(String... vals) {
        for (String v : vals) {
            if (v != null && !v.trim().isEmpty()) return v.trim();
        }
        return "";
    }

    // ===== 행 목록 조회 =====
    @GetMapping("/basic/rows")
    public List<String> getBasicRows() {
        return mergedDistinct(BASIC_ROWS_DEFAULT, feesBasicRepository.findDistinctWeights());
    }

    @GetMapping("/extra/rows")
    public List<String> getExtraRows() {
        return mergedDistinct(EXTRA_ROWS_DEFAULT, feesExtraRepository.findDistinctTitles());
    }

    // ===== 통합 데이터 조회 (Grid 생성) =====
    @GetMapping("/basic/full")
    public Map<String, Object> basicFull() {
        List<String> rows = getBasicRows();
        List<List<String>> grid = blankGrid(rows.size(), BASIC_COLS.size());
        Map<String, FeesBasic> map = new HashMap<>();
        for (FeesBasic fb : feesBasicRepository.findAll()) {
            map.put(trim(fb.getWeight()), fb);
        }
        for (int r = 0; r < rows.size(); r++) {
            String w = trim(rows.get(r));
            FeesBasic fb = map.get(w);
            String perKm = fb != null && fb.getRatePerKm() != null
                    ? fb.getRatePerKm().stripTrailingZeros().toPlainString()
                    : "";
            String base = fb != null && fb.getInitialCharge() != null
                    ? fb.getInitialCharge().stripTrailingZeros().toPlainString()
                    : "";
            grid.get(r).set(0, perKm);
            grid.get(r).set(1, base);
        }
        return Map.of("rows", rows, "columns", BASIC_COLS, "grid", grid);
    }

    @GetMapping("/extra/full")
    public Map<String, Object> extraFull() {
        List<String> rows = getExtraRows();
        List<List<String>> grid = blankGrid(rows.size(), EXTRA_COLS.size());
        Map<String, FeesExtra> map = new HashMap<>();
        for (FeesExtra fe : feesExtraRepository.findAll()) {
            map.put(trim(fe.getExtraChargeTitle()), fe);
        }
        for (int r = 0; r < rows.size(); r++) {
            String t = trim(rows.get(r));
            FeesExtra fe = map.get(t);
            String price = fe != null && fe.getExtraCharge() != null
                    ? fe.getExtraCharge().stripTrailingZeros().toPlainString()
                    : "";
            grid.get(r).set(0, price);
        }
        return Map.of("rows", rows, "columns", EXTRA_COLS, "grid", grid);
    }

    // ===== 데이터 저장 및 행 관리 =====
    @PostMapping("/basic")
    @Transactional
    public ResponseEntity<Void> upsertBasic(@RequestBody FeesBasicDTO dto) {
        String weight = trim(dto.getWeight());
        if (weight.isEmpty() || dto.getRatePerKm() == null || dto.getInitialCharge() == null) {
            return ResponseEntity.badRequest().build();
        }
        FeesBasic row = feesBasicRepository.findByWeight(weight)
                .orElseGet(() -> FeesBasic.builder().weight(weight).cargoName(dto.getCargoName() != null ? dto.getCargoName() : "미지정").build());
        row.setRatePerKm(dto.getRatePerKm());
        row.setInitialCharge(dto.getInitialCharge());
        row.setUpdatedAt(LocalDateTime.now());
        feesBasicRepository.save(row);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/extra")
    @Transactional
    public ResponseEntity<Void> upsertExtra(@RequestBody FeesExtraDTO dto) {
        String title = trim(dto.getExtraChargeTitle());
        if (title.isEmpty() || dto.getExtraCharge() == null) return ResponseEntity.badRequest().build();
        FeesExtra row = feesExtraRepository.findByExtraChargeTitle(title).orElse(new FeesExtra());
        row.setExtraChargeTitle(title);
        row.setExtraCharge(dto.getExtraCharge());
        row.setUpdatedAt(LocalDateTime.now());
        feesExtraRepository.save(row);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/basic/rows")
@Transactional
public ResponseEntity<Void> addBasicRow(@RequestBody RowRequest req) {
    String weight = trim(req.getName());
    if (weight.isEmpty()) return ResponseEntity.badRequest().build();
    if (feesBasicRepository.findByWeight(weight).isEmpty()) {
        FeesBasic row = FeesBasic.builder()
                .weight(weight)
                .cargoName(req.getCargoName() != null ? req.getCargoName() : "미지정")
                .ratePerKm(BigDecimal.ZERO)
                .initialCharge(BigDecimal.ZERO)
                .updatedAt(LocalDateTime.now())
                .build();
        feesBasicRepository.save(row);
    }
    return ResponseEntity.ok().build();
}

@PostMapping("/extra/rows")
@Transactional
public ResponseEntity<Void> addExtraRow(@RequestBody RowRequest req) {
    String title = trim(req.getName());
    if (title.isEmpty()) return ResponseEntity.badRequest().build();
    if (feesExtraRepository.findByExtraChargeTitle(title).isEmpty()) {
        FeesExtra row = new FeesExtra();
        row.setExtraChargeTitle(title);
        row.setExtraCharge(BigDecimal.ZERO);
        row.setUpdatedAt(LocalDateTime.now());
        feesExtraRepository.save(row);
    }
    return ResponseEntity.ok().build();
}
    
    @DeleteMapping("/basic/rows")
    @Transactional
    public ResponseEntity<Void> deleteBasicRowParam(@RequestParam Map<String, String> params) {
        String key = trim(firstNonEmpty(params.get("weight"), params.get("name")));
        if (!key.isEmpty()) feesBasicRepository.deleteByWeight(key);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/extra/rows")
    @Transactional
    public ResponseEntity<Void> deleteExtraRowParam(@RequestParam Map<String, String> params) {
        String key = trim(firstNonEmpty(params.get("title"), params.get("name")));
        if (!key.isEmpty()) feesExtraRepository.deleteByExtraChargeTitle(key);
        return ResponseEntity.ok().build();
    }

    @Getter @Setter
    public static class RowRequest { private String name; private String cargoName; }

    @PutMapping("/imageupload/{tno}")
    public ResponseEntity<Map<String,String>> imageupload(@PathVariable("tno") Long tno, @RequestPart("image") MultipartFile file){
        return ResponseEntity.ok(basicService.uploadImg(tno, file));
    }
}
