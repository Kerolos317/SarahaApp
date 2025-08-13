import path from "node:path"
import * as dotenv from "dotenv"
// dotenv.config({path:path.join('./src/config/.env.dev')})
dotenv.config({})

import cors from 'cors'
import express from 'express';
import authController from './modules/auth/auth.controller.js';
import userController from './modules/user/user.controller.js';
import messageController from './modules/message/message.controller.js';
import connectDB from './DB/connection.db.js';
import { globalErrorHandling } from './utils/response.js';
import { startCronJobs } from './utils/cron/index.js';

const bootstrap = async () =>{
  const app = express();
  const port = process.env.PORT;
  app.use(cors())
  await connectDB()
  startCronJobs()

  app.use("/uploads" , express.static(path.resolve('./src/uploads')))

  app.use(express.json())
  app.get("/", (req, res) => res.send("Welcome Blog app "));
  app.use("/auth" , authController)
  app.use("/user" , userController)
  app.use("/message" , messageController)

  app.all('{/*dummy}' , (req ,res) =>{
    res.json({message : "In-valid route"})
  })

  app.use(globalErrorHandling)


  app.listen(port, () => console.log(`Server app listening on port ${port}🚀`));
}
export default bootstrap