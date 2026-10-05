package com.awardsystem.nomination;

import com.awardsystem.common.AppException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "pdf", "doc", "docx", "png", "jpg", "jpeg"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    public FileStorageService(@Value("${app.upload.dir:uploads/nominations}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new AppException("Could not create the directory where the uploaded files will be stored.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("Uploaded file is empty", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException("File size exceeds 10 MB limit", HttpStatus.PAYLOAD_TOO_LARGE);
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");
        String extension = getFileExtension(originalFilename).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new AppException(
                    "Invalid file type '." + extension + "'. Allowed file types are: PDF, DOC, DOCX, PNG, JPG, JPEG",
                    HttpStatus.BAD_REQUEST
            );
        }

        try {
            if (originalFilename.contains("..")) {
                throw new AppException("Filename contains invalid path sequence: " + originalFilename, HttpStatus.BAD_REQUEST);
            }

            String storedFileName = UUID.randomUUID().toString() + "_" + originalFilename;
            Path targetLocation = this.fileStorageLocation.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            return "uploads/nominations/" + storedFileName;
        } catch (IOException ex) {
            throw new AppException("Could not store file " + originalFilename + ". Please try again!", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
