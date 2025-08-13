import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
    {
        originalName: { type: String, required: true },
        fileName: { type: String, required: true },
        size: { type: Number, required: true },
        mimetype: { type: String, required: true },
        finalPath: { type: String, required: true },
    },
    { _id: false }
);

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            minLength: 2,
            maxLength: 200000,
            required: function () {
                return this.attachments?.length ? false : true;
            },
        },
        attachments: [attachmentSchema],
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true,
    }
);

export const MessageModel =
    mongoose.models.Message || mongoose.model("Message", messageSchema);


