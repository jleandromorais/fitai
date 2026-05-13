package com.fitai.fitai_backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

// Componente Spring responsável por gerar, validar e extrair informações de tokens JWT
@Component
public class JwtUtil {

    // Chave criptográfica derivada do segredo configurado no application.properties
    private final SecretKey key;

    // Tempo de expiração do token em milissegundos (ex: 86400000 = 24h)
    private final long expiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,         // Segredo injetado do application.properties
            @Value("${jwt.expiration}") long expiration) { // Expiração injetada do application.properties
        // ATENÇÃO: secret.getBytes() usa o charset padrão da JVM.
        // Prefira secret.getBytes(StandardCharsets.UTF_8) para garantir consistência entre ambientes.
        // A chave deve ter no mínimo 32 caracteres para HMAC-SHA256.
        this.key = Keys.hmacShaKeyFor(secret.getBytes());
        this.expiration = expiration;
    }

    // Gera um token JWT assinado com o e-mail do usuário como subject
    // NOTA: o payload do JWT é apenas Base64, não criptografado — evite colocar dados sensíveis
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)                                               // Identifica o dono do token
                .issuedAt(new Date())                                         // Momento de emissão
                .expiration(new Date(System.currentTimeMillis() + expiration)) // Momento de expiração
                .signWith(key)                                                // Assina com HMAC-SHA256
                .compact();
    }

    // Extrai o e-mail (subject) de um token JWT válido
    // ATENÇÃO: lança JwtException se o token for inválido ou expirado — chame isValid() antes se necessário
    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(key)         // Configura a chave para verificar a assinatura
                .build()
                .parseSignedClaims(token) // Valida assinatura e expiração, lança exceção se inválido
                .getPayload()
                .getSubject();           // Retorna o subject (e-mail)
    }

    // Verifica se o token é válido (assinatura correta e não expirado)
    // Captura JwtException, que cobre: expiração, assinatura inválida, token malformado, etc.
    public boolean isValid(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException e) {
            // Token inválido por qualquer motivo — não relança para não vazar detalhes internos
            return false;
        }
    }
}
