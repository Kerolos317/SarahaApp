import { deleteExpiredTokens } from "./deleteExpiredTokens.js";

export const startCronJobs = () => {
    deleteExpiredTokens();
    console.log("Cron jobs started successfully");
};
