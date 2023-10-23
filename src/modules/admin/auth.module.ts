import {Module} from '@nestjs/common';
import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {PassportModule} from '@nestjs/passport';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './jwt.strategy';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Admin, User} from '../../database/entities';
import {UsersService} from './user.service';
import {MailService} from "../mail/mail.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([Admin, User]),
        PassportModule,
        JwtModule.register({
            secret: process.env.SECRET_KEY || 'abcxyz',
            // signOptions: { expiresIn: 24 * 60 * 60 },
        }),
    ],
    providers: [AuthService, JwtStrategy, UsersService, MailService],
    controllers: [AuthController],
})
export class AuthModule {
}
