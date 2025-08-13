import { customAlphabet } from "nanoid";
import {
    providerEnum,
    roleEnum,
    UserModel,
} from "../../DB/models/User.model.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../DB/db.service.js";
import {
    compareHash,
    generateHash,
} from "../../utils/security/hash.security.js";
import { generateEncryption } from "../../utils/security/encryption.security.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import {
    generateLoginCredential,
    generateToken,
    getSignature,
    signatureLevelEnum,
    verifyToken,
} from "../../utils/security/token.security.js";
import { sendEmail } from "../../utils/email/send.email.js";
import e from "express";
import { emailEvent } from "../../utils/events/email.event.js";
import { model } from "mongoose";
import * as validators from './auth.validation.js'


export const signup = asyncHandler(async (req, res, next) => {
    const { fullName, email, password, phone } = req.body;

    if (
        await DBService.findOne({
            model: UserModel,
            filter: { email },
        })
    ) {
        return next(new Error("Email Exist", { cause: 409 }));
    }
    const hashedPassword = await generateHash({ plaintext: password });
    const encPhone = await generateEncryption({ plaintext: phone });

    const otp = customAlphabet(`0123456789`, 6)();
    const confirmEmailOtp = await generateHash({plaintext:otp})

    const user = await DBService.create({
        model: UserModel,
        data: [{ fullName, email, password: hashedPassword, phone: encPhone  , confirmEmailOtp}],
    });

    emailEvent.emit("confirmEmail", { to: email, otp: otp });
    return successResponse({ res, data: { user }, status: 201 });
});


export const confirmEmail = asyncHandler(async (req, res, next) => {
    const {  email , otp} = req.body;
    const user = await DBService.findOne({
      model:UserModel,
      filter:{
        email,
        confirmEmail:{$exists: false},
        confirmEmailOtp:{$exists: true}
      }
    })
    if (!user) {
      return next(new Error("IN-valid account or already verified" , {cause:404}))
    }
    if (!await compareHash({plaintext:otp , hashValue:user.confirmEmailOtp})) {
      return next(new Error("IN-valid otp" , {cause:400}))
    }
    const updatedUser = await DBService.updateOne({
      model:UserModel,
      filter:{email},
      data:{
        $set:{confirmEmail: Date.now()},
        $unset:{confirmEmailOtp: 1},
        $inc:{__v: 1}
      }
    })

    return updatedUser.matchedCount ? successResponse({ res, data: { user:updatedUser }, status: 200 }):next (new Error("Fail to confirm user email" , {cause:400}))
});

export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    // console.log({ email , password });
    const user = await DBService.findOne({
        model: UserModel,
        filter: { email, provider: providerEnum.system },
    });
    if (!user) {
        return next(new Error("Not Found", { cause: 404 }));
    }

    if (!user.confirmEmail) {
      return next(new Error("Please verify your account"))
    }
    if (user.deletedAt) {
      return next(new Error("this account is deleted"))
    }
    const match = compareHash({
        plaintext: password,
        hashValue: user.password,
    });
    if (!match) {
        return next(new Error("Not Found", { cause: 404 }));
    }

    const credential = await generateLoginCredential({ user });

    return successResponse({ res, status: 200, data: { credential } });
});

async function verifyGoogleAccount({ idToken } = {}) {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.WEB_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
}

export const signupWithGmail = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body;

    const { picture, name, email, email_verified } = await verifyGoogleAccount({
        idToken,
    });
    if (!email_verified) {
        return next(new Error("not verified account", { cause: 400 }));
    }

    const user = await DBService.findOne({
        model: UserModel,
        filter: { email },
    });

    if (user) {
        if (user.provider === providerEnum.google) {
            const credential = await generateLoginCredential({ user });
            return successResponse({ res, data: { credential }, status: 200 });
        }
        return next(new Error("Email Exist", { cause: 409 }));
    }

    const newUser = await DBService.create({
        model: UserModel,
        data: [
            {
                fullName: name,
                email,
                picture,
                confirmEmail: Data.now(),
                provider: providerEnum.google,
            },
        ],
    });
    const credential = await generateLoginCredential({ user: newUser });
    return successResponse({ res, data: { credential }, status: 201 });
});

export const loginWithGmail = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body;

    const { email, email_verified } = await verifyGoogleAccount({ idToken });
    if (!email_verified) {
        return next(new Error("not verified account", { cause: 400 }));
    }

    const user = await DBService.findOne({
        model: UserModel,
        filter: { email, provider: providerEnum.google },
    });

    if (!user) {
        return next(
            new Error("In-valid Login data or provider", { cause: 404 })
        );
    }

    const credential = await generateLoginCredential({ user });
    return successResponse({ res, data: { credential }, status: 200 });
});



export const sendForgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const otp = customAlphabet("0123456789",6)()

    const user = await DBService.findOneAndUpdate({
            model: UserModel,
            filter:
            {
              email,
              confirmEmail:{$exists:true},
              deletedAt:{$exists:false},
              provider: providerEnum.system
            },
            data:{
              forgotPasswordOtp: await generateHash({plaintext:otp})
            }
        })
        if (!user) {
          return next(new Error("In-valid account", { cause: 404 }));
        }
        emailEvent.emit("SendForgotPassword", { to: email,subject:"Forgot Password", title:"Reset Password", otp: otp });
    return successResponse({ res });
});


export const verifyForgotPassword = asyncHandler(async (req, res, next) => {
    const { email , otp} = req.body;

    const user = await DBService.findOne({
            model: UserModel,
            filter:
            {
              email,
              confirmEmail:{$exists:true},
              forgotPasswordOtp:{$exists:true},
              deletedAt:{$exists:false},
              provider: providerEnum.system
            },
        })
        if (!user) {
          return next(new Error("In-valid account", { cause: 404 }));
        }
        if (! await compareHash({plaintext:otp , hashValue:user.forgotPasswordOtp})) {
          return next(new Error("In-valid otp", { cause: 400 }));
        }
    return successResponse({ res });
});


export const resetForgotPassword = asyncHandler(async (req, res, next) => {
    const { email , otp , password } = req.body;

    const user = await DBService.findOne({
            model: UserModel,
            filter:
            {
              email,
              confirmEmail:{$exists:true},
              forgotPasswordOtp:{$exists:true},
              deletedAt:{$exists:false},
              provider: providerEnum.system
            },
        })
        if (!user) {
          return next(new Error("In-valid account", { cause: 404 }));
        }
        if (! await compareHash({plaintext:otp , hashValue:user.forgotPasswordOtp})) {
          return next(new Error("In-valid otp", { cause: 400 }));
        }

        await DBService.updateOne({
          model:UserModel,
          filter:{
            email
          },
          data:{
            password  : await generateHash({plaintext:password}),
            changeCredentialsTime : new Date(),
            $unset:{
              forgotPasswordOtp:1
            }
          }
        })
    return successResponse({ res });
});





