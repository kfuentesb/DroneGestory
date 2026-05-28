# Stage 1: Build Spring Boot app
FROM maven:3.9.8-eclipse-temurin-21 AS build

WORKDIR /app

# Copiar pom.xml para cachear dependencias
COPY pom.xml ./

RUN mvn dependency:go-offline

# Copiar código fuente
COPY src ./src

# Build JAR sin tests
RUN mvn clean package -DskipTests

# Stage 2: Ejecutar JAR
FROM eclipse-temurin:21-jdk-jammy

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates wget gnupg \
    && install -d /usr/share/postgresql-common/pgdg \
    && wget -qO /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc https://www.postgresql.org/media/keys/ACCC4CF8.asc \
    && echo "deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt jammy-pgdg main" > /etc/apt/sources.list.d/pgdg.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client-16 \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/dronegestory-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
