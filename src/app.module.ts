import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { createClient } from '@supabase/supabase-js';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { PostsModule } from './posts/posts.module';
import { UsersModule } from './users/users.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    PostsModule,
    AuthModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: 'SUPABASE_CLIENT',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('SUPABASE_URL');
        const key = configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

        if (!url || !key) {
          throw new Error('Missing Supabase environment variables!');
        }

        return createClient(url, key);
      },
    },
  ],
  exports: ['SUPABASE_CLIENT'],
})
export class AppModule {}