import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

// A simple test route
router.get('/ping', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Debug pong!' });
});

export default router;
