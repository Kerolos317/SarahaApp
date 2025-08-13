import {
    fileValidation,
    localFileUpload,
} from "../../utils/multer/local.multer.js";
import * as messageService from "./message.service.js";
import * as validators from "./message.validation.js";
import { validation } from "../../middleware/validation.middleware.js";
import { Router } from "express";
import { authentication } from "../../middleware/authentication.middleware.js";
const router = Router();

router.post(
    "/:receiverId",
    authentication(),
    localFileUpload({ validation: fileValidation.image }).array(
        "attachments",
        2
    ),
    validation(validators.sendMessage),
    messageService.sendMessage
);

router.get(
    "/",
    authentication(),
    validation(validators.listMessages),
    messageService.listMessages
);

router.get(
    "/:messageId",
    authentication(),
    validation(validators.getMessageById),
    messageService.getMessageById
);

router.delete(
    "/:messageId",
    authentication(),
    validation(validators.deleteMessage),
    messageService.deleteMessage
);

export default router;
