import { asyncHandler, successResponse } from "../../utils/response.js";
import * as DBService from "../../DB/db.service.js";
import { roleEnum, UserModel } from "../../DB/models/User.model.js";
import { decryptEncryption, generateEncryption } from "../../utils/security/encryption.security.js";
import jwt from "jsonwebtoken";
import {
  createRevokeToken,
    generateLoginCredential,
    generateToken,
    getSignature,
    logoutEnum,
    signatureLevelEnum,
} from "../../utils/security/token.security.js";
import { confirmEmail } from "../auth/auth.service.js";
import { compareHash, generateHash } from "../../utils/security/hash.security.js";
import { TokenModel } from "../../DB/models/Token.model.js";



export const logout = asyncHandler(async (req, res, next) => {
  
  const {flag} = req.body
  let status = 200
  switch (flag) {
    case logoutEnum.signoutFromAll:
      await DBService.updateOne({
        model:UserModel,
        filter:{
          _id : req.decoded._id
        },
        data:{
          changeCredentialsTime:Date.now()
        }
      })
      break;
  
    default:
      await createRevokeToken({req})
  status = 201
      break;
  }
  
    return successResponse({ res,status ,data: { } });
});


export const profile = asyncHandler(async (req, res, next) => {
    req.user.phone = await decryptEncryption({ cipherText: req.user.phone });
    return successResponse({ res, data: { user: req.user } });
});

export const profileImage = asyncHandler(async (req, res, next) => {
  const user = await DBService.findOneAndUpdate({
    model:UserModel,
    filter:{
      _id:req.user._id
    },
    data:{
      picture:req.file.finalPath
    }
  })
    return successResponse({ res, data: { user} });
});

export const shareProfile = asyncHandler(async (req, res, next) => {
  const {userId} = req.params 
  const user = await DBService.findOne({
    model:UserModel,
    filter:{
      _id:userId,
      confirmEmail:{$exists:true}
    }
  })
    return user? successResponse({ res, data: { user } }):next(new Error("In-valid account", {cause:404}))
});



export const updateBasicInfo = asyncHandler(async (req, res, next) => {
  if (req.body.phone) {
    req.body.phone = await generateEncryption({plaintext:req.body.phone})
  }
  const user = await DBService.findOneAndUpdate({
    model:UserModel,
    filter:{
      _id:req.user._id,
    },
    data:req.body

  })
    return user? successResponse({ res, data: { user } }):next(new Error("In-valid account", {cause:404}))
});


export const updatePassword = asyncHandler(async (req, res, next) => {
  const {oldPassword , password ,flag} = req.body;
  if (! await compareHash({plaintext:oldPassword , hashValue:req.user.password})) {
    return next(new Error("In-valid old password"))
  }

  if (req.user.oldPasswords?.length) {
    for (const hashPassword of req.user.oldPasswords) {
      if ( await compareHash({plaintext:password , hashValue:hashPassword})) {
    return next(new Error("this password is used before"))
  }
    }
  }
  let updatedData = {}
  switch (flag) {
    case logoutEnum.signoutFromAll:
      updatedData.changeCredentialsTime = new Date()
    case logoutEnum.signout:
      await createRevokeToken({req})
      status = 201
      break;
  
    default:

      break;
  }
  const user = await DBService.findOneAndUpdate({
    model:UserModel,
    filter:{
      _id:req.user._id,
    },
    data:{
      password: await generateHash({plaintext:password}),
      ...updatedData,
      $push: {oldPasswords : req.user.password}
    }

  })
    return user? successResponse({ res, data: { user } }):next(new Error("In-valid account", {cause:404}))
});



export const freezeAccount = asyncHandler(async (req, res, next) => {
  const {userId} = req.params
  if (userId && req.user.role !== roleEnum.admin) {
    return next(new Error("Not authorized account", {cause:403}))
  }
  const user = await DBService.findOneAndUpdate({
    model:UserModel,
    filter:{
      _id:userId || req.user._id,
      deletedAt: {$exists: false}
    },
    data:{
      deletedAt: Date.now(),
      deletedBy: req.user._id,
      changeCredentialsTime : new Date(),
      $unset:{
        restoredAt:1,
        restoredBy:1
      }
    }

  })
    return user? successResponse({ res, data: { user } }):next(new Error("In-valid account", {cause:404}))
});



export const restoreAccount = asyncHandler(async (req, res, next) => {
  const {userId} = req.params
  
  const user = await DBService.findOneAndUpdate({
    model:UserModel,
    filter:{
      _id:userId ,
      deletedAt: {$exists: true},
      deletedBy: {$ne: userId}
    },
    data:{
      $unset:{
        deletedAt:1,
        deletedBy:1
      },
      restoredAt:Date.now(),
      restoredBy: req.user._id
    }

  })
    return user? successResponse({ res, data: { user } }):next(new Error("In-valid account", {cause:404}))
});


export const deleteAccount = asyncHandler(async (req, res, next) => {
  const {userId} = req.params
  
  const user = await DBService.deleteOne({
    model:UserModel,
    filter:{
      _id:userId ,
      deletedAt: {$exists: true},
    },
  })
    return user.deletedCount? successResponse({ res, data: { user } }):next(new Error("In-valid account", {cause:404}))
});



export const getNewLoginCredential = asyncHandler(async (req, res, next) => {
    const credential = await generateLoginCredential({ user: req.user });
    return successResponse({ res, data: { credential } });
});
