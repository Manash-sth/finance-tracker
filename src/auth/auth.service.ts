import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginUser, RegisterUser } from './dto';
import * as argon2 from 'argon2';
import { Constants } from 'src/constant';
import cookieParser from 'cookie-parser';
import { Response } from 'express';

@Injectable()
export class AuthService {
    constructor(private prismaservice: PrismaService, private jwtservice: JwtService, private configservice: ConfigService){}

    async user_signup(new_user_info: RegisterUser, res:Response){
        if (new_user_info.password !== new_user_info.repassword){
            throw new ForbiddenException("Passwords do not match")
        }

        const hashed_password = await argon2.hash(new_user_info.password)
        try{
            const user = await this.prismaservice.user.create({
                data: {
                    email: new_user_info.email,
                    password: hashed_password,
                    profile: {
                        create: {
                            firstname: new_user_info.firstname,
                            middlename: new_user_info.middlename || "",
                            lastname: new_user_info.lastname || "",
                        },
                    }
                },
                include: {
                    profile: true
                }
            })
            
            const info = {
                id: user.id, 
                email: user.email, 
                role: user.role, 
                email_verified: user.email_verified, 
                firstname: user.profile.firstname, 
                middlename: user.profile.middlename, 
                lastname: user.profile.lastname
            }

            const accesstoken = await this.access_token(info)
            const refreshtoken = await this.refresh_token(info)

            info['msg'] = "user created."
            info['avatar'] = user.profile.avatar
            delete info['role']

            res.cookie('access_token', accesstoken, {path:'/', secure: Constants.SECURE_COOKIE})
            res.cookie('refresh_token', refreshtoken, {path:'/', secure: Constants.SECURE_COOKIE})
            res.status(201).json(info)

        }catch(err){
            console.log(err)
            if(err.code === 'P2002'){
                throw new ForbiddenException("Account with this Email already exists.")
            }
            throw new BadRequestException('Error while creating user. Please try again later.')
        }
    }

    async user_login(user_info:LoginUser, res: Response){
        try{
            const user = await this.prismaservice.user.findUniqueOrThrow({
                where:{
                    email: user_info.email
                },
                include: {
                    profile: true
                }
            })

            const info = {
                id: user.id, 
                email: user.email, 
                role: user.role, 
                email_verified: user.email_verified, 
                firstname: user.profile.firstname, 
                middlename: user.profile.middlename, 
                lastname: user.profile.lastname
            }

            const accesstoken = await this.access_token(info)
            const refreshtoken = await this.refresh_token(info)
            
            info['avatar'] = user.profile.avatar
            delete info['role']

            res.cookie('access_token', accesstoken, {path:'/', secure: Constants.SECURE_COOKIE})
            res.cookie('refresh_token', refreshtoken, {path:'/', secure: Constants.SECURE_COOKIE})
            res.status(201).json(info)

        }catch(err){
            console.log(err)
            if(err.code === 'P2025'){
                throw new ForbiddenException("Account with this Email doesn't exists.")
            }
            throw new BadRequestException('Error while searching user. Please try again later.')
        }
    }

    async access_token(user_info:object){
        return await this.jwtservice.signAsync(
            user_info,
            {
                secret: this.configservice.get('ACCESS_SECRET'),
                expiresIn: Constants.ACCESS_TIMEOUT,
                audience: user_info['email'],
                issuer: this.configservice.get('ISSUER'),
            }
        )
    }

    async refresh_token(user_info:object){
        return await this.jwtservice.signAsync(
            user_info,
            {
                secret: this.configservice.get('REFRESH_SECRET'),
                expiresIn: Constants.REFRESH_TIMEOUT,
                audience: user_info['email'],
                issuer: this.configservice.get('ISSUER'),
            }
        )
    }

}
