import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export class SwaggerModuleConfig {
  static setup(app: INestApplication) {
    const options = new DocumentBuilder()
      .setTitle('Your API Title')
      .setDescription('API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);
  }
}
