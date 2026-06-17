# Crónica de Cambios: Conexión Turiscol Frontend ↔ Backend

## Resumen

Se analizaron y modificaron ambos proyectos (`turiscol-mobilapp` y `turiscol-backend`) para establecer la conexión entre el frontend (Ionic/Angular 20) y el backend (Spring Boot microservicios). A continuación se detallan todos los cambios realizados y las razones detrás de cada uno.

---

## Parte 1: Frontend (`turiscol-mobilapp`)

### Problema: Paths de API inconsistentes

**Archivos modificados:** `offers.ts`, `AccommodationDetailStrategy.ts`, `EventDetailStrategy.ts`, `ProductDetailStrategy.ts`

**Qué:** Varios servicios usaban rutas relativas como `/api/offers` o `/api/accommodations/{id}` en lugar de usar la URL base completa.

**Por qué:** El interceptor JWT (`auth.interceptor.ts`) verifica `req.url.startsWith(environment.apiUrl)` para añadir el token Bearer. Las rutas relativas no comenzaban con `http://localhost:8080/api/v1`, por lo que el token JAMÁS se añadía a esas peticiones. Además, el backend NO tiene endpoints separados por tipo (`/api/accommodations/{id}`, `/api/events/{id}`, etc.) — solo existe `GET /api/v1/offers/{id}` para todos los tipos.

**Cambio:** Todas las rutas ahora usan `${environment.apiUrl}/offers/...` y los strategies de detalle apuntan al endpoint unificado `${environment.apiUrl}/offers/{id}`.

### Problema: Métodos de servicio vacíos

**Archivo:** `offers.ts`

**Qué:** Los métodos `findAll()`, `findAllActive()`, `findAllByType()` tenían el cuerpo vacío (solo comentarios "// http real").

**Por qué:** Sin implementación, estos métodos nunca harían peticiones HTTP.

**Cambio:** Se implementaron con llamadas reales a `GET /offers`, `GET /offers/active`, `GET /offers/type/{type}` con soporte de paginación mediante `HttpParams`.

### Problema: Servicios con datos mock

**Archivos modificados:** `booking.ts`, `event.ts`, `price.ts`, `DepartmentService.ts`, `municipality.service.ts`, `location.ts`

**Qué:** Todos estos servicios retornaban datos quemados de archivos `*Mock.ts` en lugar de hacer llamadas HTTP.

**Por qué:** Para conectar con el backend real, estos servicios deben consumir los endpoints del API Gateway.

**Cambio:** Se reescribieron completamente para usar `HttpClient` con los endpoints correctos del backend:
- `booking.ts` → `GET/POST/PUT /booking`
- `event.ts` → `GET /offers/type/EVENT`
- `price.ts` → `GET /prices`, `GET /prices/city/{cityId}`
- `DepartmentService.ts` → `GET /locations/departments`
- `municipality.service.ts` → `GET /locations/cities`
- `location.ts` → `GET /locations/departments`, `GET /locations/cities`

### Problema: Falta de manejo de errores

**Archivos modificados:** Todos los servicios anteriores + `auth.ts`, `User.ts`

**Qué:** Ninguna llamada HTTP tenía operador `catchError`.

**Por qué:** Sin `catchError`, cualquier error HTTP (404, 500, timeout) causaría que el Observable se complete con error sin logging ni manejo graceful.

**Cambio:** Se agregó `.pipe(catchError(...))` a todas las llamadas HTTP con logging contextual y re-lanzamiento del error.

### Problema: Sin refresh token automático

**Archivo:** `auth.interceptor.ts`

**Qué:** Cuando un token JWT expiraba (status 401), la app simplemente fallaba.

**Por qué:** El frontend debe renovar automáticamente el token usando el `refresh_token` almacenado para mantener la sesión activa.

**Cambio:** Se implementó lógica de refresh: al recibir 401, el interceptor llama a `POST /auth/refresh`, guarda los nuevos tokens, y reintenta la petición original. Si el refresh falla, limpia la sesión y redirige al login.

### Problema: Componentes esperaban datos síncronos

**Archivos modificados:** `home.page.ts`, `price-list.page.ts`, `reservations.page.ts`

**Qué:** Estos componentes usaban métodos de servicio que antes retornaban datos síncronos (`Municipality[]`, `Price[]`) y ahora retornan `Observable<any>`.

**Por qué:** Al cambiar de mocks a HTTP, los métodos se volvieron asíncronos. Los componentes deben suscribirse a los Observables.

**Cambio:** Se usó `firstValueFrom()` con `async/await` para convertir Observables en promesas donde era necesario, y se ajustaron los tipos para manejar respuestas paginadas (campo `.content`).

### Problema: Tipado incorrecto en environment.prod.ts

**Archivo:** `environment.prod.ts`

**Qué:** No implementaba la interfaz `Environment` y tenía declaración genérica.

**Por qué:** Inconsistencia con el archivo dev y falta de type-safety.

**Cambio:** Se agregó la interfaz `Environment` inline y se tipó correctamente la constante.

---

## Parte 2: Backend (`turiscol-backend`)

### Problema CRÍTICO: Inconsistencia en paths de controllers vs Gateway

**14 archivos modificados** en 3 microservicios.

**Qué:** El Gateway usa `StripPrefix=2` en todas las rutas (elimina `/api/v1` de la URL antes de reenviar), pero 14 controllers tienen `@RequestMapping("/api/v1/...")`. Esto causaba que las peticiones NUNCA llegaran a los controllers correctos — el gateway reenviaba `/offers/active` pero el controller esperaba `/api/v1/offers/active`.

**Por qué:** Es un bug de configuración: el diseño correcto es que los microservicios NO incluyan el prefijo `/api/v1`, ya que el Gateway lo maneja. Este es el patrón estándar con Spring Cloud Gateway cuando se usa `StripPrefix`.

**Controllers corregidos:**

| Servicio | Controller | Antes | Después |
|----------|-----------|-------|---------|
| experience | OfferController | `/api/v1/offers` | `/offers` |
| experience | ReviewController | `/api/v1/reviews` | `/reviews` |
| experience | StockProductController | `/api/v1/offers/{id}/stock` | `/offers/{id}/stock` |
| experience | EventStatusHistoryController | `/api/v1/offers/event/{eventId}/events-status` | `/offers/event/{eventId}/events-status` |
| experience | OfferImageController | `/api/v1/offers/{offerId}/images` | `/offers/{offerId}/images` |
| experience | PriceListingController | `/api/v1/prices` | `/prices` |
| experience | ImageDestinationController | `/api/v1/locations/images` | `/locations/images` |
| experience | CityController | `/api/v1/locations/cities` | `/locations/cities` |
| experience | DepartmentController | `/api/v1/locations/departments` | `/locations/departments` |
| experience | DestinationController | `/api/v1/locations/destinations` | `/locations/destinations` |
| user | ProviderController | `/api/v1/user/providers` | `/user/providers` |
| user | RoleController | `/api/v1/users/roles` | `/users/roles` |
| booking | BookingController | `/api/v1/booking` | `/booking` |
| booking | PaymentWebhookController | `api/v1/webhooks/payments` (sin / inicial) | `/webhooks/payments` |

**Nota adicional:** El `PaymentWebhookController` también tenía el error de que le faltaba el `/` inicial en el `@RequestMapping`.

---

## Estado Final de la Conexión

| Endpoint | Frontend | Backend Gateway | Microservicio |
|----------|----------|----------------|---------------|
| `POST /auth/login` | ✅ `auth.ts` | ✅ permitAll | ✅ UserService `/auth/login` |
| `POST /auth/register` | ✅ `auth.ts` | ✅ permitAll | ✅ UserService `/auth/register` |
| `POST /auth/refresh` | ✅ interceptor | ✅ permitAll | ✅ UserService `/auth/refresh` |
| `GET /users/profile/{id}` | ✅ `User.ts` | ✅ authenticated | ✅ UserService `/users/profile/{id}` |
| `GET /offers?page=&size=` | ✅ `offers.ts` | ✅ authenticated | ✅ ExperienceService `/offers` |
| `GET /offers/active` | ✅ `offers.ts` | ✅ authenticated | ✅ ExperienceService `/offers/active` |
| `GET /offers/type/{type}` | ✅ `offers.ts` | ✅ authenticated | ✅ ExperienceService `/offers/type/{type}` |
| `GET /offers/{id}` | ✅ strategies | ✅ authenticated | ✅ ExperienceService `/offers/{id}` |
| `GET /locations/departments` | ✅ `DepartmentService.ts` | ✅ permitAll | ✅ ExperienceService `/locations/departments` |
| `GET /locations/departments/{id}/cities` | ✅ `location.ts` | ✅ permitAll | ✅ ExperienceService `/locations/departments/{id}/cities` |
| `GET /locations/cities` | ✅ `municipality.service.ts` | ✅ permitAll | ✅ ExperienceService `/locations/cities` |
| `GET /prices` | ✅ `price.ts` | ✅ authenticated | ✅ ExperienceService `/prices` |
| `GET /booking` | ✅ `booking.ts` | ✅ authenticated | ✅ BookingService `/booking` |
| `POST /booking` | ✅ `booking.ts` | ✅ authenticated | ✅ BookingService `/booking` |
| JWT Bearer token | ✅ interceptor | ✅ validated | ✅ Keycloak OAuth2 |
| Refresh token automático | ✅ interceptor | ✅ permitAll | ✅ UserService `/auth/refresh` |

---

---

## Parte 3: Categorías + Favoritos + Tipos minúscula

### 3.1 AccommodationCategory enum (NUEVO)

**Archivo:** `experience-service/.../entities/enums/AccommodationCategory.java`

**Qué:** Nuevo enum con `HOSPEDAJE, PASADIA` para categorizar ofertas de tipo Accommodation.

**Por qué:** `HOSPEDAJE` y `PASADIA` se sacaron de `ServiceCategory` y se movieron a un enum propio de Accommodation, ya que representan categorías de alojamiento, no de servicios.

### 3.2 ServiceCategory modificado

**Archivo:** `experience-service/.../entities/enums/ServiceCategory.java`

**Qué:** Se eliminaron `HOSPEDAJE, PASADIA`. Quedan: `GASTRONOMIA, TOUR, ARTESANIA, TRANSPORTE, GUIA, SERVICIO_TECNICO`.

### 3.3 AccommodationOffer con categoría

**Archivo:** `experience-service/.../entities/AccommodationOffer.java`

**Qué:** Se agregó campo `@Enumerated(EnumType.STRING) private AccommodationCategory accommodationCategory`.

**Por qué:** Las ofertas de alojamiento ahora tienen su propia categoría (`HOSPEDAJE` o `PASADIA`).

### 3.4 Offer type en minúscula

**Archivo:** `experience-service/.../entities/Offer.java`

**Cambio:** `@JsonSubTypes.Type(name = "PRODUCT")` → `@JsonSubTypes.Type(name = "product")` (igual para SERVICE, EVENT, ACCOMMODATION).

**Archivo:** `experience-service/.../controllers/OfferController.java`

**Cambio:** `resolveType()` ahora usa `type.toLowerCase()` y compara con `"accommodation"`, `"service"`, `"product"`, `"event"`.

**Frontend:** `src/app/core/models/Offers.ts` → `OfferType` enum valores en minúscula: `'accommodation'`, `'event'`, `'service'`, `'product'`.

**Por qué:** Consistencia con el diseño de API REST moderna.

### 3.5 PriceListing: category ahora es String

**Archivos modificados:**
- `PriceListing.java` → `private ServiceCategory category` → `private String category`
- `PriceListingRepository.java` → `findByCategory(ServiceCategory)` → `findByCategory(String)`
- `PriceListingServiceImpl.java` → Eliminado `parseCategory()`, uso directo de String
- `OfferDataInitializer.java` → Cambiadas referencias de `ServiceCategory.HOSPEDAJE` a `"HOSPEDAJE"`, etc.

**Por qué:** La columna DB ya era VARCHAR. Al mover HOSPEDAJE/PASADIA fuera de ServiceCategory, el enum no podía representar todas las categorías de PriceListing. String es más flexible.

### 3.6 Endpoint GET /categories (NUEVO)

**Archivo:** `experience-service/.../controllers/CategoryController.java`

**Endpoint:** `GET /categories` → retorna `Map<String, List<String>>` con categorías agrupadas por tipo de oferta.

```json
{
  "accommodation": ["HOSPEDAJE", "PASADIA"],
  "service": ["GASTRONOMIA", "TOUR", "ARTESANIA", "TRANSPORTE", "GUIA", "SERVICIO_TECNICO"],
  "product": ["ARTESANIA", "GASTRONOMIA", "TEXTIL", "BEBIDA", "OTRO"],
  "event": ["CONCERT", "WORKSHOP", "CONFERENCE", "FESTIVAL", "EXHIBITION", "TOUR", "OTHER"]
}
```

**Gateway:** Se agregó ruta `/api/v1/categories/**` a experience-service y `permitAll()` en SecurityConfig.

### 3.7 Favoritos (NUEVO)

**Archivos creados en experience-service:**

| Archivo | Ruta |
|---------|------|
| `V2__add_favorites.sql` | Migración Flyway con tabla `favorites` (id UUID, user_id, offer_id, created_at) + índices |
| `FavoriteEntity.java` | Entidad JPA con `@GeneratedValue(strategy = GenerationType.UUID)` |
| `FavoriteRepository.java` | Spring Data con `findByUserId()`, `existsByUserIdAndOfferId()`, `deleteByUserIdAndOfferId()` |
| `FavoriteController.java` | REST API completa |

**Endpoints:**
| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/favorites?userId={userId}` | Lista favoritos del usuario |
| `GET` | `/favorites/check?userId=&offerId=` | Verifica si una oferta es favorita |
| `POST` | `/favorites` | Agrega favorito (body: `{userId, offerId}`) |
| `DELETE` | `/favorites/{id}` | Elimina por ID |
| `DELETE` | `/favorites/by-offer?userId=&offerId=` | Elimina por usuario+oferta |

**Gateway:** Se agregó ruta `/api/v1/favorites/**` a experience-service.

### 3.8 Frontend: CategoryService (REESCRITO)

**Archivo:** `src/app/core/services/category.service.ts`

**Qué:** Ahora llama a `GET /categories` del backend en lugar de devolver mock data. Retorna `Observable<Category[]>` donde `Category = { type: string, name: string }`.

**Archivo eliminado:** `CategoryMock.ts`

### 3.9 Frontend: FavoritesService (REESCRITO)

**Archivo:** `src/app/core/services/favorites.services.ts`

**Qué:** Reemplaza el `signal(favoritesMock)` local por llamadas HTTP reales:
- `addFavorite()` → `POST /favorites`
- `removeFavorite()` → `DELETE /favorites/by-offer`
- `isFavorite()` → cache local via signal actualizado desde `GET /favorites`

**Cambio:** Todos los métodos ahora son `async` y retornan `Promise<void>`.

### 3.10 Frontend: Modelos alineados con backend

**Archivo:** `src/app/core/models/Offers.ts`

**Cambios:**
- `Offer` interface: eliminados `categoryId: number`, `title`, `rating`, `providerId` ahora es `string`
- Agregados campos reales: `name` (antes `title`), `providerId: string`
- Nuevos enums: `AccommodationCategory`, `ProductCategory`, `EventCategory`
- `AccommodationOffer`: agregados `accommodationCategory`, `bedrooms`, `bathrooms`, `allowPets`, `allowChildren`, `pricePerNight`
- `EventOffer`: cambiado a `eventType: EventCategory`, `ticketPrice`, `endDate`
- `ProductOffer`: agregado `productCategory`
- `ServiceOffer`: agregados `serviceCategory`, `requiresSchedule`, `durationInMinutes`, `capacity`, `pricePerPerson`
- `BookingFilters`: eliminado `minRating`, `categoryId` → reemplazado por `categoryName: string`

### 3.11 Frontend: DTOs y Adaptadores alineados

**DTOs** (`AccommodationDetailDto.ts`, `EventDetailDto.ts`, `ProductDetailDto.ts`): Reescritos para coincidir con los campos reales que retorna el backend (nombres en camelCase, campos del backend como `name`, `baseprice`, `maxGuests`, etc.)

**Adaptadores** (`OfferDetailAdapter.ts`): Actualizados para mapear los nuevos DTOs a los modelos de dominio.

### 3.12 Frontend: Páginas actualizadas

**`home.page.ts`**: `categoryService.getAll()` ahora es `async` (retorna `Observable`) → usa `firstValueFrom()`.

**`explore.page.ts`**:
- Categorías ahora se cargan desde backend via `firstValueFrom()`
- Filtro de categoría cambió de `selectedCategory: number` a `selectedCategoryName: string`
- Función helper `getOfferCategory()` extrae la categoría según el tipo de oferta
- Remove `rating` filter (ya no existe en backend)

**Templates**: `{{ offer.title }}` → `{{ offer.name }}` en 5 templates HTML.

**`favorites.page.ts`**: Métodos `removeLike()`, `addLike()` ahora son `async` y hacen `await` del servicio.

### 3.13 OfferDataInitializer actualizado

**Archivo:** `OfferDataInitializer.java`

**Cambios:**
- `caminata.setServiceCategory(ServiceCategory.PASADIA)` → `ServiceCategory.TOUR` (PASADIA ya no existe en Service)
- `cabana.setAccommodationCategory(AccommodationCategory.HOSPEDAJE)` (nuevo campo)
- PriceListings: cambiados de `ServiceCategory.HOSPEDAJE` a `"HOSPEDAJE"` (String)

---

---

## Parte 4: Plan de Mejoras — Navegación, Mapa, Calendario Cultural

### 4.1 Arquitectura: Contexto global de ciudad

**Archivo nuevo:** `src/app/core/services/selected-city.service.ts`

**Qué:** Service con `signal<Municipality | null>` que persiste la ciudad seleccionada en localStorage. Todas las páginas turista leen de este signal para filtrar contenido. Se inyecta como `providedIn: 'root'`.

### 4.2 Navegación: Nuevos tabs turista

**Archivos modificados:** `tabs.page.html`, `tabs.page.ts`, `tabs.routes.ts`

**Qué:**
- Quitado tab `account` (Perfil) del tab bar turista
- Agregado tab `map` (Mapa) con Leaflet
- Renombrado events route como calendario cultural
- Perfil movido a icono global en el header de cada página turista

**Nuevos tabs turista:**
| Tab | Label | Ícono | Página |
|-----|-------|-------|--------|
| home | Inicio | home | HomePage |
| offers | Explorar | map | ExplorePage |
| prices | Precios | cash | PricesPage |
| events | Calendario | calendar | EventsPage (conectado a API real) |
| map | Mapa | globe | MapPage (Leaflet + destinos) |

### 4.3 Frontend: DestinationService

**Archivo nuevo:** `src/app/core/services/destination.service.ts`

**Qué:** Consume `GET /locations/destinations/by-city/{cityId}` y `GET /locations/destinations/by-city/{cityId}/type/{type}`.

### 4.4 Frontend: MapPage

**Archivo nuevo:** `src/app/features/turista/map/map.page.ts`

**Dependencia:** `leaflet` + `@types/leaflet`

**Qué:** Mapa interactivo con Leaflet centrado en la ciudad seleccionada. Muestra marcadores por cada destino cultural (MUSEUM, PARK, BEACH, HISTORICAL_SITE, etc.) con popups de información. Filtros flotantes por tipo de destino.

### 4.5 Frontend: EventsPage conectada a API real

**Archivo modificado:** `events.page.ts`, `events.page.html`

**Qué:** Reemplaza datos mock por llamadas reales a `EventService.getAll()` y `EventService.getByCity()`. Agrega navegación por mes y calendario visual. Here da la ciudad de `SelectedCityService`.

### 4.6 Frontend: Home rediseñado

**Archivo modificado:** `home.page.ts`, `home.page.html`, `home.page.scss`

**Qué:**
- Agrega sección de **dato curioso** rotativo (hardcoded, 15 datos culturales colombianos)
- Convierte categorías en **chips de tipo de oferta** ("¿Qué buscas?")
- Muestra **destinos de la ciudad seleccionada** vía DestinationService
- Conecta ofertas destacadas a la ciudad global

### 4.7 Backend: Festividades culturales (PENDIENTE)

**Archivos nuevos (experience-service):**

| Archivo | Descripción |
|---------|-------------|
| `entities/Festivity.java` | Entidad JPA: id, name, description, startDate, endDate, cityId, image, category, culturalImportance, active |
| `controllers/FestivityController.java` | `GET /festivities`, `GET /festivities/by-city/{cityId}`, `GET /festivities/upcoming` |
| `services/FestivityServiceImpl.java` | CRUD con caché |
| `repositories/FestivityRepository.java` | Consultas por ciudad, mes, rango de fechas |
| `config/FestivityDataInitializer.java` | Seed con 20+ festividades colombianas |

**Endpoint planeados:**
```
GET /api/v1/festivities
GET /api/v1/festivities/by-city/{cityId}
GET /api/v1/festivities/upcoming
GET /api/v1/festivities/{id}
```

### 4.8 Backend: Seed data de destinos (PENDIENTE)

Poblar `destinations` con puntos culturales reales por ciudad (museos, plazas, iglesias, parques) con coordenadas geográficas.

---

## Cómo Iniciar

```bash
# 1. Iniciar backend
cd turiscol-backend
docker-compose up --build -d

# 2. Iniciar frontend
cd turiscol-mobilapp
npm start  # http://localhost:8101

# 3. La app apunta a http://localhost:8080/api/v1 (Gateway)
```
