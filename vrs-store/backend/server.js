'use strict';
require('dotenv').config();

const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression= require('compression');
const sanitize   = require('express-mongo-sanitize');
const hpp        = require('hpp');
const path       = require('path');

const { globalRateLimiter } = require('./middleware/security');
const { globalErrorHandler, notFound } = require('./middleware/errorHandler');
const authRoutes    = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes   = require('./routes/orderRoutes');
const adminRoutes   = require('./routes/adminRoutes');
const logger        = require('./utils/logger');

const app  = express();
const PORT = process.env.PORT || 5000;

/* ──────────────────────────────────────
   Security Middleware Stack
────────────────────────────────────── */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'cdnjs.cloudflare.com', 'fonts.googleapis.com'],
      scriptSrc:  ["'self'"],
      fontSrc:    ["'self'", 'cdnjs.cloudflare.com', 'fonts.gstatic.com'],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:3000').split(','),
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.use(globalRateLimiter);   // Global rate limit
app.use(sanitize());           // NoSQL injection prevention
app.use(hpp());                // HTTP param pollution prevention
app.use(compression());        // Gzip
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

/* ──────────────────────────────────────
   API Routes
────────────────────────────────────── */
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* ──────────────────────────────────────
   Serve Frontend in Production
────────────────────────────────────── */
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  });
}

/* ──────────────────────────────────────
   Error Handling (must be last)
────────────────────────────────────── */
app.use(notFound);
app.use(globalErrorHandler);

/* ──────────────────────────────────────
   MongoDB + Server Start
────────────────────────────────────── */
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });
    logger.info('✅ MongoDB connected');

    const server = app.listen(PORT, () =>
      logger.info(`🚀 VRS STORE API running on port ${PORT} [${process.env.NODE_ENV}]`)
    );

    /* Graceful shutdown */
    const shutdown = (signal) => {
      logger.info(`${signal} received — shutting down gracefully`);
      server.close(async () => {
        await mongoose.connection.close();
        logger.info('💤 Server closed');
        process.exit(0);
      });
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT',  () => shutdown('SIGINT'));

  } catch (err) {
    logger.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
}

mongoose.connection.on('disconnected', () => logger.warn('⚠️ MongoDB disconnected'));
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  process.exit(1);
});

start();
