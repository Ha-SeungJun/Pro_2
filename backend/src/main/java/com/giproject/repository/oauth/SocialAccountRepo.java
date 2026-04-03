// com.giproject.repository.oauth.SocialAccountRepo
package com.giproject.repository.oauth;

import com.giproject.entity.oauth.SocialAccount;
import com.giproject.entity.oauth.SocialAccount.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

public interface SocialAccountRepo extends JpaRepository<SocialAccount, Long> {

    /** 로그인ID 기준 존재 여부 (가장 빠른 체크) */
    boolean existsByUser_LoginId(String loginId);

    /** 어떤 공급자들이 연결되어 있는지 (필요 시 화면 표시) */
    @Query("select s.provider from SocialAccount s where s.user.loginId = :loginId")
    List<Provider> findProviders(@Param("loginId") String loginId);

    /** 최근(가장 마지막) 연결 하나 */
    Optional<SocialAccount> findFirstByUser_LoginIdOrderByIdDesc(String loginId);

    /** 특정 공급자 연결 여부 */
    boolean existsByUser_LoginIdAndProvider(String loginId, Provider provider);
    
    Optional<SocialAccount> findByProviderAndProviderUserId(Provider provider, String providerUserId);
    Optional<SocialAccount> findBySignupTicket(String signupTicket);
}
