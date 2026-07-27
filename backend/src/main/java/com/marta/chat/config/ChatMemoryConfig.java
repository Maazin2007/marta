package com.marta.chat.config;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.marta.chat.dto.AiPatientResponse;
import com.marta.chat.model.Message;
import com.marta.chat.model.SenderRole;
import com.marta.chat.repository.MessageRepository;

import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.ChatMessage;
import dev.langchain4j.data.message.UserMessage;
import dev.langchain4j.memory.chat.ChatMemoryProvider;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;

@Configuration
public class ChatMemoryConfig {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    private final MessageRepository messageRepository;

    public ChatMemoryConfig(MessageRepository messageRepository) {
        this.messageRepository = messageRepository;
    }

    @Bean
    public ChatMemoryProvider chatMemoryProvider() {
        return memoryId -> {
            UUID sessionId = (UUID) memoryId;
            List<Message> dbMessages = messageRepository.findBySessionIdOrderBySentAtAsc(sessionId);
            List <ChatMessage> langchainMessages = dbMessages.stream()
                .map(msg -> {
                    if (msg.getSenderRole() == SenderRole.PATIENT) {
                        // Replay past replies in the JSON shape the model is asked to produce,
                        // otherwise the plain-text history teaches it to drop the wrapper.
                        return AiMessage.from(asJsonReply(msg.getTextContent()));
                    } else {
                        return UserMessage.from(msg.getTextContent());
                    }
                })
                .collect(Collectors.toList());

                // Create the memory brain that langchain4j will use to store the chat history
                MessageWindowChatMemory memory = MessageWindowChatMemory.builder()
                    .id(sessionId.toString()) // Convert UUID to String for memory ID
                    .maxMessages(100) // Limit the chat history to 100 messages
                    .build();

                // Add the chat messages to the memory
                langchainMessages.forEach(memory::add);
                return memory;
        };
    }

    private String asJsonReply(String patientReply) {
        try {
            return OBJECT_MAPPER.writeValueAsString(new AiPatientResponse(patientReply, false, null));
        } catch (JsonProcessingException e) {
            return patientReply;
        }
    }
}
