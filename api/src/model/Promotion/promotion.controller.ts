// src/model/Promotion/promotion.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Inject,
  Delete, Patch
} from "@nestjs/common";
import { PromotionService } from './promotion.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { Promotion } from './promotion.entity';

@ApiTags('promotions')
@Controller('promotions')
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une nouvelle promotion' })
  @ApiResponse({
    status: 201,
    description: 'La promotion a été créée avec succès.',
  })
  async createPromotion(
    @Body() createPromotionDto: CreatePromotionDto,
  ): Promise<Promotion> {
    try {
      return await this.promotionService.createPromotion(createPromotionDto);
    } catch (error) {
      console.error('Erreur création promotion:', error);
      throw error;
    }
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les promotions' })
  findAll() {
    return this.promotionService.findAll();
  }

  @Get('active')
  @ApiOperation({ summary: 'Récupérer les promotions actives' })
  async getActivePromotions(): Promise<Promotion[]> {
    console.log('Requête reçue pour les promotions actives');
    const promotions = await this.promotionService.getActivePromotions();
    console.log('Promotions actives trouvées:', promotions);
    return promotions;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une promotion par son ID' })
  findOne(@Param('id') id: string) {
    return this.promotionService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour une promotion' })
  update(
    @Param('id') id: string,
    @Body() updatePromotionDto: CreatePromotionDto,
  ) {
    return this.promotionService.update(+id, updatePromotionDto);
  }

  // Suppression de la promotion s'en suit de Patch pour retirer le lien avec les produits
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une promotion' })
  remove(@Param('id') id: string) {
    return this.promotionService.remove(+id);
  }

}
