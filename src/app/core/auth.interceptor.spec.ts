import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthSessionService } from './auth-session.service';
import { authInterceptor } from './auth.interceptor';

describe('authentication interceptor', () => {
  const originalMockMode = environment.useMockApi;
  const mutableEnvironment = environment as unknown as { useMockApi: boolean };
  let httpController: HttpTestingController;
  let session: AuthSessionService;

  beforeEach(async () => {
    mutableEnvironment.useMockApi = false;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: { url: '/tabs/bookings', navigate: () => Promise.resolve(true) } },
      ],
    });
    httpController = TestBed.inject(HttpTestingController);
    session = TestBed.inject(AuthSessionService);
    await session.set({
      user: { id: '1', fullName: 'Test Customer', email: 'test@example.test', licenseStatus: 'not_uploaded' },
      sessionId: 'old-session',
      accessToken: 'a'.repeat(64),
      accessExpiresAt: '2099-01-01T00:00:00Z',
      refreshToken: 'b'.repeat(64),
      refreshExpiresAt: '2099-02-01T00:00:00Z',
    });
  });

  afterEach(async () => {
    httpController.verify();
    await session.clear();
    mutableEnvironment.useMockApi = originalMockMode;
  });

  it('queues concurrent 401 responses behind one token refresh and retries once', fakeAsync(() => {
    const results: string[] = [];
    const firstUrl = `${environment.apiBaseUrl}/bookings`;
    const secondUrl = `${environment.apiBaseUrl}/profile`;
    TestBed.inject(HttpClient)
      .get(firstUrl)
      .subscribe(() => results.push('first'));
    TestBed.inject(HttpClient)
      .get(secondUrl)
      .subscribe(() => results.push('second'));

    httpController.expectOne(firstUrl).flush({}, { status: 401, statusText: 'Unauthorized' });
    httpController.expectOne(secondUrl).flush({}, { status: 401, statusText: 'Unauthorized' });

    const refresh = httpController.expectOne(`${environment.apiBaseUrl}/auth/refresh`);
    expect(refresh.request.body).toEqual({ refreshToken: 'b'.repeat(64) });
    refresh.flush({
      data: {
        user: {
          id: '1',
          fullName: 'Test Customer',
          email: 'test@example.test',
          licenseStatus: 'not_uploaded',
        },
        sessionId: 'new-session',
        accessToken: 'c'.repeat(64),
        accessExpiresAt: '2099-01-01T00:15:00Z',
        refreshToken: 'd'.repeat(64),
        refreshExpiresAt: '2099-02-01T00:00:00Z',
      },
      message: 'Refreshed',
      meta: {},
    });
    tick();

    const retries = httpController.match((request) => [firstUrl, secondUrl].includes(request.url));
    expect(retries.length).toBe(2);
    retries.forEach((request) => {
      expect(request.request.headers.get('Authorization')).toBe(`Bearer ${'c'.repeat(64)}`);
      request.flush({ data: {}, message: '', meta: {} });
    });
    tick();
    expect(results.length).toBe(2);
  }));
});
