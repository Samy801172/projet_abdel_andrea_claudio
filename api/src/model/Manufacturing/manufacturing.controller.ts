import { Controller, Post, Body, Param, Put, Get, UseInterceptors, UploadedFile, ParseIntPipe, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ManufacturingService } from './manufacturing.service';
import { CreateManufacturingDto } from './dto/create-manufacturing.dto';
import { CreateCustomManufacturingDto } from './dto/create-custom-manufacturing.dto';
import { OrderStatus } from '../OrderStatus/dto/order-status.enum';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@feature/security/guard/jwt-auth.guard';

@ApiTags('Manufacturing')
@Controller('manufacturing')
@UseGuards(JwtAuthGuard)
export class ManufacturingController {
    constructor(private manufacturingService: ManufacturingService) {}

    @Post()
    async createManufacturing(@Body() createManufacturingDto: CreateManufacturingDto) {
        return this.manufacturingService.createManufacturingOrder(
            createManufacturingDto.orderId,
            createManufacturingDto.depositAmount,
            createManufacturingDto.totalAmount
        );
    }

    @Post(':id/deposit')
    async processDeposit(@Param('id') id: number, @Body() paymentDetails: any) {
        return this.manufacturingService.processDepositPayment(id, paymentDetails);
    }

    @Put(':id/status')
    async updateStatus(
        @Param('id') id: number,
        @Body('status') status: OrderStatus
    ) {
        return this.manufacturingService.updateManufacturingStatus(id, status);
    }

    @Post('custom')
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: CreateCustomManufacturingDto })
    @UseInterceptors(FileInterceptor('prescription', {
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(pdf|jpg|jpeg|png)$/)) {
                cb(null, true);
            } else {
                cb(new Error('Format de fichier non supporté'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB max
        }
    }))
    async createCustomManufacturing(
        @UploadedFile() prescription: Express.Multer.File,
        @Body('notes') notes: string
    ) {
        return this.manufacturingService.createCustomManufacturing(prescription, notes);
    }

    @Get()
    async getAllManufacturing() {
        return this.manufacturingService.getAllManufacturing();
    }

    @Get(':id')
    async getManufacturingById(@Param('id', ParseIntPipe) id: number) {
        return this.manufacturingService.getManufacturingById(id);
    }
} 