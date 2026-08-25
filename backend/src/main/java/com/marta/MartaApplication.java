package com.marta;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
// enabling global caching
@EnableCaching
public class MartaApplication {

	public static void main(String[] args) {
		SpringApplication.run(MartaApplication.class, args);
	}

}
