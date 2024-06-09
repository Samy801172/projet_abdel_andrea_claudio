import { Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { ApiOperation} from "@nestjs/swagger";

import { AppControllerHelloWorld, AppControllerHelloWorld2 } from "./app.swagger";
import { ApiCodeResponse, ApiResponse } from "@common/config";


@Controller("start")
export class AppController {
  constructor(private readonly appService: AppService) {
  }

  @ApiOperation(AppControllerHelloWorld)

  @Get("hello")
  getHello(): ApiResponse {
    return { result: true, code: ApiCodeResponse.TEST, data: this.appService.getHello() };
  }

  @ApiOperation(AppControllerHelloWorld2)
  @Post("hello2")
  getHello2(): ApiResponse {
    return { result: true, code: ApiCodeResponse.TEST, data: this.appService.getHello() };
  }

}