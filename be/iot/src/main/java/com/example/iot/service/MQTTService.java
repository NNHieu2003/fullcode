package com.example.iot.service;

import com.example.iot.config.WebSocketHandler;
import com.example.iot.model.Device;
import com.example.iot.model.SensorData;
import com.example.iot.repository.DeviceRepository;
import com.example.iot.repository.SensorDataRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
public class MQTTService {

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private WebSocketHandler webSocketHandler;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @ServiceActivator(inputChannel = "mqttInputChannel")
    public void handleMqttMessage(Message<?> message) {
        String topic = message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC, String.class);
        String payload = (String) message.getPayload();
        System.out.println("Received message on topic: " + topic + " - Payload: " + payload);

        if ("esp8266/sensor".equals(topic)) {
            handleSensorData(payload);
        } else if ("esp8266/action".equals(topic)) {
            //handleDeviceAction(payload);
        } else if ("esp8266/warning".equals(topic)) {
            handleWarningLed(payload);
        }
    }

    private void handleSensorData(String payload) {
        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            String deviceId = jsonNode.get("device_id").asText();
            int temperature = jsonNode.get("temperature").asInt();
            int humidity = jsonNode.get("humidity").asInt();
            int light = jsonNode.get("light").asInt();
            int dirt = jsonNode.get("dirt").asInt();

            SensorData sensorData = new SensorData(deviceId, temperature, humidity, light, dirt, LocalDateTime.now());
            sensorDataRepository.save(sensorData);

            webSocketHandler.broadcastSensorData(sensorData);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    private void handleWarningLed(String payload) {
        try {
            JsonNode jsonNode = objectMapper.readTree(payload);
            String device = jsonNode.get("led").asText();
            String action = jsonNode.get("status").asText();

            Device deviceAction = new Device("warning_led", action, LocalDateTime.now());
            deviceRepository.save(deviceAction);

            webSocketHandler.broadcastWarningLedState(deviceAction);

            System.out.println("Warning LED state saved: " + action);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}