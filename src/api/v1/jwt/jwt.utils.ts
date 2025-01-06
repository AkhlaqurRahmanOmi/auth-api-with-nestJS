import * as jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtUtils {
  private readonly jwtSecret = process.env.JWT_SECRET;

  // Generate JWT Token
  generateToken(payload: any): string {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '1h' });
  }

  // Verify JWT Token
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret);
    } catch (e) {
      return null;
    }
  }
}