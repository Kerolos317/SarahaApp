import fs from "node:fs";
import path from "path";
import multer from "multer";

export const fileValidation = {
    image: ["image/jpeg", "image/gif", "image/png", "image/webp"],
    document: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    video: ["video/mp4", "video/avi", "video/mov"],
    audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
};

export const localFileUpload = ({
    customPath = "general",
    validation = [],
    maxSize = 1024 * 1024 * 5,
} = {}) => {
    let basePath = `uploads/${customPath}`;

    const storage = multer.diskStorage({
        destination: function (req, file, callback) {
            if (req.user?._id) {
                basePath += `/${req.user._id}`;
            }

            const fullPath = path.resolve(`./src/${basePath}`);

            if (!fs.existsSync(fullPath)) {
                fs.mkdirSync(fullPath, { recursive: true });
            }

            callback(null, path.resolve(fullPath));
        },
        filename: function (req, file, callback) {
            console.log(file);
            const uniqueFileName =
                Date.now() + "__" + Math.random() + "__" + file.originalname;
            file.finalPath = basePath + "/" + uniqueFileName;
            callback(null, uniqueFileName);
        },
    });

    const fileFilter = function (req, file, callback) {
        if (validation.length === 0 || validation.includes(file.mimetype)) {
            return callback(null, true);
        }
        return callback(new Error("Invalid file format"), false);
    };

    return multer({
        dest: "./temp",
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize,
        },
    });
};

export const localFileUploadArray = ({
    fieldName,
    maxCount = 5,
    customPath = "general",
    validation = [],
    maxSize = 1024 * 1024 * 5,
} = {}) => {
    return localFileUpload({ customPath, validation, maxSize }).array(
        fieldName,
        maxCount
    );
};

export const localFileUploadFields = ({
    fields,
    customPath = "general",
    maxSize = 1024 * 1024 * 5,
} = {}) => {
    return localFileUpload({ customPath, maxSize }).fields(fields);
};
