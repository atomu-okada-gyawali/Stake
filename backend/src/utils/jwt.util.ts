import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "replace-with-a-secure-secret";
const JWT_EXPIRES_IN = "1h";

export interface JwtPayload {
  sub: string;
  email: string;
}

export function signJwt(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyJwt(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
