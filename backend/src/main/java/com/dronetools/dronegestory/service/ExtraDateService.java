package com.dronetools.dronegestory.service;

import com.dronetools.dronegestory.dto.ExtraDateDTO;
import com.dronetools.dronegestory.model.ExtraDate;
import com.dronetools.dronegestory.repository.ExtraDateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExtraDateService {

    @Autowired
    private ExtraDateRepository extraDateRepository;

    public List<ExtraDateDTO> getAllEvents() {
        return extraDateRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExtraDateDTO saveEvent(ExtraDateDTO dto) {
        ExtraDate entity = new ExtraDate();
        entity.setExtraDate(dto.getExtraDate());
        entity.setDescription(dto.getDescription());
        
        ExtraDate saved = extraDateRepository.save(entity);
        return convertToDTO(saved);
    }

    @Transactional
    public void deleteEvent(Long id) {
        extraDateRepository.deleteById(id);
    }

    private ExtraDateDTO convertToDTO(ExtraDate entity) {
        return new ExtraDateDTO(
                entity.getIdExtraDate(),
                entity.getExtraDate(),
                entity.getDescription()
        );
    }
}