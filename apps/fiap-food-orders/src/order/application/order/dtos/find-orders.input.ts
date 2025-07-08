import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class FindOrdersInput {
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  from?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  to?: Date;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  customerCpf?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;
}
