package com.fitai.fitai_backend.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleTokenVerifier {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifier(@Value("${google.client-id}") String clientId) {
        this.verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(clientId))
                .build();
    }

    // Valida o idToken com os servidores do Google e retorna o payload com os dados do usuário
    // Lança exceção se o token for inválido, expirado ou não pertencer ao nosso app
    public GoogleIdToken.Payload verify(String idToken) {
        try {
            GoogleIdToken token = verifier.verify(idToken);
            if (token == null) {
                throw new IllegalArgumentException("Token do Google inválido.");
            }
            return token.getPayload();
        } catch (Exception e) {
            throw new IllegalArgumentException("Falha ao validar token do Google: " + e.getMessage());
        }
    }
}
