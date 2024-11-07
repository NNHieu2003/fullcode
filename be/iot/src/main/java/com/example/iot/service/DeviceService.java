package com.example.iot.service;

import com.example.iot.model.Device;
import com.example.iot.repository.DeviceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    public void saveDeviceAction(Device device) {
        deviceRepository.save(device);
    }

    public List<Device> getAllDeviceActions() {
        return deviceRepository.findAll();
    }

    public List<Device> searchDeviceActionsByTime(String time) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime dateTime = LocalDateTime.parse(time, formatter);
        return deviceRepository.findByTime(dateTime.withNano(0));
    }
}
