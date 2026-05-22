package com.dronetools.dronegestory.config;

import com.dronetools.dronegestory.security.JwtAuthenticationFilter;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.tomcat.TomcatConnectorCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.multipart.support.MultipartFilter;
import org.springframework.web.multipart.support.StandardServletMultipartResolver;

@EnableWebSecurity
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            DaoAuthenticationProvider authenticationProvider,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            MultipartFilter multipartFilter
    ) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authenticationProvider(authenticationProvider)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/home", "/home").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/login", "/api/login/").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/logout", "/api/logout/").permitAll()
                        .requestMatchers("/api/login", "/api/forgot-password", "/api/reset-password").permitAll()
                        // .requestMatchers(HttpMethod.GET, "/api/**/images/**").permitAll()

                        .requestMatchers("/api/user-certificates/**").authenticated()
                        .requestMatchers("/api/aircraft-documentation/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/maintenance/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/register-maintenance").hasAnyRole("ADMIN", "MAINTAINER")
                        .requestMatchers("/api/flight-hours/**").authenticated()
                        .requestMatchers("/api/flight-time-documentation/**").authenticated()
                        .requestMatchers("/api/sent-mails/**").hasAnyRole("ADMIN", "MANAGER")

                        .requestMatchers(HttpMethod.GET, "/api/operations/anexo4/images/**").authenticated()

                        .requestMatchers(HttpMethod.DELETE, "/api/operation-documentation/*/version/*").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/operation-documentation/**").hasAnyRole("ADMIN", "MANAGER")

                        // Permite que cualquier logueado vea su propia info básica
                        .requestMatchers(HttpMethod.GET, "/api/users/me").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/users/self/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/self/*").authenticated()

                        // Acceso al personal
                        .requestMatchers("/api/users/names").authenticated()

                        // El controlador valida si el usuario autenticado puede ver/modificar ese perfil.
                        .requestMatchers(HttpMethod.GET, "/api/users/*").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/*").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/users").hasAnyRole("ADMIN", "MANAGER")

                        // El listado general expone solo un resumen para usuarios no privilegiados.
                        .requestMatchers(HttpMethod.GET, "/api/users/**").authenticated()

                        .requestMatchers(HttpMethod.GET, "/api/aircraft/images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/aircraft/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/aircraft/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/aircraft/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/aircraft/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/aircraft-models/images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/aircraft-models/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/aircraft-models/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/aircraft-models/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/aircraft-models/**").hasAnyRole("ADMIN", "MANAGER")

                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .addFilterBefore(multipartFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder
    ) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // Separamos por comas las URLs que se definen en el .env
        List<String> allowedOrigins = java.util.Arrays.stream(frontendUrl.split(","))
                .map(String::trim)
                .collect(java.util.stream.Collectors.toList());

        config.setAllowedOrigins(allowedOrigins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
    
    @Bean
    public MultipartFilter multipartFilter() {
        MultipartFilter multipartFilter = new MultipartFilter();
        multipartFilter.setMultipartResolverBeanName("filterMultipartResolver");
        return multipartFilter;
    }

    @Bean(name = "filterMultipartResolver")
    public StandardServletMultipartResolver multipartResolver() {
        return new StandardServletMultipartResolver();
    }

    @Bean
    TomcatConnectorCustomizer connectorCustomizer() {
        return connector -> {
            connector.setMaxPartCount(100);
            connector.setMaxPartHeaderSize(2048);
        };
    }
}
