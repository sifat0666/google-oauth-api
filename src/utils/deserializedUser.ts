import {Request, Response} from 'express'
import config from 'config'
import { verify } from 'jsonwebtoken'
import log from './logger'
import { isTokenExpired } from './isTokenExpired'
import { findUser } from '../service/user.service'
import SessionModel from '../model/session.model'
import { get } from 'lodash'

//retun type
// data  {
//   _id: '62972e9af9cf734102deb6af',
//   email: 'test@example.com',
//   name: 'Jane Doe',
//   createdAt: '2022-06-01T09:17:14.869Z',
//   updatedAt: '2022-06-01T09:17:14.869Z',
//   __v: 0,
//   session: {
//     user: '62972e9af9cf734102deb6af',
//     valid: true,
//     userAgent: 'PostmanRuntime/7.29.0',
//     _id: '62a4cfa3934d176470f592bd',
//     createdAt: '2022-06-11T17:23:47.983Z',
//     updatedAt: '2022-06-11T17:23:47.983Z',
//     __v: 0
//   },
//   iat: 1654968228,
//   exp: 1656264228
// }



export default async function user (req: Request, res?: Response){
    const {cookies} = req
    
    const accessToken = cookies.accessToken
    const refreshToken = cookies.refreshToken

    if(!accessToken) return log.error('access token not found')

    const decoded = verify(accessToken, config.get('ats')) 

    const expired = isTokenExpired(accessToken)

    if(expired && refreshToken ){
        if (!decoded || !get(decoded, "session")) return false;

        const session = await SessionModel.findById(get(decoded, "session"));

        if (!session || !session.valid) return false;

        const user = await findUser({ _id: session.user });

        // if (!user) return false;

    }




    return decoded

}