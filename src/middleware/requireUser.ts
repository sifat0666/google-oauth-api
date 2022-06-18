import { Request, Response, NextFunction } from "express";

const requireUser = (req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;
  console.log('userl', user)

  if (!user) {
    return res.status(403).send('forbiden')
  }

  return next();
};

export default requireUser;