import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../config';

export function configureMiddleware(app: express.Application) {
  // Security headers
  app.use(helmet());

  // CORS
  app.use(cors({
    origin: config.cors.origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Slug'],
  }));

  // Compression
  app.use(compression());

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookies
  app.use(cookieParser());

  // Global rate limiter
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 200,
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  // Trust proxy for rate limiting
  app.set('trust proxy', 1);
}

// Stricter rate limit for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// API rate limit
export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: 'Rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
});
