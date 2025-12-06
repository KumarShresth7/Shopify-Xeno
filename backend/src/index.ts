import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startSyncScheduler } from './services/syncScheduler.js';

const app = express();
const PORT = process.env.PORT || 4000;
app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    })
);
app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: true }));
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.use('/api', routes);
app.use(errorHandler);
const startServer = () => {
    app.listen(PORT, () => {
        console.log('');
        console.log('🚀 ==============================================');
        console.log(`🚀  Xeno Shopify Backend Server Started`);
        console.log('🚀 ==============================================');
        console.log(`📊  Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🌐  Server URL: http://localhost:${PORT}`);
        console.log(`🔗  API Endpoint: http://localhost:${PORT}/api`);
        console.log(`💚  Health Check: http://localhost:${PORT}/health`);
        console.log('🚀 ==============================================');
        console.log('');

        startSyncScheduler();
    });
};
startServer();