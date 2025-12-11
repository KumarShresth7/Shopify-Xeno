import { Request, Response, NextFunction } from 'express';
import { redisConnection } from '../config/redis';

interface AuthenticatedRequest extends Request {
    tenant?: {
        id: number;
    };
}

export const cacheMiddleware = (duration: number) => {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.tenant?.id) {
            return next();
        }

        const key = `cache:tenant:${req.tenant.id}:${req.originalUrl}`;

        try {
            const cachedData = await redisConnection.get(key);

            if (cachedData) {

                console.log(`Cache HIT: ${key}`);
                return res.json(JSON.parse(cachedData));
            }


            console.log(`Miss: ${key}`);

            const originalJson = res.json;


            res.json = (body) => {
                redisConnection.set(key, JSON.stringify(body), 'EX', duration).catch((err) => {
                    console.error('Redis Cache Set Error:', err);
                });
                return originalJson.call(res, body);
            };

            next();
        } catch (error) {
            console.error('Redis Middleware Error:', error);
            next();
        }
    };
};