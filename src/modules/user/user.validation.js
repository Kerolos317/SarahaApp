import joi from 'joi'
import { Types } from 'mongoose'
import { generalFields } from '../../middleware/validation.middleware.js'
import { logoutEnum } from '../../utils/security/token.security.js'


export const logout = {
  body: joi.object().keys({
    flag: joi.string().valid(...Object.values(logoutEnum)).default(logoutEnum.stayLoggedIn),
  })
}

export const shareProfile = {
  params: joi.object().keys({
    userId: generalFields.id.required()
  })}

export const updateBasicInfo = {
  body: joi.object().keys({
    fullname: generalFields.fullName,
    phone: generalFields.phone,
    gender: generalFields.gender
  }).required()
}



export const updatePassword = {
  body: logout.body.append({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref('oldPassword')).required(),
    confirmPassword: generalFields.confirmPassword.required()
  }).required()
}


export const freezeAccount = {
  params: joi.object().keys({
    userId:generalFields.id
  })
}


export const deleteAccount = {
  params: joi.object().keys({
    userId:generalFields.id.required()
  })
}


export const restoreAccount = {
  params: joi.object().keys({
    userId:generalFields.id.required()
  })
}