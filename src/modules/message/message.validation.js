import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const sendMessage = {
    params: joi
        .object()
        .keys({
            receiverId: generalFields.id.required(),
        })
        .required(),

    body: joi
        .object()
        .keys({
            content: joi.string().min(2).max(200000),
        })
        .required(),

    files: joi.array().items(
        joi
            .object()
            .keys({
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
                     .required(),
                destination: joi.string().required(),
                filename: joi.string().required(),
                path: joi.string().required(),
                finalPath: joi.string().required(),
            })
            .min(0)
            .max(2)
    ),
};

export const listMessages = {
    query: joi
        .object()
        .keys({
            page: joi.number().min(1).optional(),
            size: joi.number().min(1).max(50).optional(),
            sort: joi.string().valid("asc", "desc").optional(),
            search: joi.string().min(1).optional(),
        })
        .optional(),
};

export const deleteMessage = {
    params: joi
        .object()
        .keys({
            messageId: generalFields.id.required(),
        })
        .required(),
};

export const getMessageById = {
    params: joi
        .object()
        .keys({
            messageId: generalFields.id.required(),
        })
        .required(),
};
