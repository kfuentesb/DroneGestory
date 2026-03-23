package com.dronetools.dronegestory.controller;

import com.dronetools.dronegestory.dto.DashboardDTO;
import com.dronetools.dronegestory.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class DashboardController {

    @Autowired private DashboardService dashboardService;

    @GetMapping("/dashboard")
    public DashboardDTO getDashboard() {
        return dashboardService.getDashboard();
    }
}
