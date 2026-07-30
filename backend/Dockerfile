# Stage 1: Build the application using Maven
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy the Maven wrapper and project object model (pom.xml)
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./

# Make the Maven wrapper executable and download dependencies
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

# Copy the actual source code and build the JAR
COPY src ./src
RUN cp src/main/resources/application.properties.example src/main/resources/application.properties
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Install libgomp1 (Required for ONNX Runtime / Langchain4j Embeddings)
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose the default Spring Boot port
EXPOSE 8080

# Start the application with memory optimizations for 512MB free tier
ENTRYPOINT ["java", "-Xmx450m", "-XX:+UseSerialGC", "-jar", "app.jar"]
