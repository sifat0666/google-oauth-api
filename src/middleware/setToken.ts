import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import config from 'config'
import { findUser } from "../service/user.service";

const setToken =  (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies["refreshToken"];
    const accessToken = req.cookies["accessToken"];
    if (!refreshToken && !accessToken) {
      return next();
    }

    try {
      const data = verify(accessToken, config.get('ats')) as any;
    //   req.userId = data.userId;
      return next();
    } catch {}

    if (!refreshToken) {
      return next();
    }

    let data;

    try {
      data = verify(refreshToken, config.get('ats')) as any;
    } catch {
      return next();
    }

    const user = await findUser({_id: data._id})
    // token has been invalidated
    if (!user || user.count !== data.count) {
      return next();
    }

    const tokens = createTokens(user);

    res.cookie("refresh-token", tokens.refreshToken);
    res.cookie("access-token", tokens.accessToken);
    req.userId = user.id;

    next();
  });
