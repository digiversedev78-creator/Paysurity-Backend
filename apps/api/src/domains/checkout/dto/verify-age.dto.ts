import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class VerifyAgeDto {
  /**
   * The date of birth of the user in 'YYYY-MM-DD' format, used for age verification.
   * @example '1990-01-15'
   */
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Date of birth must be in YYYY-MM-DD format.' })
  dob: string;
}
