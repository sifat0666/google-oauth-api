import jwt, { sign, verify } from "jsonwebtoken";
import config from "config";

export function signJwt(
  object: Object,
  keyName: string,
  options?: jwt.SignOptions | undefined
) {


  return sign(object, keyName, {
    ...(options && options)
  });
}

export function verifyJwt(token: string, key :string) {
  // try {
  //   const decoded = jwt.verify(token, key);
  //   return { decoded, expired: false };
  // } catch (error: any) {
  //   return { decoded: null, expired: true };
  // }

   const decoded = verify(token, key, function(err, decoded){
    if(decoded){
      return {decoded, expired: false, valid: true}
    }
    if(err){
      console.log('firspit')
      return({decoded: null, expired: true, valid: false})
    }
    return({decoded: null, expired: true, valid: false})
  })

  return decoded

}