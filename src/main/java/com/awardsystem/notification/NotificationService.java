package com.awardsystem.notification;

import com.awardsystem.auth.User;
import com.awardsystem.common.AppException;
import com.awardsystem.notification.dto.NotificationDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createSystemNotification(User user, String recipientEmail, String type, String message, Long relatedEntityId) {
        Notification notification = new Notification(user, recipientEmail, type, message, relatedEntityId);
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getUserNotifications(User user) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(NotificationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long notificationId, User user) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException("Notification not found", HttpStatus.NOT_FOUND));

        if (notification.getUser() != null && !notification.getUser().getId().equals(user.getId())) {
            throw new AppException("Unauthorized to modify this notification", HttpStatus.FORBIDDEN);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new AppException("Notification not found", HttpStatus.NOT_FOUND);
        }
        notificationRepository.deleteById(id);
    }
}
