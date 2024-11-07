package com.example.iot.config;

import com.example.iot.model.Device;
import com.example.iot.model.SensorData;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class WebSocketHandler extends TextWebSocketHandler {
    private static final List<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    @Autowired
    private ObjectMapper objectMapper;
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.add(session);
    }
    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    public void broadcastSensorData(SensorData sensorData) throws IOException {
        ObjectNode message = objectMapper.createObjectNode();
        message.put("temperature", sensorData.getTemperature());
        message.put("humidity", sensorData.getHumidity());
        message.put("light", sensorData.getLight());
        message.put("dirt", sensorData.getDirt());
        message.put("time", sensorData.getTime().toString());

        String jsonMessage = objectMapper.writeValueAsString(message);
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(jsonMessage));
            }
        }
    }

    public void broadcastWarningLedState(Device device) throws IOException {
        ObjectNode message = objectMapper.createObjectNode();
        message.put("type", "warningLed");
        message.put("led", device.getDevice());
        message.put("status", device.getAction());
        message.put("time", device.getTime().toString());

        String jsonMessage = objectMapper.writeValueAsString(message);
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                session.sendMessage(new TextMessage(jsonMessage));
            }
        }
    }
}