package com.giproject.controller.estimate;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.giproject.dto.estimate.EstimateDTO;
import com.giproject.dto.fees.FeesBasicDTO;
import com.giproject.dto.fees.FeesExtraDTO;
import com.giproject.dto.matching.MatchingDTO;
import com.giproject.dto.matching.PageRequestDTO;
import com.giproject.dto.matching.PageResponseDTO;
import com.giproject.entity.cargo.CargoOwner;
import com.giproject.repository.cargo.CargoOwnerRepository;
import com.giproject.security.JwtService;
import com.giproject.service.estimate.EstimateService;
import com.giproject.service.estimate.matching.MatchingService;
import com.giproject.service.mail.MailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

@RestController
@RequiredArgsConstructor
@Log4j2
@RequestMapping("/g2i4/estimate")
public class EstimateController {

	private final EstimateService estimateService;
	private final MatchingService matchingService;
	private final CargoOwnerRepository cargoOwnerRepository;
	private final JwtService jwtService;
	private final MailService mailService;
	@PostMapping("/")
	public Map<String, Long> register(@RequestBody EstimateDTO dto,  @RequestHeader("Authorization") String authHeader) {
		String token = authHeader.replace("Bearer ","");
		String memId = jwtService.getUsername(token);
		dto.setMemberId(memId);
		System.out.println(memId);
		Long eno = estimateService.sendEstimate(dto);
		log.info("Received DTO: {}", eno);
		return Map.of("RESULT", eno);

	}

	@GetMapping("/list")
	public PageResponseDTO<MatchingDTO> getEstimateList(PageRequestDTO dto,@RequestHeader("Authorization") String authHeader) {
		String token = authHeader.replace("Bearer ","");
		String cargoId = jwtService.getUsername(token);
		return matchingService.getList(dto,cargoId);
	}

	@PostMapping("/subpath/rejected")
	public ResponseEntity<Map<String, String>> reject(@RequestBody Map<String, Long> eno,@RequestHeader("Authorization") String authHeader) {
		String token = authHeader.replace("Bearer ","");
		String cargoId = jwtService.getUsername(token);
		Long estimateNo = eno.get("estimateNo");

		CargoOwner cargoOwner = cargoOwnerRepository.findById(cargoId).get();

		matchingService.rejectMatching(estimateNo, cargoOwner);

		return ResponseEntity.ok().body(Map.of("result", "reject"));
	}

	@PostMapping("/subpath/accepted")
	public ResponseEntity<Map<String, String>> accepted(@RequestBody Map<String, Long> eno,@RequestHeader("Authorization") String authHeader) {
		Long estimateNo = eno.get("estimateNo");
		String token = authHeader.replace("Bearer ","");
		String cargoId = jwtService.getUsername(token);
		CargoOwner cargoOwner = cargoOwnerRepository.findById(cargoId).get();
		System.out.println(cargoId+"--------------------------------------------------");
		Long mcno=matchingService.acceptMatching(estimateNo, cargoOwner);
		mailService.acceptedMail(mcno);
		return ResponseEntity.ok().body(Map.of("result", "accepted"));
	}

	@GetMapping("/subpath/savelist")
	public ResponseEntity<List<EstimateDTO>> getSaveEstimat() {
		// Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		// String memId = auth.getName(); 추후 아이디 토큰인증로 확인예정
		String user = "user";
		List<EstimateDTO> dtolist = estimateService.getSaveEstimate(user);

		return ResponseEntity.ok(dtolist);

	}

	@GetMapping("/subpath/export")
	public ResponseEntity<EstimateDTO> exportEs(@RequestParam("eno") Long eno) {
		// Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		// String memId = auth.getName(); 추후 아이디 토큰인증로 확인예정
		String user = "user";
		EstimateDTO dto = estimateService.exportEstimate(user, eno);
		return ResponseEntity.ok(dto);
	}

	@PostMapping("/subpath/savedreft")
	public ResponseEntity<Map<String, String>>  saveEstimate(@RequestBody EstimateDTO estimateDTO) {
		estimateDTO.setMemberId("user");
		try {
			Long eno = estimateService.saveDraft(estimateDTO);
			String streno = String.valueOf(eno);
			return ResponseEntity.ok(Map.of("succese",streno));
		} catch (IllegalStateException e) {
			// 임시저장 초과 등 사용자 오류
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		} catch (NoSuchElementException e) {
			// memberId가 잘못되었을 때
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "해당 사용자가 존재하지 않습니다."));
		} catch (Exception e) {
			// 기타 예외
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "서버 오류가 발생했습니다."));
		}

	}
	
	@PostMapping("/subpath/myestimate")
	public ResponseEntity<List<EstimateDTO>> getMyEs(@RequestBody Map<String, String> body,@RequestHeader("Authorization") String authHeader){
		String token = authHeader.replace("Bearer ","");
		String memId = jwtService.getUsername(token);
		List<EstimateDTO> dtoList = estimateService.myEstimateList(memId);
		
		return ResponseEntity.ok(dtoList);
	}
	@GetMapping("/subpath/my-all-list")
	public ResponseEntity<List<EstimateDTO>> getMyAllEstimateList(@RequestHeader("Authorization") String authHeader) {
		String token = authHeader.replace("Bearer ","");
		String memId = jwtService.getUsername(token);
		System.out.println(memId);
	    List<EstimateDTO> dtoList = estimateService.myEstimateList(memId);

	    return ResponseEntity.ok(dtoList);
	}
	@GetMapping("/subpath/unpaidlist")
	public ResponseEntity<List<EstimateDTO>> getMyUnpaidEstimateList(@RequestHeader("Authorization") String authHeader) {
		String token = authHeader.replace("Bearer ","");
		String memId = jwtService.getUsername(token);
	    List<EstimateDTO> dtoList = estimateService.findMyEstimatesWithoutPayment(memId);
	    return ResponseEntity.ok(dtoList);
	}
	
	@GetMapping("/subpath/paidlist")
	   public ResponseEntity<List<EstimateDTO>> getMyPaidList(@RequestHeader("Authorization") String authHeader) {
		String token = authHeader.replace("Bearer ","");
		String memId = jwtService.getUsername(token);
	       List<EstimateDTO> dtoList = estimateService.findMyPaidEstimates(memId);

	       return ResponseEntity.ok(estimateService.findMyPaidEstimates(memId));
	   }
	@PostMapping("/subpath/searchfeesbasic")
	public ResponseEntity<List<FeesBasicDTO>> getFeesBasic(){
		System.out.println(estimateService.searchFees());
		return ResponseEntity.ok(estimateService.searchFees());
	}
	
	@PostMapping("/subpath/searchfeesextra")
	public ResponseEntity<List<FeesExtraDTO>> getFeesExtra(){
		return ResponseEntity.ok(estimateService.searchExtra());
	}
	
}
