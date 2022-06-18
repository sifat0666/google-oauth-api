import config from "config";
import { sign, verify } from "jsonwebtoken";
import { FilterQuery, UpdateQuery } from "mongoose";
import SessionModel, { SessionDocument } from "../model/session.model";
import { findUser } from "./user.service";
import {get} from 'lodash'
import { signJwt } from "../utils/jwt.utils";

export async function createSession(userId: string, userAgent: string){
    const session = await SessionModel.create({user: userId, userAgent})

    return session.toJSON()
}

export async function findSession(query: FilterQuery<SessionDocument>){
    return await SessionModel.find(query).lean()
}

export async function updateSession(
  query: FilterQuery<SessionDocument>,
  update: UpdateQuery<SessionDocument>
) {
  return SessionModel.updateOne(query, update);
}



export async function reIssueAccessToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const  decoded  = verify(refreshToken, config.get('rts'))

  // if (!decoded || !get(decoded, "session")) return false;

  const session = await SessionModel.findById(get(decoded, "session"));
  // console.log('firsa;sdljfasl;djft')
  if (!session || !session.valid) {
    console.log('session rreturns false')
    return false;
  }
    // console.log(session)

  const user = await findUser({ _id: session.user });
  // console.log(user)

  if (!user) return false;

  // const accessToken = signJwt(
  //   { ...user, session: session._id },
  //   config.get('ats'),
  //   { expiresIn: config.get("accessTokenTtl") } // 15 minutes,
  // );


      const accessToken = sign(
      {...user, session: session._id}, 
      config.get('ats'), 
      {expiresIn: config.get<string>('accessTokenTtl')}
      )


  return accessToken;
}

