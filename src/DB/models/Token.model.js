import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
  jti: { 
    type: String, 
    required: true, 
    unique: true,
    sparse: true
  },
  expiresIn: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true,
})


tokenSchema.index({ jti: 1, userId: 1 }, { unique: true, sparse: true });

export const TokenModel = mongoose.models.Token || mongoose.model("Token", tokenSchema);

