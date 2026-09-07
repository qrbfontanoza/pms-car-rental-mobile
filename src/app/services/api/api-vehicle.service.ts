import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiEnvelope, VehicleDto } from '../../models/api.models';
import { PaginatedResponse, Vehicle, VehicleFilter } from '../../models/domain.models';
import { VehicleService } from '../../models/service.interfaces';
import { mapVehicle } from './api-mappers';

@Injectable()
export class ApiVehicleService extends VehicleService {
  constructor(private readonly http: HttpClient) {
    super();
  }

  list(filter: Partial<VehicleFilter> = {}, page = 1, pageSize = 8): Observable<PaginatedResponse<Vehicle>> {
    const sortMap: Record<NonNullable<VehicleFilter['sort']>, string> = {
      name_asc: 'nameAsc',
      name_desc: 'nameDesc',
      price_asc: 'priceAsc',
      price_desc: 'priceDesc',
      newest: 'newest',
    };
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (filter.keyword) params = params.set('keyword', filter.keyword);
    if (filter.categories?.length) params = params.set('categories', filter.categories.join(','));
    if (filter.pickupDate) params = params.set('pickupDate', filter.pickupDate);
    if (filter.returnDate) params = params.set('returnDate', filter.returnDate);
    if (filter.minPrice !== undefined) params = params.set('minPrice', filter.minPrice);
    if (filter.maxPrice !== undefined) params = params.set('maxPrice', filter.maxPrice);
    if (filter.seats !== undefined) params = params.set('seats', filter.seats);
    if (filter.fuel) params = params.set('fuelTypes', filter.fuel);
    if (filter.transmission) params = params.set('transmissions', filter.transmission);
    if (filter.availableOnly) params = params.set('availableOnly', true);
    if (filter.sort) params = params.set('sort', sortMap[filter.sort]);
    return this.http.get<ApiEnvelope<VehicleDto[]>>(`${environment.apiBaseUrl}/vehicles`, { params }).pipe(
      map((response) => ({
        data: response.data.map(mapVehicle),
        meta: {
          page: Number(response.meta['page'] ?? page),
          pageSize: Number(response.meta['pageSize'] ?? pageSize),
          total: Number(response.meta['total'] ?? response.data.length),
          totalPages: Number(response.meta['totalPages'] ?? 1),
        },
      })),
    );
  }

  getById(id: string): Observable<Vehicle> {
    return this.http
      .get<ApiEnvelope<VehicleDto>>(`${environment.apiBaseUrl}/vehicles/${encodeURIComponent(id)}`)
      .pipe(map((response) => mapVehicle(response.data)));
  }

  refresh(): Observable<void> {
    return of(undefined);
  }
}
