import jwt from "jsonwebtoken"
import * as DBService from '../DB/db.service.js';
import { asyncHandler } from "../utils/response.js";
import { UserModel } from "../DB/models/User.model.js";
import { decodedToken, getSignature, tokenTypeEnum, verifyToken } from "../utils/security/token.security.js";


export const authentication = ({tokenType = tokenTypeEnum.access} = {})=>{
  return asyncHandler(async (req ,res ,next)=>{
    const {user , decoded} = await decodedToken({next , authorization:req.headers.authorization , tokenType}) ||{}
    req.user = user
    req.decoded = decoded
    return next()
  })
}




export const authorization = ({accessRoles = []} = {})=>{
  return asyncHandler(async (req ,res ,next)=>{
    // console.log({accessRoles , currentRole: req.user.role , match: accessRoles.includes(req.user.role)});
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Not authorized account", {cause:403}))
    }
    
    return next()
  })
}





export const auth = ({tokenType = tokenTypeEnum.access , accessRoles = []} = {})=>{
  return asyncHandler(async (req ,res ,next)=>{
    const {user , decoded} = await decodedToken({next , authorization:req.headers.authorization , tokenType}) ||{}
    req.user = user
    req.decoded = decoded
    // console.log({accessRoles , currentRole: req.user.role , match: accessRoles.includes(req.user.role)});
    if (!accessRoles.includes(req.user.role)) {
      return next(new Error("Not authorized account", {cause:403}))
    }
    
    return next()
  })
}