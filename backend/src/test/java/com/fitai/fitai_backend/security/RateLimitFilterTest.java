package com.fitai.fitai_backend.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class RateLimitFilterTest {

    private RateLimitFilter filter;
    private FilterChain     chain;

    @BeforeEach
    void setUp() {
        filter = new RateLimitFilter();
        chain  = mock(FilterChain.class);
    }

    private MockHttpServletRequest authRequest(String ip) {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/auth/login");
        req.setRemoteAddr(ip);
        return req;
    }

    @Test
    void requisicoesDentroDoLimite_devemPassar() throws Exception {
        for (int i = 0; i < 10; i++) {
            MockHttpServletResponse res = new MockHttpServletResponse();
            filter.doFilterInternal(authRequest("10.0.0.1"), res, chain);
            assertThat(res.getStatus()).isNotEqualTo(429);
        }
        verify(chain, times(10)).doFilter(any(), any());
    }

    @Test
    void aoUltrapassarLimite_deveRetornar429() throws Exception {
        for (int i = 0; i < 10; i++) {
            filter.doFilterInternal(authRequest("10.0.0.2"), new MockHttpServletResponse(), chain);
        }
        MockHttpServletResponse blocked = new MockHttpServletResponse();
        filter.doFilterInternal(authRequest("10.0.0.2"), blocked, chain);

        assertThat(blocked.getStatus()).isEqualTo(429);
        assertThat(blocked.getContentAsString()).contains("error");
        verify(chain, times(10)).doFilter(any(), any());
    }

    @Test
    void ipsDistintos_temContadoresIndependentes() throws Exception {
        for (int i = 0; i < 10; i++) {
            filter.doFilterInternal(authRequest("10.0.0.3"), new MockHttpServletResponse(), chain);
        }
        MockHttpServletResponse res = new MockHttpServletResponse();
        filter.doFilterInternal(authRequest("10.0.0.4"), res, chain);
        assertThat(res.getStatus()).isNotEqualTo(429);
    }

    @Test
    void endpointNaoAuth_naoDeveSerFiltrado() {
        MockHttpServletRequest req = new MockHttpServletRequest("GET", "/workouts");
        req.setRemoteAddr("10.0.0.5");
        assertThat(filter.shouldNotFilter(req)).isTrue();
    }

    @Test
    void endpointAuth_deveSerFiltrado() {
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/auth/login");
        req.setRemoteAddr("10.0.0.6");
        assertThat(filter.shouldNotFilter(req)).isFalse();
    }

    @Test
    void xForwardedFor_usaPrimeiroIp() throws Exception {
        for (int i = 0; i < 10; i++) {
            MockHttpServletRequest r = new MockHttpServletRequest("POST", "/auth/login");
            r.addHeader("X-Forwarded-For", "203.0.113.5, 10.0.0.1");
            r.setRemoteAddr("10.0.0.1");
            filter.doFilterInternal(r, new MockHttpServletResponse(), chain);
        }
        MockHttpServletRequest req = new MockHttpServletRequest("POST", "/auth/login");
        req.addHeader("X-Forwarded-For", "203.0.113.5, 10.0.0.1");
        req.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse blocked = new MockHttpServletResponse();
        filter.doFilterInternal(req, blocked, chain);
        assertThat(blocked.getStatus()).isEqualTo(429);
    }
}
