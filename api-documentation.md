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

Notificaciones in-app y por email. Escucha eventos de RabbitMQ (`booking.*`, `payment.*`, `review.*`, `settlement.*`), persiste en MongoDB, empuja por WebSocket (STOMP) y envía emails con Thymeleaf templates.

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
| **Pagos**               | MercadoPago SDK (Checkout Pro) + Strategy Pattern (MOCK/MERCADOPAGO)                               |
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

| #   | Método | Path                 | Descripción                    |
| --- | ------ | -------------------- | ------------------------------ |
| 1   | POST   | `/auth/login`        | Login con email y contraseña   |
| 2   | POST   | `/auth/client-login` | Login M2M (client_credentials) |
| 3   | POST   | `/auth/refresh`      | Refrescar token                |
| 4   | POST   | `/auth/register`     | Registrar usuario              |

---

##### POST `/auth/login` — Login

**Request Body:** `LoginRequestDTO`

| Campo      | Tipo   | Descripción |
| ---------- | ------ | ----------- |
| `email`    | String | Email       |
| `password` | String | Contraseña  |

**Response:** `200 OK` — `TokenResponseDTO`

| Campo          | Tipo   | JSON Property     |
| -------------- | ------ | ----------------- |
| `accessToken`  | String | `"access_token"`  |
| `refreshToken` | String | `"refresh_token"` |
| `userName`     | String | `"userName"`      |

---

##### POST `/auth/client-login` — Login M2M

**Request Body:** Ninguno

**Response:** `200 OK` — `TokenResponseDTO` (misma estructura que `/auth/login`)

---

##### POST `/auth/refresh` — Refrescar token

**Request Body:** `RefreshTokenRequestDTO`

| Campo          | Tipo   | Validación  | Descripción      |
| -------------- | ------ | ----------- | ---------------- |
| `refreshToken` | String | `@NotBlank` | Token de refresh |

**Response:** `200 OK` — `TokenResponseDTO`

---

##### POST `/auth/register` — Registrar usuario

**Request Body:** `UserRequestDTO` (polimórfico via discriminador `"userType"`)

**Campos base (todos los subtipos):**

| Campo         | Tipo    | Validación                     | Descripción |
| ------------- | ------- | ------------------------------ | ----------- |
| `email`       | String  | `@NotBlank`, `@Email`          | Email       |
| `userName`    | String  | `@NotBlank`, `@Size(max = 40)` | Username    |
| `password`    | String  | `@NotBlank`, `@Size(min = 8)`  | Contraseña  |
| `phoneNumber` | String  | `@Pattern(^\+?[0-9]{7,15}$)`   | Teléfono    |
| `active`      | Boolean | —                              | Activo      |

**Subtipo `"TOURIST"`** — Sin campos adicionales.

**Subtipo `"PROVIDER"` — `ProviderRequestDTO`:**

| Campo               | Tipo         | Validación  | Descripción                  |
| ------------------- | ------------ | ----------- | ---------------------------- |
| `type`              | ProviderType | `@NotNull`  | `COMPANY` / `NATURAL_PERSON` |
| `razonSocial`       | String       | `@NotBlank` | Razón social                 |
| `description`       | String       | —           | Descripción                  |
| `certified`         | Boolean      | —           | Certificado                  |
| `nitRut`            | String       | `@NotBlank` | NIT/RUT                      |
| `documentType`      | DocumentType | —           | `CC` / `NIT` / `CE`          |
| `documentNumber`    | String       | —           | Número de documento          |
| `bankName`          | String       | —           | Nombre del banco             |
| `bankAccountType`   | String       | —           | `AHORROS` / `CORRIENTE`      |
| `bankAccountNumber` | String       | —           | Número de cuenta bancaria    |

**Response:** `201 CREATED` — `UserResponseDTO` o `ProviderResponseDTO`

**UserResponseDTO:**

| Campo         | Tipo    |
| ------------- | ------- |
| `id`          | String  |
| `email`       | String  |
| `userName`    | String  |
| `phoneNumber` | String  |
| `active`      | Boolean |
| `role`        | String  |

**ProviderResponseDTO** (extiende UserResponseDTO):

| Campo                 | Tipo         |
| --------------------- | ------------ |
| `razonSocial`         | String       |
| `description`         | String       |
| `type`                | ProviderType |
| `nitRut`              | String       |
| `documentType`        | DocumentType |
| `documentNumber`      | String       |
| `bankName`            | String       |
| `bankAccountType`     | String       |
| `bankAccountNumber`   | String       |
| `onboardingCompleted` | Boolean      |
| `certified`           | Boolean      |

---

#### UserController

| #   | Método | Path                     | Descripción               |
| --- | ------ | ------------------------ | ------------------------- |
| 5   | PUT    | `/users/{id}`            | Actualizar usuario        |
| 6   | PUT    | `/users/{id}/deactivate` | Desactivar usuario        |
| 7   | PUT    | `/users/{id}/activate`   | Activar usuario           |
| 8   | GET    | `/users/{id}`            | Obtener usuario por ID    |
| 9   | GET    | `/users/email/{email}`   | Obtener usuario por email |
| 10  | GET    | `/users`                 | Listar usuarios           |
| 11  | GET    | `/users/role/{role}`     | Listar por rol            |
| 12  | GET    | `/users/profile/{id}`    | Obtener perfil            |

---

##### PUT `/users/{id}` — Actualizar usuario

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `id`   | String | ID usuario  |

**Request Body:** `UserRequestDTO` (polimórfico, mismos campos que registro)

**Response:** `200 OK` — `UserResponseDTO`

> **Onboarding de proveedor:** al actualizar un proveedor, si se completan `bankName`, `bankAccountType` y `bankAccountNumber`, el campo `onboardingCompleted` se marca automáticamente en `true`. Hasta entonces queda `false`, y la liquidación semanal no procesa payouts para ese proveedor.

---

##### PUT `/users/{id}/deactivate` — Desactivar usuario

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `id`   | String | ID usuario  |

**Response:** `204 No Content`

---

##### PUT `/users/{id}/activate` — Activar usuario

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `id`   | String | ID usuario  |

**Response:** `204 No Content`

---

##### GET `/users/{id}` — Obtener usuario por ID

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `id`   | String | ID usuario  |

**Response:** `200 OK` — `UserResponseDTO`

---

##### GET `/users/email/{email}` — Obtener usuario por email

**Path Variables:**

| Nombre  | Tipo   | Descripción |
| ------- | ------ | ----------- |
| `email` | String | Email       |

**Response:** `200 OK` — `UserResponseDTO`

---

##### GET `/users` — Listar usuarios (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<UserResponseDTO>`

---

##### GET `/users/role/{role}` — Listar por rol (paginado)

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `role` | String | Nombre rol  |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<UserResponseDTO>`

---

##### GET `/users/profile/{id}` — Obtener perfil

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `id`   | String | ID usuario  |

**Response:** `200 OK` — `UserResponseDTO`

---

#### ProviderController

| #   | Método | Path                                     | Descripción                           |
| --- | ------ | ---------------------------------------- | ------------------------------------- |
| 13  | POST   | `/user/providers`                        | Crear provider (interno, sin Gateway) |
| 14  | PUT    | `/user/providers/{id}`                   | Actualizar provider (interno)         |
| 15  | GET    | `/user/providers/by-username/{username}` | Obtener provider por username         |

---

##### POST `/user/providers` — Crear provider

**Request Body:** `ProviderRequestDTO` (campos ver subtipo PROVIDER en AuthController)

**Response:** `201 CREATED` — `ProviderResponseDTO`

---

##### PUT `/user/providers/{id}` — Actualizar provider

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `id`   | String | ID provider |

**Request Body:** `ProviderRequestDTO`

**Response:** `200 OK` — `ProviderResponseDTO`

---

##### GET `/user/providers/by-username/{username}` — Obtener provider

**Path Variables:**

| Nombre     | Tipo   | Descripción |
| ---------- | ------ | ----------- |
| `username` | String | Username    |

**Response:** `200 OK` — `ProviderResponseDTO`

---

#### RoleController

| #   | Método | Path           | Descripción                        |
| --- | ------ | -------------- | ---------------------------------- |
| 16  | GET    | `/users/roles` | Listar roles de Keycloak (interno) |

---

##### GET `/users/roles` — Listar roles

**Response:** `200 OK` — `List<String>`

---

### 3.2 Booking Service API

#### BookingController

| #   | Método | Path                          | Descripción        |
| --- | ------ | ----------------------------- | ------------------ |
| 17  | POST   | `/api/v1/booking`             | Crear reserva      |
| 18  | GET    | `/api/v1/booking`             | Listar reservas    |
| 19  | GET    | `/api/v1/booking/{id}`        | Detalle de reserva |
| 20  | PUT    | `/api/v1/booking/{id}`        | Actualizar reserva |
| 21  | POST   | `/api/v1/booking/{id}/cancel` | Cancelar reserva   |

---

##### POST `/api/v1/booking` — Crear reserva

**Headers:**

| Nombre            | Tipo   | Requerido | Default       | Descripción           |
| ----------------- | ------ | --------- | ------------- | --------------------- |
| `X-User-Id`       | String | No        | `"1"`         | ID del turista        |
| `Idempotency-Key` | String | No        | UUID generado | Clave de idempotencia |

**Request Body:** `@Valid` `CreateBookingRequestDTO`

| Campo        | Tipo      | Validación         | Descripción                          |
| ------------ | --------- | ------------------ | ------------------------------------ |
| `offerId`    | String    | `@NotNull`         | ID de la oferta                      |
| `startDate`  | LocalDate | `@FutureOrPresent` | Fecha de inicio                      |
| `endDate`    | LocalDate | `@FutureOrPresent` | Fecha de fin                         |
| `quantity`   | Integer   | `@Positive`        | Cantidad de unidades/tickets         |
| `guestCount` | Integer   | —                  | N° de huéspedes (solo ACCOMMODATION) |

**Validaciones adicionales (service layer):**

- La oferta debe existir y estar activa (consulta vía Feign)
- No se permiten reservas de tipo `EVENT`
- Para SERVICE/ACCOMMODATION: `endDate` debe ser posterior a `startDate`
- Para SERVICE/ACCOMMODATION: no debe superponerse con reservas CONFIRMED o PENDING_PAYMENT
- Para ACCOMMODATION: `guestCount` es obligatorio y no puede exceder `maxGuests` de la oferta
- Para PRODUCT: se deduce stock (si falla, la reserva no se crea)

**Response:** `201 CREATED` — `BookingResponseDTO`

| Campo         | Tipo          | Descripción                          |
| ------------- | ------------- | ------------------------------------ |
| `id`          | Long          | ID de la reserva                     |
| `offerId`     | UUID          | ID de la oferta                      |
| `offerName`   | String        | Nombre de la oferta                  |
| `status`      | String        | Estado actual (`PENDING_PAYMENT`)    |
| `totalAmount` | BigDecimal    | Monto total                          |
| `currency`    | String        | Moneda (COP)                         |
| `startDate`   | LocalDate     | Fecha de inicio                      |
| `endDate`     | LocalDate     | Fecha de fin                         |
| `quantity`    | Integer       | Cantidad                             |
| `guestCount`  | Integer       | N° de huéspedes (solo ACCOMMODATION) |
| `expiresAt`   | LocalDateTime | Expiración (15 min desde creación)   |
| `createdAt`   | LocalDateTime | Fecha de creación                    |

---

##### GET `/api/v1/booking` — Listar reservas (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<BookingResponseDTO>`

---

##### GET `/api/v1/booking/{id}` — Detalle de reserva

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID reserva  |

**Response:** `200 OK` — `BookingDetailResponseDTO`

| Campo           | Tipo          | Descripción                          |
| --------------- | ------------- | ------------------------------------ |
| `id`            | Long          | ID de la reserva                     |
| `offerId`       | UUID          | ID de la oferta                      |
| `offerName`     | String        | Nombre de la oferta                  |
| `totalAmount`   | BigDecimal    | Monto total                          |
| `currency`      | String        | Moneda                               |
| `startDate`     | LocalDate     | Fecha de inicio                      |
| `endDate`       | LocalDate     | Fecha de fin                         |
| `quantity`      | Integer       | Cantidad                             |
| `guestCount`    | Integer       | N° de huéspedes (solo ACCOMMODATION) |
| `expiresAt`     | LocalDateTime | Expiración                           |
| `createdAt`     | LocalDateTime | Fecha de creación                    |
| `payments`      | List          | Ver `PaymentResponseDTO` abajo       |
| `statusHistory` | List          | Ver `BookingStatusHistoryDTO`        |

**PaymentResponseDTO (nested):**

| Campo       | Tipo          |
| ----------- | ------------- |
| `id`        | Long          |
| `status`    | String        |
| `amount`    | BigDecimal    |
| `currency`  | String        |
| `paidAt`    | LocalDateTime |
| `createdAt` | LocalDateTime |

**BookingStatusHistoryDTO (nested):**

| Campo       | Tipo          |
| ----------- | ------------- |
| `status`    | String        |
| `changedAt` | LocalDateTime |

---

##### PUT `/api/v1/booking/{id}` — Actualizar reserva

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID reserva  |

**Request Body:** `@Valid` `UpdateBookingRequestDTO` (todos opcionales, solo se actualizan los campos enviados)

| Campo        | Tipo              | Validación         | Descripción           |
| ------------ | ----------------- | ------------------ | --------------------- |
| `startDate`  | LocalDate         | `@FutureOrPresent` | Nueva fecha de inicio |
| `endDate`    | LocalDate         | `@Future`          | Nueva fecha de fin    |
| `quantity`   | Integer           | `@Min(1)`          | Nueva cantidad        |
| `guestCount` | Integer           | `@Min(1)`          | N° de huéspedes       |
| `newStatus`  | BookingStatusType | —                  | Nuevo estado          |

**BookingStatusType enum:** `PENDING_PAYMENT`, `CONFIRMED`, `COMPLETION_REQUESTED`, `COMPLETED`, `CANCELLED`, `EXPIRED`, `FAILED`

**Transiciones válidas:**

- `PENDING_PAYMENT` → `CANCELLED`
- `CONFIRMED` → `CANCELLED`, `COMPLETION_REQUESTED`, `COMPLETED`
- `COMPLETION_REQUESTED` → `COMPLETED`, `CANCELLED`

> `CONFIRMED → COMPLETION_REQUESTED` la dispara el provider vía `POST /api/v1/booking/{id}/complete-request`; `COMPLETION_REQUESTED → COMPLETED` la confirma el turista vía `POST /api/v1/booking/{id}/confirm-completion`. En `COMPLETED` los earnings quedan disponibles para liquidación semanal.

**Response:** `200 OK` — `BookingResponseDTO`

---

##### POST `/api/v1/booking/{id}/cancel` — Cancelar reserva

**Headers:**

| Nombre      | Tipo   | Requerido | Descripción |
| ----------- | ------ | --------- | ----------- |
| `X-User-Id` | String | Sí        | ID turista  |

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID reserva  |

**@PreAuthorize:** `#userId == @bookingServiceImpl.getBookingById(#id).customerId`

**Comportamiento adicional:**

- Si la reserva está CONFIRMED, restituye stock (PRODUCT) y procesa reembolso
- Emite evento `booking.cancelled` en RabbitMQ

**Response:** `200 OK` — `BookingResponseDTO`

---

#### CheckoutController

| #   | Método | Path                                   | Descripción             |
| --- | ------ | -------------------------------------- | ----------------------- |
| 22  | POST   | `/api/v1/booking/{bookingId}/checkout` | Iniciar checkout y pago |

---

##### POST `/api/v1/booking/{bookingId}/checkout` — Checkout

**Headers:**

| Nombre      | Tipo   | Requerido | Descripción |
| ----------- | ------ | --------- | ----------- |
| `X-User-Id` | String | Sí        | ID turista  |

**Path Variables:**

| Nombre      | Tipo | Descripción |
| ----------- | ---- | ----------- |
| `bookingId` | Long | ID reserva  |

**@PreAuthorize:** `#userId == @bookingServiceImpl.getBookingById(#bookingId).customerId`

**Validaciones:**

- El turista debe ser dueño de la reserva
- La reserva debe estar en estado `PENDING_PAYMENT`

**Response:** `200 OK` — `CheckoutResponse`

| Campo         | Tipo       | Descripción               |
| ------------- | ---------- | ------------------------- |
| `checkoutUrl` | String     | URL de pago del proveedor |
| `amount`      | BigDecimal | Monto a pagar             |
| `currency`    | String     | Moneda                    |

**Errores:** `403 Forbidden` (no es dueño), `400 Bad Request` (no está PENDING_PAYMENT), `409 Conflict` (pago ya en progreso)

---

#### PaymentWebhookController

| #   | Método | Path                                           | Descripción                         |
| --- | ------ | ---------------------------------------------- | ----------------------------------- |
| 23  | POST   | `/api/v1/webhooks/payments`                    | Webhook de pago (proveedor)         |
| 24  | GET    | `/api/v1/webhooks/payments/success`            | Callback redirect post-pago exitoso |
| 25  | GET    | `/api/v1/webhooks/payments/failure`            | Callback redirect post-pago fallido |
| 26  | GET    | `/api/v1/webhooks/payments/pending`            | Callback redirect pago pendiente    |
| 27  | POST   | `/api/v1/webhooks/payments/mock/success/{ref}` | Simular pago exitoso (mock)         |
| 28  | POST   | `/api/v1/webhooks/payments/mock/failure/{ref}` | Simular pago fallido (mock)         |

---

##### POST `/api/v1/webhooks/payments` — Webhook de pago

**Request Body:** `Map<String, Object>` (JSON crudo)

Estructura esperada de MercadoPago:

```json
{
  "action": "payment.created",
  "type": "payment",
  "data": { "id": 12345 }
}
```

**Response:** `200 OK`

---

##### Verificación de firma HMAC-SHA256

MercadoPago firma cada notificación con HMAC-SHA256. El endpoint valida la firma antes de procesar el pago.

**Headers:**

| Nombre         | Tipo   | Requerido | Descripción                                              |
| -------------- | ------ | --------- | -------------------------------------------------------- |
| `x-signature`  | String | Sí        | `ts=<timestamp>,v1=<hmac-hex>` (firma v1 de MercadoPago) |
| `x-request-id` | String | Sí        | UUID de la petición incluido en el manifest firmado      |

**Algoritmo:** HMAC-SHA256 (clave = `MERCADOPAGO_WEBHOOK_SECRET`) sobre el manifest:

```
id:<data.id>;request-id:<x-request-id>;ts:<ts>;
```

El resultado (hexadecimal) debe ser idéntico al valor `v1` del header `x-signature`.

**Respuestas:**

| Código | Caso                                             |
| ------ | ------------------------------------------------ |
| `401`  | Firma ausente o inválida (el webhook se rechaza) |
| `200`  | Firma válida y pago procesado                    |

> Si `MERCADOPAGO_WEBHOOK_SECRET` no está configurado, la verificación queda **deshabilitada** (solo se loguea un warning). Configurar siempre el secret en `.env`.

---

##### GET `/api/v1/webhooks/payments/success` — Callback éxito

**Query Parameters:**

| Nombre               | Tipo   | Requerido | Descripción        |
| -------------------- | ------ | --------- | ------------------ |
| `payment_id`         | String | No        | ID del pago        |
| `status`             | String | No        | Estado del pago    |
| `external_reference` | String | No        | Referencia externa |

**Response:** `200 OK` — `"Pago procesado correctamente. Puedes cerrar esta ventana."`

---

##### GET `/api/v1/webhooks/payments/failure` — Callback fallo

**Query Parameters:**

| Nombre       | Tipo   | Requerido | Descripción |
| ------------ | ------ | --------- | ----------- |
| `payment_id` | String | No        | ID del pago |
| `status`     | String | No        | Estado      |

**Response:** `200 OK` — `"El pago no pudo ser procesado. Puedes intentar nuevamente."`

---

##### GET `/api/v1/webhooks/payments/pending` — Callback pendiente

**Query Parameters:**

| Nombre       | Tipo   | Requerido | Descripción |
| ------------ | ------ | --------- | ----------- |
| `payment_id` | String | No        | ID del pago |
| `status`     | String | No        | Estado      |

**Response:** `200 OK` — `"Tu pago está siendo procesado. Te notificaremos cuando se confirme."`

---

##### POST `/api/v1/webhooks/payments/mock/success/{providerReference}` — Mock éxito

**Path Variables:**

| Nombre              | Tipo   | Descripción         |
| ------------------- | ------ | ------------------- |
| `providerReference` | String | Referencia del pago |

**Response:** `200 OK`

---

##### POST `/api/v1/webhooks/payments/mock/failure/{providerReference}` — Mock fallo

**Path Variables:**

| Nombre              | Tipo   | Descripción         |
| ------------------- | ------ | ------------------- |
| `providerReference` | String | Referencia del pago |

**Response:** `200 OK`

---

> **Flujo de pago (Checkout Pro):**
>
> 1. Frontend → `POST /api/v1/booking/{id}/checkout` → backend crea preferencia de pago → devuelve `checkoutUrl`
> 2. Frontend redirige usuario a `checkoutUrl`
> 3. Usuario paga → proveedor envía webhook a `POST /api/v1/webhooks/payments`
> 4. Backend procesa pago → actualiza estado → publica evento RabbitMQ `payment.completed`
> 5. BookingService confirma reserva vía evento

> **Cancelación con reembolso:** `POST /api/v1/booking/{id}/cancel` en bookings CONFIRMED dispara automáticamente un reembolso vía el proveedor configurado.

#### Dashboard de proveedores y pagos semanales

Los siguientes endpoints del dashboard de proveedores y pagos semanales (documentados en `DOCUMENTACION_PAGOS.md`) están implementados en `ProviderDashboardController`:

| Método | Path                                      | Descripción                                        |
| ------ | ----------------------------------------- | -------------------------------------------------- |
| GET    | `/api/v1/providers/dashboard`             | Indicadores financieros y operativos del proveedor |
| GET    | `/api/v1/providers/bookings/pending`      | Reservas CONFIRMED + COMPLETION_REQUESTED          |
| GET    | `/api/v1/providers/bookings/completed`    | Reservas COMPLETED                                 |
| GET    | `/api/v1/providers/bookings/cancelled`    | Reservas CANCELLED                                 |
| GET    | `/api/v1/providers/earnings`              | Ganancias por reserva (histórico)                  |
| GET    | `/api/v1/providers/settlements`           | Historial de pagos semanales                       |
| GET    | `/api/v1/providers/settlements/{id}`      | Detalle de pago semanal con bookings               |
| POST   | `/api/v1/booking/{id}/complete-request`   | Provider solicita completación                     |
| POST   | `/api/v1/booking/{id}/confirm-completion` | Turista confirma completación                      |

---

### 3.3 Experience Service API

#### OfferController

| #   | Método | Path                                             | Descripción                  |
| --- | ------ | ------------------------------------------------ | ---------------------------- |
| 25  | POST   | `/api/v1/offers`                                 | Crear oferta                 |
| 26  | PUT    | `/api/v1/offers/{id}`                            | Actualizar oferta            |
| 27  | PATCH  | `/api/v1/offers/{id}/activate`                   | Activar oferta               |
| 28  | PATCH  | `/api/v1/offers/{id}/deactivate`                 | Desactivar oferta            |
| 29  | GET    | `/api/v1/offers/{id}`                            | Detalle de oferta            |
| 30  | GET    | `/api/v1/offers`                                 | Listar ofertas               |
| 31  | GET    | `/api/v1/offers/active`                          | Ofertas activas              |
| 32  | GET    | `/api/v1/offers/provider/{providerId}`           | Ofertas por proveedor        |
| 33  | GET    | `/api/v1/offers/city/{cityId}`                   | Ofertas por ciudad           |
| 34  | GET    | `/api/v1/offers/city/{cityId}/active`            | Ofertas activas por ciudad   |
| 35  | GET    | `/api/v1/offers/type/{type}`                     | Ofertas por tipo             |
| 36  | GET    | `/api/v1/offers/type/{type}/active`              | Ofertas activas por tipo     |
| 37  | GET    | `/api/v1/offers/search`                          | Buscar ofertas con filtros   |
| 38  | GET    | `/api/v1/offers/featured`                        | Ofertas destacadas           |
| 39  | PATCH  | `/api/v1/offers/{id}/featured`                   | Marcar/desmarcar destacada   |
| 40  | GET    | `/api/v1/offers/type/{type}/category/{category}` | Ofertas por tipo y categoría |

---

##### POST `/api/v1/offers` — Crear oferta

**@PreAuthorize:** `authentication.principal != null`

**Request Body:** `@Valid` `Offer` (polimórfico via discriminador `"type"`)

**Campos base (todos los subtipos):**

| Campo         | Tipo       | Descripción                 |
| ------------- | ---------- | --------------------------- |
| `name`        | String     | Nombre                      |
| `description` | String     | Descripción                 |
| `providerId`  | String     | ID del proveedor            |
| `baseprice`   | BigDecimal | Precio base                 |
| `cityId`      | Long       | ID del municipio            |
| `active`      | Boolean    | Activo (default `true`)     |
| `featured`    | Boolean    | Destacada (default `false`) |
| `images`      | List       | Lista de imágenes           |

**Subtipo `"product"` — ProductOffer:**

| Campo              | Tipo            | Descripción                       |
| ------------------ | --------------- | --------------------------------- |
| `productCategory`  | ProductCategory | Categoría                         |
| `isUnlimitedStock` | Boolean         | Stock ilimitado (default `false`) |

**Subtipo `"service"` — ServiceOffer:**

| Campo               | Tipo            | Descripción         |
| ------------------- | --------------- | ------------------- |
| `serviceCategory`   | ServiceCategory | Categoría           |
| `requiresSchedule`  | Boolean         | Requiere agenda     |
| `durationInMinutes` | Integer         | Duración en minutos |
| `capacity`          | Integer         | Capacidad           |
| `pricePerPerson`    | BigDecimal      | Precio por persona  |

**Subtipo `"event"` — EventOffer:**

| Campo             | Tipo          | Descripción                                         |
| ----------------- | ------------- | --------------------------------------------------- |
| `startDate`       | LocalDateTime | Fecha inicio                                        |
| `endDate`         | LocalDateTime | Fecha fin                                           |
| `maximumCapacity` | Integer       | Capacidad máxima                                    |
| `ticketPrice`     | BigDecimal    | Precio ticket                                       |
| `purchaseUrl`     | String        | URL de compra                                       |
| `eventType`       | EventType     | `PUBLISHED`, `IN_PROGRESS`, `FINISHED`, `CANCELLED` |

**Subtipo `"accommodation"` — AccommodationOffer:**

| Campo                   | Tipo                  | Descripción       |
| ----------------------- | --------------------- | ----------------- |
| `maxGuests`             | Integer               | Máx huéspedes     |
| `bedrooms`              | Integer               | Habitaciones      |
| `bathrooms`             | Integer               | Baños             |
| `allowPets`             | Boolean               | Permitir mascotas |
| `allowChildren`         | Boolean               | Permitir niños    |
| `pricePerNight`         | BigDecimal            | Precio por noche  |
| `accommodationCategory` | AccommodationCategory | Categoría         |

**Response:** `200 OK` — `OfferResponseDTO`

| Campo         | Tipo          | Descripción                                            |
| ------------- | ------------- | ------------------------------------------------------ |
| `id`          | UUID          | ID de la oferta                                        |
| `providerId`  | String        | ID del proveedor                                       |
| `name`        | String        | Nombre                                                 |
| `description` | String        | Descripción                                            |
| `baseprice`   | BigDecimal    | Precio base                                            |
| `cityId`      | Long          | ID del municipio                                       |
| `type`        | String        | `"product"`, `"service"`, `"event"`, `"accommodation"` |
| `category`    | String        | Categoría o null                                       |
| `active`      | boolean       | Activo                                                 |
| `featured`    | boolean       | Destacada                                              |
| `createdAt`   | LocalDateTime | Fecha de creación                                      |
| `updatedAt`   | LocalDateTime | Fecha de actualización                                 |

---

##### PUT `/api/v1/offers/{id}` — Actualizar oferta

**@PreAuthorize:** `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal`

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID oferta   |

**Request Body:** `@Valid` `Offer` (polimórfico, mismos campos que creación)

**Response:** `200 OK` — `OfferResponseDTO`

---

##### PATCH `/api/v1/offers/{id}/activate` — Activar oferta

**@PreAuthorize:** `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal`

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID oferta   |

**Response:** `204 No Content`

---

##### PATCH `/api/v1/offers/{id}/deactivate` — Desactivar oferta

**@PreAuthorize:** `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal`

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID oferta   |

**Response:** `204 No Content`

---

##### GET `/api/v1/offers/{id}` — Detalle de oferta

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID oferta   |

**Response:** `200 OK` — `OfferDetailDTO` (incluye campos base + campos específicos del tipo + `images: List<OfferImageDTO>`)

**OfferImageDTO:**

| Campo       | Tipo    |
| ----------- | ------- |
| `imageUrl`  | String  |
| `isPrimary` | boolean |

---

##### GET `/api/v1/offers` — Listar ofertas (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### GET `/api/v1/offers/active` — Ofertas activas (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### GET `/api/v1/offers/provider/{providerId}` — Ofertas por proveedor (paginado)

**Path Variables:**

| Nombre       | Tipo   | Descripción  |
| ------------ | ------ | ------------ |
| `providerId` | String | ID proveedor |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### GET `/api/v1/offers/city/{cityId}` — Ofertas por ciudad (paginado)

**Path Variables:**

| Nombre   | Tipo | Descripción |
| -------- | ---- | ----------- |
| `cityId` | Long | ID ciudad   |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### GET `/api/v1/offers/city/{cityId}/active` — Ofertas activas por ciudad (paginado)

**Path Variables:**

| Nombre   | Tipo | Descripción |
| -------- | ---- | ----------- |
| `cityId` | Long | ID ciudad   |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### GET `/api/v1/offers/type/{type}` — Ofertas por tipo (paginado)

**Path Variables:**

| Nombre | Tipo   | Valores permitidos                                     |
| ------ | ------ | ------------------------------------------------------ |
| `type` | String | `"accommodation"`, `"service"`, `"product"`, `"event"` |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### GET `/api/v1/offers/type/{type}/active` — Ofertas activas por tipo (paginado)

**Path Variables:**

| Nombre | Tipo   | Valores permitidos                                     |
| ------ | ------ | ------------------------------------------------------ |
| `type` | String | `"accommodation"`, `"service"`, `"product"`, `"event"` |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### GET `/api/v1/offers/search` — Buscar ofertas con filtros

**Query Parameters:**

| Nombre          | Tipo          | Requerido | Descripción                    |
| --------------- | ------------- | --------- | ------------------------------ |
| `providerId`    | String        | No        | ID del proveedor               |
| `cityId`        | Long          | No        | ID del municipio               |
| `active`        | Boolean       | No        | Filtrar por activas            |
| `name`          | String        | No        | Nombre (búsqueda parcial)      |
| `type`          | String        | No        | Tipo de oferta                 |
| `category`      | String        | No        | Categoría                      |
| `featured`      | Boolean       | No        | Solo destacadas                |
| `minPrice`      | BigDecimal    | No        | Precio mínimo                  |
| `maxPrice`      | BigDecimal    | No        | Precio máximo                  |
| `maxGuests`     | Integer       | No        | Máximo huéspedes               |
| `allowPets`     | Boolean       | No        | Permitir mascotas              |
| `allowChildren` | Boolean       | No        | Permitir niños                 |
| `startDate`     | LocalDateTime | No        | Fecha inicio (`ISO.DATE_TIME`) |
| `endDate`       | LocalDateTime | No        | Fecha fin (`ISO.DATE_TIME`)    |
| `capacity`      | Integer       | No        | Capacidad                      |
| `page`          | Integer       | No        | Página (default `0`)           |
| `size`          | Integer       | No        | Tamaño (default `20`)          |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### GET `/api/v1/offers/featured` — Ofertas destacadas (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### PATCH `/api/v1/offers/{id}/featured` — Marcar/desmarcar destacada

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID oferta   |

**Query Parameters:**

| Nombre     | Tipo    | Requerido | Descripción |
| ---------- | ------- | --------- | ----------- |
| `featured` | boolean | Sí        | true/false  |

**Response:** `204 No Content`

---

##### GET `/api/v1/offers/type/{type}/category/{category}` — Ofertas por tipo y categoría (paginado)

**Path Variables:**

| Nombre     | Tipo   | Descripción |
| ---------- | ------ | ----------- |
| `type`     | String | Tipo oferta |
| `category` | String | Categoría   |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

#### StockProductController

| #   | Método | Path                                | Descripción          |
| --- | ------ | ----------------------------------- | -------------------- |
| 41  | POST   | `/api/v1/offers/{id}/stock/deduct`  | Deducir stock        |
| 42  | POST   | `/api/v1/offers/{id}/stock/restock` | Reabastecer stock    |
| 43  | GET    | `/api/v1/offers/{id}/stock`         | Obtener stock actual |

---

##### POST `/api/v1/offers/{id}/stock/deduct` — Deducir stock

**@PreAuthorize:** `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal`

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID oferta   |

**Request Body:** `DeductStockRequest`

| Campo         | Tipo    | Descripción                    |
| ------------- | ------- | ------------------------------ |
| `quantity`    | Integer | Cantidad a deducir             |
| `referenceId` | String  | Referencia (ej: `booking-123`) |

**Response:** `200 OK`

---

##### POST `/api/v1/offers/{id}/stock/restock` — Reabastecer stock

**@PreAuthorize:** `@offerQueryServiceImpl.getDetail(#id).providerId == authentication.principal`

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID oferta   |

**Query Parameters:**

| Nombre        | Tipo    | Requerido | Descripción |
| ------------- | ------- | --------- | ----------- |
| `quantity`    | Integer | Sí        | Cantidad    |
| `description` | String  | No        | Descripción |

**Response:** `200 OK`

---

##### GET `/api/v1/offers/{id}/stock` — Obtener stock actual

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID oferta   |

**Response:** `200 OK` — `Integer`

---

#### EventStatusHistoryController

| #   | Método | Path                                                    | Descripción                |
| --- | ------ | ------------------------------------------------------- | -------------------------- |
| 44  | POST   | `/api/v1/offers/event/{eventId}/events-status`          | Registrar cambio de estado |
| 45  | GET    | `/api/v1/offers/event/{eventId}/events-status`          | Obtener historial          |
| 46  | GET    | `/api/v1/offers/event/{eventId}/events-status/latest`   | Último estado              |
| 47  | GET    | `/api/v1/offers/event/{eventId}/events-status/{status}` | Buscar por estado          |

---

##### POST `/api/v1/offers/event/{eventId}/events-status` — Registrar cambio de estado

**Path Variables:**

| Nombre    | Tipo | Descripción |
| --------- | ---- | ----------- |
| `eventId` | UUID | ID evento   |

**Request Body:** `EventStatusHistoryRequest`

| Campo     | Tipo        | Validación | Descripción                                         |
| --------- | ----------- | ---------- | --------------------------------------------------- |
| `eventId` | UUID        | `@NotNull` | ID evento                                           |
| `status`  | EventStatus | `@NotNull` | `PUBLISHED`, `IN_PROGRESS`, `FINISHED`, `CANCELLED` |

**Response:** `200 OK` — `EventStatusHistoryResponse`

| Campo       | Tipo          |
| ----------- | ------------- |
| `id`        | UUID          |
| `eventId`   | UUID          |
| `status`    | EventStatus   |
| `changedAt` | LocalDateTime |

---

##### GET `/api/v1/offers/event/{eventId}/events-status` — Obtener historial

**Path Variables:**

| Nombre    | Tipo | Descripción |
| --------- | ---- | ----------- |
| `eventId` | UUID | ID evento   |

**Response:** `200 OK` — `List<EventStatusHistoryResponse>`

---

##### GET `/api/v1/offers/event/{eventId}/events-status/latest` — Último estado

**Path Variables:**

| Nombre    | Tipo | Descripción |
| --------- | ---- | ----------- |
| `eventId` | UUID | ID evento   |

**Response:** `200 OK` — `EventStatusHistoryResponse` | `404 Not Found`

---

##### GET `/api/v1/offers/event/{eventId}/events-status/{status}` — Buscar por estado

**Path Variables:**

| Nombre    | Tipo   | Valores permitidos                                  |
| --------- | ------ | --------------------------------------------------- |
| `eventId` | UUID   | ID evento                                           |
| `status`  | String | `PUBLISHED`, `IN_PROGRESS`, `FINISHED`, `CANCELLED` |

**Response:** `200 OK` — `List<EventStatusHistoryResponse>`

---

#### OfferImageController

| #   | Método | Path                                                | Descripción              |
| --- | ------ | --------------------------------------------------- | ------------------------ |
| 48  | POST   | `/api/v1/offers/{offerId}/images`                   | Agregar imagen por URL   |
| 49  | POST   | `/api/v1/offers/{offerId}/images/upload`            | Subir archivo de imagen  |
| 50  | POST   | `/api/v1/offers/{offerId}/images/batch-upload`      | Subir múltiples imágenes |
| 51  | GET    | `/api/v1/offers/{offerId}/images`                   | Listar imágenes          |
| 52  | DELETE | `/api/v1/offers/{offerId}/images/{imageId}`         | Eliminar imagen          |
| 53  | PATCH  | `/api/v1/offers/{offerId}/images/{imageId}/primary` | Marcar como principal    |

---

##### POST `/api/v1/offers/{offerId}/images` — Agregar imagen por URL

**Path Variables:**

| Nombre    | Tipo | Descripción |
| --------- | ---- | ----------- |
| `offerId` | UUID | ID oferta   |

**Request Body:** `ImageRequest`

| Campo       | Tipo    | Validación  | Descripción |
| ----------- | ------- | ----------- | ----------- |
| `imageUrl`  | String  | `@NotBlank` | URL imagen  |
| `isPrimary` | Boolean | —           | Principal   |

**Response:** `200 OK` — `OfferImage`

---

##### POST `/api/v1/offers/{offerId}/images/upload` — Subir imagen (multipart)

**Path Variables:**

| Nombre    | Tipo | Descripción |
| --------- | ---- | ----------- |
| `offerId` | UUID | ID oferta   |

**Request Parameters (multipart):**

| Nombre      | Tipo          | Requerido | Default |
| ----------- | ------------- | --------- | ------- |
| `file`      | MultipartFile | Sí        | —       |
| `isPrimary` | Boolean       | No        | `false` |

**Response:** `200 OK` — `OfferImage`

---

##### POST `/api/v1/offers/{offerId}/images/batch-upload` — Subir múltiples imágenes

**Path Variables:**

| Nombre    | Tipo | Descripción |
| --------- | ---- | ----------- |
| `offerId` | UUID | ID oferta   |

**Request Parameters (multipart):**

| Nombre  | Tipo                  | Requerido |
| ------- | --------------------- | --------- |
| `files` | List\<MultipartFile\> | Sí        |

**Response:** `200 OK` — `List<OfferImage>`

---

##### GET `/api/v1/offers/{offerId}/images` — Listar imágenes

**Path Variables:**

| Nombre    | Tipo | Descripción |
| --------- | ---- | ----------- |
| `offerId` | UUID | ID oferta   |

**Response:** `200 OK` — `List<OfferImage>`

---

##### DELETE `/api/v1/offers/{offerId}/images/{imageId}` — Eliminar imagen

**Path Variables:**

| Nombre    | Tipo | Descripción |
| --------- | ---- | ----------- |
| `imageId` | UUID | ID imagen   |

**Response:** `204 No Content`

---

##### PATCH `/api/v1/offers/{offerId}/images/{imageId}/primary` — Marcar como principal

**Path Variables:**

| Nombre    | Tipo | Descripción |
| --------- | ---- | ----------- |
| `imageId` | UUID | ID imagen   |

**Response:** `204 No Content`

---

#### CategoryController

| #   | Método | Path                                     | Descripción                   |
| --- | ------ | ---------------------------------------- | ----------------------------- |
| 54  | GET    | `/api/v1/offers/categories`              | Todas las categorías por tipo |
| 55  | GET    | `/api/v1/offers/types/{type}/categories` | Categorías por tipo de oferta |

---

##### GET `/api/v1/offers/categories` — Todas las categorías

**Response:** `200 OK` — `Map<String, List<String>>`

```json
{
  "accommodation": ["HOTEL", "HOSTEL", ...],
  "service": ["TOUR", ...],
  "product": [...],
  "event": [...]
}
```

---

##### GET `/api/v1/offers/types/{type}/categories` — Categorías por tipo

**Path Variables:**

| Nombre | Tipo   | Valores permitidos                                     |
| ------ | ------ | ------------------------------------------------------ |
| `type` | String | `"accommodation"`, `"service"`, `"product"`, `"event"` |

**Response:** `200 OK` — `List<String>`

---

#### PriceListingController

| #   | Método | Path                                     | Descripción             |
| --- | ------ | ---------------------------------------- | ----------------------- |
| 56  | POST   | `/api/v1/prices`                         | Crear listing de precio |
| 57  | PUT    | `/api/v1/prices/{id}`                    | Actualizar listing      |
| 58  | GET    | `/api/v1/prices/{id}`                    | Listing por ID          |
| 59  | GET    | `/api/v1/prices`                         | Listar todos            |
| 60  | GET    | `/api/v1/prices/city/{cityId}`           | Filtrar por ciudad      |
| 61  | GET    | `/api/v1/prices/category/{categoryName}` | Filtrar por categoría   |
| 62  | GET    | `/api/v1/prices/range`                   | Filtrar por rango       |
| 63  | GET    | `/api/v1/prices/active`                  | Listings activos        |
| 64  | DELETE | `/api/v1/prices/{id}`                    | Eliminar listing        |

---

##### POST `/api/v1/prices` — Crear listing de precio

**Request Body:** `@Valid` `PriceListingRequest`

| Campo         | Tipo       | Validación              | Descripción |
| ------------- | ---------- | ----------------------- | ----------- |
| `name`        | String     | `@NotBlank`             | Nombre      |
| `description` | String     | —                       | Descripción |
| `category`    | String     | `@NotBlank`             | Categoría   |
| `minPrice`    | BigDecimal | `@NotNull`, `@Positive` | Precio mín  |
| `maxPrice`    | BigDecimal | `@NotNull`, `@Positive` | Precio máx  |
| `cityId`      | Long       | `@NotNull`              | ID ciudad   |
| `active`      | boolean    | —                       | Activo      |

**Response:** `201 CREATED` — `PriceListingResponse`

| Campo            | Tipo       |
| ---------------- | ---------- |
| `id`             | UUID       |
| `name`           | String     |
| `description`    | String     |
| `category`       | String     |
| `minPrice`       | BigDecimal |
| `maxPrice`       | BigDecimal |
| `municipalityId` | Long       |
| `mainImage`      | String     |
| `active`         | boolean    |

---

##### PUT `/api/v1/prices/{id}` — Actualizar listing

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID listing  |

**Request Body:** `@Valid` `PriceListingRequest` (mismos campos que creación)

**Response:** `200 OK` — `PriceListingResponse`

---

##### GET `/api/v1/prices/{id}` — Listing por ID

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID listing  |

**Response:** `200 OK` — `PriceListingResponse` | `404 Not Found`

---

##### GET `/api/v1/prices` — Listar todos

**Response:** `200 OK` — `List<PriceListingResponse>`

---

##### GET `/api/v1/prices/city/{cityId}` — Filtrar por ciudad

**Path Variables:**

| Nombre   | Tipo | Descripción |
| -------- | ---- | ----------- |
| `cityId` | Long | ID ciudad   |

**Response:** `200 OK` — `List<PriceListingResponse>`

---

##### GET `/api/v1/prices/category/{categoryName}` — Filtrar por categoría

**Path Variables:**

| Nombre         | Tipo   | Descripción |
| -------------- | ------ | ----------- |
| `categoryName` | String | Categoría   |

**Response:** `200 OK` — `List<PriceListingResponse>`

---

##### GET `/api/v1/prices/range` — Filtrar por rango

**Query Parameters:**

| Nombre | Tipo       | Requerido | Descripción |
| ------ | ---------- | --------- | ----------- |
| `min`  | BigDecimal | Sí        | Precio mín  |
| `max`  | BigDecimal | Sí        | Precio máx  |

**Response:** `200 OK` — `List<PriceListingResponse>`

---

##### GET `/api/v1/prices/active` — Listings activos

**Response:** `200 OK` — `List<PriceListingResponse>`

---

##### DELETE `/api/v1/prices/{id}` — Eliminar listing

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID listing  |

**Response:** `204 No Content`

---

#### ReviewController

| #   | Método | Path                                          | Descripción               |
| --- | ------ | --------------------------------------------- | ------------------------- |
| 65  | POST   | `/api/v1/reviews`                             | Crear reseña              |
| 66  | PUT    | `/api/v1/reviews/{id}`                        | Actualizar reseña         |
| 67  | DELETE | `/api/v1/reviews/{id}`                        | Eliminar reseña           |
| 68  | GET    | `/api/v1/reviews/{id}`                        | Reseña por ID             |
| 69  | GET    | `/api/v1/reviews/user/{userId}`               | Reseñas por usuario       |
| 70  | GET    | `/api/v1/reviews/offer/{offerId}`             | Reseñas por oferta        |
| 71  | GET    | `/api/v1/reviews/service/{serviceId}/summary` | Resumen de calificaciones |

---

##### POST `/api/v1/reviews` — Crear reseña

**@PreAuthorize:** `authentication.principal != null`

**Request Body:** `@Valid` `ReviewRequest`

| Campo      | Tipo   | Validación           | Descripción        |
| ---------- | ------ | -------------------- | ------------------ |
| `offerId`  | String | `@NotBlank`          | ID oferta          |
| `authorId` | String | `@NotNull`           | ID autor           |
| `comment`  | String | `@NotBlank`          | Comentario         |
| `rating`   | int    | `@Min(1)`, `@Max(5)` | Calificación (1-5) |

**Response:** `201 CREATED` — `ReviewResponse`

| Campo       | Tipo          |
| ----------- | ------------- |
| `id`        | String        |
| `offerId`   | String        |
| `authorId`  | String        |
| `comment`   | String        |
| `rating`    | int           |
| `createdAt` | LocalDateTime |

---

##### PUT `/api/v1/reviews/{id}` — Actualizar reseña

**@PreAuthorize:** `@reviewService.getReviewById(#id).authorId == authentication.principal`

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `id`   | String | ID reseña   |

**Request Body:** `@Valid` `ReviewRequest` (mismos campos que creación)

**Response:** `200 OK` — `ReviewResponse`

---

##### DELETE `/api/v1/reviews/{id}` — Eliminar reseña

**@PreAuthorize:** `@reviewService.getReviewById(#id).authorId == authentication.principal`

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `id`   | String | ID reseña   |

**Response:** `204 No Content`

---

##### GET `/api/v1/reviews/{id}` — Reseña por ID

**Path Variables:**

| Nombre | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `id`   | String | ID reseña   |

**Response:** `200 OK` — `ReviewResponse`

---

##### GET `/api/v1/reviews/user/{userId}` — Reseñas por usuario (paginado)

**Path Variables:**

| Nombre   | Tipo   | Descripción |
| -------- | ------ | ----------- |
| `userId` | String | ID usuario  |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<ReviewResponse>`

---

##### GET `/api/v1/reviews/offer/{offerId}` — Reseñas por oferta (paginado)

**Path Variables:**

| Nombre    | Tipo   | Descripción |
| --------- | ------ | ----------- |
| `offerId` | String | ID oferta   |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `20`    |

**Response:** `200 OK` — `Page<ReviewResponse>`

---

##### GET `/api/v1/reviews/service/{serviceId}/summary` — Resumen de calificaciones

**Path Variables:**

| Nombre      | Tipo   | Descripción |
| ----------- | ------ | ----------- |
| `serviceId` | String | ID servicio |

**Response:** `200 OK` — `RatingSummaryResponse`

| Campo          | Tipo   |
| -------------- | ------ |
| `average`      | double |
| `totalReviews` | long   |

---

#### FavoriteController

| #   | Método | Path                                | Descripción                 |
| --- | ------ | ----------------------------------- | --------------------------- |
| 105 | GET    | `/api/v1/offers/favorites`          | Listar favoritos            |
| 106 | GET    | `/api/v1/offers/favorites/check`    | Verificar si es favorito    |
| 107 | POST   | `/api/v1/offers/favorites`          | Agregar favorito            |
| 108 | DELETE | `/api/v1/offers/favorites/{id}`     | Eliminar favorito por ID    |
| 109 | DELETE | `/api/v1/offers/favorites/by-offer` | Eliminar por usuario+oferta |

---

##### GET `/api/v1/offers/favorites` — Listar favoritos

**Query Parameters:**

| Nombre   | Tipo   | Requerido | Descripción |
| -------- | ------ | --------- | ----------- |
| `userId` | String | Sí        | ID usuario  |

**Response:** `200 OK` — `UserFavoritesResponseDTO`

| Campo    | Tipo                         | Descripción                |
| -------- | ---------------------------- | -------------------------- |
| `user`   | ProviderSummary              | Datos del usuario          |
| `offers` | List\<FavoriteOfferItemDTO\> | Lista de ofertas favoritas |

**ProviderSummary (nested):**

| Campo         | Tipo    |
| ------------- | ------- |
| `id`          | String  |
| `userName`    | String  |
| `phoneNumber` | String  |
| `email`       | String  |
| `role`        | String  |
| `active`      | Boolean |

---

##### GET `/api/v1/offers/favorites/check` — Verificar si es favorito

**Query Parameters:**

| Nombre    | Tipo   | Requerido | Descripción |
| --------- | ------ | --------- | ----------- |
| `userId`  | String | Sí        | ID usuario  |
| `offerId` | UUID   | Sí        | ID oferta   |

**Response:** `200 OK` — `FavoriteCheckResponseDTO`

| Campo        | Tipo    |
| ------------ | ------- |
| `isFavorite` | boolean |

---

##### POST `/api/v1/offers/favorites` — Agregar favorito

**Request Body:** `@Valid` `FavoriteRequestDTO`

| Campo     | Tipo   | Validación  | Descripción |
| --------- | ------ | ----------- | ----------- |
| `userId`  | String | `@NotBlank` | ID usuario  |
| `offerId` | UUID   | `@NotNull`  | ID oferta   |

**Response:** `201 CREATED` — `FavoriteResponseDTO`

| Campo       | Tipo             |
| ----------- | ---------------- |
| `id`        | UUID             |
| `user`      | ProviderSummary  |
| `offer`     | Offer (completo) |
| `createdAt` | LocalDateTime    |

---

##### DELETE `/api/v1/offers/favorites/{id}` — Eliminar favorito por ID

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | UUID | ID favorito |

**Response:** `204 No Content`

---

##### DELETE `/api/v1/offers/favorites/by-offer` — Eliminar por usuario+oferta

**Query Parameters:**

| Nombre    | Tipo   | Requerido | Descripción |
| --------- | ------ | --------- | ----------- |
| `userId`  | String | Sí        | ID usuario  |
| `offerId` | UUID   | Sí        | ID oferta   |

**Response:** `204 No Content`

---

### 3.4 Location Controllers (Experience Service)

#### CityController (Municipality)

| #   | Método | Path                                                                | Descripción                      |
| --- | ------ | ------------------------------------------------------------------- | -------------------------------- |
| 72  | POST   | `/api/v1/locations/cities`                                          | Crear ciudad/municipio           |
| 73  | GET    | `/api/v1/locations/cities`                                          | Listar ciudades                  |
| 74  | GET    | `/api/v1/locations/cities/{id}`                                     | Ciudad por ID                    |
| 75  | PUT    | `/api/v1/locations/cities/{id}`                                     | Actualizar ciudad                |
| 76  | DELETE | `/api/v1/locations/cities/{id}`                                     | Eliminar ciudad                  |
| 77  | GET    | `/api/v1/locations/cities/by-name/{name}`                           | Buscar por nombre                |
| 78  | GET    | `/api/v1/locations/cities/by-name/{name}/department/{departmentId}` | Buscar por nombre + departamento |
| 79  | GET    | `/api/v1/locations/cities/search`                                   | Buscar ciudades (parcial)        |
| 80  | GET    | `/api/v1/locations/cities/{id}/destinations`                        | Destinos por ciudad              |
| 81  | GET    | `/api/v1/locations/cities/{cityId}/destinations/type/{type}`        | Destinos por ciudad y tipo       |
| 82  | GET    | `/api/v1/locations/cities/featured`                                 | Ciudades destacadas              |

---

##### POST `/api/v1/locations/cities` — Crear ciudad

**Request Body:** `@Valid` `MunicipalityRequestDTO`

| Campo          | Tipo    | Descripción     |
| -------------- | ------- | --------------- |
| `name`         | String  | Nombre          |
| `imageUrl`     | String  | URL imagen      |
| `departmentId` | Long    | ID departamento |
| `featured`     | Boolean | Destacada       |

**Response:** `201 CREATED` — `MunicipalityResponseDTO`

| Campo        | Tipo                                               |
| ------------ | -------------------------------------------------- |
| `id`         | Long                                               |
| `name`       | String                                             |
| `imageUrl`   | String                                             |
| `featured`   | Boolean                                            |
| `department` | DepartmentMunicipalityDTO (id: Long, name: String) |

---

##### GET `/api/v1/locations/cities` — Listar ciudades (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<MunicipalityResponseDTO>`

---

##### GET `/api/v1/locations/cities/{id}` — Ciudad por ID

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID ciudad   |

**Response:** `200 OK` — `MunicipalityResponseDTO` | `404 Not Found`

---

##### PUT `/api/v1/locations/cities/{id}` — Actualizar ciudad

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID ciudad   |

**Request Body:** `@Valid` `MunicipalityRequestDTO` (mismos campos que creación)

**Response:** `200 OK` — `MunicipalityResponseDTO`

---

##### DELETE `/api/v1/locations/cities/{id}` — Eliminar ciudad

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID ciudad   |

**Response:** `204 No Content`

---

##### GET `/api/v1/locations/cities/by-name/{name}` — Buscar por nombre

**Path Variables:**

| Nombre | Tipo   | Descripción   |
| ------ | ------ | ------------- |
| `name` | String | Nombre ciudad |

**Response:** `200 OK` — `MunicipalityResponseDTO` | `404 Not Found`

---

##### GET `/api/v1/locations/cities/by-name/{name}/department/{departmentId}` — Buscar por nombre + departamento

**Path Variables:**

| Nombre         | Tipo   | Descripción     |
| -------------- | ------ | --------------- |
| `name`         | String | Nombre          |
| `departmentId` | Long   | ID departamento |

**Response:** `200 OK` — `MunicipalityResponseDTO` | `404 Not Found`

---

##### GET `/api/v1/locations/cities/search` — Buscar ciudades (parcial, sin acentos)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `q`    | String  | Sí        | —       |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<MunicipalityResponseDTO>`

---

##### GET `/api/v1/locations/cities/{id}/destinations` — Destinos por ciudad

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID ciudad   |

**Response:** `200 OK` — `List<DestinationResponseDTO>`

**DestinationResponseDTO:**

| Campo          | Tipo                    |
| -------------- | ----------------------- |
| `id`           | Long                    |
| `name`         | String                  |
| `description`  | String                  |
| `municipality` | MunicipalityResponseDTO |
| `latitude`     | Double                  |
| `longitude`    | Double                  |
| `active`       | Boolean                 |
| `featured`     | Boolean                 |
| `imageUrls`    | List\<String\>          |

---

##### GET `/api/v1/locations/cities/{cityId}/destinations/type/{type}` — Destinos por ciudad y tipo (paginado)

**Path Variables:**

| Nombre   | Tipo   | Descripción  |
| -------- | ------ | ------------ |
| `cityId` | Long   | ID ciudad    |
| `type`   | String | Tipo destino |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<DestinationResponseDTO>`

---

##### GET `/api/v1/locations/cities/featured` — Ciudades destacadas (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<MunicipalityResponseDTO>`

---

#### DepartmentController

| #   | Método | Path                                        | Descripción             |
| --- | ------ | ------------------------------------------- | ----------------------- |
| 83  | POST   | `/api/v1/locations/departments`             | Crear departamento      |
| 84  | GET    | `/api/v1/locations/departments`             | Listar departamentos    |
| 85  | GET    | `/api/v1/locations/departments/{id}`        | Departamento por ID     |
| 86  | PUT    | `/api/v1/locations/departments/{id}`        | Actualizar departamento |
| 87  | DELETE | `/api/v1/locations/departments/{id}`        | Eliminar departamento   |
| 88  | GET    | `/api/v1/locations/departments/{id}/cities` | Con municipios          |

---

##### POST `/api/v1/locations/departments` — Crear departamento

**Request Body:** `@Valid` `DepartmentRequestDTO`

| Campo  | Tipo   | Descripción |
| ------ | ------ | ----------- |
| `name` | String | Nombre      |

**Response:** `201 CREATED` — `DepartmentResponseDTO`

| Campo  | Tipo   |
| ------ | ------ |
| `id`   | Long   |
| `name` | String |

---

##### GET `/api/v1/locations/departments` — Listar departamentos (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<DepartmentResponseDTO>`

---

##### GET `/api/v1/locations/departments/{id}` — Departamento por ID

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID depto    |

**Response:** `200 OK` — `DepartmentResponseDTO` | `404 Not Found`

---

##### PUT `/api/v1/locations/departments/{id}` — Actualizar departamento

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID depto    |

**Request Body:** `@Valid` `DepartmentRequestDTO`

**Response:** `200 OK` — `DepartmentResponseDTO`

---

##### DELETE `/api/v1/locations/departments/{id}` — Eliminar departamento

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID depto    |

**Response:** `204 No Content`

---

##### GET `/api/v1/locations/departments/{id}/cities` — Departamento con municipios

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID depto    |

**Response:** `200 OK` — `DepartmentWithMunicipalitiesDTO`

| Campo            | Tipo                            |
| ---------------- | ------------------------------- |
| `id`             | Long                            |
| `name`           | String                          |
| `municipalities` | List\<MunicipalityResponseDTO\> |

---

#### DestinationController

| #   | Método | Path                                                          | Descripción         |
| --- | ------ | ------------------------------------------------------------- | ------------------- |
| 89  | POST   | `/api/v1/locations/destinations`                              | Crear destino       |
| 90  | GET    | `/api/v1/locations/destinations`                              | Listar destinos     |
| 91  | GET    | `/api/v1/locations/destinations/active`                       | Destinos activos    |
| 92  | GET    | `/api/v1/locations/destinations/{id}`                         | Destino por ID      |
| 93  | PUT    | `/api/v1/locations/destinations/{id}`                         | Actualizar destino  |
| 94  | DELETE | `/api/v1/locations/destinations/{id}`                         | Eliminar destino    |
| 95  | GET    | `/api/v1/locations/destinations/by-city/{cityId}`             | Destinos por ciudad |
| 96  | GET    | `/api/v1/locations/destinations/by-city/{cityId}/active`      | Activos por ciudad  |
| 97  | GET    | `/api/v1/locations/destinations/by-city/{cityId}/type/{type}` | Por ciudad y tipo   |
| 98  | GET    | `/api/v1/locations/destinations/featured`                     | Destinos destacados |

**Tipos de destino:** `VIEWPOINT`, `SPOT`, `HISTORICAL_SITE`, `MUSEUM`, `PARK`, `BEACH`, `NATURAL_RESERVE`

---

##### POST `/api/v1/locations/destinations` — Crear destino

**Request Body:** `@Valid` `DestinationRequestDTO`

| Campo             | Tipo                        | Descripción  |
| ----------------- | --------------------------- | ------------ |
| `name`            | String                      | Nombre       |
| `description`     | String                      | Descripción  |
| `imageUrl`        | String                      | URL imagen   |
| `latitude`        | Double                      | Latitud      |
| `longitude`       | Double                      | Longitud     |
| `destinationType` | String                      | Tipo destino |
| `municipalityId`  | Long                        | ID municipio |
| `active`          | Boolean                     | Activo       |
| `featured`        | Boolean                     | Destacado    |
| `images`          | List\<ImageDestinationDTO\> | Imágenes     |

**Response:** `201 CREATED` — `DestinationResponseDTO`

| Campo          | Tipo                    |
| -------------- | ----------------------- |
| `id`           | Long                    |
| `name`         | String                  |
| `description`  | String                  |
| `municipality` | MunicipalityResponseDTO |
| `latitude`     | Double                  |
| `longitude`    | Double                  |
| `active`       | Boolean                 |
| `featured`     | Boolean                 |
| `imageUrls`    | List\<String\>          |

---

##### GET `/api/v1/locations/destinations` — Listar destinos (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<DestinationResponseDTO>`

---

##### GET `/api/v1/locations/destinations/active` — Destinos activos (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<DestinationResponseDTO>`

---

##### GET `/api/v1/locations/destinations/{id}` — Destino por ID

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID destino  |

**Response:** `200 OK` — `DestinationResponseDTO` | `404 Not Found`

---

##### PUT `/api/v1/locations/destinations/{id}` — Actualizar destino

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID destino  |

**Request Body:** `@Valid` `DestinationRequestDTO` (mismos campos que creación)

**Response:** `200 OK` — `DestinationResponseDTO`

---

##### DELETE `/api/v1/locations/destinations/{id}` — Eliminar destino

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID destino  |

**Response:** `204 No Content`

---

##### GET `/api/v1/locations/destinations/by-city/{cityId}` — Destinos por ciudad

**Path Variables:**

| Nombre   | Tipo | Descripción |
| -------- | ---- | ----------- |
| `cityId` | Long | ID ciudad   |

**Response:** `200 OK` — `List<DestinationResponseDTO>`

---

##### GET `/api/v1/locations/destinations/by-city/{cityId}/active` — Activos por ciudad

**Path Variables:**

| Nombre   | Tipo | Descripción |
| -------- | ---- | ----------- |
| `cityId` | Long | ID ciudad   |

**Response:** `200 OK` — `List<DestinationResponseDTO>`

---

##### GET `/api/v1/locations/destinations/by-city/{cityId}/type/{type}` — Por ciudad y tipo

**Path Variables:**

| Nombre   | Tipo   | Descripción  |
| -------- | ------ | ------------ |
| `cityId` | Long   | ID ciudad    |
| `type`   | String | Tipo destino |

**Response:** `200 OK` — `List<DestinationResponseDTO>`

---

##### GET `/api/v1/locations/destinations/featured` — Destinos destacados (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<DestinationResponseDTO>`

---

#### ImageDestinationController

| #   | Método | Path                                                                   | Descripción            |
| --- | ------ | ---------------------------------------------------------------------- | ---------------------- |
| 99  | GET    | `/api/v1/locations/images/by-destination/{destinationId}`              | Imágenes de un destino |
| 100 | POST   | `/api/v1/locations/images/by-destination/{destinationId}`              | Crear imagen por URL   |
| 101 | POST   | `/api/v1/locations/images/upload/by-destination/{destinationId}`       | Subir archivo          |
| 102 | POST   | `/api/v1/locations/images/batch-upload/by-destination/{destinationId}` | Subir múltiples        |
| 103 | PUT    | `/api/v1/locations/images/{id}`                                        | Actualizar imagen      |
| 104 | DELETE | `/api/v1/locations/images/{id}`                                        | Eliminar imagen        |

---

##### GET `/api/v1/locations/images/by-destination/{destinationId}` — Imágenes

**Path Variables:**

| Nombre          | Tipo | Descripción |
| --------------- | ---- | ----------- |
| `destinationId` | Long | ID destino  |

**Response:** `200 OK` — `List<ImageDestinationDTO>`

**ImageDestinationDTO:**

| Campo           | Tipo   |
| --------------- | ------ |
| `id`            | Long   |
| `url`           | String |
| `publicId`      | String |
| `destinationId` | Long   |

---

##### POST `/api/v1/locations/images/by-destination/{destinationId}` — Crear imagen por URL

**Path Variables:**

| Nombre          | Tipo | Descripción |
| --------------- | ---- | ----------- |
| `destinationId` | Long | ID destino  |

**Request Body:** `@Valid` `ImageDestinationDTO`

| Campo      | Tipo   | Descripción   |
| ---------- | ------ | ------------- |
| `url`      | String | URL imagen    |
| `publicId` | String | ID Cloudinary |

**Response:** `201 CREATED` — `ImageDestinationDTO`

---

##### POST `/api/v1/locations/images/upload/by-destination/{destinationId}` — Subir imagen

**Path Variables:**

| Nombre          | Tipo | Descripción |
| --------------- | ---- | ----------- |
| `destinationId` | Long | ID destino  |

**Request Parameters (multipart):**

| Nombre | Tipo          | Requerido |
| ------ | ------------- | --------- |
| `file` | MultipartFile | Sí        |

**Response:** `201 CREATED` — `ImageDestinationDTO`

---

##### POST `/api/v1/locations/images/batch-upload/by-destination/{destinationId}` — Subir múltiples

**Path Variables:**

| Nombre          | Tipo | Descripción |
| --------------- | ---- | ----------- |
| `destinationId` | Long | ID destino  |

**Request Parameters (multipart):**

| Nombre  | Tipo                  | Requerido |
| ------- | --------------------- | --------- |
| `files` | List\<MultipartFile\> | Sí        |

**Response:** `201 CREATED` — `List<ImageDestinationDTO>`

---

##### PUT `/api/v1/locations/images/{id}` — Actualizar imagen

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID imagen   |

**Request Body:** `@Valid` `ImageDestinationDTO`

**Response:** `200 OK` — `ImageDestinationDTO`

---

##### DELETE `/api/v1/locations/images/{id}` — Eliminar imagen

**Path Variables:**

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| `id`   | Long | ID imagen   |

**Response:** `204 No Content`

---

### 3.5 Notification Service API

#### NotificationController

| #   | Método | Path                                 | Descripción                |
| --- | ------ | ------------------------------------ | -------------------------- |
| 110 | GET    | `/api/v1/notifications`              | Notificaciones del usuario |
| 111 | PATCH  | `/api/v1/notifications/{id}/read`    | Marcar como leída          |
| 112 | GET    | `/api/v1/notifications/unread-count` | Contar no leídas           |

---

##### GET `/api/v1/notifications` — Notificaciones del usuario (paginado)

**Query Parameters:**

| Nombre   | Tipo    | Requerido | Descripción |
| -------- | ------- | --------- | ----------- |
| `userId` | String  | Sí        | ID usuario  |
| `page`   | Integer | No        | Página      |
| `size`   | Integer | No        | Tamaño      |

**Response:** `200 OK` — `Page<NotificationEntity>`

**NotificationEntity (MongoDB):**

| Campo              | Tipo                               | Descripción       |
| ------------------ | ---------------------------------- | ----------------- |
| `id`               | String                             | ID                |
| `userId`           | String                             | ID usuario        |
| `notificationType` | NotificationType                   | Tipo notificación |
| `deliveries`       | List\<NotificationDeliveryStatus\> | Entregas          |
| `title`            | String                             | Título            |
| `message`          | String                             | Mensaje           |
| `metadata`         | Map\<String, Object\>              | Metadata          |
| `createdAt`        | LocalDateTime                      | Fecha creación    |
| `read`             | Boolean                            | Leída             |

**NotificationType enum:** `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `BOOKING_COMPLETED`, `COMPLETION_REQUESTED`, `PAYMENT_FAILED`, `NEW_REVIEW`, `SYSTEM_ALERT`, `BOOKING_REMINDER`, `SETTLEMENT_PAID`

**NotificationDeliveryStatus (nested):**

| Campo         | Tipo                                        |
| ------------- | ------------------------------------------- |
| `channel`     | NotificationChannelType (`EMAIL`, `IN_APP`) |
| `delivered`   | Boolean                                     |
| `deliveredAt` | LocalDateTime                               |

---

##### PATCH `/api/v1/notifications/{id}/read` — Marcar como leída

**Path Variables:**

| Nombre | Tipo   | Descripción     |
| ------ | ------ | --------------- |
| `id`   | String | ID notificación |

**Query Parameters:**

| Nombre   | Tipo   | Requerido | Descripción |
| -------- | ------ | --------- | ----------- |
| `userId` | String | Sí        | ID usuario  |

**Response:** `200 OK`

---

##### GET `/api/v1/notifications/unread-count` — Contar no leídas

**Query Parameters:**

| Nombre   | Tipo   | Requerido | Descripción |
| -------- | ------ | --------- | ----------- |
| `userId` | String | Sí        | ID usuario  |

**Response:** `200 OK` — `long`

---

### 3.6 FestivityController (experience-service)

Festividades culturales colombianas (Carnaval de Barranquilla, Feria de las Flores, etc.).
Son entidades informativas de calendario cultural, **no** ofertas vendibles — a diferencia de `EventOffer`,
las festividades no tienen proveedor, precio, ni capacidad. Se crean a nivel de administración del sistema.

| #   | Método | Path                                   | Descripción      |
| --- | ------ | -------------------------------------- | ---------------- |
| 113 | POST   | `/api/v1/festivities`                  | Crear festividad |
| 114 | GET    | `/api/v1/festivities`                  | Listar todas     |
| 115 | GET    | `/api/v1/festivities/{id}`             | Por ID           |
| 116 | PUT    | `/api/v1/festivities/{id}`             | Actualizar       |
| 117 | DELETE | `/api/v1/festivities/{id}`             | Eliminar         |
| 118 | GET    | `/api/v1/festivities/by-city/{cityId}` | Por ciudad       |
| 119 | GET    | `/api/v1/festivities/upcoming`         | Próximas         |

---

##### POST `/api/v1/festivities` — Crear festividad

**Request Body:** `@Valid` `FestivityRequest`

| Campo         | Tipo      | Validación  | Descripción  |
| ------------- | --------- | ----------- | ------------ |
| `name`        | String    | `@NotBlank` | Nombre       |
| `description` | String    | —           | Descripción  |
| `startDate`   | LocalDate | `@NotNull`  | Fecha inicio |
| `endDate`     | LocalDate | `@NotNull`  | Fecha fin    |
| `cityId`      | Long      | `@NotNull`  | ID municipio |
| `image`       | String    | —           | URL imagen   |
| `active`      | Boolean   | —           | Activo       |

**Response:** `201 CREATED` — `FestivityResponse`

| Campo         | Tipo      |
| ------------- | --------- |
| `id`          | UUID      |
| `name`        | String    |
| `description` | String    |
| `startDate`   | LocalDate |
| `endDate`     | LocalDate |
| `cityId`      | Long      |
| `image`       | String    |
| `active`      | Boolean   |

---

##### GET `/api/v1/festivities` — Listar todas (paginado)

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<FestivityResponse>`

---

##### GET `/api/v1/festivities/{id}` — Por ID

**Path Variables:**

| Nombre | Tipo | Descripción   |
| ------ | ---- | ------------- |
| `id`   | UUID | ID festividad |

**Response:** `200 OK` — `FestivityResponse` | `404 Not Found`

---

##### PUT `/api/v1/festivities/{id}` — Actualizar

**Path Variables:**

| Nombre | Tipo | Descripción   |
| ------ | ---- | ------------- |
| `id`   | UUID | ID festividad |

**Request Body:** `@Valid` `FestivityRequest` (mismos campos que creación)

**Response:** `200 OK` — `FestivityResponse`

---

##### DELETE `/api/v1/festivities/{id}` — Eliminar

**Path Variables:**

| Nombre | Tipo | Descripción   |
| ------ | ---- | ------------- |
| `id`   | UUID | ID festividad |

**Response:** `204 No Content`

---

##### GET `/api/v1/festivities/by-city/{cityId}` — Festividades por ciudad (paginado)

**Path Variables:**

| Nombre   | Tipo | Descripción |
| -------- | ---- | ----------- |
| `cityId` | Long | ID ciudad   |

**Query Parameters:**

| Nombre | Tipo    | Requerido | Default |
| ------ | ------- | --------- | ------- |
| `page` | Integer | No        | `0`     |
| `size` | Integer | No        | `10`    |

**Response:** `200 OK` — `Page<FestivityResponse>`

---

##### GET `/api/v1/festivities/upcoming` — Próximas festividades

**Response:** `200 OK` — `List<FestivityResponse>`

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

| Cola                       | Routing Keys                                         | Dead Letter               | Servicio             |
| -------------------------- | ---------------------------------------------------- | ------------------------- | -------------------- |
| `booking.experience.queue` | `experience.*`                                       | `booking.events.dlq`      | booking-service      |
| `booking.payment.queue`    | `payment.*`                                          | `booking.events.dlq`      | booking-service      |
| `payment.booking.queue`    | `booking.*`                                          | `booking.events.dlq`      | booking-service      |
| `notification.events`      | `booking.*`, `payment.*`, `review.*`, `settlement.*` | `notification.events.dlq` | notification-service |

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

**Notas del notification-service:**

- Cada evento genera una notificación in-app (persistida en MongoDB + push WebSocket) y, si el payload incluye `email`, además un email con su template Thymeleaf (`booking-completed`, `completion-requested`, `settlement-paid`, etc.).
- Para `settlement.paid` el destinatario no es el turista (`userId`) sino el **proveedor** (`providerId` del payload).

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

| Funcionalidad                                                                           | Prioridad                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------------- |
| Sistema de pagos semanales a proveedores (comisiones, settlements, dashboard)           | ✅ Implementado (ver DOCUMENTACION_PAGOS.md)      |
| MercadoPago Checkout Pro + Webhooks + Reembolsos                                        | ✅ Implementado (Checkout Pro, webhooks, refunds) |
| Onboarding bancario de proveedores (endpoint dedicado)                                  | ✅ Implementado (PUT /user/providers/{id}/onboarding/banking) |
| Forgot password vía email (Keycloak)                                                    | ✅ Implementado (POST /auth/forgot-password)       |
| Chatbot con LLM (Function Calling)                                                      | 📋 Documentado (ver DOCUMENTACION_CHATBOT.md)     |
| Pasarela de pago adicional (Stripe/Wompi)                                                | 🟡 Media                                          |
| Sistema de recomendaciones por IA                                                        | Alta                                              |
| Push notifications (FCM)                                                                 | Media                                             |
| Cleanup de notificaciones viejas (TTL)                                                  | Baja                                              |

**Contexto:** Para push notifications se necesita Firebase Cloud Messaging (FCM) + plugin `@capacitor/push-notifications` en Ionic.

---

## 8. Configuración de MercadoPago — Webhooks y notificaciones

### 8.1 ¿Cómo funciona?

Cuando se crea una Preference de Checkout Pro en `MercadoPagoProvider`, se incluye un `notificationUrl`:

```java
String webhookUrl = appBaseUrl + "/api/v1/webhooks/payments";
```

MercadoPago **envía automáticamente** notificaciones POST a esa URL cada vez que cambia el estado de un pago. No necesitás configurar nada adicional en el backend.

### 8.2 ¿Qué llega al webhook?

MercadoPago envía un POST a `POST /api/v1/webhooks/payments` con este payload:

```json
{
  "action": "payment.created",
  "type": "payment",
  "data": { "id": 12345678 }
}
```

El backend procesa así:

1. Extrae el `payment_id` del payload
2. **Verifica la firma HMAC-SHA256** (headers `x-signature` y `x-request-id` contra `MERCADOPAGO_WEBHOOK_SECRET`); si es inválida responde `401` y descarta la notificación
3. Llama a `MercadoPagoProvider.getExternalReferenceFromPayment(mpPaymentId)` → hace GET a la API de MercadoPago para obtener el `external_reference`
4. Busca el pago por `bookingId` en la DB
5. Actualiza el estado a `PAID`
6. Publica evento `payment.completed` en RabbitMQ → BookingService confirma la reserva

### 8.3 Desarrollo local — ngrok

**Problema:** MercadoPago necesita poder alcanzar tu URL por internet. Si estás corriendo localmente, MercadoPago no puede llegar a `localhost:8080`.

**Solución:** Usar ngrok para exponer tu puerto local:

```bash
# 1. Asegurarse de que docker-compose esté corriendo
docker-compose up -d

# 2. En otra terminal, levantar ngrok
ngrok http 8080
```

Esto te da una URL pública temporal como:

```
https://abcd1234.ngrok-free.app
```

### 8.4 Configurar ngrok paso a paso

**Paso 1: Actualizar `.env`**

```env
APP_BASE_URL=https://abcd1234.ngrok-free.app
PAYMENT_PROVIDER=MERCADOPAGO
```

> **IMPORTANTE:** La URL de ngrok cambia cada vez que reiniciás ngrok. Actualizá `APP_BASE_URL` en `.env` cada vez que levantes ngrok.

**Paso 2: Reiniciar docker-compose para que booking-service tome la nueva URL**

```bash
docker-compose down && docker-compose up -d
```

**Paso 3: Configurar webhook en MercadoPago Dashboard**

1. Ir a https://www.mercadopago.com.ar/developers
2. Seleccionar tu aplicación
3. Ir a **Webhooks**
4. Crear un webhook con:
   - **URL:** `https://tu-url-ngrok.ngrok-free.app/api/v1/webhooks/payments`
   - **Evento:** Pagos
5. Guardar

**Paso 4: Verificar que MercadoPago puede alcanzar ngrok**

Abrí la consola de ngrok en el navegador (`http://localhost:4040`) y verificá que aparezcan requests con status `200` cuando MercadoPago envía notificaciones.

### 8.6 Variables de entorno relevantes

| Variable                     | Descripción                                                      | Ejemplo                           |
| ---------------------------- | ---------------------------------------------------------------- | --------------------------------- |
| `APP_BASE_URL`               | URL pública del backend (donde MercadoPago envía notificaciones) | `https://abcd1234.ngrok-free.app` |
| `PAYMENT_PROVIDER`           | Proveedor activo: `MOCK` o `MERCADOPAGO`                         | `MERCADOPAGO`                     |
| `MERCADOPAGO_ACCESS_TOKEN`   | Token de acceso TEST o PROD                                      | `TEST-2109324389320804-...`       |
| `MERCADOPAGO_PUBLIC_KEY`     | Public key para el widget de pago del frontend                   | `TEST-de8789eb-...`               |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret para verificar la firma HMAC-SHA256 de los webhooks       | `74fdcd65a5b46d35ec...`           |

### 8.7 Tipos de notificación de MercadoPago

| Tipo             | Cuando se envía                    | Nuestro endpoint          |
| ---------------- | ---------------------------------- | ------------------------- |
| `payment`        | Cuando cambia el estado de un pago | `POST /webhooks/payments` |
| `merchant_order` | Cuando se crea/actualiza una orden | (no implementado)         |

### 8.8 Prueba del flujo completo (LOCAL)

1. Levantar docker-compose: `docker-compose up -d`
2. Levantar ngrok: `ngrok http 8080`
3. Copiar la URL de ngrok (ej: `https://abcd1234.ngrok-free.app`)
4. Actualizar `APP_BASE_URL` en `.env` con esa URL
5. Reiniciar booking-service: `docker-compose restart booking-service`
6. Configurar el webhook en MercadoPago Dashboard con la URL de ngrok
7. Crear reserva → ir a checkout → MercadoPago redirige a página de pago
8. Usar tarjeta de prueba de MercadoPago:
   - Número: `5031 7557 3453 0604`
   - CVV: `123`
   - Vencimiento: futuro (ej: 12/25)
   - DNI: `12345678`
9. Completar el pago
10. MercadoPago envía webhook a ngrok → se procesa → reserva se confirma

### 8.9 Troubleshooting

| Problema                                     | Causa posible                                                 | Solución                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Botón de pago deshabilitado                  | Public key no coincide con el ambiente                        | Verificar que la public key en el frontend coincida con las credenciales en `.env`                           |
| Pago se completa pero reserva no se confirma | Webhook no llega                                              | Verificar que ngrok esté corriendo y la URL en MercadoPago Dashboard sea correcta                            |
| Webhook retorna error 5xx                    | booking-service no está corriendo o hay error en DB           | Revisar logs de booking-service con `docker-compose logs booking-service`                                    |
| URL de ngrok cambió                          | ngrok se reinició                                             | Actualizar `APP_BASE_URL` en `.env`, reiniciar docker-compose, y actualizar webhook en MercadoPago Dashboard |
| Reserva queda en PENDING_PAYMENT             | El pago fue aprobado pero el webhook no procesó correctamente | Verificar en la consola de ngrok (`localhost:4040`) que los requests llegan con status 200                   |

---
