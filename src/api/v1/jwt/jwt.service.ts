import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtService {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly jwtExpiration = '720h'; // Set your expiration time, e.g., 1 month

  constructor(private configService: ConfigService) {
    // Use the ConfigService to load keys
    this.privateKey = this.configService.get<string>('JWT_SECRET');  // Load from .env
    this.publicKey = this.configService.get<string>('JWT_PUBLIC');
    // Load from .env
  }

  // Generate JWT Token
  generateToken(payload: any) {
    if (!this.privateKey) {
      throw new Error('Private key is not provided');
    }
    return jwt.sign(payload, this.privateKey, { algorithm: 'RS256', expiresIn: this.jwtExpiration });
  }

  // Verify JWT Token
  verifyToken(token: string) {
    if (!this.publicKey) {
      throw new Error('Public key is not provided');
    }
    try {
      return jwt.verify(token, this.publicKey, { algorithms: ['RS256'] });
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
  
  decodeToken(token: string) {
    try {
      return jwt.decode(token);
    } catch (error) {
      throw new Error('Error decoding token');
    }
  }


}

