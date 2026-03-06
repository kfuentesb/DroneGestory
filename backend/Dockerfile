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

COPY --from=build /app/target/dronegestory-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]