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
| `/api/v1/festivities/**` | experience-service |
| `/api/v1/booking/**` | booking-service |
| `/api/v1/payments/**` | booking-service |
| `/api/v1/webhooks/**` | booking-service |
| `/api/v1/providers/**` | booking-service |
| `/api/v1/notifications/**` | notification-service |
| `/ws/**` | notification-service (WebSocket) |
| `/api/v1/users/**` | user-service |
| `/api/v1/auth/**` | user-service |
| `/api/v1/user/**` | user-service (rutas internas de provider) |

### 1.1.1 User Service (8802)

Gestiona usuarios, autenticación y roles. Se integra con Keycloak para el manejo de identidades.

### 1.1.2 Experience Service (8803)

Catálogo de la plataforma. Maneja ubicaciones, ofertas, reseñas, imágenes, precios y festividades culturales.

### 1.1.3 Booking Service (8804)

Reservas y pagos. Se comunica con experience-service vía Feign para validar ofertas y stock.

### 1.1.4 Notification Service (8808)

Notificaciones in-app. Escucha eventos de RabbitMQ y persiste en MongoDB.

### 1.1.5 Gateway Service (8080)

Punto de entrada único. Maneja autenticación JWT, CORS, y enrutamiento a los microservicios.

### 1.1.6 Eureka Service (8811)

Service Discovery. Todos los servicios se registran aquí.

---

| Característica          | Valor                                                                                              |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| **Java**                | 21                                                                                                 |
| **Spring Boot**         | 3.5.x                                                                                              |
| **Spring Cloud**        | 2025.0.0                                                                                           |
| **Arquitectura**        | Microservicios con API Gateway                                                                     |
| **Bases de datos**      | PostgreSQL 15 (x3), MongoDB 6                                                                      |
| **Mensajería**          | RabbitMQ (Topic Exchange)                                                                          |
| **Auth**                | Keycloak 24.0.2 (OIDC + JWT)                                                                       |
| **Service Discovery**   | Netflix Eureka                                                                                     |
| **Config**              | Configuración local en cada servicio                                                               |
| **Imágenes**            | Cloudinary                                                                                         |
| **API Docs**            | Swagger/OpenAPI (springdoc-openapi)                                                                |
| **Trazabilidad**        | Micrometer Tracing + Zipkin                                                                        |
| **Migraciones BD**      | ddl-auto=update (no Flyway)                                                                        |
| **Total endpoints**     | ~113 implementados + ~12 planeados                                                                 |
| **Total controladores** | 21                                                                                                 |
| **Redis**               | Cache (ofertas, ubicaciones, precios) + Rate Limiting                                              |
| **WebSocket**           | STOMP con autenticación JWT, colas privadas por usuario. Raw WebSocket (mobile) + SockJS (browser) |
| **Email**               | Thymeleaf templates + SMTP configurable                                                            |

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

| #   | Método | Path                 | Descripción                            | Request Body                          | Response                                           |
| --- | ------ | -------------------- | -------------------------------------- | ------------------------------------- | -------------------------------------------------- |
| 1   | POST   | `/auth/login`        | Login con email y contraseña           | `LoginRequestDTO { email, password }` | `TokenResponseDTO { access_token, refresh_token }` |
| 2   | POST   | `/auth/client-login` | Login M2M (client_credentials)         | -                                     | `TokenResponseDTO`                                 |
| 3   | POST   | `/auth/refresh`      | Refrescar token                        | `refreshToken` (raw string)           | `TokenResponseDTO`                                 |
| 4   | POST   | `/auth/register`     | Registrar usuario (TOURIST o PROVIDER) | `UserRequestDTO` (polimórfico)        | `UserResponseDTO` / `ProviderResponseDTO` (201)    |

**UserRequestDTO** - Clase abstracta con subtipos:

- `@type = "TOURIST"` → `TouristRequestDTO` (sin campos extra)
- `@type = "PROVIDER"` → `ProviderRequestDTO` (type, razonSocial, description, certified, nitRut, website)

#### UserController

| #   | Método | Path                     | Descripción                | Parámetros                                 | Response                |
| --- | ------ | ------------------------ | -------------------------- | ------------------------------------------ | ----------------------- |
| 5   | PUT    | `/users/{id}`            | Actualizar usuario         | `id` (String path), body: `UserRequestDTO` | `UserResponseDTO`       |
| 6   | PUT    | `/users/{id}/deactivate` | Desactivar usuario         | `id` (String path)                         | 204 No Content          |
| 7   | PUT    | `/users/{id}/activate`   | Activar usuario            | `id` (String path)                         | 204 No Content          |
| 8   | GET    | `/users/{id}`            | Obtener usuario por ID     | `id` (String path)                         | `UserResponseDTO`       |
| 9   | GET    | `/users/email/{email}`   | Obtener usuario por email  | `email` (String path)                      | `UserResponseDTO`       |
| 10  | GET    | `/users`                 | Listar usuarios (paginado) | `page`, `size` (query)                     | `Page<UserResponseDTO>` |
| 11  | GET    | `/users/role/{role}`     | Listar por rol (paginado)  | `role` (String path), `page`, `size`       | `Page<UserResponseDTO>` |
| 12  | GET    | `/users/profile/{id}`    | Obtener perfil             | `id` (String path)                         | `UserResponseDTO`       |

#### ProviderController

| #   | Método | Path                                     | Descripción                                               | Response                    | @PreAuthorize |
| --- | ------ | ---------------------------------------- | --------------------------------------------------------- | --------------------------- | ------------- |
| 13  | POST   | `/user/providers`                        | Crear provider (interno, sin ruta Gateway)                | `ProviderResponseDTO` (201) | —             |
| 14  | PUT    | `/user/providers/{id}`                   | Actualizar provider (interno, sin ruta Gateway)           | `ProviderResponseDTO`       | —             |
| 15  | GET    | `/user/providers/by-username/{username}` | Obtener provider por username (interno, sin ruta Gateway) | `ProviderResponseDTO`       | —             |

#### RoleController

| #   | Método | Path           | Descripción                                          | Response       |
| --- | ------ | -------------- | ---------------------------------------------------- | -------------- |
| 16  | GET    | `/users/roles` | Listar roles de Keycloak (interno, sin ruta Gateway) | `List<String>` |

---

### 3.2 Booking Service API

#### BookingController

| #   | Método | Path                          | Descripción                | Headers                        | Request Body              | Response                   | @PreAuthorize                                                   |
| --- | ------ | ----------------------------- | -------------------------- | ------------------------------ | ------------------------- | -------------------------- | --------------------------------------------------------------- |
| 17  | POST   | `/api/v1/booking`             | Crear reserva              | `X-User-Id`, `Idempotency-Key` | `CreateBookingRequestDTO` | `BookingResponseDTO` (201) | —                                                               |
| 18  | GET    | `/api/v1/booking`             | Listar reservas (paginado) | -                              | -                         | `Page<BookingResponseDTO>` | —                                                               |
| 19  | GET    | `/api/v1/booking/{id}`        | Detalle de reserva         | -                              | -                         | `BookingDetailResponseDTO` | —                                                               |
| 20  | PUT    | `/api/v1/booking/{id}`        | Actualizar reserva         | -                              | `UpdateBookingRequestDTO` | `BookingResponseDTO`       | —                                                               |
| 21  | POST   | `/api/v1/booking/{id}/cancel` | Cancelar reserva           | `X-User-Id`                    | —                         | `BookingResponseDTO`       | `#userId == @bookingServiceImpl.getBookingById(#id).customerId` |

#### CheckoutController

| #   | Método | Path                                   | Descripción                          | Headers     | Response                                                  | @PreAuthorize                                                          |
| --- | ------ | -------------------------------------- | ------------------------------------ | ----------- | --------------------------------------------------------- | ---------------------------------------------------------------------- |
| 22  | POST   | `/api/v1/booking/{bookingId}/checkout` | Iniciar checkout y obtener ref. pago | `X-User-Id` | `CheckoutResponse { paymentReference, amount, currency }` | `#userId == @bookingServiceImpl.getBookingById(#bookingId).customerId` |

#### PaymentWebhookController

| #   | Método | Path                                                    | Descripción                     |
| --- | ------ | ------------------------------------------------------- | ------------------------------- |
| 23  | POST   | `/api/v1/webhooks/payments/success/{providerReference}` | Simular webhook de pago exitoso |
| 24  | POST   | `/api/v1/webhooks/payments/failure/{providerReference}` | Simular webhook de pago fallido |

#### Planeado / No implementado

Los siguientes endpoints están documentados en `DOCUMENTACION_PAGOS.md` como parte del dashboard de proveedores y pagos semanales, pero **aún no tienen controller ni service en el código**. Se implementarán cuando se desarrolle el módulo de providers:

| Método | Path                                      | Descripción                                        |
| ------ | ----------------------------------------- | -------------------------------------------------- |
| GET    | `/api/v1/providers/dashboard`             | Indicadores financieros y operativos del proveedor |
| GET    | `/api/v1/providers/bookings/pending`      | Reservas CONFIRMED + COMPLETION_REQUESTED          |
| GET    | `/api/v1/providers/bookings/completed`    | Reservas COMPLETED                                 |
| GET    | `/api/v1/providers/bookings/cancelled`    | Reservas CANCELLED                                 |
| GET    | `/api/v1/providers/earnings`              | Ganancias por reserva (histórico)                  |
| GET    | `/api/v1/providers/settlements`           | Historial de pagos semanales                       |
| GET    | `/api/v1/providers/settlements/{id}`      | Detalle de pago semanal con bookings               |
| POST   | `/api/v1/providers/payment-info`          | Registrar datos bancarios                          |
| GET    | `/api/v1/providers/payment-info`          | Obtener datos bancarios                            |
| PUT    | `/api/v1/providers/payment-info`          | Actualizar datos bancarios                         |
| POST   | `/api/v1/booking/{id}/complete-request`   | Provider solicita completación                     |
| POST   | `/api/v1/booking/{id}/confirm-completion` | Turista confirma completación                      |

---

### 3.3 Experience Service API

#### OfferController

| #   | Método | Path                                             | Descripción                                                         | @PreAuthorize                                                                  |
| --- | ------ | ------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 25  | POST   | `/api/v1/offers`                                 | Crear oferta (cualquier tipo)                                       | `authentication.principal != null`                                             |
| 26  | PUT    | `/api/v1/offers/{id}`                            | Actualizar oferta                                                   | `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal` |
| 27  | PATCH  | `/api/v1/offers/{id}/activate`                   | Activar oferta                                                      | `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal` |
| 28  | PATCH  | `/api/v1/offers/{id}/deactivate`                 | Desactivar oferta                                                   | `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal` |
| 29  | GET    | `/api/v1/offers/{id}`                            | Obtener detalle de oferta                                           | —                                                                              |
| 30  | GET    | `/api/v1/offers`                                 | Listar ofertas (paginado)                                           | —                                                                              |
| 31  | GET    | `/api/v1/offers/active`                          | Ofertas activas (paginado)                                          | —                                                                              |
| 32  | GET    | `/api/v1/offers/provider/{providerId}`           | Ofertas por proveedor (paginado)                                    | —                                                                              |
| 33  | GET    | `/api/v1/offers/city/{cityId}`                   | Ofertas por ciudad (paginado)                                       | —                                                                              |
| 34  | GET    | `/api/v1/offers/city/{cityId}/active`            | Ofertas activas por ciudad (paginado)                               | —                                                                              |
| 35  | GET    | `/api/v1/offers/type/{type}`                     | Ofertas por tipo ACCOMMODATION/SERVICE/PRODUCT/EVENT (paginado)     | —                                                                              |
| 36  | GET    | `/api/v1/offers/type/{type}/active`              | Ofertas activas por tipo (paginado)                                 | —                                                                              |
| 37  | GET    | `/api/v1/offers/search`                          | Buscar ofertas con filtros                                          | —                                                                              |
| 38  | GET    | `/api/v1/offers/featured`                        | Ofertas destacadas (paginado)                                       | —                                                                              |
| 39  | PATCH  | `/api/v1/offers/{id}/featured`                   | Marcar/desmarcar oferta como destacada (query: featured=true/false) | —                                                                              |
| 40  | GET    | `/api/v1/offers/type/{type}/category/{category}` | Ofertas activas por tipo y categoría (paginado)                     | —                                                                              |

**Parámetros search:** `providerId`, `cityId`, `active`, `name`, `type`, `category`, `featured`, `minPrice`, `maxPrice`, `maxGuests`, `allowPets`, `allowChildren`, `startDate`, `endDate`, `capacity`, `page`, `size`

#### StockProductController

| #   | Método | Path                                | Descripción                                      | @PreAuthorize                                                                  |
| --- | ------ | ----------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------------------ |
| 41  | POST   | `/api/v1/offers/{id}/stock/deduct`  | Deducir stock (body: DeductStockRequest)         | `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal` |
| 42  | POST   | `/api/v1/offers/{id}/stock/restock` | Reabastecer stock (query: quantity, description) | `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal` |
| 43  | GET    | `/api/v1/offers/{id}/stock`         | Obtener stock actual                             | —                                                                              |

#### EventStatusHistoryController

| #   | Método | Path                                                    | Descripción                          |
| --- | ------ | ------------------------------------------------------- | ------------------------------------ |
| 44  | POST   | `/api/v1/offers/event/{eventId}/events-status`          | Registrar cambio de estado de evento |
| 45  | GET    | `/api/v1/offers/event/{eventId}/events-status`          | Obtener historial de estados         |
| 46  | GET    | `/api/v1/offers/event/{eventId}/events-status/latest`   | Último estado del evento             |
| 47  | GET    | `/api/v1/offers/event/{eventId}/events-status/{status}` | Buscar por estado                    |

#### OfferImageController

| #   | Método | Path                                                | Descripción                   |
| --- | ------ | --------------------------------------------------- | ----------------------------- |
| 48  | POST   | `/api/v1/offers/{offerId}/images`                   | Agregar imagen por URL        |
| 49  | POST   | `/api/v1/offers/{offerId}/images/upload`            | Subir archivo de imagen       |
| 50  | POST   | `/api/v1/offers/{offerId}/images/batch-upload`      | Subir múltiples imágenes      |
| 51  | GET    | `/api/v1/offers/{offerId}/images`                   | Listar imágenes de una oferta |
| 52  | DELETE | `/api/v1/offers/{offerId}/images/{imageId}`         | Eliminar imagen               |
| 53  | PATCH  | `/api/v1/offers/{offerId}/images/{imageId}/primary` | Marcar como imagen principal  |

#### CategoryController

| #   | Método | Path                                     | Descripción                                                                    |
| --- | ------ | ---------------------------------------- | ------------------------------------------------------------------------------ |
| 54  | GET    | `/api/v1/offers/categories`              | Obtener todas las categorías agrupadas por tipo de oferta                      |
| 55  | GET    | `/api/v1/offers/types/{type}/categories` | Obtener categorías por tipo de oferta (accommodation, service, product, event) |

#### PriceListingController

| #   | Método | Path                                     | Descripción                         |
| --- | ------ | ---------------------------------------- | ----------------------------------- |
| 56  | POST   | `/api/v1/prices`                         | Crear listing de precio             |
| 57  | PUT    | `/api/v1/prices/{id}`                    | Actualizar listing                  |
| 58  | GET    | `/api/v1/prices/{id}`                    | Obtener listing por ID              |
| 59  | GET    | `/api/v1/prices`                         | Listar todos                        |
| 60  | GET    | `/api/v1/prices/city/{cityId}`           | Filtrar por ciudad                  |
| 61  | GET    | `/api/v1/prices/category/{categoryName}` | Filtrar por categoría               |
| 62  | GET    | `/api/v1/prices/range`                   | Filtrar por rango (query: min, max) |
| 63  | GET    | `/api/v1/prices/active`                  | Listings activos                    |
| 64  | DELETE | `/api/v1/prices/{id}`                    | Eliminar listing                    |

#### ReviewController

| #   | Método | Path                                          | Descripción                    | @PreAuthorize                                                            |
| --- | ------ | --------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------ |
| 65  | POST   | `/api/v1/reviews`                             | Crear reseña                   | `authentication.principal != null`                                       |
| 66  | PUT    | `/api/v1/reviews/{id}`                        | Actualizar reseña              | `@reviewService.getReviewById(#id).authorId == authentication.principal` |
| 67  | DELETE | `/api/v1/reviews/{id}`                        | Eliminar reseña                | `@reviewService.getReviewById(#id).authorId == authentication.principal` |
| 68  | GET    | `/api/v1/reviews/{id}`                        | Obtener reseña por ID          | —                                                                        |
| 69  | GET    | `/api/v1/reviews/user/{userId}`               | Reseñas por usuario (paginado) | —                                                                        |
| 70  | GET    | `/api/v1/reviews/offer/{offerId}`             | Reseñas por oferta (paginado)  | —                                                                        |
| 71  | GET    | `/api/v1/reviews/service/{serviceId}/summary` | Resumen de calificaciones      | —                                                                        |

#### CityController (Municipality)

| #   | Método | Path                                                                | Descripción                                                              |
| --- | ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 72  | POST   | `/api/v1/locations/cities`                                          | Crear ciudad/municipio                                                   |
| 73  | GET    | `/api/v1/locations/cities`                                          | Listar ciudades (paginado)                                               |
| 74  | GET    | `/api/v1/locations/cities/{id}`                                     | Obtener ciudad por ID                                                    |
| 75  | PUT    | `/api/v1/locations/cities/{id}`                                     | Actualizar ciudad                                                        |
| 76  | DELETE | `/api/v1/locations/cities/{id}`                                     | Eliminar ciudad                                                          |
| 77  | GET    | `/api/v1/locations/cities/by-name/{name}`                           | Buscar ciudad por nombre (sin acentos)                                   |
| 78  | GET    | `/api/v1/locations/cities/by-name/{name}/department/{departmentId}` | Buscar por nombre + departamento                                         |
| 79  | GET    | `/api/v1/locations/cities/search`                                   | Buscar ciudades por nombre (coincidencia parcial, sin acentos, paginado) |
| 80  | GET    | `/api/v1/locations/cities/{id}/destinations`                        | Destinos por ciudad                                                      |
| 81  | GET    | `/api/v1/locations/cities/{cityId}/destinations/by-type/{type}`     | Destinos por ciudad y tipo (paginado)                                    |
| 82  | GET    | `/api/v1/locations/cities/featured`                                 | Ciudades destacadas (paginado)                                           |

#### DepartmentController

| #   | Método | Path                                        | Descripción                     |
| --- | ------ | ------------------------------------------- | ------------------------------- |
| 83  | POST   | `/api/v1/locations/departments`             | Crear departamento              |
| 84  | GET    | `/api/v1/locations/departments`             | Listar departamentos (paginado) |
| 85  | GET    | `/api/v1/locations/departments/{id}`        | Obtener departamento            |
| 86  | PUT    | `/api/v1/locations/departments/{id}`        | Actualizar departamento         |
| 87  | DELETE | `/api/v1/locations/departments/{id}`        | Eliminar departamento           |
| 88  | GET    | `/api/v1/locations/departments/{id}/cities` | Departamentos con municipios    |

#### DestinationController

| #   | Método | Path                                                          | Descripción                    |
| --- | ------ | ------------------------------------------------------------- | ------------------------------ |
| 89  | POST   | `/api/v1/locations/destinations`                              | Crear destino                  |
| 90  | GET    | `/api/v1/locations/destinations`                              | Listar destinos (paginado)     |
| 91  | GET    | `/api/v1/locations/destinations/active`                       | Destinos activos (paginado)    |
| 92  | GET    | `/api/v1/locations/destinations/{id}`                         | Obtener destino                |
| 93  | PUT    | `/api/v1/locations/destinations/{id}`                         | Actualizar destino             |
| 94  | DELETE | `/api/v1/locations/destinations/{id}`                         | Eliminar destino               |
| 95  | GET    | `/api/v1/locations/destinations/by-city/{cityId}`             | Destinos por ciudad            |
| 96  | GET    | `/api/v1/locations/destinations/by-city/{cityId}/active`      | Destinos activos por ciudad    |
| 97  | GET    | `/api/v1/locations/destinations/by-city/{cityId}/type/{type}` | Destinos por ciudad + tipo     |
| 98  | GET    | `/api/v1/locations/destinations/featured`                     | Destinos destacados (paginado) |

**Tipos de destino:** `VIEWPOINT`, `SPOT`, `HISTORICAL_SITE`, `MUSEUM`, `PARK`, `BEACH`, `NATURAL_RESERVE`

#### ImageDestinationController

| #   | Método | Path                                                                   | Descripción                   |
| --- | ------ | ---------------------------------------------------------------------- | ----------------------------- |
| 99  | GET    | `/api/v1/locations/images/by-destination/{destinationId}`              | Imágenes de un destino        |
| 100 | POST   | `/api/v1/locations/images/by-destination/{destinationId}`              | Crear imagen por URL          |
| 101 | POST   | `/api/v1/locations/images/upload/by-destination/{destinationId}`       | Subir archivo de imagen       |
| 102 | POST   | `/api/v1/locations/images/batch-upload/by-destination/{destinationId}` | Subir múltiples imágenes      |
| 103 | PUT    | `/api/v1/locations/images/{id}`                                        | Actualizar metadata de imagen |
| 104 | DELETE | `/api/v1/locations/images/{id}`                                        | Eliminar imagen               |

#### FavoriteController

| #   | Método | Path                                | Descripción                          | Parámetros                          | Response                    |
| --- | ------ | ----------------------------------- | ------------------------------------ | ----------------------------------- | --------------------------- |
| 105 | GET    | `/api/v1/offers/favorites`          | Listar favoritos de un usuario       | `userId` (query)                    | `UserFavoritesResponseDTO`  |
| 106 | GET    | `/api/v1/offers/favorites/check`    | Verificar si es favorito             | `userId` (query), `offerId` (query) | `{ isFavorite: boolean }`   |
| 107 | POST   | `/api/v1/offers/favorites`          | Agregar favorito                     | body: `{ userId, offerId }`         | `FavoriteResponseDTO` (201) |
| 108 | DELETE | `/api/v1/offers/favorites/{id}`     | Eliminar favorito por ID             | `id` (path)                         | 204 No Content              |
| 109 | DELETE | `/api/v1/offers/favorites/by-offer` | Eliminar favorito por usuario+oferta | `userId` (query), `offerId` (query) | 204 No Content              |

**UserFavoritesResponseDTO:** `{ user (ProviderSummary), offers: [{...offer fields..., createdAt}] }` — el `@JsonUnwrapped` aplana los campos del `Offer` dentro de cada ítem del array `offers` junto con su `createdAt`.

**FavoriteResponseDTO:** `{ id, user (ProviderSummary), offer (Offer completo), createdAt }` — usado solo en POST (Agregar favorito).

---

### 3.4 Notification Service API

| #   | Método | Path                                 | Descripción                           | Parámetros                       | Response                   |
| --- | ------ | ------------------------------------ | ------------------------------------- | -------------------------------- | -------------------------- |
| 110 | GET    | `/api/v1/notifications`              | Notificaciones del usuario (paginado) | `userId` (query), `page`, `size` | `Page<NotificationEntity>` |
| 111 | PATCH  | `/api/v1/notifications/{id}/read`    | Marcar como leída                     | `id` (path), `userId` (query)    | 200 OK                     |
| 112 | GET    | `/api/v1/notifications/unread-count` | Contar no leídas                      | `userId` (query)                 | `long`                     |

### 3.5 FestivityController (experience-service)

Festividades culturales colombianas (Carnaval de Barranquilla, Feria de las Flores, etc.).
Son entidades informativas de calendario cultural, **no** ofertas vendibles — a diferencia de `EventOffer`,
las festividades no tienen proveedor, precio, ni capacidad. Se crean a nivel de administración del sistema.

| #   | Método | Path                                   | Descripción                       | Request                              | Response                  |
| --- | ------ | -------------------------------------- | --------------------------------- | ------------------------------------ | ------------------------- |
| 113 | POST   | `/api/v1/festivities`                  | Crear festividad                  | `FestivityRequest`                   | `FestivityResponse` (201) |
| 114 | GET    | `/api/v1/festivities`                  | Listar todas (paginado)           | `page`, `size` (query)               | `Page<FestivityResponse>` |
| 115 | GET    | `/api/v1/festivities/{id}`             | Obtener por ID                    | `id` (UUID path)                     | `FestivityResponse`       |
| 116 | PUT    | `/api/v1/festivities/{id}`             | Actualizar                        | `id` (UUID path), `FestivityRequest` | `FestivityResponse`       |
| 117 | DELETE | `/api/v1/festivities/{id}`             | Eliminar                          | `id` (UUID path)                     | 204 No Content            |
| 118 | GET    | `/api/v1/festivities/by-city/{cityId}` | Festividades activas por ciudad   | `cityId` (Long path), `page`, `size` | `Page<FestivityResponse>` |
| 119 | GET    | `/api/v1/festivities/upcoming`         | Próximas festividades (desde hoy) | —                                    | `List<FestivityResponse>` |

**Entidad Festivity:**

| Campo         | Tipo                  | Descripción                              |
| ------------- | --------------------- | ---------------------------------------- |
| `id`          | `UUID` (autogenerado) | Identificador único                      |
| `name`        | `String`              | Nombre de la festividad                  |
| `description` | `String`              | Descripción (opcional, máx 2000 chars)   |
| `startDate`   | `LocalDate`           | Fecha de inicio                          |
| `endDate`     | `LocalDate`           | Fecha de fin                             |
| `cityId`      | `Long`                | ID del municipio (FK a `municipalities`) |
| `image`       | `String`              | URL de imagen representativa             |
| `active`      | `Boolean`             | Activo (default `true`)                  |

**FestivityRequest:**

```json
{
  "name": "Feria de las Flores",
  "description": "Evento tradicional de Medellín...",
  "startDate": "2026-08-01",
  "endDate": "2026-08-10",
  "cityId": 1,
  "image": "https://...",
  "active": true
}
```

**FestivityResponse:**

```json
{
  "id": "uuid",
  "name": "Feria de las Flores",
  "description": "Evento tradicional de Medellín...",
  "startDate": "2026-08-01",
  "endDate": "2026-08-10",
  "cityId": 1,
  "image": "https://...",
  "active": true
}
```

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

| Cola                       | Routing Keys                         | Dead Letter               | Servicio             |
| -------------------------- | ------------------------------------ | ------------------------- | -------------------- |
| `booking.experience.queue` | `experience.*`                       | `booking.events.dlq`      | booking-service      |
| `booking.payment.queue`    | `payment.*`                          | `booking.events.dlq`      | booking-service      |
| `payment.booking.queue`    | `booking.*`                          | `booking.events.dlq`      | booking-service      |
| `notification.events`      | `booking.*`, `payment.*`, `review.*` | `notification.events.dlq` | notification-service |

### 5.3 Eventos del Dominio

| Evento                         | Publica         | Consume                               | Descripción                              |
| ------------------------------ | --------------- | ------------------------------------- | ---------------------------------------- |
| `booking.payment_pending`      | booking-service | payment-module                        | Se creó una reserva, esperando pago      |
| `booking.confirmed`            | booking-service | notification-service                  | Pago exitoso, reserva confirmada         |
| `booking.cancelled`            | booking-service | notification-service                  | Reserva cancelada                        |
| `booking.completion_requested` | booking-service | notification-service                  | Provider solicitó completación           |
| `booking.completed`            | booking-service | notification-service                  | Reserva completada, earnings disponibles |
| `payment.completed`            | payment-module  | booking-service, notification-service | Pago procesado exitosamente              |
| `payment.failed`               | payment-module  | booking-service, notification-service | Pago fallido                             |
| `settlement.paid`              | booking-service | notification-service                  | Pago semanal transferido al proveedor    |

## 6. Acceso a servicios

| Servicio             | URL                                   |
| -------------------- | ------------------------------------- |
| Gateway              | http://localhost:8080                 |
| Swagger UI (Gateway) | http://localhost:8080/swagger-ui.html |
| Eureka Dashboard     | http://localhost:8811                 |
| RabbitMQ Management  | http://localhost:15672 (guest/guest)  |
| Keycloak Admin       | http://localhost:8090 (admin/admin)   |
| Redis                | http://localhost:6379                 |
| WebSocket (STOMP)    | ws://localhost:8080/ws (Gateway)      |

**Nota:** Antes de iniciar los servicios, crear el archivo `.env` en la raíz del proyecto con las variables necesarias para Keycloak (ver `.env.example`). Sin este archivo, el user-service no arranca.

---

## 7. Mejoras pendientes (tener en cuenta)

| Funcionalidad                                                                           | Prioridad                                                  |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Sistema de pagos semanales a proveedores (comisiones, settlements, dashboard)           | 🔴 No implementado (planificado en DOCUMENTACION_PAGOS.md) |
| Pasarela de pago real (Stripe/Wompi/MercadoPago)                                        | 🟡 Media                                                   |
| Sistema de recomendaciones por IA (gustos e intereses del usuario → destinos y ofertas) | Alta                                                       |
| Chat bot para interacción con usuarios                                                  | Alta                                                       |
| Tests de integración (Testcontainers)                                                   | Baja                                                       |
| Cleanup de notificaciones viejas (TTL)                                                  | Baja                                                       |

**Contexto:** Para push notifications se necesita Firebase Cloud Messaging (FCM) + plugin `@capacitor/push-notifications` en Ionic.

---
