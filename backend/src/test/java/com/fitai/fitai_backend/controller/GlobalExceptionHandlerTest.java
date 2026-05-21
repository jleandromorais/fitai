package com.fitai.fitai_backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionHandler();
    }

    @Test
    void illegalArgument_deveRetornar400ComMensagem() {
        ResponseEntity<Map<String, String>> res =
                handler.handleIllegalArgument(new IllegalArgumentException("Email já cadastrado."));

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(res.getBody()).containsEntry("error", "Email já cadastrado.");
    }

    @Test
    void badCredentials_deveRetornar401() {
        ResponseEntity<Map<String, String>> res =
                handler.handleBadCredentials(new BadCredentialsException("x"));

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(res.getBody()).containsKey("error");
    }

    @Test
    void validationException_deveRetornar400ComCamposInvalidos() {
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("obj", "email", "não pode ser vazio"),
                new FieldError("obj", "password", "não pode ser vazio")
        ));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, Object>> res = handler.handleValidation(ex);

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(res.getBody()).containsKey("fields");
        assertThat(res.getBody()).containsKey("error");

        @SuppressWarnings("unchecked")
        Map<String, String> fields = (Map<String, String>) res.getBody().get("fields");
        assertThat(fields).containsKey("email").containsKey("password");
    }

    @Test
    void genericException_deveRetornar500() {
        ResponseEntity<Map<String, String>> res =
                handler.handleGeneric(new RuntimeException("Erro inesperado"));

        assertThat(res.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
        assertThat(res.getBody()).containsKey("error");
    }

    @Test
    void validationException_camposDuplicados_mantemPrimeiraMensagem() {
        BindingResult bindingResult = mock(BindingResult.class);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(
                new FieldError("obj", "email", "mensagem 1"),
                new FieldError("obj", "email", "mensagem 2")
        ));

        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        when(ex.getBindingResult()).thenReturn(bindingResult);

        ResponseEntity<Map<String, Object>> res = handler.handleValidation(ex);

        @SuppressWarnings("unchecked")
        Map<String, String> fields = (Map<String, String>) res.getBody().get("fields");
        assertThat(fields.get("email")).isEqualTo("mensagem 1");
    }
}
