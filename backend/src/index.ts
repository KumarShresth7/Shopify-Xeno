import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { startSyncScheduler } from './services/syncScheduler.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    })
);

// --- MODIFIED SECTION START ---
// Body parsing with Raw Body for Webhooks
app.use(express.json({
    verify: (req: any, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: true }));
// --- MODIFIED SECTION END ---

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

// Start server
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

        // Start automated sync scheduler
        startSyncScheduler();
    });
};

startServer();