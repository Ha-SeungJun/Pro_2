package com.giproject.repository.qna;

import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.giproject.entity.qaboard.QAPost; // 너희 엔티티 패키지에 맞춰 수정
import org.springframework.data.domain.Pageable; 
import java.util.List;

public interface QnaRepository extends JpaRepository<QAPost, Long> {
	   @Query(value = """
		        SELECT
		          q.post_id    AS postId,
		          q.title      AS title,
		          q.created_at AS createdAt,
		          CASE WHEN EXISTS (
		            SELECT 1 FROM admin_response r WHERE r.post_id = q.post_id
		          ) THEN 1 ELSE 0 END AS answered
		        FROM qa_post q
		        WHERE q.author_id = :userId
		        ORDER BY q.created_at DESC
		        """,
		        countQuery = """
		        SELECT COUNT(*)
		        FROM qa_post q
		        WHERE q.author_id = :userId
		        """,
		        nativeQuery = true)
		    Page<MyInquiryRow> findMyInquiriesByAuthorIdStr(@Param("userId") String userId, Pageable pageable);

		    // author_id 가 INT인 경우
		    @Query(value = """
		        SELECT
		          q.post_id    AS postId,
		          q.title      AS title,
		          q.created_at AS createdAt,
		          CASE WHEN EXISTS (
		            SELECT 1 FROM admin_response r WHERE r.post_id = q.post_id
		          ) THEN 1 ELSE 0 END AS answered
		        FROM qa_post q
		        WHERE q.author_id = :userId
		        ORDER BY q.created_at DESC
		        """,
		        countQuery = """
		        SELECT COUNT(*)
		        FROM qa_post q
		        WHERE q.author_id = :userId
		        """,
		        nativeQuery = true)
		    Page<MyInquiryRow> findMyInquiriesByAuthorIdNum(@Param("userId") Long userId, Pageable pageable);
}
