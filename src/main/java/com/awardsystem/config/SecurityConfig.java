package com.awardsystem.config;

import com.awardsystem.auth.JwtAuthenticationFilter;
import com.awardsystem.auth.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter, AuthenticationProvider authenticationProvider) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.authenticationProvider = authenticationProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Static frontend & public endpoints
                        .requestMatchers(
                                "/",
                                "/index.html",
                                "/assets/**",
                                "/favicon.ico",
                                "/*.ico",
                                "/*.png",
                                "/*.svg",
                                "/api/auth/**",
                                "/api/public/**",
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/uploads/**",
                                "/h2-console/**"
                        ).permitAll()

                        // Published winners are viewable by all
                        .requestMatchers(HttpMethod.GET, "/api/results/published").permitAll()

                        // Category reading
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        // Category management (Admin only)
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                        // Nomination approval / review queue
                        .requestMatchers("/api/approval/**").hasAnyRole("ADMIN", "COMMITTEE_MEMBER")

                        // Nomination submissions & management
                        .requestMatchers(HttpMethod.POST, "/api/nominations").hasAnyRole("NOMINATOR", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/nominations/my").hasAnyRole("NOMINATOR", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/nominations/**").hasAnyRole("NOMINATOR", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/nominations/*/withdraw").hasAnyRole("NOMINATOR", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/nominations/**").hasRole("ADMIN")

                        // Voting
                        .requestMatchers(HttpMethod.GET, "/api/voting/ballot").hasAnyRole("VOTER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/voting/cast").hasRole("VOTER")
                        .requestMatchers(HttpMethod.GET, "/api/voting/my-status").hasRole("VOTER")
                        .requestMatchers("/api/voting-periods/**").hasAnyRole("PROGRAM_MANAGER", "ADMIN")

                        // Results verification and publication
                        .requestMatchers("/api/results/tallies").hasAnyRole("RESULTS_OFFICER", "PROGRAM_MANAGER", "ADMIN")
                        .requestMatchers("/api/results/verify").hasRole("RESULTS_OFFICER")
                        .requestMatchers("/api/results/escalate").hasRole("RESULTS_OFFICER")
                        .requestMatchers("/api/results/publish").hasAnyRole("PROGRAM_MANAGER", "ADMIN")
                        .requestMatchers("/api/results/statistics").hasAnyRole("PROGRAM_MANAGER", "ADMIN", "RESULTS_OFFICER")

                        // Notifications & Reports
                        .requestMatchers("/api/notifications/my").authenticated()
                        .requestMatchers("/api/notifications/*/read").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/notifications/**").hasRole("ADMIN")
                        .requestMatchers("/api/reports/**").hasRole("PROGRAM_MANAGER")

                        // Profile & users
                        .requestMatchers("/api/users/profile").authenticated()
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
