# DOCUMENTACIÓN TURISCOL BACKEND

## 1. Resumen del Proyecto

**Turiscol** es una plataforma de turismo colombiana compuesta por 6 microservicios. El frontend es una app móvil en **Ionic** que consume la API a través del Gateway.

### 1.1 Microservicios
A los servicios se puede acceder mediante el Gateway en `http://localhost:8080` y las rutas se redirigen de la siguiente manera:
| Ruta Gateway | Destino |
|---|---|---|
| `/api/v1/locations/**` | experience-service |
| `/api/v1/offers/**` | experience-service |
| `/api/v1/reviews/**` | experience-service |
| `/api/v1/prices/**` | experience-service |
| `/api/v1/categories/**` | experience-service |
| `/api/v1/offers/favorites/**` | experience-service |
| `/api/v1/booking/**` | booking-service |
| `/api/v1/payments/**` | booking-service |
| `/api/v1/notifications/**` | notification-service |
| `/ws/**` | notification-service (WebSocket) |
| `/api/v1/users/**` | user-service |
| `/api/v1/auth/**` | user-service |

### 1.1.1 User Service (8802)
Gestiona usuarios, autenticación y roles. Se integra con Keycloak para el manejo de identidades.

### 1.1.2 Experience Service (8803)
Catálogo de la plataforma. Maneja ubicaciones, ofertas, reseñas, imágenes y precios.

### 1.1.3 Booking Service (8804)
Reservas y pagos. Se comunica con experience-service vía Feign para validar ofertas y stock.

### 1.1.4 Notification Service (8808)
Notificaciones in-app. Escucha eventos de RabbitMQ y persiste en MongoDB.

### 1.1.5 Gateway Service (8080)
Punto de entrada único. Maneja autenticación JWT, CORS, y enrutamiento a los microservicios.

### 1.1.6 Eureka Service (8811)
Service Discovery. Todos los servicios se registran aquí.

---

| Característica | Valor |
|---|---|
| **Java** | 21 |
| **Spring Boot** | 3.5.x |
| **Spring Cloud** | 2025.0.0 |
| **Arquitectura** | Microservicios con API Gateway |
| **Bases de datos** | PostgreSQL 15 (x3), MongoDB 6 |
| **Mensajería** | RabbitMQ (Topic Exchange) |
| **Auth** | Keycloak 24.0.2 (OIDC + JWT) |
| **Service Discovery** | Netflix Eureka |
| **Config** | Configuración local en cada servicio |
| **Imágenes** | Cloudinary |
| **API Docs** | Swagger/OpenAPI (springdoc-openapi) |
| **Trazabilidad** | Micrometer Tracing + Zipkin |
| **Migraciones BD** | Flyway |
| **Total endpoints** | 96 → 111 |
| **Total controladores** | 18 |
| **Redis** | Cache (ofertas, ubicaciones, precios) + Rate Limiting |
| **WebSocket** | STOMP con autenticación JWT, colas privadas por usuario. Raw WebSocket (mobile) + SockJS (browser) |
| **Email** | Thymeleaf templates + SMTP configurable |

---

## 2. Arquitectura

```
                         ┌─────────────┐
                         │   Keycloak   │ (8090)
                         └──────┬──────┘
                                │ JWT
┌─────────┐     ┌──────────────┼──────────────────┐
│ App Móvil│────▶   Gateway    │ (8080)            │
│ (Ionic)  │     └──────┬──────┴────────┬─────────┘
└─────────┘            │               │
               ┌───────▼────┐          
               │ Eureka(8811)│          
               └───────┬────┘          
                       │               
    ┌──────────────────┼───────────────────────────────┐
    │                  │                               │
    ▼                  ▼               ▼               ▼
┌──────────┐    ┌────────────┐    ┌───────────┐    ┌───────────────┐
│  User    │    │ Experience │    │  Booking  │    │ Notification  │
│ (8802)   │    │  (8803)    │    │  (8804)   │    │   (8808)      │
│ PostgreSQL│   │ PostgreSQL │    │ PostgreSQL│    │   MongoDB      │
└──────────┘    └────────────┘    └─────┬─────┘    └───────┬───────┘
                                        │                  │
                                        └───── RabbitMQ ───┘
                                        (domain.events)
```

## 3. API Completa por Servicio

### 3.1 User Service API

#### AuthController

| # | Método | Path | Descripción | Request Body | Response |
|---|--------|------|-------------|--------------|----------|
| 1 | POST | `/auth/login` | Login con email y contraseña | `LoginRequestDTO { email, password }` | `TokenResponseDTO { access_token, refresh_token }` |
| 2 | POST | `/auth/client-login` | Login M2M (client_credentials) | - | `TokenResponseDTO` |
| 3 | POST | `/auth/refresh` | Refrescar token | `refreshToken` (raw string) | `TokenResponseDTO` |
| 4 | POST | `/auth/register` | Registrar usuario (TOURIST o PROVIDER) | `UserRequestDTO` (polimórfico) | `UserResponseDTO` / `ProviderResponseDTO` (201) |

**UserRequestDTO** - Clase abstracta con subtipos:
- `@type = "TOURIST"` → `TouristRequestDTO` (sin campos extra)
- `@type = "PROVIDER"` → `ProviderRequestDTO` (type, razonSocial, description, certified, nitRut, website)

#### UserController

| # | Método | Path | Descripción | Parámetros | Response |
|---|--------|------|-------------|------------|----------|
| 5 | PUT | `/users/{id}` | Actualizar usuario | `id` (String path), body: `UserRequestDTO` | `UserResponseDTO` |
| 6 | PUT | `/users/{id}/deactivate` | Desactivar usuario | `id` (String path) | 204 No Content |
| 7 | PUT | `/users/{id}/activate` | Activar usuario | `id` (String path) | 204 No Content |
| 8 | GET | `/users/{id}` | Obtener usuario por ID | `id` (String path) | `UserResponseDTO` |
| 9 | GET | `/users/email/{email}` | Obtener usuario por email | `email` (String path) | `UserResponseDTO` |
| 10 | GET | `/users` | Listar usuarios (paginado) | `page`, `size` (query) | `Page<UserResponseDTO>` |
| 11 | GET | `/users/role/{role}` | Listar por rol (paginado) | `role` (String path), `page`, `size` | `Page<UserResponseDTO>` |
| 12 | GET | `/users/profile/{id}` | Obtener perfil | `id` (String path) | `UserResponseDTO` |

#### ProviderController

| # | Método | Path | Descripción | Response |
|---|--------|------|-------------|----------|
| 13 | POST | `/user/providers` | Crear provider (interno, sin ruta Gateway) | `ProviderResponseDTO` (201) |
| 14 | PUT | `/user/providers/{id}` | Actualizar provider (interno, sin ruta Gateway) | `ProviderResponseDTO` |
| 15 | GET | `/user/providers/by-username/{username}` | Obtener provider por username (interno, sin ruta Gateway) | `ProviderResponseDTO` |

#### RoleController

| # | Método | Path | Descripción | Response |
|---|--------|------|-------------|----------|
| 16 | GET | `/users/roles` | Listar roles de Keycloak (interno, sin ruta Gateway) | `List<String>` |

---

### 3.2 Booking Service API

#### BookingController

| # | Método | Path | Descripción | Headers | Request Body | Response |
|---|--------|------|-------------|---------|--------------|----------|
| 17 | POST | `/api/v1/booking` | Crear reserva | `X-User-Id`, `Idempotency-Key` | `CreateBookingRequestDTO` | `BookingResponseDTO` (201) |
| 18 | GET | `/api/v1/booking` | Listar reservas (paginado) | - | - | `Page<BookingResponseDTO>` |
| 19 | GET | `/api/v1/booking/{id}` | Detalle de reserva | - | - | `BookingDetailResponseDTO` |
| 20 | PUT | `/api/v1/booking/{id}` | Actualizar reserva | - | `UpdateBookingRequestDTO` | `BookingResponseDTO` |

#### PaymentWebhookController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 21 | POST | `/api/v1/webhooks/payments/success/{providerReference}` | Simular webhook de pago exitoso |
| 22 | POST | `/api/v1/webhooks/payments/failure/{providerReference}` | Simular webhook de pago fallido |

---

### 3.3 Experience Service API

#### OfferController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 23 | POST | `/api/v1/offers` | Crear oferta (cualquier tipo) |
| 24 | PUT | `/api/v1/offers/{id}` | Actualizar oferta |
| 25 | PATCH | `/api/v1/offers/{id}/activate` | Activar oferta |
| 26 | PATCH | `/api/v1/offers/{id}/deactivate` | Desactivar oferta |
| 27 | GET | `/api/v1/offers/{id}` | Obtener detalle de oferta |
| 28 | GET | `/api/v1/offers` | Listar ofertas (paginado) |
| 29 | GET | `/api/v1/offers/active` | Ofertas activas (paginado) |
| 30 | GET | `/api/v1/offers/provider/{providerId}` | Ofertas por proveedor (paginado) |
| 31 | GET | `/api/v1/offers/city/{cityId}` | Ofertas por ciudad (paginado) |
| 32 | GET | `/api/v1/offers/city/{cityId}/active` | Ofertas activas por ciudad (paginado) |
| 33 | GET | `/api/v1/offers/type/{type}` | Ofertas por tipo ACCOMMODATION/SERVICE/PRODUCT/EVENT (paginado) |
| 34 | GET | `/api/v1/offers/type/{type}/active` | Ofertas activas por tipo (paginado) |
| 35 | GET | `/api/v1/offers/search` | Buscar ofertas con filtros |
| 36 | GET | `/api/v1/offers/featured` | Ofertas destacadas (paginado) |
| 37 | PATCH | `/api/v1/offers/{id}/featured` | Marcar/desmarcar oferta como destacada (query: featured=true/false) |
| 38 | GET | `/api/v1/offers/type/{type}/category/{category}` | Ofertas activas por tipo y categoría (paginado) |

**Parámetros search:** `providerId`, `cityId`, `active`, `name`, `type`, `category`, `featured`, `minPrice`, `maxPrice`, `maxGuests`, `allowPets`, `allowChildren`, `startDate`, `endDate`, `capacity`, `page`, `size`

#### StockProductController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 39 | POST | `/api/v1/offers/{id}/stock/deduct` | Deducir stock (body: DeductStockRequest) |
| 40 | POST | `/api/v1/offers/{id}/stock/restock` | Reabastecer stock (query: quantity, description) |
| 41 | GET | `/api/v1/offers/{id}/stock` | Obtener stock actual |

#### EventStatusHistoryController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 42 | POST | `/api/v1/offers/event/{eventId}/events-status` | Registrar cambio de estado de evento |
| 43 | GET | `/api/v1/offers/event/{eventId}/events-status` | Obtener historial de estados |
| 44 | GET | `/api/v1/offers/event/{eventId}/events-status/latest` | Último estado del evento |
| 45 | GET | `/api/v1/offers/event/{eventId}/events-status/{status}` | Buscar por estado |

#### OfferImageController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 46 | POST | `/api/v1/offers/{offerId}/images` | Agregar imagen por URL |
| 47 | POST | `/api/v1/offers/{offerId}/images/upload` | Subir archivo de imagen |
| 48 | POST | `/api/v1/offers/{offerId}/images/batch-upload` | Subir múltiples imágenes |
| 49 | GET | `/api/v1/offers/{offerId}/images` | Listar imágenes de una oferta |
| 50 | DELETE | `/api/v1/offers/{offerId}/images/{imageId}` | Eliminar imagen |
| 51 | PATCH | `/api/v1/offers/{offerId}/images/{imageId}/primary` | Marcar como imagen principal |

#### CategoryController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 52 | GET | `/api/v1/offers/categories` | Obtener todas las categorías agrupadas por tipo de oferta |
| 53 | GET | `/api/v1/offers/types/{type}/categories` | Obtener categorías por tipo de oferta (accommodation, service, product, event) |

#### PriceListingController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 54 | POST | `/api/v1/prices` | Crear listing de precio |
| 55 | PUT | `/api/v1/prices/{id}` | Actualizar listing |
| 56 | GET | `/api/v1/prices/{id}` | Obtener listing por ID |
| 57 | GET | `/api/v1/prices` | Listar todos |
| 58 | GET | `/api/v1/prices/city/{cityId}` | Filtrar por ciudad |
| 59 | GET | `/api/v1/prices/category/{categoryName}` | Filtrar por categoría |
| 60 | GET | `/api/v1/prices/range` | Filtrar por rango (query: min, max) |
| 61 | GET | `/api/v1/prices/active` | Listings activos |
| 62 | DELETE | `/api/v1/prices/{id}` | Eliminar listing |

#### ReviewController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 63 | POST | `/api/v1/reviews` | Crear reseña |
| 64 | PUT | `/api/v1/reviews/{id}` | Actualizar reseña |
| 65 | DELETE | `/api/v1/reviews/{id}` | Eliminar reseña |
| 66 | GET | `/api/v1/reviews/{id}` | Obtener reseña por ID |
| 67 | GET | `/api/v1/reviews/user/{userId}` | Reseñas por usuario (paginado) |
| 68 | GET | `/api/v1/reviews/offer/{offerId}` | Reseñas por oferta (paginado) |
| 69 | GET | `/api/v1/reviews/service/{serviceId}/summary` | Resumen de calificaciones |

#### CityController (Municipality)

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 70 | POST | `/api/v1/locations/cities` | Crear ciudad/municipio |
| 71 | GET | `/api/v1/locations/cities` | Listar ciudades (paginado) |
| 72 | GET | `/api/v1/locations/cities/{id}` | Obtener ciudad por ID |
| 73 | PUT | `/api/v1/locations/cities/{id}` | Actualizar ciudad |
| 74 | DELETE | `/api/v1/locations/cities/{id}` | Eliminar ciudad |
| 75 | GET | `/api/v1/locations/cities/by-name/{name}` | Buscar ciudad por nombre (sin acentos) |
| 76 | GET | `/api/v1/locations/cities/search` | Buscar ciudades por nombre (coincidencia parcial, sin acentos, paginado) |
| 77 | GET | `/api/v1/locations/cities/by-name/{name}/department/{departmentId}` | Buscar por nombre + departamento |
| 78 | GET | `/api/v1/locations/cities/{id}/destinations` | Destinos por ciudad |
| 79 | GET | `/api/v1/locations/cities/featured` | Ciudades destacadas (paginado) |

#### DepartmentController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 79 | POST | `/api/v1/locations/departments` | Crear departamento |
| 80 | GET | `/api/v1/locations/departments` | Listar departamentos (paginado) |
| 81 | GET | `/api/v1/locations/departments/{id}` | Obtener departamento |
| 82 | PUT | `/api/v1/locations/departments/{id}` | Actualizar departamento |
| 83 | DELETE | `/api/v1/locations/departments/{id}` | Eliminar departamento |
| 84 | GET | `/api/v1/locations/departments/{id}/cities` | Departamentos con municipios |

#### DestinationController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 85 | POST | `/api/v1/locations/destinations` | Crear destino |
| 86 | GET | `/api/v1/locations/destinations` | Listar destinos (paginado) |
| 87 | GET | `/api/v1/locations/destinations/active` | Destinos activos (paginado) |
| 88 | GET | `/api/v1/locations/destinations/{id}` | Obtener destino |
| 89 | PUT | `/api/v1/locations/destinations/{id}` | Actualizar destino |
| 90 | DELETE | `/api/v1/locations/destinations/{id}` | Eliminar destino |
| 91 | GET | `/api/v1/locations/destinations/by-city/{cityId}` | Destinos por ciudad |
| 92 | GET | `/api/v1/locations/destinations/by-city/{cityId}/active` | Destinos activos por ciudad |
| 93 | GET | `/api/v1/locations/destinations/by-city/{cityId}/type/{type}` | Destinos por ciudad + tipo |
| 94 | GET | `/api/v1/locations/destinations/featured` | Destinos destacados (paginado) |

**Tipos de destino:** `VIEWPOINT`, `SPOT`, `HISTORICAL_SITE`, `MUSEUM`, `PARK`, `BEACH`, `NATURAL_RESERVE`

#### ImageDestinationController

| # | Método | Path | Descripción |
|---|--------|------|-------------|
| 95 | GET | `/api/v1/locations/images/by-destination/{destinationId}` | Imágenes de un destino |
| 96 | POST | `/api/v1/locations/images/by-destination/{destinationId}` | Crear imagen por URL |
| 97 | POST | `/api/v1/locations/images/upload/by-destination/{destinationId}` | Subir archivo de imagen |
| 98 | POST | `/api/v1/locations/images/batch-upload/by-destination/{destinationId}` | Subir múltiples imágenes |
| 99 | PUT | `/api/v1/locations/images/{id}` | Actualizar metadata de imagen |
| 100 | DELETE | `/api/v1/locations/images/{id}` | Eliminar imagen |

#### FavoriteController

| # | Método | Path | Descripción | Parámetros | Response |
|---|--------|------|-------------|------------|----------|
| 101 | GET | `/api/v1/offers/favorites` | Listar favoritos de un usuario | `userId` (query) | `UserFavoritesResponseDTO` |
| 102 | GET | `/api/v1/offers/favorites/check` | Verificar si es favorito | `userId` (query), `offerId` (query) | `{ isFavorite: boolean }` |
| 103 | POST | `/api/v1/offers/favorites` | Agregar favorito | body: `{ userId, offerId }` | `FavoriteResponseDTO` (201) |
| 104 | DELETE | `/api/v1/offers/favorites/{id}` | Eliminar favorito por ID | `id` (path) | 204 No Content |
| 105 | DELETE | `/api/v1/offers/favorites/by-offer` | Eliminar favorito por usuario+oferta | `userId` (query), `offerId` (query) | 204 No Content |

**UserFavoritesResponseDTO:** `{ user (ProviderSummary), offers: [{...offer fields..., createdAt}] }` — el `@JsonUnwrapped` aplana los campos del `Offer` dentro de cada ítem del array `offers` junto con su `createdAt`.

**FavoriteResponseDTO:** `{ id, user (ProviderSummary), offer (Offer completo), createdAt }` — usado solo en POST (Agregar favorito).

---

### 3.4 Notification Service API

| # | Método | Path | Descripción | Parámetros | Response |
|---|--------|------|-------------|------------|----------|
| 106 | GET | `/api/v1/notifications` | Notificaciones del usuario (paginado) | `userId` (query), `page`, `size` | `Page<NotificationEntity>` |
| 107 | PATCH | `/api/v1/notifications/{id}/read` | Marcar como leída | `id` (path), `userId` (query) | 200 OK |
| 108 | GET | `/api/v1/notifications/unread-count` | Contar no leídas | `userId` (query) | `long` |

---

## 4. Seguridad

### 4.1 Autenticación

El Gateway usa **OAuth2 Resource Server** con JWT emitido por **Keycloak**.

1. App móvil llama a `POST /api/v1/auth/login` (user-service) con email + password
2. User-service delega en Keycloak vía password grant y devuelve `access_token` + `refresh_token`
3. La app envía el token en header `Authorization: Bearer <token>` en todas las requests
4. Gateway valida el JWT contra Keycloak y extrae los roles

## 5. Sistema de Eventos (RabbitMQ)

### 5.1 Exchange

- **Nombre:** `domain.events`
- **Tipo:** TopicExchange (durable)

### 5.2 Colas y Bindings

| Cola | Routing Keys | Dead Letter | Servicio |
|---|---|---|---|
| `booking.experience.queue` | `experience.*` | `booking.events.dlq` | booking-service |
| `booking.payment.queue` | `payment.*` | `booking.events.dlq` | booking-service |
| `payment.booking.queue` | `booking.*` | `booking.events.dlq` | booking-service |
| `notification.events` | `booking.*`, `payment.*`, `review.*` | `notification.events.dlq` | notification-service |

### 5.3 Eventos del Dominio

| Evento | Publica | Consume | Descripción |
|---|---|---|---|
| `booking.payment_pending` | booking-service | payment-module | Se creó una reserva, esperando pago |
| `booking.confirmed` | booking-service | notification-service | Pago exitoso, reserva confirmada |
| `booking.cancelled` | booking-service | notification-service | Reserva cancelada |
| `payment.completed` | payment-module | booking-service, notification-service | Pago procesado exitosamente |
| `payment.failed` | payment-module | booking-service, notification-service | Pago fallido |


## 6. Acceso a servicios

| Servicio | URL |
|---|---|
| Gateway | http://localhost:8080 |
| Swagger UI (Gateway) | http://localhost:8080/swagger-ui.html |
| Eureka Dashboard | http://localhost:8811 |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |
| Keycloak Admin | http://localhost:8090 (admin/admin) |
| Redis | http://localhost:6379 |
| WebSocket (STOMP) | ws://localhost:8080/ws (Gateway) |

**Nota:** Antes de iniciar los servicios, crear el archivo `.env` en la raíz del proyecto con las variables necesarias para Keycloak (ver `.env.example`). Sin este archivo, el user-service no arranca.

---

## 7. Mejoras pendientes (tener en cuenta)

| Funcionalidad | Prioridad |
|---|---|
| Sistema de recomendaciones por IA (gustos e intereses del usuario → destinos y ofertas) | Alta |
| Chat bot para interacción con usuarios | Alta |
| Tests de integración (Testcontainers) | Baja |
| Cleanup de notificaciones viejas (TTL) | Baja |

**Contexto:** Para push notifications se necesita Firebase Cloud Messaging (FCM) + plugin `@capacitor/push-notifications` en Ionic.