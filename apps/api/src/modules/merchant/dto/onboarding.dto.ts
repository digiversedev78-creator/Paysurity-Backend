import {
  IsString,
  IsEmail,
  Matches,
  IsNotEmpty,
  IsDateString,
  ValidateNested,
  IsOptional,
  IsNotEmptyObject
} from 'class-validator';
import { Type } from 'class-transformer';

// DTO for address details, to be nested within KycSubmitDto
class AddressDto {
  @IsString()
  @IsNotEmpty()
  street1: string;

  @IsString()
  @IsOptional()
  street2?: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string;

  @IsString()
  @IsNotEmpty()
  zip: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

// DTO for submitting KYC information during merchant onboarding
export class KycSubmitDto {
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @IsString()
  @IsNotEmpty()
  dba: string;

  @IsString()
  @Matches(/^\d{9}$/, { message: 'EIN must be a 9-digit number' })
  ein: string;

  @IsString()
  @IsNotEmpty()
  sicCode: string;

  @IsString()
  @Matches(/^\d{4}$/, { message: 'Owner SSN Last 4 must be a 4-digit number' })
  ownerSsnLast4: string;

  @IsDateString() // Expects a string representing a date, e.g., YYYY-MM-DD
  @IsNotEmpty()
  ownerDob: string;

  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmptyObject()
  address: AddressDto;
}

// DTO for configuring gateway settings for a merchant
export class GatewayConfigDto {
  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @IsString()
  @IsNotEmpty()
  terminalKey: string;

  @IsString()
  @IsNotEmpty()
  settlementAccountId: string;

  @IsString()
  @IsNotEmpty()
  mcc: string; // Merchant Category Code
}

// DTO for inviting a new user to the merchant's account
export class InviteUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;
}
