import jwt from 'jsonwebtoken';

const secret = process.env.VERDLEDGER_JWT_SECRET || 'change_me';

export const sign = (payload: string | object | Buffer) =>
  jwt.sign(payload, secret);

export const verify = <T extends object | string>(token: string) =>
  jwt.verify(token, secret) as T;
