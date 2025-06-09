// Production Environment Diagnostics
// Add this temporarily to your index.ts or create an endpoint to check production env

import { Request, Response } from 'express';

// Add this as a temporary route in your Express app for debugging
export const checkProductionEmail = (req: Request, res: Response) => {
  console.log('🔍 Production Email Environment Check:');
  
  const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE,
    user: process.env.EMAIL_USER,
    passLength: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
    passSet: !!process.env.EMAIL_PASS,
    nodeEnv: process.env.NODE_ENV
  };
  
  console.log('Email Config:', emailConfig);
  
  // Check if all required vars are set
  const missingVars = [];
  if (!process.env.EMAIL_HOST) missingVars.push('EMAIL_HOST');
  if (!process.env.EMAIL_USER) missingVars.push('EMAIL_USER');
  if (!process.env.EMAIL_PASS) missingVars.push('EMAIL_PASS');
  
  const status = {
    configured: missingVars.length === 0,
    missingVariables: missingVars,
    emailConfig,
    environment: process.env.NODE_ENV || 'development'
  };
  
  console.log('Production Email Status:', status);
  
  res.json({
    success: true,
    emailServiceStatus: status,
    message: missingVars.length === 0 
      ? 'All email environment variables are set' 
      : `Missing variables: ${missingVars.join(', ')}`
  });
};
