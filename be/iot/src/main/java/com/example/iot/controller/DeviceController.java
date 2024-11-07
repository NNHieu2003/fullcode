package com.example.iot.controller;

import com.example.iot.model.Device;
import com.example.iot.model.SensorData;
import com.example.iot.service.DeviceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    @GetMapping("/device-history")
    public ResponseEntity<List<Device>> getDeviceHistory() {
        List<Device> result = deviceService.getAllDeviceActions();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/device-history/search")
    public ResponseEntity<List<Device>> searchDeviceHistoryByTime(@RequestParam String time) {
        List<Device> result = deviceService.searchDeviceActionsByTime(time);
        return ResponseEntity.ok(result);
    }
}
