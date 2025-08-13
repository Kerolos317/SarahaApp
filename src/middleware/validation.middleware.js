import { Types } from "mongoose";
import { asyncHandler } from "../utils/response.js";
import joi from "joi";
import { genderEnum } from "../DB/models/User.model.js";

export const generalFields = {
    fullName: joi
        .string()
        .pattern(new RegExp(/^[A-Z][a-z]{1,19}\s{1}[A-Z][a-z]{1,19}$/))
        .min(2)
        .max(20)
        .messages({
            "string.min": "min name length is 2 char",
            "any.required": "fullName is mandatory",
        }),
    email: joi.string().email({
        minDomainSegments: 2,
        maxDomainSegments: 3,
        tlds: { allow: ["net", "com"] },
    }),
    password: joi
        .string()
        .pattern(
            new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)
        ),
    confirmPassword: joi.string().valid(joi.ref("password")),
    phone: joi.string().pattern(new RegExp(/^(002|\+2)?01[0125][0-9]{8}$/)),
    gender: joi.valid(...Object.values(genderEnum)),
    otp: joi.string().pattern(new RegExp(/^\d{6}$/)),
    id: joi.string().custom((value, helper) => {
        return (
            Types.ObjectId.isValid(value) || helper.message("In-valid ObjectId")
        );
    }),
};

export const fileFields = {
    image: joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi
            .string()
            .valid("image/jpeg", "image/gif", "image/png", "image/webp")
            .required(),
        size: joi
            .number()
            .max(5 * 1024 * 1024)
            .required(), // 5MB max
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        finalPath: joi.string().required(),
    }),
    document: joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi
            .string()
            .valid(
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
            .required(),
        size: joi
            .number()
            .max(10 * 1024 * 1024)
            .required(), // 10MB max
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        finalPath: joi.string().required(),
    }),
    video: joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi
            .string()
            .valid("video/mp4", "video/avi", "video/mov")
            .required(),
        size: joi
            .number()
            .max(50 * 1024 * 1024)
            .required(), // 50MB max
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        finalPath: joi.string().required(),
    }),
    audio: joi.object({
        fieldname: joi.string().required(),
        originalname: joi.string().required(),
        encoding: joi.string().required(),
        mimetype: joi
            .string()
            .valid("audio/mpeg", "audio/wav", "audio/ogg")
            .required(),
        size: joi
            .number()
            .max(20 * 1024 * 1024)
            .required(), // 20MB max
        destination: joi.string().required(),
        filename: joi.string().required(),
        path: joi.string().required(),
        finalPath: joi.string().required(),
    }),
};

export const validation = (schema) => {
    return asyncHandler(async (req, res, next) => {
        const validationErrors = [];
        for (const key of Object.keys(schema)) {
            const validationResult = schema[key].validate(req[key], {
                abortEarly: false,
            });
            if (validationResult.error) {
                validationErrors.push(validationResult.error?.details);
            }
        }

        if (validationErrors.length) {
            return res.status(400).json({
                err_message: "validation error",
                error: validationErrors,
            });
        }

        return next();
    });
};

export const fileValidation = (schema) => {
    return asyncHandler(async (req, res, next) => {
        const validationErrors = [];

        if (req.files) {
            if (Array.isArray(req.files)) {
                for (let i = 0; i < req.files.length; i++) {
                    const file = req.files[i];
                    const validationResult = schema.validate(file, {
                        abortEarly: false,
                    });
                    if (validationResult.error) {
                        validationErrors.push({
                            fileIndex: i,
                            fileName: file.originalname,
                            errors: validationResult.error.details,
                        });
                    }
                }
            } else {
                for (const fieldName in req.files) {
                    const files = req.files[fieldName];
                    if (Array.isArray(files)) {
                        for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            const validationResult = schema[
                                fieldName
                            ]?.validate(file, {
                                abortEarly: false,
                            });
                            if (validationResult?.error) {
                                validationErrors.push({
                                    fieldName,
                                    fileIndex: i,
                                    fileName: file.originalname,
                                    errors: validationResult.error.details,
                                });
                            }
                        }
                    } else {
                        const validationResult = schema[fieldName]?.validate(
                            files,
                            {
                                abortEarly: false,
                            }
                        );
                        if (validationResult?.error) {
                            validationErrors.push({
                                fieldName,
                                fileName: files.originalname,
                                errors: validationResult.error.details,
                            });
                        }
                    }
                }
            }
        }

        if (validationErrors.length) {
            return res.status(400).json({
                err_message: "File validation error",
                error: validationErrors,
            });
        }

        return next();
    });
};
