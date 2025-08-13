import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBservice from "../../DB/db.service.js";
import { UserModel } from "../../DB/models/User.model.js";
import { MessageModel } from "../../DB/models/Message.model.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
    if (!req.body.content && !req.files) {
        return next(new Error("message content is required"));
    }
    const { receiverId } = req.params;

    if (
        !(await DBservice.findOne({
            model: UserModel,
            filter: {
                _id: receiverId,
                deletedAt: { $exists: false },
                confirmEmail: { $exists: true },
            },
        }))
    ) {
        return next(new Error("In-valid recipient account", { cause: 404 }));
    }

    const { content } = req.body;
    let attachments = [];
    if (req.files) {
        attachments = req.files.map((file) => ({
            originalName: file.originalname,
            fileName: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            finalPath: file.finalPath,
        }));
    }

    const message = await DBservice.create({
        model: MessageModel,
        data: {
            content,
            attachments,
            receiverId,
            senderId: req.user._id,
        },
    });
    return successResponse({ res, status: 201, data: message });
});

export const listMessages = asyncHandler(async (req, res, next) => {
    const { page = 1, size = 10, sort = "desc", search } = req.query;
    const skip = (page - 1) * size;

    let filter = {
        $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
        deletedAt: { $exists: false },
    };

    if (search) {
        filter.content = { $regex: search, $options: "i" };
    }

    const messages = await DBservice.findMany({
        model: MessageModel,
        filter,
        options: {
            skip,
            limit: parseInt(size),
            sort: { createdAt: sort === "asc" ? 1 : -1 },
            populate: [
                { path: "senderId", select: "fullName email profileImage" },
                { path: "receiverId", select: "fullName email profileImage" },
            ],
        },
    });

    const total = await DBservice.count({
        model: MessageModel,
        filter,
    });

    return successResponse({
        res,
        data: {
            messages,
            pagination: {
                page: parseInt(page),
                size: parseInt(size),
                total,
                pages: Math.ceil(total / size),
            },
        },
    });
});

export const deleteMessage = asyncHandler(async (req, res, next) => {
    const { messageId } = req.params;

    const message = await DBservice.findOne({
        model: MessageModel,
        filter: {
            _id: messageId,
            $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
            deletedAt: { $exists: false },
        },
    });

    if (!message) {
        return next(new Error("Message not found", { cause: 404 }));
    }

    await DBservice.updateOne({
        model: MessageModel,
        filter: { _id: messageId },
        data: { deletedAt: new Date() },
    });

    return successResponse({
        res,
        message: "Message deleted successfully",
    });
});

export const getMessageById = asyncHandler(async (req, res, next) => {
    const { messageId } = req.params;

    const message = await DBservice.findOne({
        model: MessageModel,
        filter: {
            _id: messageId,
            $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
            deletedAt: { $exists: false },
        },
        options: {
            populate: [
                { path: "senderId", select: "fullName email profileImage" },
                { path: "receiverId", select: "fullName email profileImage" },
            ],
        },
    });

    if (!message) {
        return next(new Error("Message not found", { cause: 404 }));
    }

    return successResponse({
        res,
        data: message,
    });
});
