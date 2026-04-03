package com.giproject.utils;

import java.io.UnsupportedEncodingException;
import java.time.ZonedDateTime;
import java.util.Date;
import java.util.Map;

import javax.crypto.SecretKey;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.InvalidClaimException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.WeakKeyException;

/*
 * JWT 생성 클래스
 * 암호화를 적용해서 내용을 처리한다.
 * 암호화 하는 방법은 몇 종류가 되는데, SHAKey 암호화 알고리즘을 적용해서 진행할 예정
 * 이때 중요한게 생성키. 반드시 30자 이상의 고유키가 필요함. 작으면 에러 가능성이 큼
 *
 * JWT 를 생성했었을 때의 유의사항
 * 1. 시간의 제한이 짧다. 이유는 만약 탈취되더라도 짧은 유효기간으로 재사용 하지 못하도록 하는 의미
 * 2. 시간이 짧다보니 지속적으로 서버와 통신시에 문제(expired) 발생
 * 3. 이를 극복하기 위해 refresh token 이라는 개념을 많이 사용함
 *
 * 이 개념은 특정 경로(refresh)를 통해서 Access Token 과 Refresh Token 을 검증하고
 * Access Token 은 만료, Refresh Token 은 만료되지 않았다면
 * 새로운 Access Token 을 재발행해서 되돌려주는 로직
 *
 * 토큰 생성의 조건은 아래와 같음
 *
 * 1. AC Token 이 없거나 잘못된 경우 -> 예외 메시지 보냄
 * 2. AC Token 의 유효기간이 남은 경우 -> 전달된 토큰 재사용(리턴)
 * 3. AC Token 만료, RE Token 은 유효한 경우 -> 새로운 AC Token 발행 및 리턴
 * 4.RE Token 의 유효기간이 특정 조건보다 낮은 경우, 즉 얼마 남지 않은 경우 -> 새로운 RE Token 발생 및 전송
 * 5. RE Token 의 유효기간이 충분한 경우 -> 기존 RE Token 재활용
 *
 */

public class JWTUtil {

    private static String Key = "123456789012345678901234567890817682825";

    // 클라이언트에 넘길 내용을 암호화 하여 생성함
    // 유효기간도 설정
    public static String generateToken(Map<String, Object> valueMap, int min)
    {
        SecretKey key = null;

        try
        {
            key = Keys.hmacShaKeyFor(JWTUtil.Key.getBytes("UTF-8"));
        }
        catch (Exception e)
        {
            throw new RuntimeException(e.getMessage());
        }

        String jwtStr = Jwts.builder()
                .setHeader(Map.of("typ", "JWT"))
                .setClaims(valueMap)
                .setIssuedAt(Date.from(ZonedDateTime.now().toInstant()))
                .setExpiration(Date.from(ZonedDateTime.now().plusMinutes(min).toInstant()))
                .signWith(key)
                .compact();

        return jwtStr;
    }

    // 토큰 검증 메서드 정의
    // 토큰을 검증해서 실패시 처리 할 내용 정의
    public static Map<String, Object> validateToken(String token)
    {
        Map<String, Object> claim = null;

        try
        {
            SecretKey key = Keys.hmacShaKeyFor(JWTUtil.Key.getBytes("UTF-8"));

            claim = Jwts.parser()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        }
        catch (MalformedJwtException e)
        {
            throw new CustomJWTException("Malformed");
        }
        catch (WeakKeyException e)
        {
            throw new CustomJWTException("WeakKey");
        }
        catch (UnsupportedEncodingException e)
        {
            throw new CustomJWTException("UnsupportedEncoding");
        }
        catch (ExpiredJwtException expiredJwtException)
        {
            throw new CustomJWTException("Expired");
        }
        catch (InvalidClaimException claimException)
        {
            throw new CustomJWTException("InvalidClaim");
        }
        catch (JwtException e)
        {
            throw new CustomJWTException("Jwt");
        }
        catch (Exception e)
        {
            throw new CustomJWTException("Error");
        }

        return claim;
    }

}