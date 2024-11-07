package com.example.iot.controller;

import com.example.iot.model.Device;
import com.example.iot.model.SensorData;
import com.example.iot.service.DeviceService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.integration.support.MessageBuilder;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin("*")
@RestController
@RequestMapping("/api")
public class IoTController {
    @Autowired
    private DeviceService deviceService;
    @Autowired
    private MessageChannel mqttOutboundChannel;
    @PostMapping("/led/{ledName}")
    public ResponseEntity<?> controlLed(@PathVariable String ledName, @RequestBody boolean state) {
        try {
            String topic = "esp8266/" + ledName.toLowerCase();
            String payload = state ? "0" : "1";

            Message<String> message = MessageBuilder
                    .withPayload(payload)
                    .setHeader(MqttHeaders.TOPIC, topic)
                    .build();

            mqttOutboundChannel.send(message);

            Device deviceAction = new Device();
            deviceAction.setDevice(ledName);
            deviceAction.setAction(state ? "ON" : "OFF");
            deviceAction.setTime(LocalDateTime.now());
            deviceService.saveDeviceAction(deviceAction);

            return ResponseEntity.ok("LED control message sent");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to send LED control message: " + e.getMessage());
        }
    }
}