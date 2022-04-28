import { User } from '../entities/User';
import { DataSource } from 'typeorm';
import { Post } from '../entities/Post';
import mongoose from 'mongoose';
export const connectDB = async () => {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.USER_NAME,
    password: process.env.PASSWD,
    database: 'reddit',
    synchronize: true,
    logging: false,
    entities: [User, Post],
  });
  AppDataSource.initialize()
    .then(() => {
      console.log('DB connection successfully!');
    })
    .catch((error) => console.log(`DB connect failly! Error: ${error}`));
};

export const connectMongoDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}`, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log('mongoDB connect successfully!');
  } catch (error) {
    console.log(`mongoose connect error: ${error.message}`);
  }
};
