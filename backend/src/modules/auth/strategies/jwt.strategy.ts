import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../../database/schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'rafeeq_super_secret_jwt_key_2026',
    });
  }

  async validate(payload: { sub: string; name: string; roles: string[] }) {
    const user = await this.userModel.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive or not found.');
    }
    return {
      userId: user._id.toString(),
      name: user.name,
      roles: user.roles,
    };
  }
}
