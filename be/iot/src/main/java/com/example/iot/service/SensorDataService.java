package com.example.iot.service;

import com.example.iot.model.SensorData;
import com.example.iot.repository.SensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import java.time.format.DateTimeFormatter;

@Service
public class SensorDataService {
    @Autowired
    private SensorDataRepository sensorDataRepository;

    public List<SensorData> getAllSensorData() {
        return sensorDataRepository.findAll(Sort.by("id").ascending());
    }

    public List<SensorData> searchSensorDataByTime(String time) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime dateTime = LocalDateTime.parse(time, formatter);
        return sensorDataRepository.findByTime(dateTime.withNano(0));
    }
}




