import { Request, Response, NextFunction } from 'express';

export const LoggerFnMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const now = Date.now();
  console.log('Middleware Fn', req.url);
  next();
  console.log('Middleware Fn', Date.now() - now);
};
