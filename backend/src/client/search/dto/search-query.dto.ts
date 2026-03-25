import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  query: string;
}
