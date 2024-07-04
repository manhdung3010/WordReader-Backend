import { PartialType } from '@nestjs/swagger';
import { CreateCategoryPostDto } from './create-category-post.dto';

export class UpdateCategoryPostDto extends PartialType(CreateCategoryPostDto) {}
