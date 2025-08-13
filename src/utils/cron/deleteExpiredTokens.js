import cron from 'node-cron';
import * as DBservice from '../../DB/db.service.js';
import { TokenModel } from '../../DB/models/Token.model.js';

export const deleteExpiredTokens = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            const currentTime = Date.now();
            
            const result = await DBservice.deleteMany({
                model: TokenModel,
                filter: {
                    expiresIn: { $lt: currentTime }
                }
            });

            console.log(`Cron Job: Deleted ${result.deletedCount} expired tokens at ${new Date().toISOString()}`);
        } catch (error) {
            console.error('Cron Job Error - Delete Expired Tokens:', error);
        }
    }, {
        scheduled: true,
        timezone: "Africa/Cairo"
    });
};
