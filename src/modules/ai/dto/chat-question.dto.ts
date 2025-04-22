import { ApiProperty } from '@nestjs/swagger';

class ChatMessage {
  @ApiProperty({
    description: 'Role of the message sender',
    enum: ['user', 'assistant'],
    example: 'user'
  })
  role: 'user' | 'assistant';

  @ApiProperty({
    description: 'Content of the message',
    example: 'What is the capital of France?'
  })
  content: string;
}

export class ChatQuestionDto {
  @ApiProperty({
    description: 'The question to ask the AI',
    example: 'Tell me about this book'
  })
  question: string;

  @ApiProperty({
    description: 'Chat history for context',
    type: [ChatMessage],
    required: false,
    example: [
      { role: 'user', content: 'Previous question' },
      { role: 'assistant', content: 'Previous answer' }
    ]
  })
  history?: ChatMessage[];
}
