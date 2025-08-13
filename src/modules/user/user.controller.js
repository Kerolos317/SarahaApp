import {
    authentication,
    authorization,
    auth,
} from "../../middleware/authentication.middleware.js";
import {
    validation,
    fileValidation as joiFileValidation,
    fileFields,
} from "../../middleware/validation.middleware.js";
import {
    fileValidation,
    localFileUpload,
    localFileUploadArray,
    localFileUploadFields,
} from "../../utils/multer/local.multer.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import { endpoint } from "./user.authorization.js";
import * as userService from "./user.service.js";
import * as validators from "./user.validation.js";
import { Router } from "express";
import { asyncHandler } from "../../utils/response.js";
const router = Router();

router.get("/", auth({ accessRoles: endpoint.profile }), userService.profile);
router.get(
    "/refresh-token",
    authentication({ tokenType: tokenTypeEnum.refresh }),
    userService.getNewLoginCredential
);
router.post(
    "/logout",
    authentication(),
    validation(validators.logout),
    userService.logout
);
router.get("/:userId", userService.shareProfile);

router.patch(
    "/",
    authentication(),
    validation(validators.updateBasicInfo),
    userService.updateBasicInfo
);

router.patch(
    "/password",
    authentication(),
    validation(validators.updatePassword),
    userService.updatePassword
);

router.patch(
    "/profile-image",
    authentication(),
    localFileUpload({
        customPath: "user",
        validation: fileValidation.image,
    }).single("image"),
    userService.profileImage
);
router.patch(
    "/:userId/restore-account",
    auth({ accessRoles: endpoint.restoreAccount }),
    validation(validators.restoreAccount),
    userService.restoreAccount
);

router.delete(
    "/:userId",
    auth({ accessRoles: endpoint.deleteAccount }),
    validation(validators.deleteAccount),
    userService.deleteAccount
);

router.delete(
    "{/:userId}/freeze-account",
    authentication(),
    validation(validators.freezeAccount),
    userService.freezeAccount
);

router.post(
    "/upload-single-image",
    authentication(),
    localFileUpload({
        customPath: "user",
        validation: fileValidation.image,
    }).single("image"),
    joiFileValidation(fileFields.image),
    asyncHandler(async (req, res) => {
        return res.status(200).json({
            message: "Single image uploaded successfully",
            file: req.file,
        });
    })
);

router.post(
    "/upload-multiple-images",
    authentication(),
    localFileUploadArray({
        fieldName: "images",
        maxCount: 5,
        customPath: "user",
        validation: fileValidation.image,
    }),
    joiFileValidation(fileFields.image),
    asyncHandler(async (req, res) => {
        return res.status(200).json({
            message: "Multiple images uploaded successfully",
            files: req.files,
            count: req.files.length,
        });
    })
);

router.post(
    "/upload-multiple-file-types",
    authentication(),
    localFileUploadFields({
        fields: [
            { name: "images", maxCount: 3 },
            { name: "documents", maxCount: 2 },
            { name: "videos", maxCount: 1 },
        ],
        customPath: "user",
    }),
    joiFileValidation({
        images: fileFields.image,
        documents: fileFields.document,
        videos: fileFields.video,
    }),
    asyncHandler(async (req, res) => {
        return res.status(200).json({
            message: "Multiple file types uploaded successfully",
            files: req.files,
        });
    })
);

router.post(
    "/upload-with-data",
    authentication(),
    localFileUploadArray({
        fieldName: "files",
        maxCount: 3,
        customPath: "user",
        validation: [...fileValidation.image, ...fileValidation.document],
    }),
    joiFileValidation({
        files: fileFields.image,
    }),
    asyncHandler(async (req, res) => {
        return res.status(200).json({
            message: "Files and data uploaded successfully",
            files: req.files,
            body: req.body,
        });
    })
);

export default router;
