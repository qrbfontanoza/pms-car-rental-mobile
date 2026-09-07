import { AuthService, VehicleService } from './models/service.interfaces';
import { ApiAuthService, ApiVehicleService } from './services/api-services';
import { APP_SERVICE_PROVIDERS } from './app.providers.prod';

describe('production service providers', () => {
  const providerFor = (token: unknown): { provide: unknown; useClass: unknown } =>
    APP_SERVICE_PROVIDERS.find((provider) => (provider as { provide?: unknown }).provide === token) as {
      provide: unknown;
      useClass: unknown;
    };

  it('selects API authentication and vehicle implementations', () => {
    expect(providerFor(AuthService).useClass).toBe(ApiAuthService);
    expect(providerFor(VehicleService).useClass).toBe(ApiVehicleService);
  });
});
