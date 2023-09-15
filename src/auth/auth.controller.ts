import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUser, RegisterUser } from './dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authservice: AuthService){}

    @HttpCode(HttpStatus.OK)
    @Post('signup')
    signup(@Body() register_user: RegisterUser, @Res() res: Response){
        return this.authservice.user_signup(register_user, res)
    }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    login(@Body() login_user:LoginUser, @Res() res:Response){
        return this.authservice.user_login(login_user, res)
    }
}
