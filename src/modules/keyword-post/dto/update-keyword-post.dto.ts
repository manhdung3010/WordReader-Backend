import { PartialType } from '@nestjs/swagger';
import { CreateKeywordPostDto } from './create-keyword-post.dto';

export class UpdateKeywordPostDto extends PartialType(CreateKeywordPostDto) {}
