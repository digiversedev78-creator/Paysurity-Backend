import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum TaxDocumentType {
  W2 = 'W2',
  W9 = 'W9',
  FORM_1099_MISC = 'FORM_1099_MISC',
  FORM_1099_NEC = 'FORM_1099_NEC',
  FORM_1099_K = 'FORM_1099_K',
  FORM_1099_INT = 'FORM_1099_INT',
  FORM_1099_DIV = 'FORM_1099_DIV',
  FORM_1099_R = 'FORM_1099_R',
  FORM_1099_SA = 'FORM_1099_SA',
  FORM_1098_T = 'FORM_1098_T',
  FORM_1098_E = 'FORM_1098_E',
  // Add other relevant tax document types as needed for PaySurity
}

export class GenerateTaxDocumentDto {
  @IsNotEmpty()
  @IsUUID('4', { message: 'businessId must be a valid UUID' })
  businessId: string; // The ID of the business for which the document is generated

  @IsOptional()
  @IsUUID('4', { message: 'employeeId must be a valid UUID' })
  employeeId?: string; // Optional: If the document is specific to an employee (e.g., W2)

  @IsNotEmpty()
  @IsInt({ message: 'taxYear must be an integer' })
  @Min(1900, { message: 'taxYear must not be less than 1900' }) // Reasonable minimum year
  @Max(new Date().getFullYear() + 1, { message: 'taxYear cannot be in the far future' }) // Allow current year + next year for future planning
  @Type(() => Number) // Ensure it's parsed as a number from query params or body
  taxYear: number;

  @IsNotEmpty()
  @IsEnum(TaxDocumentType, { message: 'documentType must be a valid TaxDocumentType' })
  documentType: TaxDocumentType;

  @IsOptional()
  @IsInt({ message: 'quarter must be an integer' })
  @Min(1, { message: 'quarter must be between 1 and 4' })
  @Max(4, { message: 'quarter must be between 1 and 4' })
  @Type(() => Number)
  quarter?: number; // Optional: For quarterly documents if applicable

  @IsOptional()
  @IsString({ message: 'outputFormat must be a string' })
  @IsEnum(['PDF', 'XML', 'CSV'], { message: 'outputFormat must be PDF, XML, or CSV' }) // Example formats
  outputFormat?: 'PDF' | 'XML' | 'CSV';
}
