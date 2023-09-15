import { IsEmail, IsNotEmpty, IsStrongPassword, Equals, MinLength, MaxLength, IsEmpty } from "class-validator"

export class RegisterUser{

    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    @IsStrongPassword()
    password: string

    @IsNotEmpty()
    repassword: string

    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(50)
    firstname: string

    middlename: string

    lastname: string
}

export class LoginUser{
    @IsNotEmpty()
    @IsEmail()
    email: string

    @IsNotEmpty()
    password: string
}