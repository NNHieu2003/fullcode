package com.example.iot.controller;

import com.example.iot.model.SensorData;
import com.example.iot.service.SensorDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api")
public class SensorDataController {
    @Autowired
    private SensorDataService sensorDataService;

    @GetMapping("/sensor-history")
    public ResponseEntity<List<SensorData>> getSensorHistory() {
        List<SensorData> result = sensorDataService.getAllSensorData();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/sensor-history/search")
    public ResponseEntity<List<SensorData>> searchSensorHistoryByTime(@RequestParam String time) {
        List<SensorData> result = sensorDataService.searchSensorDataByTime(time);
        return ResponseEntity.ok(result);
    }
}









