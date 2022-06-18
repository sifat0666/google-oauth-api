import { get } from "lodash";
import { Request, Response, NextFunction } from "express";
// import { verifyJwt } from "../utils/jwt.utils";
import { reIssueAccessToken } from "../service/session.service";
import { verify } from "jsonwebtoken";
import config from 'config'
import { isTokenExpired } from "../utils/isTokenExpired";
import { verifyJwt } from "../utils/jwt.utils";

const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const {cookies} = req
    
    const accessToken = cookies.accessToken
    const refreshToken = cookies.refreshToken

  if (!accessToken) {

    res.status(403).send('not authorized')

    return next();
  }
  const { decoded, expired } = verifyJwt(accessToken, config.get('ats'));


  if (decoded) {
    res.locals.user = decoded;
    return next();
  }

    // const expired = isTokenExpired(accessToken)

  if (expired && refreshToken) {
    const newAccessToken = await reIssueAccessToken({ refreshToken });

    if (newAccessToken) {
      
        res?.cookie("accessToken", newAccessToken, {
            maxAge: 1000*60*60,
            httpOnly: true,
        })

    }

    const result = verifyJwt(accessToken, config.get('ats'));

    res.locals.user = result
    return next();
  }

  return next();
};

export default deserializeUser;