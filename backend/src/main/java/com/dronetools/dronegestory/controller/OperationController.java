package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.model.Operation;
import com.dronetools.dronegestory.service.OperationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auth/operations")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class OperationController {

    private final OperationService operationService;

    @GetMapping
    public List<Operation> getAll(){
        return operationService.getAllOperations();
    }
}
