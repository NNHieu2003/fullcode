package com.example.iot.repository;

import com.example.iot.model.Device;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {
    List<Device> findAll();

    @Query("SELECT d FROM Device d WHERE FUNCTION('DATE_FORMAT', d.time, '%Y-%m-%d %H:%i:%s') = :time")
    List<Device> findByTime(@Param("time") LocalDateTime time);
}

