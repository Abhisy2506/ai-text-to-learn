import { auth } from 'express-oauth2-jwt-bearer';
import { User } from '../models/user.model.js';
import { ApiError } from '../utils/ApiError.js';
import dotenv from 'dotenv';

dotenv.config();

export const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
  tokenSigningAlg: 'RS256',
});

export const attachUser = async (req, res, next) => {
  try {
    const auth0Id = req.auth?.payload?.sub;

    if (!auth0Id) {
      throw new ApiError(401, 'Unauthorized: Invalid token payload');
    }

    let user = await User.findOne({ auth0Id });


    if (!user) {
      const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`] || `${auth0Id}@auth0.placeholder`;
      user = await User.create({
        auth0Id,
        email,
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};