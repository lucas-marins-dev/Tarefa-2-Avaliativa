const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// OWASP Top 10 Security: Helmet covers secure headers
app.use(helmet());

// CORS configuration for local & production interoperability
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with 50kb limit to prevent payload flooding (DoS)
app.use(express.json({ limit: '50kb' }));

// OWASP Top 10: Rate limiter to prevent DDoS / Brute Force
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: { erro: 'Muitas requisições vindas deste IP, tente novamente mais tarde.' }
});
app.use('/api/', limiter);

// Swagger Auto-documentation route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes mounted at /api
app.use('/api', routes);

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;
