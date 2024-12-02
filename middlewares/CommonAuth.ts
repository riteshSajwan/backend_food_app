import { Request, RequestHandler, NextFunction, Response } from 'express'
import {AuthPayload } from '../dto'
import { ValidateSignature } from '../utility';

declare global {
    namespace Express{
        interface Request{
            user?: AuthPayload
        }
    }
}

export const Authenticate: RequestHandler = async (req, res, next) => {
  try {
    const signature = await ValidateSignature(req);
    // console.log("signature2",signature)
    if (signature) {
      next(); // Call next middleware or route handler
    } else {
      res.status(401).json({ message: "User Not Authorized" });
    }
  } catch (error:any) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};