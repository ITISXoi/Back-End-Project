import {
    Body,
    Controller,
    DefaultValuePipe,
    Get,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors
} from '@nestjs/common';
import {FileInterceptor} from "@nestjs/platform-express";
import {ApiOperation, ApiQuery, ApiResponse} from '@nestjs/swagger';
import {AuthService} from './auth.service';
import {Login} from './request/login.dto';
import {ResetPassword} from './request/reset-password.dto';
import {UpdatePassword} from './request/update-password.dto';
import {LoginResponse} from './response/login.dto';
import {EmptyObject} from '../../shared/response/emptyObject.dto';
import {LoginBase} from './response/loginBase.dto';
import {Causes} from '../../config/exception/causes';
import {EmptyObjectBase} from '../../shared/response/emptyObjectBase.dto';
import {JwtAuthGuard} from './jwt-auth.guard';
import {Register} from './request/register.dto';
import {RegisterResponse} from './response/register.dto';
import {RegisterBase} from './response/registerBase.dto';
import {TwoFactorAuthenticationService} from './twoFactorAuthentication.service';
import {UsersService} from './user.service';
import RequestWithUser from './requestWithUser.interface';
import {JwtService} from '@nestjs/jwt';
import {User} from '../../database/entities';
import {PaginationResponse} from 'src/config/rest/paginationResponse';
import {SendMailResetPassword} from './request/sendMailResetPassword.dto';
@Controller('user')
export class AuthController {
    constructor(
        private jwtService: JwtService,
        private readonly twoFactorAuthenticationService: TwoFactorAuthenticationService,
        private readonly usersService: UsersService,
        private authService: AuthService,
    ) {
    }

    @Post('/register')
    @ApiOperation({
        tags: ['auth'],
        operationId: 'register',
        summary: 'Register',
        description: 'Register a new user',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: RegisterBase,
    })
    async register(@Body() data: Register): Promise<RegisterResponse | EmptyObject> {

        const duplicatedUser = await this.authService.checkDuplicatedUser(data);
        if (duplicatedUser) {
            throw Causes.DUPLICATED_EMAIL_OR_USERNAME;
        }
        const user = await this.authService.registerUser(data);
        return user;
    }

    @Get('/active')
    @ApiOperation({
        tags: ['auth'],
        operationId: 'active',
        summary: 'active',
        description: 'Active a new user',
    })
    @ApiQuery({
        name: 'code',
        required: true,
        type: String,
    })
    async active(@Query('code') code: string, @Res() res) {
        if (!code) throw Causes.DATA_INVALID;

        const activeUser = await this.authService.activeUser(code);
        if (!activeUser) throw Causes.DATA_INVALID;

        res.setHeader('Access-Control-Allow-Origin', process.env.URL_FRONTEND);
        return res.redirect(process.env.URL_FRONTEND + '/login');
    }

    @Post('/add-wallet')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['auth'],
        operationId: 'add wallet',
        summary: 'add wallet',
        description: 'add wallet',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: RegisterBase,
    })
    async addWallet(@Body() data: any, @Req() request: RequestWithUser): Promise<any | EmptyObject> {
        if (!request || !request.user) throw Causes.USER_NOT_ACCESS;

        if (!data || !data.wallet) throw Causes.DATA_INVALID;

        const user = request.user;
        const userUpdate = await this.authService.updateProfile(user, {wallet: data.wallet});

        if (!userUpdate) throw Causes.DATA_INVALID;

        return userUpdate;
    }

    @Post('/update-profile')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['auth'],
        operationId: 'update profile',
        summary: 'update profile',
        description: 'update profile',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: RegisterBase,
    })
    async updateProfile(@Body() data: any, @Req() request: RequestWithUser): Promise<any | EmptyObject> {
        if (!request || !request.user) throw Causes.USER_NOT_ACCESS;

        const user = request.user;
        const userUpdate = await this.authService.updateProfile(user, data);

        if (!userUpdate) throw Causes.DATA_INVALID;

        return userUpdate;
    }

    @Post('/update-password')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['auth'],
        operationId: 'update profile',
        summary: 'update profile',
        description: 'update profile',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: RegisterBase,
    })
    async updatePassword(@Body() data: UpdatePassword, @Req() request: RequestWithUser): Promise<any | EmptyObject> {
        if (!request || !request.user) throw Causes.USER_NOT_ACCESS;

        if (!data.oldPassword || !data.newPassword || data.oldPassword === data.newPassword) throw Causes.DATA_INVALID;

        const user = request.user;
        const userUpdate = await this.authService.updatePassword(user, data);
        if (!userUpdate) throw Causes.DATA_INVALID;

        return userUpdate;
    }
 
    @Post('/reset-password')
    @ApiOperation({
        tags: ['auth'],
        operationId: 'reset password',
        summary: 'reset password',
        description: 'reset password',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: RegisterBase,
    })
    async resetPassword(@Body() data: ResetPassword): Promise<any | EmptyObject> {

        if (!data.password || !data.token) throw Causes.DATA_INVALID;

        const userUpdate = await this.authService.resetPassword(data.token, data.password);

        if (!userUpdate) throw Causes.DATA_INVALID;

        return userUpdate;
    }

    @Post('/resend-mail-active-user')
    @ApiOperation({
        tags: ['auth'],
        operationId: 'reset password',
        summary: 'reset password',
        description: 'reset password',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: RegisterBase,
    })
    async resendMailActive(@Body() data: SendMailResetPassword): Promise<any | EmptyObject> {

        if (!data.email) throw Causes.DATA_INVALID;

        const userUpdate = await this.authService.resendMailActiveUser(data);

        if (!userUpdate) throw Causes.DATA_INVALID;

        return userUpdate;
    }

    @Post('/send-mail-reset-password')
    @ApiOperation({
        tags: ['auth'],
        operationId: 'reset password',
        summary: 'reset password',
        description: 'reset password',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: RegisterBase,
    })
    async sendMailResetPassword(@Body() data: SendMailResetPassword): Promise<any | EmptyObject> {

        if (!data.email) throw Causes.DATA_INVALID;

        const userUpdate = await this.authService.sendMailResetPassword(data);

        if (!userUpdate) throw Causes.DATA_INVALID;

        return userUpdate;
    }

    @Post("upload-avatar")
    @UseInterceptors(FileInterceptor("avatar", {dest: "./uploads"}))
    uploadSingle(@UploadedFile() file) {
        console.log(file);

        return {
            file
        };
    }

    @Post('/is-active-2fa')
    @ApiOperation({
        tags: ['auth'],
        operationId: 'is active 2fa',
        summary: 'is active 2fa',
        description: 'is active 2fa',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: LoginBase,
    })
    async isActive2fa(@Body() data: Login): Promise<LoginResponse | EmptyObject> {
        const user = await this.authService.validateUser(data);
        if (!user) {
            throw Causes.EMAIL_OR_PASSWORD_INVALID;
        }

        return user.isActive2fa;
    }

    @Post('/get-2fa')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['auth'],
        operationId: 'get 2fa',
        summary: 'get 2fa',
        description: 'get 2fa',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: EmptyObjectBase,
    })
    async get2fa(@Req() request: RequestWithUser): Promise<EmptyObject> {
        const userRequest = request.user;

        const user = await this.authService.getUserByEmail(userRequest.email);

        var secret = user.twoFactorAuthenticationSecret;
        if (!secret) {
            secret = await this.twoFactorAuthenticationService.generateTwoFactorAuthenticationSecret(user);
        }

        return {
            twoFactorAuthenticationSecret: user.isActive2fa ? null : this.jwtService.decode(secret)
        };
    }

    @Post('/active-2fa')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['auth'],
        operationId: 'active 2fa',
        summary: 'active 2fa',
        description: 'active 2fa',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: LoginBase,
    })
    async active2fa(@Body() data: any, @Req() request: RequestWithUser): Promise<any | EmptyObject> {

        const userRequest = request.user;

        const user = await this.authService.getUserByEmail(userRequest.email);

        if (!data.twofa) throw Causes.TWOFA_INVALID;

        const isCodeValid = await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
            data.twofa, user
        );

        if (!isCodeValid) throw Causes.TWOFA_INVALID;

        if (!user.isActive2fa) {
            await this.usersService.turnOnTwoFactorAuthentication(user.id);
        }

        return {};
    }

    @Post('/disable-2fa')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['auth'],
        operationId: 'disable 2fa',
        summary: 'disable 2fa',
        description: 'disable 2fa',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: LoginBase,
    })
    async disable2fa(@Body() data: any, @Req() request: RequestWithUser): Promise<any | EmptyObject> {

        const userRequest = request.user;

        const user = await this.authService.getUserByEmail(userRequest.email);

        if (!data.twofa) throw Causes.TWOFA_INVALID;

        const isCodeValid = await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
            data.twofa, user
        );

        if (!isCodeValid) throw Causes.TWOFA_INVALID;

        if (user.isActive2fa) {
            await this.usersService.turnOffTwoFactorAuthentication(user.id);
        }

        return {};
    }

    @Post('/login')
    @ApiOperation({
        tags: ['auth'],
        operationId: 'login',
        summary: 'Login',
        description: 'Login',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: LoginBase,
    })
    async login(@Body() data: Login): Promise<LoginResponse | EmptyObject> {
        const user = await this.authService.validateUser(data);
        if (!user) {
            throw Causes.EMAIL_OR_PASSWORD_INVALID;
        }

        if (user.isActive2fa) {

            if (!data.twofa) throw Causes.TWOFA_INVALID;

            const isCodeValid = await this.twoFactorAuthenticationService.isTwoFactorAuthenticationCodeValid(
                data.twofa, user
            );

            if (!isCodeValid) throw Causes.TWOFA_INVALID;
        }

        return this.authService.login(user);
    }

    @Get('/me')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['auth'],
        operationId: 'info user',
        summary: 'info user',
        description: 'Info user',
    })
    async getInfoUser(@Req() request: RequestWithUser) {
        if (!request || !request.user || !request.user.email) throw Causes.DATA_INVALID;


        const user = await this.authService.getUserByEmail(request.user.email);

        if (!user) throw Causes.DATA_INVALID;

        const {password, token, twoFactorAuthenticationSecret, ...dataReturn} = user;

        return dataReturn;
    }

    @Post('/logout')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        tags: ['auth'],
        operationId: 'logout',
        summary: 'Logout',
        description: 'Logout',
    })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Successful',
        type: EmptyObjectBase,
    })
    async logout(@Req() request: any): Promise<EmptyObject> {
        const token = request.headers.authorization;
        this.authService.logout(token);
        return new EmptyObject();
    }
}
