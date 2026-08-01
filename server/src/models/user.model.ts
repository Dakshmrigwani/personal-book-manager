import type { IUser, PaginatedModel } from '@/types';
import { hashPassword } from '@/utils/password-hash';
import { Schema, model } from 'mongoose';
import validator from 'validator';
import paginate from './plugins/paginate';
import toJSON from './plugins/toJSON';

const userSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      trim: true,
      required: true,
      private: true,
      minlength: 8,
      validate: {
        validator: (value: string) => /\d/.test(value) && /[a-zA-Z]/.test(value),
        message: 'Password must contain at least one letter and one number',
      },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

userSchema.plugin(paginate);
userSchema.plugin(toJSON);

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});

const User = model<IUser, PaginatedModel<IUser>>('User', userSchema);
export default User;
