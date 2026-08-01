import readline from 'node:readline';
import mongoose from 'mongoose';
import { env } from '../src/config';
import User from '../src/models/user.model';
import type { IUser } from '../src/types';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const adminDetails: Partial<IUser> = {
  name: 'Admin',
  role: 'admin',
};

async function createOrReplaceAdmin() {
  try {
    await mongoose.connect(env.mongoose.url);
    console.log('Database connected');

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('Existing admin found. Removing the current admin...');
      await User.deleteOne({ role: 'admin' });
      console.log('Existing admin removed.');
    }

    await User.create(adminDetails);
    console.log('Admin user created successfully!');
  } catch (err) {
    console.error('Error seeding database: ', err);
  } finally {
    await mongoose.connection.close();
  }
}

async function askAdminCredentials() {
  rl.question('Enter admin email: ', (email) => {
    adminDetails.email = email;

    rl.question('Enter admin password: ', (password) => {
      adminDetails.password = password;

      createOrReplaceAdmin();
      rl.close();
    });
  });
}

askAdminCredentials();
