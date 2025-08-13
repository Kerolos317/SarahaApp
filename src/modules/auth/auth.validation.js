import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const login = 
    joi.object().keys({
        email:generalFields.email.required(),
        password:generalFields.password.required(),
    })
    .options({ allowUnknown: false });
    
    export const signup = {
      body: 
            joi.object().keys({
                fullName:generalFields.fullName.required(),
                email:generalFields.email.required(),
                password:generalFields.password.required(),
                confirmPassword:generalFields.confirmPassword.required(),
                phone:generalFields.phone.required(),
            })
            .options({ allowUnknown: false }),
            

    query: joi.object().keys({
      lang: joi.string().valid("ar" , "en")
    }).required()
};



export const verifyForgotPassword = {
  body: joi.object().keys({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
  }).required()
}


export const resetForgotPassword = {
  body: joi.object().keys({
    email: generalFields.email.required(),
    otp: generalFields.otp.required(),
    password: generalFields.password.required(),
    confirmPassword: generalFields.confirmPassword.required(),
  }).required()
}


export const sendForgotPassword = {
  body: joi.object().keys({
    email: generalFields.email.required(),
  }).required()
}


