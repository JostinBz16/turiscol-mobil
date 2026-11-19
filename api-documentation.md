# DOCUMENTACIÓN TURISCOL BACKEND

## 1. Resumen del Proyecto

**Turiscol** es una plataforma de turismo colombiana compuesta por 6 microservicios. El frontend es una app móvil en **Ionic** que consume la API a través del Gateway en `http://localhost:8080`.

### 1.1 Microservicios

| Ruta Gateway                  | Destino                                | Puerto |
| ----------------------------- | -------------------------------------- | ------ |
| `/api/v1/locations/**`        | experience-service                     | 8803   |
| `/api/v1/offers/**`           | experience-service                     | 8803   |
| `/api/v1/reviews/**`          | experience-service                     | 8803   |
| `/api/v1/prices/**`           | experience-service                     | 8803   |
| `/api/v1/categories/**`       | experience-service                     | 8803   |
| `/api/v1/offers/favorites/**` | experience-service                     | 8803   |
| `/api/v1/festivities/**`      | experience-service                     | 8803   |
| `/api/v1/booking/**`          | booking-service                        | 8804   |
| `/api/v1/payments/**`         | booking-service                        | 8804   |
| `/api/v1/webhooks/**`         | booking-service                        | 8804   |
| `/api/v1/providers/**`        | booking-service                        | 8804   |
| `/api/v1/notifications/**`    | notification-service                   | 8808   |
| `/api/v1/chat/**`             | chatbot-service                        | 8809   |
| `/ws/**`                      | notification-service (WebSocket)       | 8808   |
| `/api/v1/users/**`            | user-service                           | 8802   |
| `/api/v1/auth/**`             | user-service                           | 8802   |
| `/api/v1/user/**`             | user-service (rutas internas provider) | 8802   |

| Servicio                        | Descripción                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **User Service (8802)**         | Usuarios, autenticación y roles. Integra con Keycloak.                                                                                                        |
| **Experience Service (8803)**   | Catálogo: ubicaciones, ofertas, reseñas, imágenes, precios y festividades culturales.                                                                         |
| **Booking Service (8804)**      | Reservas y pagos. Comunica con experience-service vía Feign para validar ofertas y stock.                                                                     |
| **Notification Service (8808)** | Notificaciones in-app y por email. Escucha RabbitMQ (`booking.*`, `payment.*`, `review.*`, `settlement.*`), MongoDB, WebSocket (STOMP) y email con Thymeleaf. |
| **Gateway Service (8080)**      | Punto de entrada único. Autenticación JWT, CORS y enrutamiento.                                                                                               |
| **Eureka Service (8811)**       | Service Discovery. Todos los servicios se registran aquí.                                                                                                     |

### Stack

| Característica          | Valor                                                                |
| ----------------------- | -------------------------------------------------------------------- |
| **Java**                | 21                                                                   |
| **Spring Boot**         | 3.5.x                                                                |
| **Spring Cloud**        | 2025.0.0                                                             |
| **Arquitectura**        | Microservicios con API Gateway                                       |
| **Bases de datos**      | PostgreSQL 15 (x3), MongoDB 6                                        |
| **Mensajería**          | RabbitMQ (Topic Exchange)                                            |
| **Pagos**               | MercadoPago SDK (Checkout Pro) + Strategy Pattern (MOCK/MERCADOPAGO) |
| **Auth**                | Keycloak 24.0.2 (OIDC + JWT)                                         |
| **Service Discovery**   | Netflix Eureka                                                       |
| **Imágenes**            | Cloudinary                                                           |
| **API Docs**            | Swagger/OpenAPI (springdoc-openapi)                                  |
| **Trazabilidad**        | Micrometer Tracing + Zipkin                                          |
| **Migraciones BD**      | ddl-auto=update (no Flyway)                                          |
| **Redis**               | Cache (ofertas, ubicaciones, precios) + Rate Limiting                |
| **WebSocket**           | STOMP con autenticación JWT, colas privadas por usuario              |
| **Email**               | Thymeleaf templates + SMTP configurable                              |
| **Total endpoints**     | ~113 implementados + ~12 planeados                                   |
| **Total controladores** | 21                                                                   |

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

---

## 3. API Completa por Servicio

### 3.1 User Service API

#### AuthController

| #   | Método | Path                    | Auth    | Descripción                    |
| --- | ------ | ----------------------- | ------- | ------------------------------ |
| 1   | POST   | `/auth/login`           | Público | Login con email y contraseña   |
| 2   | POST   | `/auth/client-login`    | Público | Login M2M (client_credentials) |
| 3   | POST   | `/auth/refresh`         | Público | Refrescar token                |
| 4   | POST   | `/auth/register`        | Público | Registrar usuario              |
| 5   | POST   | `/auth/forgot-password` | Público | Enviar email de recuperación   |

---

##### POST `/auth/login` — Login

**Request Body:** `LoginRequestDTO`

| Campo      | Tipo   | Descripción |
| ---------- | ------ | ----------- |
| `email`    | String | Email       |
| `password` | String | Contraseña  |

**Response:** `200 OK` — `TokenResponseDTO`

| Campo              | Tipo   | JSON Property          |
| ------------------ | ------ | ---------------------- |
| `accessToken`      | String | `"access_token"`       |
| `refreshToken`     | String | `"refresh_token"`      |
| `expiresIn`        | Long   | `"expires_in"`         |
| `refreshExpiresIn` | Long   | `"refresh_expires_in"` |
| `userName`         | String | `"userName"`           |

`expiresIn` y `refreshExpiresIn` son la vigencia, en segundos, del access token y del refresh token (ver sección 4.3). El frontend puede usarlos para programar el refresh.

**Errores:**

| Código          | Cuándo                                                                                                                  |
| --------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `403 Forbidden` | El usuario está bloqueado (desactivado por un ADMIN). Mensaje: `"Tu cuenta está bloqueada. Contactá al administrador."` |

> **Usuarios bloqueados:** un usuario desactivado con `PUT /users/{id}/deactivate` no puede iniciar sesión ni refrescar su token (`/auth/refresh` también responde `403` con el mismo mensaje).

---

##### POST `/auth/client-login` — Login M2M

Sin body. Responde con `TokenResponseDTO` igual que `/auth/login`.

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

**UserResponseDTO:** `id` (String), `email` (String), `userName` (String), `phoneNumber` (String), `active` (Boolean), `role` (String).

**ProviderResponseDTO** (extiende UserResponseDTO): + `razonSocial`, `description`, `type`, `nitRut`, `documentType`, `documentNumber`, `bankName`, `bankAccountType`, `bankAccountNumber`, `onboardingCompleted`, `certified`.

---

##### POST `/auth/forgot-password` — Recuperar contraseña

Envía un email con link para restablecer la contraseña. Usa `executeActionsEmail` de Keycloak con la acción `UPDATE_PASSWORD`.

> **Requisito:** Keycloak debe tener SMTP configurado en Admin Console → Realm → Email → SMTP Settings.

**Request Body:** `ForgotPasswordRequestDTO`

| Campo   | Tipo   | Validación            | Descripción       |
| ------- | ------ | --------------------- | ----------------- |
| `email` | String | `@NotBlank`, `@Email` | Email del usuario |

**Response:** `200 OK` — `"Si el email está registrado, recibirás un correo con las instrucciones para restablecer tu contraseña"`

> Siempre retorna 200 independientemente de si el email existe o no, para evitar enumeración de usuarios.

---

#### UserController

| #   | Método | Path                     | Auth          | Descripción                            |
| --- | ------ | ------------------------ | ------------- | -------------------------------------- |
| 5   | PUT    | `/users/{id}`            | ADMIN o dueño | Actualizar usuario                     |
| 6   | PUT    | `/users/{id}/deactivate` | ADMIN         | Desactivar usuario                     |
| 7   | PUT    | `/users/{id}/activate`   | ADMIN         | Activar usuario                        |
| 7b  | PUT    | `/users/{id}/role`       | ADMIN         | Cambiar el rol de realm del usuario    |
| 8   | GET    | `/users/{id}`            | ADMIN o dueño | Obtener usuario por ID                 |
| 9   | GET    | `/users/email/{email}`   | ADMIN         | Obtener usuario por email              |
| 10  | GET    | `/users`                 | ADMIN         | Listar usuarios (paginado: page, size) |
| 11  | GET    | `/users/role/{role}`     | ADMIN         | Listar por rol (paginado: page, size)  |
| 12  | GET    | `/users/profile/{id}`    | ADMIN o dueño | Obtener perfil                         |

---

##### PUT `/users/{id}` — Actualizar usuario

**Auth:** ADMIN o dueño (el `{id}` debe ser el propio usuario autenticado).

**Path:** `id` (String, ID usuario)

**Request Body:** `UserRequestDTO` (polimórfico, mismos campos que registro)

**Response:** `200 OK` — `UserResponseDTO`

> **Onboarding de proveedor:** al actualizar un proveedor, si se completan `bankName`, `bankAccountType` y `bankAccountNumber`, el campo `onboardingCompleted` se marca automáticamente en `true`. Hasta entonces queda `false`, y la liquidación semanal no procesa payouts para ese proveedor.
>
> **El campo `active` se ignora si quien llama no es ADMIN.** Un usuario no puede activarse/desactivarse a sí mismo mandando `active` en el body de este endpoint; para eso debe usar los endpoints dedicados `/activate`/`/deactivate` (solo ADMIN).

---

##### PUT `/users/{id}/deactivate` — Desactivar usuario

**Auth:** ADMIN. **Path:** `id` (String). **Response:** `204 No Content`.

Es el **bloqueo de usuario**: lo deja inactivo en la base local y deshabilitado en Keycloak, y además **revoca sus sesiones abiertas y refresh tokens**. Desde ese momento no puede iniciar sesión ni refrescar el token (`403`, ver `POST /auth/login`). El access token ya emitido sigue siendo válido hasta que expire (ver sección 4.3).

##### PUT `/users/{id}/activate` — Activar usuario

**Auth:** ADMIN. **Path:** `id` (String). **Response:** `204 No Content`.

Es el **desbloqueo de usuario**: el usuario vuelve a poder iniciar sesión.

##### PUT `/users/{id}/role` — Cambiar rol del usuario

**Auth:** ADMIN.

**Path:** `id` (String, ID usuario).

**Request Body:** `RoleChangeRequestDTO`

| Campo  | Tipo   | Validación  | Descripción                                    |
| ------ | ------ | ----------- | ---------------------------------------------- |
| `role` | String | `@NotBlank` | Nuevo rol de realm (`USER`/`PROVIDER`/`ADMIN`) |

**Response:** `204 No Content`.

> Reemplaza TODOS los roles de realm que el usuario tenía por el nuevo (no es aditivo). Pensado para el dashboard de admin: promover/revocar un usuario a `PROVIDER` o `ADMIN` sin reenviar el resto del perfil.

##### GET `/users/{id}` — Obtener usuario por ID

**Auth:** ADMIN o dueño. **Path:** `id` (String). **Response:** `200 OK` — `UserResponseDTO`.

##### GET `/users/email/{email}` — Obtener usuario por email

**Auth:** ADMIN. **Path:** `email` (String). **Response:** `200 OK` — `UserResponseDTO`.

##### GET `/users` — Listar usuarios (paginado)

**Auth:** ADMIN. **Query:** `page` (default 0), `size` (default 20). **Response:** `200 OK` — `Page<UserResponseDTO>`.

##### GET `/users/role/{role}` — Listar por rol (paginado)

**Auth:** ADMIN. **Path:** `role` (String). **Query:** `page` (default 0), `size` (default 20). **Response:** `200 OK` — `Page<UserResponseDTO>`.

##### GET `/users/profile/{id}` — Obtener perfil

**Auth:** ADMIN o dueño. **Path:** `id` (String). **Response:** `200 OK` — `UserResponseDTO`.

---

#### UserStatsController

| #   | Método | Path           | Auth  | Descripción                        |
| --- | ------ | -------------- | ----- | ---------------------------------- |
| 17  | GET    | `/users/stats` | ADMIN | Estadísticas agregadas de usuarios |

##### GET `/users/stats` — Estadísticas de usuarios

**Auth:** ADMIN. Expuesto en un controller propio, fuera de `UserController`, para no chocar con `/users/{id}`.

**Response:** `200 OK` — `UserStatsDTO`

| Campo      | Tipo              | Descripción                                                       |
| ---------- | ----------------- | ----------------------------------------------------------------- |
| `total`    | long              | Total de usuarios en la tabla local                               |
| `active`   | long              | Usuarios con `active = true`                                      |
| `inactive` | long              | Usuarios con `active = false`                                     |
| `byRole`   | Map<String, Long> | Conteo de miembros por rol de realm (`USER`, `PROVIDER`, `ADMIN`) |

> `byRole` consulta Keycloak en vivo (no la tabla local) y trae todos los miembros de cada rol para contarlos en memoria — correcto para el volumen actual, pero no escalado para bases de usuarios muy grandes.

---

#### ProviderController

| #   | Método | Path                                      | Auth          | Descripción                           |
| --- | ------ | ----------------------------------------- | ------------- | ------------------------------------- |
| 13  | POST   | `/user/providers`                         | Público       | Crear provider (interno, sin Gateway) |
| 14  | PUT    | `/user/providers/{id}`                    | ADMIN o dueño | Actualizar provider (interno)         |
| 15  | GET    | `/user/providers/by-username/{username}`  | ADMIN         | Obtener provider por username         |
| 16  | PUT    | `/user/providers/{id}/onboarding/banking` | ADMIN o dueño | Completar onboarding bancario         |

---

##### POST `/user/providers` — Crear provider

**Auth:** Público (se mantiene así deliberadamente; es la ruta de alta de proveedores usada hoy).

**Request Body:** `ProviderRequestDTO` (campos ver subtipo PROVIDER en AuthController)

**Response:** `201 CREATED` — `ProviderResponseDTO`

##### PUT `/user/providers/{id}` — Actualizar provider

**Auth:** ADMIN o dueño. **Path:** `id` (String, ID provider). **Request Body:** `ProviderRequestDTO`.

**Response:** `200 OK` — `ProviderResponseDTO`.

##### GET `/user/providers/by-username/{username}` — Obtener provider

**Auth:** ADMIN. **Path:** `username` (String). **Response:** `200 OK` — `ProviderResponseDTO`.

---

##### PUT `/user/providers/{id}/onboarding/banking` — Completar onboarding bancario

**Auth:** ADMIN o dueño.

Endpoint dedicado para que un proveedor complete su información bancaria y pueda recibir pagos semanales. Valida que el usuario tenga rol `PROVIDER` y que no haya completado el onboarding previamente.

**Path:** `id` (String, Keycloak UUID del proveedor).

**Request Body:** `BankingOnboardingRequestDTO`

| Campo               | Tipo         | Validación  | Descripción                     |
| ------------------- | ------------ | ----------- | ------------------------------- |
| `bankName`          | String       | `@NotBlank` | Nombre del banco                |
| `bankAccountType`   | String       | `@NotBlank` | `AHORROS` / `CORRIENTE`         |
| `bankAccountNumber` | String       | `@NotBlank` | Número de cuenta bancaria       |
| `documentType`      | DocumentType | `@NotBlank` | `CC` / `NIT` / `CE`             |
| `documentNumber`    | String       | `@NotBlank` | Número de documento del titular |

**Response:** `200 OK` — `ProviderResponseDTO` con `onboardingCompleted: true`

| Código | Causa                                         |
| ------ | --------------------------------------------- |
| `400`  | El usuario no tiene rol de proveedor          |
| `400`  | El onboarding ya fue completado anteriormente |
| `404`  | Usuario o perfil de proveedor no encontrado   |

> Este endpoint se llama una sola vez durante el primer inicio del proveedor.

---

#### RoleController

| #   | Método | Path           | Auth  | Descripción                                                  |
| --- | ------ | -------------- | ----- | ------------------------------------------------------------ |
| 18  | GET    | `/users/roles` | ADMIN | Listar roles de Keycloak (interno). Response: `List<String>` |

---

### 3.2 Booking Service API

#### BookingController

| #   | Método | Path                          | Descripción                |
| --- | ------ | ----------------------------- | -------------------------- |
| 17  | POST   | `/api/v1/booking`             | Crear reserva              |
| 18  | GET    | `/api/v1/booking`             | Listar reservas (paginado) |
| 19  | GET    | `/api/v1/booking/{id}`        | Detalle de reserva         |
| 20  | PUT    | `/api/v1/booking/{id}`        | Actualizar reserva         |
| 21  | POST   | `/api/v1/booking/{id}/cancel` | Cancelar reserva           |

---

##### POST `/api/v1/booking` — Crear reserva

**Headers:**

| Nombre            | Tipo   | Requerido | Default       |
| ----------------- | ------ | --------- | ------------- |
| `X-User-Id`       | String | No        | `"1"`         |
| `Idempotency-Key` | String | No        | UUID generado |

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

**Query:** `page` (default 0), `size` (default 20). **Response:** `200 OK` — `Page<BookingResponseDTO>`.

##### GET `/api/v1/booking/{id}` — Detalle de reserva

**Path:** `id` (Long).

**Response:** `200 OK` — `BookingDetailResponseDTO` (campos de `BookingResponseDTO` +):

| Campo           | Tipo                            | Descripción                                                       |
| --------------- | ------------------------------- | ----------------------------------------------------------------- |
| `payments`      | List\<PaymentResponseDTO\>      | Pagos asociados (id, status, amount, currency, paidAt, createdAt) |
| `statusHistory` | List\<BookingStatusHistoryDTO\> | Historial de cambios de estado (status, changedAt)                |

---

##### PUT `/api/v1/booking/{id}` — Actualizar reserva

**Path:** `id` (Long).

**Request Body:** `@Valid` `UpdateBookingRequestDTO` (todos opcionales, solo se actualizan los campos enviados)

| Campo        | Tipo              | Validación         | Descripción           |
| ------------ | ----------------- | ------------------ | --------------------- |
| `startDate`  | LocalDate         | `@FutureOrPresent` | Nueva fecha de inicio |
| `endDate`    | LocalDate         | `@Future`          | Nueva fecha de fin    |
| `quantity`   | Integer           | `@Min(1)`          | Nueva cantidad        |
| `guestCount` | Integer           | `@Min(1)`          | N° de huéspedes       |
| `newStatus`  | BookingStatusType | —                  | Nuevo estado          |

**BookingStatusType:** `PENDING_PAYMENT`, `CONFIRMED`, `COMPLETION_REQUESTED`, `COMPLETED`, `CANCELLED`, `EXPIRED`, `FAILED`

**Transiciones válidas:**

- `PENDING_PAYMENT` → `CANCELLED`
- `CONFIRMED` → `CANCELLED`, `COMPLETION_REQUESTED`, `COMPLETED`
- `COMPLETION_REQUESTED` → `COMPLETED`, `CANCELLED`

> `CONFIRMED → COMPLETION_REQUESTED` la dispara el provider vía `POST /api/v1/booking/{id}/complete-request`; `COMPLETION_REQUESTED → COMPLETED` la confirma el turista vía `POST /api/v1/booking/{id}/confirm-completion`. En `COMPLETED` los earnings quedan disponibles para liquidación semanal.

**Response:** `200 OK` — `BookingResponseDTO`

---

##### POST `/api/v1/booking/{id}/cancel` — Cancelar reserva

**Headers:** `X-User-Id` (String, requerido, ID turista)

**Path:** `id` (Long).

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

**Headers:** `X-User-Id` (String, requerido, ID turista)

**Path:** `bookingId` (Long).

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

**Query:** `payment_id`, `status`, `external_reference`. **Response:** `200 OK` — `"Pago procesado correctamente. Puedes cerrar esta ventana."`

##### GET `/api/v1/webhooks/payments/failure` — Callback fallo

**Query:** `payment_id`, `status`. **Response:** `200 OK` — `"El pago no pudo ser procesado. Puedes intentar nuevamente."`

##### GET `/api/v1/webhooks/payments/pending` — Callback pendiente

**Query:** `payment_id`, `status`. **Response:** `200 OK` — `"Tu pago está siendo procesado. Te notificaremos cuando se confirme."`

##### POST `/api/v1/webhooks/payments/mock/success/{providerReference}` — Mock éxito

**Path:** `providerReference` (String). **Response:** `200 OK`.

##### POST `/api/v1/webhooks/payments/mock/failure/{providerReference}` — Mock fallo

**Path:** `providerReference` (String). **Response:** `200 OK`.

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

| #   | Método | Path                                             | Descripción                             | Autenticación                            |
| --- | ------ | ------------------------------------------------ | --------------------------------------- | ---------------------------------------- |
| 25  | POST   | `/api/v1/offers`                                 | Crear oferta                            | `authentication.principal != null`       |
| 26  | PUT    | `/api/v1/offers/{id}`                            | Actualizar oferta                       | `providerId == authentication.principal` |
| 27  | PATCH  | `/api/v1/offers/{id}/activate`                   | Activar oferta                          | `providerId == authentication.principal` |
| 28  | PATCH  | `/api/v1/offers/{id}/deactivate`                 | Desactivar oferta                       | `providerId == authentication.principal` |
| 28b | PATCH  | `/api/v1/offers/{id}/block`                      | Bloquear oferta (la desactiva)          | ADMIN                                    |
| 28c | PATCH  | `/api/v1/offers/{id}/unblock`                    | Desbloquear oferta (no la reactiva)     | ADMIN                                    |
| 29  | GET    | `/api/v1/offers/{id}`                            | Detalle de oferta                       | —                                        |
| 30  | GET    | `/api/v1/offers`                                 | Listar ofertas (paginado)               | —                                        |
| 31  | GET    | `/api/v1/offers/active`                          | Ofertas activas (paginado)              | —                                        |
| 32  | GET    | `/api/v1/offers/provider/{providerId}`           | Ofertas por proveedor (paginado)        | —                                        |
| 33  | GET    | `/api/v1/offers/city/{cityId}`                   | Ofertas por ciudad (paginado)           | —                                        |
| 34  | GET    | `/api/v1/offers/city/{cityId}/active`            | Ofertas activas por ciudad (paginado)   | —                                        |
| 35  | GET    | `/api/v1/offers/type/{type}`                     | Ofertas por tipo (paginado)             | —                                        |
| 36  | GET    | `/api/v1/offers/type/{type}/active`              | Ofertas activas por tipo (paginado)     | —                                        |
| 37  | GET    | `/api/v1/offers/search`                          | Buscar ofertas con filtros (paginado)   | —                                        |
| 38  | GET    | `/api/v1/offers/featured`                        | Ofertas destacadas (paginado)           | —                                        |
| 39  | PATCH  | `/api/v1/offers/{id}/featured`                   | Marcar/desmarcar destacada              | —                                        |
| 40  | GET    | `/api/v1/offers/type/{type}/category/{category}` | Ofertas por tipo y categoría (paginado) | —                                        |

**Tipos de oferta:** `"product"`, `"service"`, `"event"`, `"accommodation"`

**Query params de paginado:** `page` (default 0), `size` (default 20).

**Bloqueo de ofertas:** `blocked` es un estado controlado solo por el ADMIN, independiente de `active` (que es el interruptor del proveedor). `OfferResponseDTO` y `OfferDetailDTO` exponen `blocked` para que el front muestre el estado.

- `PATCH /offers/{id}/block` (ADMIN, `204 No Content`): marca la oferta como bloqueada y la desactiva, por lo que desaparece del catálogo y no se puede reservar.
- `PATCH /offers/{id}/unblock` (ADMIN, `204 No Content`): quita el bloqueo, pero **no** reactiva la oferta; el proveedor debe activarla con `PATCH /offers/{id}/activate`.
- Si el proveedor intenta activar una oferta bloqueada, responde `409 Conflict` con el mensaje `"Esta oferta está bloqueada por un administrador y no puede activarse."`.
- Un no-ADMIN que llame a `block`/`unblock` recibe `403 Forbidden`; si la oferta no existe, `404 Not Found`.
- `blocked` se ignora al crear: toda oferta nueva nace sin bloquear (y desactivada si el cliente intentó enviarla bloqueada).

---

##### POST `/api/v1/offers` — Crear oferta

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

**Subtipo `"product"`:** `productCategory` (ProductCategory), `isUnlimitedStock` (Boolean, default `false`)

**Subtipo `"service"`:** `serviceCategory` (ServiceCategory), `requiresSchedule` (Boolean), `durationInMinutes` (Integer), `capacity` (Integer), `pricePerPerson` (BigDecimal)

**Subtipo `"event"`:** `startDate` (LocalDateTime), `endDate` (LocalDateTime), `maximumCapacity` (Integer), `ticketPrice` (BigDecimal), `purchaseUrl` (String), `eventType` (EventType: `PUBLISHED`, `IN_PROGRESS`, `FINISHED`, `CANCELLED`)

**Subtipo `"accommodation"`:** `maxGuests` (Integer), `bedrooms` (Integer), `bathrooms` (Integer), `allowPets` (Boolean), `allowChildren` (Boolean), `pricePerNight` (BigDecimal), `accommodationCategory` (AccommodationCategory)

**Response:** `200 OK` — `OfferResponseDTO` (id, providerId, name, description, baseprice, cityId, type, category, active, blocked, featured, createdAt, updatedAt)

---

##### GET `/api/v1/offers/search` — Buscar ofertas con filtros

**Query Parameters:**

| Nombre          | Tipo          | Descripción                    |
| --------------- | ------------- | ------------------------------ |
| `providerId`    | String        | ID del proveedor               |
| `cityId`        | Long          | ID del municipio               |
| `active`        | Boolean       | Filtrar por activas            |
| `name`          | String        | Nombre (búsqueda parcial)      |
| `type`          | String        | Tipo de oferta                 |
| `category`      | String        | Categoría                      |
| `featured`      | Boolean       | Solo destacadas                |
| `minPrice`      | BigDecimal    | Precio mínimo                  |
| `maxPrice`      | BigDecimal    | Precio máximo                  |
| `maxGuests`     | Integer       | Máximo huéspedes               |
| `allowPets`     | Boolean       | Permitir mascotas              |
| `allowChildren` | Boolean       | Permitir niños                 |
| `startDate`     | LocalDateTime | Fecha inicio (`ISO.DATE_TIME`) |
| `endDate`       | LocalDateTime | Fecha fin (`ISO.DATE_TIME`)    |
| `capacity`      | Integer       | Capacidad                      |
| `page`          | Integer       | Página (default `0`)           |
| `size`          | Integer       | Tamaño (default `20`)          |

**Response:** `200 OK` — `Page<OfferResponseDTO>`

---

##### GET `/api/v1/offers/{id}` — Detalle de oferta

**Response:** `200 OK` — `OfferDetailDTO` (campos base + campos específicos del tipo + `images: List<OfferImageDTO>` donde cada imagen tiene `imageUrl` y `isPrimary`)

---

#### StockProductController

| #   | Método | Path                                | Descripción                                                  |
| --- | ------ | ----------------------------------- | ------------------------------------------------------------ |
| 41  | POST   | `/api/v1/offers/{id}/stock/deduct`  | Deducir stock (`providerId == authentication.principal`)     |
| 42  | POST   | `/api/v1/offers/{id}/stock/restock` | Reabastecer stock (`providerId == authentication.principal`) |
| 43  | GET    | `/api/v1/offers/{id}/stock`         | Obtener stock actual. Response: `Integer`                    |

##### POST `/api/v1/offers/{id}/stock/deduct` — Deducir stock

**Request Body:** `DeductStockRequest` — `quantity` (Integer, cantidad a deducir), `referenceId` (String, ej: `booking-123`).

**Response:** `200 OK`.

##### POST `/api/v1/offers/{id}/stock/restock` — Reabastecer stock

**Query:** `quantity` (Integer, requerido), `description` (String, opcional). **Response:** `200 OK`.

---

#### EventStatusHistoryController

| #   | Método | Path                                                    | Descripción                |
| --- | ------ | ------------------------------------------------------- | -------------------------- |
| 44  | POST   | `/api/v1/offers/event/{eventId}/events-status`          | Registrar cambio de estado |
| 45  | GET    | `/api/v1/offers/event/{eventId}/events-status`          | Obtener historial          |
| 46  | GET    | `/api/v1/offers/event/{eventId}/events-status/latest`   | Último estado              |
| 47  | GET    | `/api/v1/offers/event/{eventId}/events-status/{status}` | Buscar por estado          |

**POST — Request:** `eventId` (UUID, @NotNull), `status` (EventStatus: `PUBLISHED`, `IN_PROGRESS`, `FINISHED`, `CANCELLED`).

**GET — Response:** `EventStatusHistoryResponse` — `id` (UUID), `eventId` (UUID), `status` (EventStatus), `changedAt` (LocalDateTime).

---

#### OfferImageController

| #   | Método | Path                                                | Descripción                                                         |
| --- | ------ | --------------------------------------------------- | ------------------------------------------------------------------- |
| 48  | POST   | `/api/v1/offers/{offerId}/images`                   | Agregar imagen por URL (`imageUrl`, `isPrimary`)                    |
| 49  | POST   | `/api/v1/offers/{offerId}/images/upload`            | Subir archivo de imagen (multipart: `file`, `isPrimary`)            |
| 50  | POST   | `/api/v1/offers/{offerId}/images/batch-upload`      | Subir múltiples imágenes (multipart: `files`)                       |
| 51  | GET    | `/api/v1/offers/{offerId}/images`                   | Listar imágenes. Response: `List<OfferImage>` (imageUrl, isPrimary) |
| 52  | DELETE | `/api/v1/offers/{offerId}/images/{imageId}`         | Eliminar imagen. `204 No Content`                                   |
| 53  | PATCH  | `/api/v1/offers/{offerId}/images/{imageId}/primary` | Marcar como principal. `204 No Content`                             |

---

#### CategoryController

| #   | Método | Path                                     | Descripción                                                          |
| --- | ------ | ---------------------------------------- | -------------------------------------------------------------------- |
| 54  | GET    | `/api/v1/offers/categories`              | Todas las categorías por tipo. Response: `Map<String, List<String>>` |
| 55  | GET    | `/api/v1/offers/types/{type}/categories` | Categorías por tipo de oferta. Response: `List<String>`              |

---

#### PriceListingController

| #   | Método | Path                                     | Descripción                                                          |
| --- | ------ | ---------------------------------------- | -------------------------------------------------------------------- |
| 56  | POST   | `/api/v1/prices`                         | Crear listing de precio                                              |
| 57  | PUT    | `/api/v1/prices/{id}`                    | Actualizar listing                                                   |
| 58  | GET    | `/api/v1/prices/{id}`                    | Listing por ID                                                       |
| 59  | GET    | `/api/v1/prices`                         | Listar todos                                                         |
| 60  | GET    | `/api/v1/prices/city/{cityId}`           | Filtrar por ciudad                                                   |
| 61  | GET    | `/api/v1/prices/category/{categoryName}` | Filtrar por categoría                                                |
| 62  | GET    | `/api/v1/prices/range`                   | Filtrar por rango (query: `min`, `max`, ambos BigDecimal requeridos) |
| 63  | GET    | `/api/v1/prices/active`                  | Listings activos                                                     |
| 64  | DELETE | `/api/v1/prices/{id}`                    | Eliminar listing. `204 No Content`                                   |

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

**Response:** `201 CREATED` — `PriceListingResponse` (id, name, description, category, minPrice, maxPrice, municipalityId, mainImage, active)

---

#### ReviewController

| #   | Método | Path                                          | Descripción                    | Autenticación                          |
| --- | ------ | --------------------------------------------- | ------------------------------ | -------------------------------------- |
| 65  | POST   | `/api/v1/reviews`                             | Crear reseña                   | `authentication.principal != null`     |
| 66  | PUT    | `/api/v1/reviews/{id}`                        | Actualizar reseña              | `authorId == authentication.principal` |
| 67  | DELETE | `/api/v1/reviews/{id}`                        | Eliminar reseña                | `authorId == authentication.principal` |
| 68  | GET    | `/api/v1/reviews/{id}`                        | Reseña por ID                  | —                                      |
| 69  | GET    | `/api/v1/reviews/user/{userId}`               | Reseñas por usuario (paginado) | —                                      |
| 70  | GET    | `/api/v1/reviews/offer/{offerId}`             | Reseñas por oferta (paginado)  | —                                      |
| 71  | GET    | `/api/v1/reviews/service/{serviceId}/summary` | Resumen de calificaciones      | —                                      |

##### POST `/api/v1/reviews` — Crear reseña

**Request Body:** `@Valid` `ReviewRequest`

| Campo      | Tipo   | Validación           | Descripción        |
| ---------- | ------ | -------------------- | ------------------ |
| `offerId`  | String | `@NotBlank`          | ID oferta          |
| `authorId` | String | `@NotNull`           | ID autor           |
| `comment`  | String | `@NotBlank`          | Comentario         |
| `rating`   | int    | `@Min(1)`, `@Max(5)` | Calificación (1-5) |

**Response:** `201 CREATED` — `ReviewResponse` (id, offerId, authorId, comment, rating, createdAt)

##### GET `/api/v1/reviews/service/{serviceId}/summary` — Resumen de calificaciones

**Response:** `200 OK` — `RatingSummaryResponse` (average: double, totalReviews: long)

---

#### FavoriteController

| #   | Método | Path                                | Descripción                                                                                                       |
| --- | ------ | ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 105 | GET    | `/api/v1/offers/favorites`          | Listar favoritos (query: `userId`)                                                                                |
| 106 | GET    | `/api/v1/offers/favorites/check`    | Verificar si es favorito (query: `userId`, `offerId`). Response: `FavoriteCheckResponseDTO` (isFavorite: boolean) |
| 107 | POST   | `/api/v1/offers/favorites`          | Agregar favorito (body: `userId`, `offerId`)                                                                      |
| 108 | DELETE | `/api/v1/offers/favorites/{id}`     | Eliminar favorito por ID. `204 No Content`                                                                        |
| 109 | DELETE | `/api/v1/offers/favorites/by-offer` | Eliminar por usuario+oferta (query: `userId`, `offerId`). `204 No Content`                                        |

##### GET `/api/v1/offers/favorites` — Listar favoritos

**Query:** `userId` (String, requerido).

**Response:** `200 OK` — `UserFavoritesResponseDTO`

| Campo    | Tipo                                                               |
| -------- | ------------------------------------------------------------------ |
| `user`   | `ProviderSummary` (id, userName, phoneNumber, email, role, active) |
| `offers` | `List<FavoriteOfferItemDTO>`                                       |

##### POST `/api/v1/offers/favorites` — Agregar favorito

**Request Body:** `@Valid` `FavoriteRequestDTO` — `userId` (String, @NotBlank), `offerId` (UUID, @NotNull).

**Response:** `201 CREATED` — `FavoriteResponseDTO` (id: UUID, user: ProviderSummary, offer: Offer, createdAt)

---

### 3.4 Location Controllers (Experience Service)

#### CityController (Municipality)

| #   | Método | Path                                                                | Descripción                                                                    |
| --- | ------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 72  | POST   | `/api/v1/locations/cities`                                          | Crear ciudad/municipio                                                         |
| 73  | GET    | `/api/v1/locations/cities`                                          | Listar ciudades (paginado: page, size default 10)                              |
| 74  | GET    | `/api/v1/locations/cities/{id}`                                     | Ciudad por ID                                                                  |
| 75  | PUT    | `/api/v1/locations/cities/{id}`                                     | Actualizar ciudad                                                              |
| 76  | DELETE | `/api/v1/locations/cities/{id}`                                     | Eliminar ciudad. `204 No Content`                                              |
| 77  | GET    | `/api/v1/locations/cities/by-name/{name}`                           | Buscar por nombre                                                              |
| 78  | GET    | `/api/v1/locations/cities/by-name/{name}/department/{departmentId}` | Buscar por nombre + departamento                                               |
| 79  | GET    | `/api/v1/locations/cities/search`                                   | Buscar ciudades (parcial, sin acentos). Query: `q` (requerido), `page`, `size` |
| 80  | GET    | `/api/v1/locations/cities/{id}/destinations`                        | Destinos por ciudad                                                            |
| 81  | GET    | `/api/v1/locations/cities/{cityId}/destinations/type/{type}`        | Destinos por ciudad y tipo (paginado)                                          |
| 82  | GET    | `/api/v1/locations/cities/featured`                                 | Ciudades destacadas (paginado)                                                 |

##### POST `/api/v1/locations/cities` — Crear ciudad

**Request Body:** `@Valid` `MunicipalityRequestDTO` — `name` (String), `imageUrl` (String), `departmentId` (Long), `featured` (Boolean).

**Response:** `201 CREATED` — `MunicipalityResponseDTO` (id, name, imageUrl, featured, department: {id, name})

##### GET `/api/v1/locations/cities/{id}/destinations` — Destinos por ciudad

**Response:** `200 OK` — `List<DestinationResponseDTO>` (id, name, description, municipality, latitude, longitude, active, featured, imageUrls)

---

#### DepartmentController

| #   | Método | Path                                        | Descripción                                                                                                                          |
| --- | ------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 83  | POST   | `/api/v1/locations/departments`             | Crear departamento (body: name)                                                                                                      |
| 84  | GET    | `/api/v1/locations/departments`             | Listar departamentos (paginado)                                                                                                      |
| 85  | GET    | `/api/v1/locations/departments/{id}`        | Departamento por ID                                                                                                                  |
| 86  | PUT    | `/api/v1/locations/departments/{id}`        | Actualizar departamento                                                                                                              |
| 87  | DELETE | `/api/v1/locations/departments/{id}`        | Eliminar departamento. `204 No Content`                                                                                              |
| 88  | GET    | `/api/v1/locations/departments/{id}/cities` | Departamento con municipios. Response: `DepartmentWithMunicipalitiesDTO` (id, name, municipalities: List\<MunicipalityResponseDTO\>) |

**Response base:** `DepartmentResponseDTO` (id: Long, name: String)

---

#### DestinationController

| #   | Método | Path                                                          | Descripción                        |
| --- | ------ | ------------------------------------------------------------- | ---------------------------------- |
| 89  | POST   | `/api/v1/locations/destinations`                              | Crear destino                      |
| 90  | GET    | `/api/v1/locations/destinations`                              | Listar destinos (paginado)         |
| 91  | GET    | `/api/v1/locations/destinations/active`                       | Destinos activos (paginado)        |
| 92  | GET    | `/api/v1/locations/destinations/{id}`                         | Destino por ID                     |
| 93  | PUT    | `/api/v1/locations/destinations/{id}`                         | Actualizar destino                 |
| 94  | DELETE | `/api/v1/locations/destinations/{id}`                         | Eliminar destino. `204 No Content` |
| 95  | GET    | `/api/v1/locations/destinations/by-city/{cityId}`             | Destinos por ciudad                |
| 96  | GET    | `/api/v1/locations/destinations/by-city/{cityId}/active`      | Activos por ciudad                 |
| 97  | GET    | `/api/v1/locations/destinations/by-city/{cityId}/type/{type}` | Por ciudad y tipo                  |
| 98  | GET    | `/api/v1/locations/destinations/featured`                     | Destinos destacados (paginado)     |

**Tipos de destino:** `VIEWPOINT`, `SPOT`, `HISTORICAL_SITE`, `MUSEUM`, `PARK`, `BEACH`, `NATURAL_RESERVE`

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

**Response:** `201 CREATED` — `DestinationResponseDTO` (id, name, description, municipality, latitude, longitude, active, featured, imageUrls)

---

#### ImageDestinationController

| #   | Método | Path                                                                   | Descripción                                                                                      |
| --- | ------ | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| 99  | GET    | `/api/v1/locations/images/by-destination/{destinationId}`              | Imágenes de un destino. Response: `List<ImageDestinationDTO>` (id, url, publicId, destinationId) |
| 100 | POST   | `/api/v1/locations/images/by-destination/{destinationId}`              | Crear imagen por URL (body: url, publicId)                                                       |
| 101 | POST   | `/api/v1/locations/images/upload/by-destination/{destinationId}`       | Subir archivo (multipart: file)                                                                  |
| 102 | POST   | `/api/v1/locations/images/batch-upload/by-destination/{destinationId}` | Subir múltiples (multipart: files)                                                               |
| 103 | PUT    | `/api/v1/locations/images/{id}`                                        | Actualizar imagen (body: url, publicId)                                                          |
| 104 | DELETE | `/api/v1/locations/images/{id}`                                        | Eliminar imagen. `204 No Content`                                                                |

---

### 3.5 Notification Service API

#### NotificationController

| #   | Método | Path                                 | Descripción                                                                                  |
| --- | ------ | ------------------------------------ | -------------------------------------------------------------------------------------------- |
| 110 | GET    | `/api/v1/notifications`              | Notificaciones del usuario (query: userId, page, size). Response: `Page<NotificationEntity>` |
| 111 | PATCH  | `/api/v1/notifications/{id}/read`    | Marcar como leída (query: userId). `200 OK`                                                  |
| 112 | GET    | `/api/v1/notifications/unread-count` | Contar no leídas (query: userId). Response: `long`                                           |

**NotificationEntity (MongoDB):** id, userId, notificationType, title, message, metadata, createdAt, read, deliveries: List\<NotificationDeliveryStatus\> (channel, delivered, deliveredAt).

**NotificationType:** `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `BOOKING_COMPLETED`, `COMPLETION_REQUESTED`, `PAYMENT_FAILED`, `NEW_REVIEW`, `SYSTEM_ALERT`, `BOOKING_REMINDER`, `SETTLEMENT_PAID`

**NotificationChannelType:** `EMAIL`, `IN_APP`

> Ver `WEBSOCKET_NOTIFICATIONS.md` para el flujo completo de notificaciones en tiempo real vía WebSocket.

---

### 3.6 FestivityController (experience-service)

Festividades culturales colombianas (Carnaval de Barranquilla, Feria de las Flores, etc.). Son entidades informativas de calendario cultural, **no** ofertas vendibles — a diferencia de `EventOffer`, las festividades no tienen proveedor, precio, ni capacidad. Se crean a nivel de administración del sistema.

| #   | Método | Path                                   | Descripción                                   |
| --- | ------ | -------------------------------------- | --------------------------------------------- |
| 113 | POST   | `/api/v1/festivities`                  | Crear festividad                              |
| 114 | GET    | `/api/v1/festivities`                  | Listar todas (paginado)                       |
| 115 | GET    | `/api/v1/festivities/{id}`             | Por ID                                        |
| 116 | PUT    | `/api/v1/festivities/{id}`             | Actualizar                                    |
| 117 | DELETE | `/api/v1/festivities/{id}`             | Eliminar. `204 No Content`                    |
| 118 | GET    | `/api/v1/festivities/by-city/{cityId}` | Por ciudad (paginado)                         |
| 119 | GET    | `/api/v1/festivities/upcoming`         | Próximas. Response: `List<FestivityResponse>` |

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

**Response:** `201 CREATED` — `FestivityResponse` (id, name, description, startDate, endDate, cityId, image, active)

---

## 4. Seguridad

El Gateway usa **OAuth2 Resource Server** con JWT emitido por **Keycloak**.

1. App móvil llama a `POST /api/v1/auth/login` (user-service) con email + password
2. User-service delega en Keycloak vía password grant y devuelve `access_token` + `refresh_token`
3. La app envía el token en header `Authorization: Bearer <token>` en todas las requests
4. Gateway valida el JWT contra Keycloak, extrae los roles del claim `realm_access.roles` y los propaga a los microservicios internos como headers `X-User-Id` / `X-User-Roles`
5. Cada microservicio (incluido `user-service`) aplica `@PreAuthorize` por endpoint a partir de esos roles

### 4.1 Roles de negocio

| Rol        | Significado                    | Usuario semilla      |
| ---------- | ------------------------------ | -------------------- |
| `USER`     | Turista / usuario regular      | `turista@test.com`   |
| `PROVIDER` | Proveedor de servicios         | `proveedor@test.com` |
| `ADMIN`    | Administrador de la plataforma | `admin@turiscol.com` |

> El rol `ADMIN` es de negocio (realm `turiscol-realm`), **distinto** del admin de la consola de Keycloak (`admin/admin`, realm `master`, sección 6).

### 4.2 Niveles de autorización usados en las tablas de endpoints

| Nivel             | Significa                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------- |
| **Público**       | No requiere token (o solo requiere estar autenticado, sin rol específico)                               |
| **ADMIN**         | Requiere `ROLE_ADMIN`. El front debe ocultar/bloquear la acción si el usuario no es admin               |
| **ADMIN o dueño** | `ROLE_ADMIN`, o el `{id}` de la ruta debe coincidir con el ID (sub de Keycloak) del usuario autenticado |

Si el frontend llama un endpoint sin el rol requerido, el backend responde `403 Forbidden`.

### 4.3 Bloqueos y vigencia del token

**Códigos de error relacionados:**

| Código          | Cuándo                                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------------------------ |
| `403 Forbidden` | Login o refresh de un usuario bloqueado; endpoint llamado sin el rol requerido (user-service y experience-service) |
| `409 Conflict`  | El proveedor intenta activar una oferta bloqueada por un ADMIN                                                     |

**Vigencia del token:** el access token dura **60 minutos** (antes ~5 min por defecto de Keycloak). Las respuestas de `/auth/login`, `/auth/refresh` y `/auth/client-login` incluyen `expires_in` (access token) y `refresh_expires_in` (refresh token), ambos en segundos, para que el frontend programe el refresh.

| Parámetro (user-service)                 | Default             | Realm Keycloak          |
| ---------------------------------------- | ------------------- | ----------------------- |
| `keycloak.token.access-lifespan-seconds` | `3600` (60 min)     | `accessTokenLifespan`   |
| `keycloak.token.sso-idle-seconds`        | `604800` (7 días)   | `ssoSessionIdleTimeout` |
| `keycloak.token.sso-max-seconds`         | `2592000` (30 días) | `ssoSessionMaxLifespan` |

`user-service` aplica estos valores al realm al arrancar (y están en `keycloak/turiscol-realm.json` para entornos nuevos). Si no puede actualizar el realm solo registra un warning y el arranque continúa.

> **Ventana de bloqueo:** el gateway solo valida firma y expiración del JWT. Un usuario bloqueado conserva su access token vigente hasta 60 minutos como máximo; el refresh queda cortado de inmediato.

---

## 5. Sistema de Eventos (RabbitMQ)

### Exchange

- **Nombre:** `domain.events`
- **Tipo:** TopicExchange (durable)

### Colas y Bindings

| Cola                       | Routing Keys                                         | Dead Letter               | Servicio             |
| -------------------------- | ---------------------------------------------------- | ------------------------- | -------------------- |
| `booking.experience.queue` | `experience.*`                                       | `booking.events.dlq`      | booking-service      |
| `booking.payment.queue`    | `payment.*`                                          | `booking.events.dlq`      | booking-service      |
| `payment.booking.queue`    | `booking.*`                                          | `booking.events.dlq`      | booking-service      |
| `notification.events`      | `booking.*`, `payment.*`, `review.*`, `settlement.*` | `notification.events.dlq` | notification-service |

### Eventos del Dominio

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

> Cada evento genera una notificación in-app (MongoDB + push WebSocket) y, si el payload incluye `email`, además un email con su template Thymeleaf.
> Para `settlement.paid` el destinatario es el **proveedor** (`providerId` del payload), no el turista.

---

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

> Antes de iniciar los servicios, crear el archivo `.env` en la raíz del proyecto con las variables necesarias para Keycloak (ver `.env.example`). Sin este archivo, el user-service no arranca.

### Usuarios semilla (realm `turiscol-realm`, no confundir con el admin de Keycloak de arriba)

| Email              | Password | Rol      |
| ------------------ | -------- | -------- |
| turista@test.com   | test123  | USER     |
| proveedor@test.com | test123  | PROVIDER |
| admin@turiscol.com | admin123 | ADMIN    |

> Estos usuarios se importan desde `keycloak/turiscol-realm.json` y se sincronizan al arrancar `user-service` (`UserDataInitializer`). El admin de negocio (`ADMIN`) es distinto del admin de consola de Keycloak (`admin/admin`, fila "Keycloak Admin" arriba).

## 8. Configuración de MercadoPago — Webhooks y notificaciones

### 8.1 ¿Cómo funciona?

Cuando se crea una Preference de Checkout Pro en `MercadoPagoProvider`, se incluye un `notificationUrl`:

```java
String webhookUrl = appBaseUrl + "/api/v1/webhooks/payments";
```

MercadoPago **envía automáticamente** notificaciones POST a esa URL cada vez que cambia el estado de un pago.

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

### 8.3 Variables de entorno

| Variable                     | Descripción                                                | Ejemplo                           |
| ---------------------------- | ---------------------------------------------------------- | --------------------------------- |
| `APP_BASE_URL`               | URL pública del backend                                    | `https://abcd1234.ngrok-free.app` |
| `PAYMENT_PROVIDER`           | Proveedor activo: `MOCK` o `MERCADOPAGO`                   | `MERCADOPAGO`                     |
| `MERCADOPAGO_ACCESS_TOKEN`   | Token de acceso TEST o PROD                                | `TEST-2109324389320804-...`       |
| `MERCADOPAGO_PUBLIC_KEY`     | Public key para el widget de pago del frontend             | `TEST-de8789eb-...`               |
| `MERCADOPAGO_WEBHOOK_SECRET` | Secret para verificar la firma HMAC-SHA256 de los webhooks | `74fdcd65a5b46d35ec...`           |

### 8.4 Tipos de notificación de MercadoPago

| Tipo             | Cuando se envía                    | Nuestro endpoint          |
| ---------------- | ---------------------------------- | ------------------------- |
| `payment`        | Cuando cambia el estado de un pago | `POST /webhooks/payments` |
| `merchant_order` | Cuando se crea/actualiza una orden | (no implementado)         |

### 8.5 Configuración local con ngrok — paso a paso

**Problema:** MercadoPago necesita alcanzar tu URL por internet. En local, `localhost:8080`
no es accesible desde MercadoPago. La solución es un túnel ngrok.

> **El orden importa: ngrok primero → pegar la URL en `.env` → recién entonces levantar los
> contenedores.** `booking-service` construye la `notificationUrl`
> (`APP_BASE_URL + "/api/v1/webhooks/payments"`) **al arrancar**, así que si el contenedor ya
> existe con una URL vieja, el webhook saldrá mal.

**Paso 1 — Levantar ngrok (antes que los contenedores)**

```bash
ngrok http 8080
```

Esto abre una URL pública temporal, por ejemplo:

```
https://abcd1234.ngrok-free.app
```

Mantener esa terminal abierta. La consola de ngrok queda en `http://localhost:4040`.

**Paso 2 — Copiar la URL y pegarla en las variables de entorno**

Copiar la URL que aparece en la sección **Forwarding** de ngrok y pegarla en `.env`:

```env
APP_BASE_URL=https://abcd1234.ngrok-free.app   # sin barra al final
```

> **IMPORTANTE:** la URL de ngrok cambia **cada vez que reiniciás ngrok**. Actualizá
> `APP_BASE_URL` en `.env` en cada arranque nuevo.

`PAYMENT_PROVIDER` **no** va en `.env`: ya está fijo en `docker-compose.yml`
(`PAYMENT_PROVIDER: MERCADOPAGO`).

**Paso 3 — Recién ahora levantar los contenedores**

```bash
docker compose up --build -d
```

`booking-service` toma `APP_BASE_URL` de `.env` en este arranque.

**Paso 4 — Configurar el webhook en MercadoPago Dashboard**

1. Ir a https://www.mercadopago.com.ar/developers
2. Seleccionar tu aplicación
3. Ir a **Webhooks**
4. Crear un webhook con:
   - **URL:** `https://tu-url-ngrok.ngrok-free.app/api/v1/webhooks/payments`
   - **Evento:** Pagos
5. Guardar

**Paso 5 — Verificar que MercadoPago puede alcanzar ngrok**

Abrir la consola de ngrok en el navegador (`http://localhost:4040`) y comprobar que los
requests de MercadoPago llegan con status `200`.

**Paso 6 — Prueba del flujo completo (LOCAL)**

1. Crear una reserva → ir a checkout → MercadoPago redirige a la página de pago
2. Usar tarjeta de prueba de MercadoPago:
   - Número: `5031 7557 3453 0604`
   - CVV: `123`
   - Vencimiento: futuro (ej: 12/29)
   - DNI: `12345678`
3. Completar el pago
4. MercadoPago envía el webhook a ngrok → se procesa → la reserva queda en `CONFIRMED`

### 8.6 Si la URL de ngrok cambió

1. Copiar la nueva URL de ngrok
2. Pegarla en `.env` (`APP_BASE_URL=...`)
3. `docker compose up -d` — **no** `docker compose restart`, porque `restart` no vuelve a
   leer `.env` y el contenedor conserva la URL con la que se creó. `up -d` detecta el cambio
   de entorno y **recrea** `booking-service`
4. Actualizar la URL del webhook en el dashboard de MercadoPago

### 8.7 Troubleshooting

| Problema                                     | Causa posible                                                    | Solución                                                                                                      |
| -------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Botón de pago deshabilitado                  | Public key no coincide con el ambiente                           | Verificar que la public key del frontend coincida con las credenciales en `.env`                              |
| Pago se completa pero reserva no se confirma | Webhook no llega                                                 | Verificar que ngrok esté corriendo y la URL en MercadoPago Dashboard sea correcta                             |
| Webhook retorna error 5xx                    | booking-service no está corriendo o hay error en DB              | Revisar logs con `docker compose logs booking-service`                                                        |
| URL de ngrok cambió                          | ngrok se reinició                                                | Actualizar `APP_BASE_URL` en `.env`, `docker compose up -d`, y actualizar el webhook en MercadoPago Dashboard |
| Reserva queda en PENDING_PAYMENT             | El pago fue aprobado pero el webhook no se procesó correctamente | Verificar en la consola de ngrok (`localhost:4040`) que los requests llegan con status 200                    |

> Desarrollo local con ngrok: ver sección 8.5. Variables de entorno: ver sección 8.3.
