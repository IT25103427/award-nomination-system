package com.awardsystem.notification.dto;

import com.awardsystem.notification.Notification;

import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private String type;
    private String message;
    private Long relatedEntityId;
    private boolean read;
    private LocalDateTime createdAt;

    public NotificationDto() {
    }

    public static NotificationDto fromEntity(Notification notif) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notif.getId());
        dto.setType(notif.getType());
        dto.setMessage(notif.getMessage());
        dto.setRelatedEntityId(notif.getRelatedEntityId());
        dto.setRead(notif.isRead());
        dto.setCreatedAt(notif.getCreatedAt());
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getRelatedEntityId() {
        return relatedEntityId;
    }

    public void setRelatedEntityId(Long relatedEntityId) {
        this.relatedEntityId = relatedEntityId;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
