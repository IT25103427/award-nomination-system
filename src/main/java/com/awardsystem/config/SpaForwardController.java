package com.awardsystem.config;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaForwardController {

    @GetMapping(value = {
            "/login",
            "/register",
            "/forgot-password",
            "/reset-password",
            "/status-lookup",
            "/winners",
            "/public-lookup",
            "/public-winners",
            "/dashboard",
            "/categories",
            "/submit-nomination",
            "/my-nominations",
            "/approval-queue",
            "/voting-booth",
            "/my-votes",
            "/voting-periods",
            "/results-audit",
            "/manager-publish",
            "/notifications",
            "/reports",
            "/user-management",
            "/profile"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
