import "reflect-metadata"; // Must be imported once in your project
import { IsEmail, Length } from "class-validator";

export class CreateCustomerInputs {
    @IsEmail()
    email: string;

    @Length(7, 12)
    phone: string;

    @Length(6, 20)
    password: string;
}

export class useLoginInputs {
    @IsEmail()
    email: string;

    @Length(6, 20)
    password: string;
}

export class EditCustomerrofileInputs {

   @Length(6,25)
   firstName: string;

   @Length(3,25)
   lastName: string;

   @Length(6,25)
    address: string;
}

export interface CustomerPayload {
    _id: string;
    email: string;
    verified: boolean;
}



