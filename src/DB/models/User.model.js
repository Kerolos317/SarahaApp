import mongoose from "mongoose";

export let genderEnum = {male : "male" , female: "female"};
export let roleEnum = {user : "user" , admin: "admin"};
export let providerEnum = {system : "system" , google: "google"};

const userSchema = new mongoose.Schema({
  firstName : {type : String , required:true , minLength: 2,
    maxLength: [20 , "firstName max length is 20 char and you have entered {VALUE}"]
  },
  lastName : {type : String , required:true , minLength: 2,
    maxLength: [20 , "lastName max length is 20 char and you have entered {VALUE}"]
  },
  email: {type: String , required:true , unique:true},
  password: {type: String , required:function () {
    return this.provider === providerEnum.system ? true :false
  } },
  oldPasswords:[String],
  gender: {type: String ,
    enum:{values: Object.values(genderEnum), message:`gender only allow ${Object.values(genderEnum)}`},
    default: genderEnum.male
  },
  phone:{type:String ,require:function () {
    return this.provider === providerEnum.system ? true :false
  }},
  provider:{type:String , enum:Object.values(providerEnum) , default: providerEnum.system},
  confirmEmail:Date,
  confirmEmailOtp:String,
  forgotPasswordOtp:String,
  changeCredentialsTime:Date,
  deletedAt:Date,
  deletedBy:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
  restoredAt:Date,
  restoredBy:{type:mongoose.Schema.Types.ObjectId, ref:"User"},
  picture:String,
  role:{
    type:String,
    enum:Object.values(roleEnum),
    default: roleEnum.user
  }
}, {
  timestamps:true,
  toObject:{virtuals:true},
  toJSON:{virtuals:true}
})
userSchema.virtual("fullName").set(function (value) {
  const [firstName ,lastName] = value?.split(" ")|| [];
  this.set({firstName , lastName})
}).get(function() {
  return this.firstName + " "+this.lastName
})
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema);

