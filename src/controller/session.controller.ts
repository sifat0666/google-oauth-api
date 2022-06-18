import { Request, Response } from "express";
import { createSession, findSession, updateSession } from "../service/session.service";
import { findAndUpdateUser, getGoogleOAuthTokens, getGoogleUser, validatePassword } from "../service/user.service";
// import { signJwt } from "../utils/jwt.utils";
import config from 'config'
import { decode, sign } from "jsonwebtoken";
import user from './../utils/deserializedUser'
import { signJwt } from "../utils/jwt.utils";


export async function createUserSessionHandler(req: Request, res: Response){

    //validate the users password
    const user = await validatePassword(req.body)



    if(!user){
        return res.status(401).send('invalid email or password')
    }

    //create a session
    const session = await createSession(user._id, req.get("user-agent") || "")

    console.log(session._id)
//  console.log("tokenTtls" , config.get('refrestTokenTtl'))
    
    const accessToken = sign(
      {...user, session: session._id}, 
      config.get('ats'), 
      {expiresIn: config.get<string>('accessTokenTtl')}
      )


    const refreshToken = sign (
      {...user, session: session._id}, 
      config.get('rts'), 
      // {expiresIn: config.get<string>('refreshTokenTtl')}
      {expiresIn: '1y'}
      )
  // const accessToken = signJwt(
  //   { ...user, session: session._id },
  //   config.get('rts'),
  //   { expiresIn: config.get("accessTokenTtl") } // 15 minutes,
  // );

  // // create a refresh token
  // const refreshToken = signJwt(
  //   { ...user, session: session._id },
  //   config.get('rts'),
  //   { expiresIn: config.get("refreshTokenTtl") } // 15 minutes
  // );
    res.cookie("accessToken", accessToken, {
    maxAge: 1000*60*60,
    httpOnly: true,
    domain: "localhost",
    path: '/',
    sameSite: 'strict',
    secure: false
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000*60*60*24*365,
    httpOnly: true,
    domain: 'localhost',
    path: '/',
    sameSite: 'strict',
    secure: false
  });



    //return access and refresh tokem
    return res.send({accessToken, refreshToken})

}

export async function getUserSessionHandler(req: Request, res: Response){

  
    const userId = res.locals.user._id


    const sessions = await findSession({user: userId, valid: true})


   res.send(sessions)
    
}


export async function deleteSessionHandler(req: Request, res: Response) {
  
  const data = res.locals.user

  // console.log('data ', data.session)

  await updateSession({ _id: data.session }, { valid: false });

  return res.send({
    accessToken: null,
    refreshToken: null,
  });
}

export async function googleOauthHandler(req:Request, res:Response){
  try{//get query from qs
  const code = req.query.code as string

  const {id_token, access_token} = await getGoogleOAuthTokens({code})
  // console.log({id_token,access_token})
  //get id and access token from code
  const googleUser = await getGoogleUser({ id_token, access_token });

  console.log({googleUser})

  if(!googleUser){
    res.status(403).send('google account not verified')
  }

  // upsert the user
  const user = await findAndUpdateUser(
      {
        email: googleUser.email,
      },
      {
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
      {
        upsert: true,
        new: true,
      }
    );

  //create session
  const session = await createSession(user._id, req.get("user-agent") || "")

    console.log(session._id)
//  console.log("tokenTtls" , config.get('refrestTokenTtl'))
    
    const accessToken = sign(
      {...user, session: session._id}, 
      config.get('ats'), 
      {expiresIn: config.get<string>('accessTokenTtl')}
      )


    const refreshToken = sign (
      {...user, session: session._id}, 
      config.get('rts'), 
      // {expiresIn: config.get<string>('refreshTokenTtl')}
      {expiresIn: '1y'}
      )


  //set cookie

      res.cookie("accessToken", accessToken, {
    maxAge: 1000*60*60,
    httpOnly: true,
    domain: "localhost",
    path: '/',
    sameSite: 'strict',
    secure: false
  });

  res.cookie("refreshToken", refreshToken, {
    maxAge: 1000*60*60*24*365,
    httpOnly: true,
    domain: 'localhost',
    path: '/',
    sameSite: 'strict',
    secure: false
  });

  res.redirect(config.get('origin'))


  }catch(e: any){
    console.log(e.response.data.error)
    return res.redirect(`${config.get('origin')}/oauth/error`)
  }
}
