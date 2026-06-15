import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HospitalRegDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('hospital-registration')
  hospitalRegistration(@Body() request: HospitalRegDto) {
    return this.authService.hospitalRegistration(request);
  }
}
