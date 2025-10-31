import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private usersService: UsersService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error('Missing JWT_SECRET in environment');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        // Validasi user exists
        const user = await this.usersService.findOne(payload.sub);

        if (!user) {
            throw new UnauthorizedException('Invalid token or user not found');
        }

        // Return the user information (exclude password) so guards and decorators
        // can read `request.user.role` populated by Passport.
        const { password, ...rest } = user as any;
        return {
            id: user.id,
            email: user.email,
            role: (user as any).role,
            ...rest,
        };
    }
}