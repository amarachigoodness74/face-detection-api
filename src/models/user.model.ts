import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
import config from "config";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  entries: number;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    entries: { type: Number, default: 0 },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Hash the password before saving
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(
      config.get("dbConfig.saltWorkFactor") as number
    );

    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Add a method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Create and export the User model
const User = mongoose.model<IUser>("User", UserSchema);

export default User;
