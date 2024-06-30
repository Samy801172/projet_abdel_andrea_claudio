import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumController } from './forum.controller'
import { Forum } from './forum.entity';
import { ForumService } from './forum.service'
import { SecurityModule } from '@feature/security';

@Module({
  imports: [SecurityModule,TypeOrmModule.forFeature([Forum])],
  controllers: [ForumController],
  providers: [ForumService],
})
export class ForumModule {}
