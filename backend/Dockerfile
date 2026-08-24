#STAGE 1: THE BUILDER
# Keep the full JDK for builder then swtich to lighter image for runner
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
# we are skipping the tests sense they will be run the CI/CD pipeline
RUN mvn clean package -DskipTests 

#STAGE 2: THE runner
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
# Optimization trick to run the jar with lower ram consumption
ENTRYPOINT ["java", "-Xmx350m", "-jar", "app.jar"]