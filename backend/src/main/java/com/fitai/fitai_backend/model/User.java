package com.fitai.fitai_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name =  "useres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class User{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column (nullable = false)
    private String name;

    @Column (nullable = false ,unique = true)
    private String email;

    // Nullable: usuários Google não têm senha local
    @Column(nullable = true)
    private String password;

    // Preenchido apenas para usuários que autenticaram via Google
    @Column(nullable = true, unique = true)
    private String googleId;

}
