package com.marta.chat.service;

import java.util.UUID;

import dev.langchain4j.service.MemoryId;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.spring.AiService;

@AiService
public interface  AiPatientService {
    // Master System Message
    @SystemMessage({
        "You are a dental patient participating in a clinical exam simulation.",                            
        "A dental student will ask you questions to figure out your diagnosis.",                            
        "Do NOT give away your diagnosis easily. Only answer the exact question they ask.",                                       
        "Keep your responses short, natural, and conversational. Do not use complex medical terms."   
    })
    // method to call to chat with students
    String chatWithStudent(@MemoryId UUID sessionID, @UserMessage String message);

}
