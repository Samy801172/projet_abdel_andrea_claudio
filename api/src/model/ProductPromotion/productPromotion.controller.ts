// src/controllers/productPromotion.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { ProductPromotionService } from './productPromotion.service';
import { CreateProductPromotionDto } from './dto/create-productPromotion.dto';
import { UpdateProductPromotionDto } from './dto/update-productPromotion.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('product-promotions')
@ApiBearerAuth('access-token')
@Controller('product-promotions')
export class ProductPromotionController {
  constructor(
    private readonly productPromotionService: ProductPromotionService,
  ) {}

  @Post()
  create(@Body() createProductPromotionDto: CreateProductPromotionDto) {
    return this.productPromotionService.create(createProductPromotionDto);
  }

  @Get()
  findAll() {
    return this.productPromotionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productPromotionService.findOne(+id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductPromotionDto: UpdateProductPromotionDto,
  ) {
    return this.productPromotionService.update(+id, updateProductPromotionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productPromotionService.remove(+id);
  }
}
