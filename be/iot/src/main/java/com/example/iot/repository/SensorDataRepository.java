package com.example.iot.repository;

import com.example.iot.model.SensorData;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {
    List<SensorData> findAll(Sort sort);

    @Query("SELECT s FROM SensorData s WHERE FUNCTION('DATE_FORMAT', s.time, '%Y-%m-%d %H:%i:%s') = :time")
    List<SensorData> findByTime(@Param("time") LocalDateTime time);
}








