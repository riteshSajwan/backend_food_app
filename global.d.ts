import {AuthPayload } from '../dto'

declare namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string; 
    }
  }
  
  // declare global {
  //   namespace Express {
  //     interface Request {
  //       user?: AuthPayload; 
  //     }
  //   }
  // }
  
  export {};