package com.giproject.service.member;

import com.giproject.dto.common.UserResponseDTO;
import com.giproject.dto.secure.MemberModifyDTO;
import com.giproject.dto.secure.MemberRole;
import com.giproject.dto.member.MemberDTO;
import com.giproject.entity.member.Member;
import com.giproject.repository.member.MemberRepository;

import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
@Log4j2
public class MemberServiceImpl implements MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final GoogleOAuthService googleOAuthService;
	
	private String makeTempPassword()
	{
		StringBuffer sb = new StringBuffer();
		for(int i = 0; i < 10; i++)
		{
			sb.append((char)((int)(Math.random() * 55) + 65));
		}
		return sb.toString();
	}
    
	private Member makeSocialMember(String email) {
	    String tempPass = makeTempPassword();
	    String nickName = email.split("@")[0]; // 이메일 앞부분을 닉네임 기본값

	    return Member.builder()
	            .memEmail(email) // 소셜 로그인은 이메일만 저장
	            .memPw(passwordEncoder.encode(tempPass))
	            .memName(nickName)
	            .memCreateIdDateTime(LocalDateTime.now())
	            .build();
	}

    @Override
    public UserResponseDTO getSessionUserInfo(HttpSession session) {
        Member member = (Member) session.getAttribute("member");

        return new UserResponseDTO(
            member.getMemId(),
            member.getMemName(),
            member.getMemEmail(),
            member.getMemPhone(),
            member.getMemAddress(),
            member.getMemCreateIdDateTime()
        );
    }

	@Override
	public MemberDTO getKakaoMember(String accessToken) {
		String email = getEmailFromKakaoAccessToken(accessToken);
		
		log.info("Email : " + email);
		
		Optional<Member> res = memberRepository.findById(email);
		
		if(!res.isEmpty())
		{
			// 기존 회원이 SNS 로 로그인
			MemberDTO dto = entityToDTO(res.get());
			
			return dto;
		}
		
		// 기존 회원이 아닌 경우 임의의 닉네임과 암호를 전송
		Member snsMember = makeSocialMember(email);
		memberRepository.save(snsMember);
		
		MemberDTO dto = entityToDTO(snsMember);
		
		return dto;
	}
	
	private String getEmailFromKakaoAccessToken(String accessToken)
	{
		String kakaoAccessURL = "https://kapi.kakao.com/v2/user/me";
		
		if(accessToken == null)
		{
			throw new RuntimeException("Access Token is NULL");
		}
		
		RestTemplate restTemplate = new RestTemplate();
		
		// 메서드를 이용해서 target rest 서버에 header 정보와 body 를 세팅
		HttpHeaders headers = new HttpHeaders();
		headers.add("Authorization", "Bearer " + accessToken);
		headers.add("Content-Type", "application/x-www-form-urlencoded");
		HttpEntity<String> entity = new HttpEntity<String>(headers);
		
		UriComponents uriComponents = UriComponentsBuilder.fromHttpUrl(kakaoAccessURL).build();
		
		ResponseEntity<LinkedHashMap> response = restTemplate
				.exchange(uriComponents.toString(), 
						HttpMethod.GET, 
						entity, 
						LinkedHashMap.class);
		
		log.info("------------------카카오 인증 서버의 결과 값 : " + response);
		
		LinkedHashMap<String, LinkedHashMap> bodyMap = response.getBody();
		
		log.info("사용자의 허용 정보 : " + bodyMap);
		
		LinkedHashMap<String, String> kakaoAccount = bodyMap.get("kakao_account");
		
		log.info("카카오 계정 정보 : " + kakaoAccount);
		
		return kakaoAccount.get("email");
	}

	@Override
	public MemberDTO getNaverMember(String accessToken) {
	    String naverUserInfoUrl = "https://openapi.naver.com/v1/nid/me";

	    if (accessToken == null) {
	        throw new RuntimeException("Access Token is NULL");
	    }

	    RestTemplate restTemplate = new RestTemplate();

	    HttpHeaders headers = new HttpHeaders();
	    headers.add("Authorization", "Bearer " + accessToken);
	    HttpEntity<String> entity = new HttpEntity<>(headers);

	    ResponseEntity<LinkedHashMap> response = restTemplate.exchange(
	        naverUserInfoUrl,
	        HttpMethod.GET,
	        entity,
	        LinkedHashMap.class);

	    log.info("------------------네이버 인증 서버의 결과 값 : " + response);

	    LinkedHashMap<String, Object> bodyMap = response.getBody();

	    if (bodyMap == null || !"success".equals(bodyMap.get("resultcode"))) {
	        throw new RuntimeException("네이버 사용자 정보 조회 실패");
	    }

	    LinkedHashMap<String, Object> responseMap = (LinkedHashMap<String, Object>) bodyMap.get("response");

	    String naverId = (String) responseMap.get("id");
	    String email = (String) responseMap.get("email");
	    String name = (String) responseMap.get("name");
	    String phone = (String) responseMap.get("mobile");

	    // 회원 존재 여부 확인 (Primary Key가 naverId라고 가정)
	    Optional<Member> existingMember = memberRepository.findById(naverId);

	    Member member;

	    if (existingMember.isPresent()) {
	        member = existingMember.get();
	    } else {
	        // 신규 회원 등록
	        member = Member.builder()
	            .memId(naverId)
	            .memEmail(email)
	            .memName(name)
	            .memPhone(phone)
	            .memPw(passwordEncoder.encode(makeTempPassword())) // 임시 비밀번호 생성
	            .memCreateIdDateTime(LocalDateTime.now())
	            .build();

	        memberRepository.save(member);
	    }

	    return entityToDTO(member);
	}

	@Override
    public MemberDTO getGoogleMember(String accessToken) {
        // 1) 구글 사용자 정보 조회
        Map<String, Object> profile = googleOAuthService.getUserProfile(accessToken);

        String email = (String) profile.get("email");
        String name = (String) profile.get("name");

        // 2) 이메일로 회원 조회 또는 신규 회원 생성
        Member member = memberRepository.findFirstByMemEmail(email)
            .orElseGet(() -> {
                Member newMember = Member.builder()
                    .memId(UUID.randomUUID().toString())
                    .memEmail(email)
                    .memName(name)
                    .social(true)  // 소셜 로그인 유저 표시용 필드
                    .build();
                return memberRepository.save(newMember);
            });

        // 3) DTO 변환 후 반환
        return new MemberDTO(
            member.getMemId(),
            null,
            member.getMemEmail(),
            member.getMemName(),
            member.getMemPhone(),
            member.getMemAddress(),
            member.getMemCreateIdDateTime(),
            member.getMemberRoleList()
        );
    }

	 @Override
	 public boolean isIdAvailable(String memId) {
		 if (memId == null || memId.isBlank()) return false;
		 return !memberRepository.existsById(memId.trim()); 
	}
}