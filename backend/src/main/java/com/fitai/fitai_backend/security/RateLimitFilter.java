package com.fitai.fitai_backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiter simples por IP para endpoints de autenticação.
 * Janela deslizante: MAX_REQUESTS tentativas por WINDOW_SECONDS segundos.
 * Entradas expiradas são limpas a cada CLEANUP_INTERVAL_SECONDS para evitar crescimento ilimitado.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int MAX_REQUESTS = 10;
    private static final long WINDOW_SECONDS = 60;
    private static final long CLEANUP_INTERVAL_SECONDS = 300;

    private record Bucket(int count, long windowStart) {}

    private final ConcurrentHashMap<String, Bucket> buckets = new ConcurrentHashMap<>();
    private volatile long lastCleanup = Instant.now().getEpochSecond();

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String ip = resolveClientIp(request);
        long now = Instant.now().getEpochSecond();

        periodicCleanup(now);

        Bucket bucket = buckets.compute(ip, (key, existing) -> {
            if (existing == null || now - existing.windowStart() >= WINDOW_SECONDS) {
                return new Bucket(1, now);
            }
            return new Bucket(existing.count() + 1, existing.windowStart());
        });

        if (bucket.count() > MAX_REQUESTS) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Muitas tentativas. Aguarde 1 minuto.\"}");
            return;
        }

        chain.doFilter(request, response);
    }

    private String resolveClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private void periodicCleanup(long now) {
        if (now - lastCleanup >= CLEANUP_INTERVAL_SECONDS) {
            lastCleanup = now;
            buckets.entrySet().removeIf(e -> now - e.getValue().windowStart() >= WINDOW_SECONDS);
        }
    }
}
