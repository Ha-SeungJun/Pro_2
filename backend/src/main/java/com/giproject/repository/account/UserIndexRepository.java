// com.giproject.repository.account.UserIndexRepository
package com.giproject.repository.account;

import com.giproject.entity.account.UserIndex;
import com.giproject.entity.account.UserIndex.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserIndexRepository extends JpaRepository<UserIndex, String> {

    // 기본 키 조회
    Optional<UserIndex> findByLoginId(String loginId);
    boolean existsByLoginId(String loginId);
    
    boolean existsByEmail(String email);
    boolean existsByEmailIgnoreCase(String email);

    // 역할로 조회
    List<UserIndex> findByRole(Role role);

    // 역할 + 키워드
    @Query("""
        SELECT ui FROM UserIndex ui
        WHERE ui.role = :role
          AND (LOWER(ui.loginId) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(ui.email)   LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    List<UserIndex> findByRoleAndKeyword(@Param("role") Role role, @Param("keyword") String keyword);

    // 여러 역할 + 키워드
    @Query("""
        SELECT ui FROM UserIndex ui
        WHERE ui.role IN :roles
          AND (LOWER(ui.loginId) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(ui.email)   LIKE LOWER(CONCAT('%', :keyword, '%')))
    """)
    List<UserIndex> findByRolesAndKeyword(@Param("roles") List<Role> roles, @Param("keyword") String keyword);

    // 여러 역할
    @Query("SELECT ui FROM UserIndex ui WHERE ui.role IN :roles")
    List<UserIndex> findByRoles(@Param("roles") List<Role> roles);
}
