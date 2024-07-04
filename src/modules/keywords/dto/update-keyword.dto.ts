import { PartialType } from '@nestjs/swagger';
import { CreateKeywordDto } from './create-keyword.dto';

export class UpdateKeywordDto extends PartialType(CreateKeywordDto) {}
