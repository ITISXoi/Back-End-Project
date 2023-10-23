import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from "@nestjs/platform-express";
import {
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginAdmin } from "./request/login.dto";
import { LoginResponse } from "./response/login.dto";
import { EmptyObject } from "../../shared/response/emptyObject.dto";
import { LoginBase } from "./response/loginBase.dto";
import { EmptyObjectBase } from "../../shared/response/emptyObjectBase.dto";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { RegisterBase } from "./response/registerBase.dto";
import { UsersService } from "./user.service";
import RequestWithUser from "./requestWithUser.interface";
import { JwtService } from "@nestjs/jwt";
import { Admin, User } from "../../database/entities";
import { PaginationResponse } from "src/config/rest/paginationResponse";
import * as argon2 from "argon2";
import { CreateAdmin } from "../admin/request/create.dto";
import { CreatePartnershipRes } from "../admin/response/createPartnership.dto";
import { createSuperAdmin, resetPassword } from "../../shared/emailTemplate";
import { MailService } from "../mail/mail.service";
import {
  UpdateAdmin,
  subscribePremiumPackData,
} from "../admin/request/update.dto";
import { UpdateAdminPassword } from "./request/update-admin-password.dto";
import { checkImage } from "../../shared/Utils";
import { Express } from "express";
import { EmailResetPassword } from "./request/email-reset-password.dto";
import { AdminResetPassword } from "./request/reset-password.dto";
import { Causes } from "src/config/exception/causes";

@Controller("admin")
export class AuthController {
  constructor(
    private jwtService: JwtService,
    private mailService: MailService,
    private readonly usersService: UsersService,
    private authService: AuthService
  ) {}

  @Get("/list-subscribe-premium-pack")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "getList subscribe_premium_pack",
    summary: "Get all subscribe_premium_pack",
    description: "Get all subscribe_premium_pack",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
  })
  async getListSubscribePremiumPack(
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Req() request: any
  ) {
    return await this.authService.getListSubscribePremiumPack(request.user, {
      page,
      limit,
    });
  }

  @Get("/subscribe-premium-pack")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "get subscribe_premium_pack",
    summary: "Get subscribe_premium_pack",
    description: "Get subscribe_premium_pack",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  async getSubscribePremiumPack(@Req() request: any) {
    return await this.authService.getSubscribePremiumPack(request.user);
  }

  @Post("subscribe-premium-pack")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "create subscribe-premium-pack",
    summary: "create subscribe-premium-pack",
    description: "create subscribe-premium-pack",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
  })
  async subscribePremiumPack(
    @Body() data: subscribePremiumPackData,
    @Req() request: any
  ) {
    return await this.authService.subscribePremiumPack(data, request.user);
  }

  @Get("/admin-info")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "info admin",
    summary: "info admin",
    description: "Info admin",
  })
  async getInfoUserToId(@Req() request: RequestWithUser) {
    console.log("request: ", request);
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

    return await this.authService.getAdminById(request.user.id);
  }

  @Get("/list")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "getList admin and artist",
    summary: "Get all admin and artist",
    description: "Get all admin and artist",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: Admin,
  })
  @ApiQuery({
    name: "isActive",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "type",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "username",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "email",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
  })
  async getList(
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Query("username") username: string,
    @Query("email") email: string,
    @Query("isActive") isActive: number,
    @Query("type") type: number,
    @Req() request: any
  ): Promise<PaginationResponse<Admin>> {
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;
    const checkPermission = await this.authService.checkPermissionUser(
      request.user
    );
    if (!checkPermission) {
      throw Causes.USER_DONT_HAVE_PERMISSION;
    }
    const result = this.authService.getList(
      { email, isActive, type },
      { page, limit }
    );

    return result;
  }

  @Get("/list-user")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "getList end user",
    summary: "Get all end user",
    description: "Get all end user",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: Admin,
  })
  @ApiQuery({
    name: "status",
    description: "active || request",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "username",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "email",
    required: false,
    type: String,
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
  })
  async getListUser(
    @Query("page", new DefaultValuePipe(1)) page: number,
    @Query("limit", new DefaultValuePipe(10)) limit: number,
    @Query("username") username: string,
    @Query("email") email: string,
    @Query("status") status: string,
    @Req() request: any
  ): Promise<PaginationResponse<User>> {
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;
    const checkPermission = await this.authService.checkPermissionUser(
      request.user
    );
    if (!checkPermission) {
      throw Causes.USER_DONT_HAVE_PERMISSION;
    }
    const result = this.authService.getListUser(
      { email, username, status },
      { page, limit }
    );

    return result;
  }

  @Get("/user/:id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "info user by id",
    summary: "info user by id",
    description: "Info user by id",
  })
  async getInfoUserById(
    @Req() request: RequestWithUser,
    @Param("id") id: number
  ) {
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

    const checkPermission = await this.authService.checkPermissionUser(
      request.user
    );
    if (!checkPermission) {
      throw Causes.USER_DONT_HAVE_PERMISSION;
    }

    return await this.authService.getUserById(id);
  }
  @Post("/create")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: "image", maxCount: 1 }]))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "create artist/super admin    ",
    summary: "create a artist/super admin by super admin",
    description: "create a artist/super admin by super admin",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: RegisterBase,
  })
  async create(
    @Body() data: CreateAdmin,
    @Req() request: RequestWithUser,
    @UploadedFiles() files: { image?: Express.Multer.File[] }
  ): Promise<CreatePartnershipRes | EmptyObject> {
    console.log("Hhahaah");
    // if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;
    // const checkPermission = await this.authService.checkPermissionUser(
    //     request.user
    // );
    // if (!checkPermission) {
    //     throw Causes.USER_DONT_HAVE_PERMISSION;
    // }
    const duplicatedUser = await this.authService.checkDuplicatedUser(data);
    if (duplicatedUser) {
      throw Causes.DUPLICATED_ACCOUNT;
    }

    let image = files && files.image ? files.image[0] : undefined;

    if (image) await checkImage(image);

    const user = await this.authService.create(data, { image });

    const sendMail = user.email;
    const subject = "Your account has been created on our platform";

    const html = createSuperAdmin(request.user, data);

    //await this.mailService.sendMail(sendMail, subject, html);
    return user;
  }

  @Post("/update-profile")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: "image", maxCount: 1 }]))
  @ApiConsumes("multipart/form-data")
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "update profile",
    summary: "update profile",
    description: "update profile",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: RegisterBase,
  })
  async updateProfile(
    @Body() data: UpdateAdmin,
    @Req() request: RequestWithUser,
    @UploadedFiles() files: { image?: Express.Multer.File[] }
  ): Promise<any | EmptyObject> {
    if (!request || !request.user) throw Causes.USER_NOT_ACCESS;

    let image = files && files.image ? files.image[0] : undefined;

    if (image) await checkImage(image);

    const user = request.user;
    const userUpdate = await this.authService.updateProfile(user, data, {
      image,
    });

    if (!userUpdate) throw Causes.DATA_INVALID;

    return userUpdate;
  }

  @Post("/update-password")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "update password",
    summary: "update password",
    description: "update password",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: RegisterBase,
  })
  async updatePassword(
    @Body() data: UpdateAdminPassword,
    @Req() request: RequestWithUser
  ): Promise<any | EmptyObject> {
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

    if (!data.oldPassword || !data.newPassword) throw Causes.DATA_INVALID;

    if (data.oldPassword === data.newPassword) throw Causes.DUPLICATE_PASSWORD;

    const user = request.user;
    const userUpdate = await this.authService.updatePassword(user, data);

    if (!userUpdate) throw Causes.DATA_INVALID;

    return userUpdate;
  }

  @Post("upload-avatar")
  @UseInterceptors(FileInterceptor("avatar", { dest: "./uploads" }))
  uploadSingle(@UploadedFile() file) {
    console.log(file);

    return {
      file,
    };
  }

  @Get("/:id")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "info admin by id",
    summary: "info admin by id",
    description: "Info admin by id",
  })
  async getInfoAdminById(
    @Req() request: RequestWithUser,
    @Param("id") id: number
  ) {
    if (!request || !request.user) throw Causes.USER_DONT_HAVE_PERMISSION;

    const checkPermission = await this.authService.checkPermissionUser(
      request.user
    );
    if (!checkPermission) {
      throw Causes.USER_DONT_HAVE_PERMISSION;
    }

    return await this.authService.getAdminById(id);
  }

  @Post("/logout")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "logout",
    summary: "Logout",
    description: "Logout",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: EmptyObjectBase,
  })
  async logout(@Req() request: any): Promise<EmptyObject> {
    const token = request.headers.authorization;
    this.authService.logout(token);
    return new EmptyObject();
  }

  @Post("/login")
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "login",
    summary: "Login",
    description: "Login",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: LoginBase,
  })
  async login(@Body() data: LoginAdmin): Promise<LoginResponse | EmptyObject> {
    const user = await this.authService.validateAdmin(data);
    if (!user) {
      throw Causes.EMAIL_OR_PASSWORD_INVALID;
    }

    if (user.isActive != 1) {
      throw Causes.ADMIN_IS_NOT_ACTIVE;
    }

    if (await argon2.verify(user.password, data.password)) {
      return this.authService.login(user);
    } else {
      throw Causes.PASSWORD_IS_FALSE;
    }
  }

  @Post("/send-email-reset-password")
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "send email reset password (just api)",
    summary: "send email reset password",
    description: "send email reset password",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: RegisterBase,
  })
  async sendMailResetPassApi(
    @Body() data: EmailResetPassword,
    @Req() request: RequestWithUser
  ) {
    const sendUser = await this.authService.getUserByEmail(data.email);
    if (!sendUser) {
      throw Causes.USER_DOES_NOT_EXIST_WITH_THIS_EMAIL;
    }

    const code = await this.authService.genCode();

    await this.authService.updateCode(sendUser, code);

    const sendMail = sendUser.email;
    const subject = "Reset your password";

    let url = process.env.NFTee_ADMIN_FRONTEND + "/reset-password?code=" + code;
    // let url = "http://localhost:3001/reset-password?code=" + code;
    const html = resetPassword(sendUser, url);

    await this.mailService.sendMail(sendMail, subject, html);

    return true;
  }

  @Post("/reset-password")
  @ApiOperation({
    tags: ["auth-admin"],
    operationId: "reset password",
    summary: "reset password",
    description: "reset password",
  })
  @ApiQuery({
    name: "code",
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Successful",
    type: RegisterBase,
  })
  async resetPassword(
    @Query("code") code: string,
    @Body() data: AdminResetPassword
  ) {
    const { password } = data;
    if (!password) {
      throw Causes.DATA_INVALID;
    }

    try {
      this.jwtService.verify(code, { secret: process.env.JWT_SECRET });
    } catch (error) {
      throw Causes.CODE_RESET_PASS_INVALID;
    }

    const user = await this.authService.getUserByCode(code);

    if (!user) {
      throw Causes.CODE_RESET_PASS_INVALID;
    }

    await this.authService.updateResetPassword(user, password);

    return true;
  }
}
