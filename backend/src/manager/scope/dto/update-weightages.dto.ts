import { IsArray, ValidateNested, IsUUID, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class WeightageItemDto {
  @IsUUID()
  id: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  weightage: number;
}

export class UpdateWeightagesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightageItemDto)
  items: WeightageItemDto[];
}
