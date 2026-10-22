# Feature: Panel de administración solo-web + soporte web general

## Objetivo
Crear una sección de administración (precios, usuarios, proveedores, festividades) accesible
únicamente cuando la app corre en navegador web (nunca en el build nativo de Capacitor/Android),
y hacer que el resto de la app (turista/proveedor) se vea razonablemente bien en pantallas de
escritorio sin reescribir su UI.

## Por qué
El usuario pidió explícitamente separar una parte "solo web" de admin y que la app en general
se pueda ver en navegador, no solo orientada a mobile. Stack real: Angular 20 + Ionic 8 +
Capacitor 8 (no React Native) — Angular ya compila a web nativamente, falta la sección admin
y ajustar el layout para pantallas grandes.

## Alcance confirmado por el usuario
Panel admin con 4 áreas: gestión de precios (migrar lo existente), gestión de usuarios,
aprobación/gestión de proveedores, gestión de festividades/eventos del sistema.

## Ampliación de alcance (post-auditoría de API)
Tras completar T1-T7, se auditó `api-documentation.md` completo contra lo implementado.
Cero discrepancias en lo ya hecho (precios/usuarios/proveedores/festividades coinciden
exactamente con la doc). Se encontraron 3 huecos que el usuario confirmó agregar:
- Gestión de rol de usuario (`PUT /users/{id}/role`, api-documentation.md:210,243-257 —
  la doc dice explícitamente "pensado para el dashboard de admin").
- Dashboard/resumen como landing de `/admin-dashboard` (`GET /users/stats` + `GET /users/roles`,
  api-documentation.md:285-300,369).
- Nueva 5ª área: gestión de ciudades/departamentos/destinos (`CityController`,
  `DepartmentController`, `DestinationController`, api-documentation.md:883-973) — datos
  maestros del sistema, sin servicio Angular ni pantalla admin todavía.

## Plan de referencia
`C:\Users\Usuario\.claude\plans\analiza-mi-codigo-y-zippy-comet.md` (plan aprobado en esta sesión).

## Modo TDD efectivo
**Desactivado.** Fuente: no hay ningún archivo `*.spec.ts` en `src/` pese a existir el script
`ng test` (Karma por defecto de Angular). No se inventa infraestructura de test nueva; se
valida cada tarea con `ng build` y `ng lint` como checks funcionales, más verificación manual
end-to-end descrita en el plan.

## Tareas

- [x] T1 — Guard `web-only.guard.ts` (`src/app/core/guards/web-only.guard.ts`), usa
  `Capacitor.isNativePlatform()`, redirige a `/tabs/home` si es nativo. Ruta: directo inline
  (archivo único, ya entendido por el plan aprobado; hecho por el orquestador, no delegado).

- [x] T2 — Rama de rutas `admin-dashboard` en `app.routes.ts` + `admin.routes.ts` (nuevo) con
  las 4 subrutas protegidas por `roleGuard` + `canMatch: [webOnlyGuard]` + layout
  `admin-layout.page.ts|html|scss` (sidebar `ion-menu`/`ion-split-pane`). Ruta: delegado
  (3+ archivos no triviales).

- [x] T3 — Migrar `admin-prices` desde `tabs.routes.ts` (líneas 137-151) hacia
  `admin-dashboard/prices`; quitar bloque `admin` de `tabs.routes.ts`; quitar tab "Admin" e
  íconos no usados de `tabs.page.html`/`.ts`. Ruta: delegado.

- [x] T4 — Ampliar `UserService` (`getById`, `getByRole`, `activate`, `deactivate`, según
  `api-documentation.md:223-343`) + páginas `admin-users` (lista + detalle). Ruta: delegado.

- [x] T5 — `provider-admin.service.ts` nuevo (sobre `UserService.getByRole('PROVIDER')` +
  `activate`/`deactivate`) + páginas `admin-providers` (lista + detalle), con TODO explícito
  sobre falta de endpoint de aprobación diferenciado. Ruta: delegado.

- [x] T6 — Ampliar `FestivityService` (`create`, `update`, `delete`, según
  `api-documentation.md:2452-2538`) + páginas `admin-festivities` (lista + editor). Ruta: delegado.

- [x] T7 — "Mobile frame" responsive: media query `@media (min-width: 768px)` en
  `tabs.page.scss` y `auth-layout.component.scss`. Ruta: directo inline (CSS mecánico, ya
  especificado en el plan aprobado; hecho por el orquestador, no delegado).

## Estrategia de entrega
`ask-on-risk` (default). La rama actual (`dev`) no es la rama por defecto del repo (`main`),
y el historial reciente muestra commits de feature directos sobre `dev` sin branches por
feature — se sigue esa misma convención: cada tarea cierra con al menos un commit de trabajo
en Conventional Commits sobre `dev`. Push y PR quedan a decisión del usuario.

## Progreso
(se actualiza tras cada tarea con evidencia de verificación y commit)

- T2: creado `admin-layout.page.ts|html|scss` (split-pane siempre expandido vía
  `when="(min-width: 0px)"`, sidebar con 4 links a `prices`/`users`/`providers`/`festivities`) y
  `features/admin/admin.routes.ts` (redirect a `prices` con placeholder inline; `users`,
  `providers`, `festivities` comentadas con TODO T4/T5/T6). Rama `admin-dashboard` conectada en
  `app.routes.ts` con `canMatch: [webOnlyGuard]`. `npx ng build` — éxito (solo advertencia de
  presupuesto preexistente en `reservation-detail.page.scss`, no relacionada). Sin commit aún
  (pendiente de confirmación del usuario).

- T3: en `features/admin/admin.routes.ts`, la ruta `prices` ahora carga el componente real
  (`loadComponent` → `./prices/admin-prices.page` → `AdminPricesPage`) con `canActivate:
  [roleGuard]` + `data: { role: 'admin' }` (import `roleGuard` desde
  `../auth/login/guards/role.guard`); se eliminó `AdminPricesPlaceholderPage` y su TODO. Se
  eliminó el bloque de ruta `admin` (comentario `ADMIN PRICES`) de
  `layouts/tabs/tabs.routes.ts`. Se eliminó el `ion-tab-button tab="admin"` de
  `layouts/tabs/tabs.page.html`. En `layouts/tabs/tabs.page.ts` se eliminaron los íconos
  `colorPalette`/`colorPaletteOutline` (import y `addIcons`), confirmado por grep que no se usan
  en ningún otro lugar del archivo ni del repo. No fue necesario mover el archivo físico
  `admin-prices.page.ts|html|scss`: ya vive en `src/app/features/admin/prices/`, que coincide
  con el import relativo que usa `admin.routes.ts`. `npx ng build` — éxito (misma advertencia
  preexistente de presupuesto en `reservation-detail.page.scss`, sin errores nuevos). Grep final
  confirma cero referencias colgantes a `tabs/admin`, `tab="admin"` o
  `AdminPricesPlaceholderPage`.

- **Commit T1+T2+T3**: `eba7f93` — "feat(admin): agregar guard web-only y panel
  admin-dashboard, migrar gestión de precios". Se excluyeron intencionalmente del commit
  `package-lock.json` (normalización de lockfile por `npm run build`, ajena a la feature) y
  `src/environments/environment.ts` (cambio de IP local, ajeno a esta feature — posible edición
  en paralelo del usuario), ambos quedaron sin commitear para que el usuario decida.

- T4: en `core/services/User.ts` se agregaron `getById(id)` (`GET /users/{id}`),
  `getByRole(role, params?)` (`GET /users/role/{role}`, paginado con `page`/`size`),
  `activate(id)` y `deactivate(id)` (`PUT /users/{id}/activate` y `/deactivate`, body vacío,
  backend responde `204 No Content`), siguiendo exactamente `api-documentation.md:223-343` y el
  estilo ya existente del archivo (mismo patrón `catchError`/`throwError`, mismo `this.API`).
  Se importó `UserApi` desde `../models/User` para tipar `getById`/`getByRole` (roles
  `ADMIN`/`PROVIDER`/`CONSUMER`, no se inventaron campos nuevos). Se creó
  `features/admin/users/admin-users.page.ts|html|scss` (listado standalone con filtro por rol
  vía `ion-select` — `ALL`/`ADMIN`/`PROVIDER`/`CONSUMER`, usando `getAll` o `getByRole` según el
  filtro; cada fila tiene `routerLink` al `:id` y un `ion-toggle` inline para activar/desactivar
  sin entrar al detalle, con `stopPropagation` para no disparar la navegación) y
  `features/admin/users/user-detail/admin-user-detail.page.ts|html|scss` (detalle por `:id`
  desde `ActivatedRoute`, vía `getById`, con botón único que alterna
  activar/desactivar según `user.active`). Se activó el bloque `users` en
  `features/admin/admin.routes.ts` (se quitaron los comentarios TODO T4), con `canActivate:
  [roleGuard]` + `data: { role: 'admin' }` en el nivel `users` (mismo patrón que `prices`, hijos
  `''` → `AdminUsersPage` y `:id` → `AdminUserDetailPage`). No se tocaron los bloques comentados
  de `providers`/`festivities`. `npx ng build` — éxito, sin errores nuevos (solo la misma
  advertencia preexistente de presupuesto en `reservation-detail.page.scss`, ajena a esta
  tarea). Commit `779aa72`.

- T5: creado `core/services/provider-admin.service.ts` (`ProviderAdminService`), construido
  enteramente sobre `UserService` sin HTTP propio: `listProviders(params?)` delega en
  `UserService.getByRole('PROVIDER', params)`, `getById(id)` delega en `UserService.getById`
  (tipado como `ProviderApi`, que extiende `UserApi` con `onboardingCompleted?: boolean`
  opcional), y `approve(id)`/`suspend(id)` son alias literales de
  `UserService.activate`/`deactivate`. Se confirmó leyendo `api-documentation.md:346-389`
  (`ProviderController`) que solo existen `POST /user/providers`, `PUT /user/providers/{id}`
  (ambos "interno, sin Gateway") y `GET /user/providers/by-username/{username}` — ningún
  endpoint de aprobación diferenciado. También se confirmó en `api-documentation.md:192-219`
  que `onboardingCompleted` está documentado solo en `ProviderResponseDTO` (devuelto por
  registro/actualización de provider), no necesariamente en el `UserResponseDTO` que devuelven
  `GET /users/{id}` y `GET /users/role/{role}` (que es lo que este servicio realmente usa); por
  eso el campo quedó opcional y la UI lo oculta si viene `undefined` en lugar de asumir `false`.
  Se dejó un TODO explícito y extenso en el servicio (comentario de clase) indicando que
  `approve`/`suspend` son hoy literalmente el activar/desactivar genérico de usuario, que no
  hay lógica de negocio de aprobación real, y que hay que confirmar con backend si se necesita
  un estado `PENDING_APPROVAL` o un endpoint propio antes de tratar esto como un flujo de
  aprobación formal. Se crearon `features/admin/providers/admin-providers.page.ts|html|scss`
  (listado, mismo patrón que `admin-users`: `ion-toggle` inline con `stopPropagation`, badge de
  estado activo/inactivo, línea de onboarding condicional) y
  `features/admin/providers/provider-detail/admin-provider-detail.page.ts|html|scss` (detalle
  por `:id`, mismo mecanismo de alternar activar/desactivar que `admin-user-detail`, con una nota
  visible en la UI —no alarmante— aclarando que el botón activa/suspende la cuenta y no es una
  aprobación formal distinta). Se activó el bloque `providers` en
  `features/admin/admin.routes.ts` (se quitaron los comentarios TODO T5) con `canActivate:
  [roleGuard]` + `data: { role: 'admin' }` en el nivel `providers`, mismo patrón que
  `prices`/`users`. No se tocó el bloque comentado de `festivities` (T6). `npx ng build` —
  éxito, sin errores nuevos (solo la misma advertencia preexistente de presupuesto en
  `reservation-detail.page.scss`, ajena a esta tarea: "Budget 6.00 kB was not met by 300 bytes
  with a total of 6.30 kB"). Commit `6b0cbb7`.

- T6: en `core/services/festivity.service.ts` se agregó la interfaz `FestivityRequest`
  (`name`, `description`, `startDate`, `endDate`, `cityId`, `image`, `active`, exactamente los
  campos documentados en `api-documentation.md:2462-2487` para `FestivityRequest`/
  `FestivityResponse`, sin inventar campos nuevos — el modelo `Festivity` ya los cubría todos)
  y los métodos `create(dto)` (`POST /festivities`), `update(id, dto)` (`PUT /festivities/{id}`)
  y `delete(id)` (`DELETE /festivities/{id}`, `204 No Content`), mismo estilo
  `catchError`/`throwError` que el resto del archivo y análogo a `PriceService.create`/
  `update`/`delete`. Se crearon `features/admin/festivities/admin-festivities.page.ts|html|scss`
  (listado standalone con `getAll({ size: 100 })`, mismo patrón que `admin-users`: cada
  `ion-item` con `routerLink` a `[festivity.id, 'edit']`, botón de borrar inline con
  `stopPropagation` + `ion-alert` de confirmación vía `AlertController`, FAB `routerLink`
  a `['new']`) y `features/admin/festivities/festivity-editor/admin-festivity-editor.page.ts|
  html|scss` (formulario reactivo único dual crear/editar, mismo patrón que
  `offer-editor.page.ts`: lee `:id` de `ActivatedRoute` — presente solo en la ruta `:id/edit` —,
  si existe precarga vía `getById` y llama `update`, si no llama `create`; inputs `type="date"`
  para `startDate`/`endDate`, toggle para `active`). Se activó el bloque `festivities` en
  `features/admin/admin.routes.ts` con `canActivate: [roleGuard]` + `data: { role: 'admin' }` en
  el nivel `festivities` (mismo patrón que `prices`/`users`/`providers`) y children `''` (lista),
  `'new'` y `':id/edit'` (ambas al editor) — se siguió el patrón real ya existente en el
  proyecto para crear/editar (`tabs.routes.ts:113-133`, `manage-offers/offer-editor` con exactamente
  esa forma `new` + `:id/edit`), ya que el bloque comentado original en `admin.routes.ts` solo
  tenía `''` y `':id'` (sin ruta `new` separada), una forma distinta a la pedida explícitamente
  para esta tarea. `npx ng build` — éxito, sin errores nuevos (solo la misma advertencia
  preexistente de presupuesto en `reservation-detail.page.scss`: "Budget 6.00 kB was not met by
  300 bytes with a total of 6.30 kB"). Commit `0661a18`.

- T7: leí `tabs.page.html` y `auth-layout.component.html` antes de escribir el CSS — ambos
  anidan componentes Ionic (`ion-tabs`, y un `ion-app`/`ion-router-outlet` interno dentro de
  `auth-layout`) que Ionic posiciona con `position: absolute; inset: 0` relativo al ancestro
  posicionado más cercano. Por eso la media query no alcanza con `max-width`/`margin-inline`
  solos: hace falta `position: relative` en `:host` para que ese `:host` pase a ser el ancestro
  posicionado y los hijos absolutos de Ionic queden contenidos dentro del "marco", en vez de
  seguir llenando el viewport completo. Agregado en `tabs.page.scss` (que ya tenía estilos) y
  creado en `auth-layout.component.scss` (estaba vacío). `npx ng build` — éxito, sin errores
  nuevos (misma advertencia preexistente de presupuesto). Hecho inline por el orquestador
  (CSS mecánico, 2 archivos, ya especificado en el plan).

- T8: leí `api-documentation.md:203-277` y `:365-369` para confirmar la forma exacta de
  `PUT /users/{id}/role` (body `RoleChangeRequestDTO` con un único campo `role: String`
  `@NotBlank`, valores de realm `USER`/`PROVIDER`/`ADMIN`, respuesta `204 No Content`,
  reemplaza todos los roles de realm, no es aditivo) y `GET /users/roles` (`RoleController`,
  "Listar roles de Keycloak (interno)", respuesta `List<String>`). Hallazgo relevante: el
  dominio de valores de este endpoint (`USER`/`PROVIDER`/`ADMIN`, roles de *realm*) es distinto
  del dominio de `UserApi.role` (`ADMIN`/`PROVIDER`/`CONSUMER`, el rol de negocio que devuelve
  `UserResponseDTO`) — la doc usa `USER` donde el DTO usa `CONSUMER`. Por eso no se reutilizó
  `UserApi['role']` para el nuevo endpoint: se agregó un tipo nuevo `RealmRole` en
  `src/app/core/models/User.ts` (`'USER' | 'PROVIDER' | 'ADMIN'`), con comentario explicando la
  diferencia, en vez de forzar un tipo existente que no coincide con lo documentado. En
  `src/app/core/services/User.ts` se agregaron `getRoles()` (`GET /users/roles`, tipado
  `Observable<string[]>`) y `updateRole(id, role: RealmRole)` (`PUT /users/{id}/role`, body
  `{ role }`, `Observable<void>`), mismo estilo `catchError`/`throwError` que el resto del
  archivo. En la UI (`features/admin/users/user-detail/admin-user-detail.page.ts|html`) se
  agregó un `ion-select` (mismo patrón `[value]`/`(ionChange)` que ya usa `admin-users.page.html`,
  no `ngModel`, para no depender de `FormsModule`) con las 3 opciones de rol y un botón
  "Confirmar cambio de rol" separado del botón existente de activar/desactivar. Se decidió NO
  poblar el select con el resultado de `getRoles()`: la doc marca ese endpoint como "interno" y
  devuelve la lista cruda de roles de Keycloak, que puede incluir roles técnicos no asignables
  (`offline_access`, `default-roles-*`, etc.) — se usan los 3 roles de negocio documentados en la
  tabla de `RoleChangeRequestDTO` en su lugar (fallback explícitamente permitido por la tarea). El
  valor inicial del select se calcula mapeando `user.role` (dominio `CONSUMER`/`PROVIDER`/`ADMIN`)
  a `RealmRole` (`CONSUMER` → `USER`) vía `toRealmRole()`; el botón de confirmar queda
  deshabilitado si el rol seleccionado coincide con el actual (`isRoleUnchanged()`). Tras un
  cambio exitoso se vuelve a llamar `loadUser()` para refrescar el usuario desde el backend (el
  endpoint responde `204 No Content`, sin body, así que no hay estado intermedio confiable para
  actualizar localmente). `npx ng build` — éxito, sin errores nuevos (misma advertencia
  preexistente de presupuesto en `reservation-detail.page.scss`: "Budget 6.00 kB was not met by
  300 bytes with a total of 6.30 kB"). Sin commit (a pedido explícito del encargo).

## Tareas de ampliación (post-auditoría)

- [x] T8 — Gestión de rol de usuario: agregar `getRoles()` y `updateRole(id, role)` a
  `UserService` (`GET /users/roles`, `PUT /users/{id}/role`), y una acción de cambio de rol
  (select + confirmación) dentro de `admin-user-detail.page` ya existente. No requiere pantalla
  nueva ni cambios de rutas. Ruta: delegado (2+ archivos no triviales).

- [ ] T9 — Dashboard/resumen como landing de `/admin-dashboard`: agregar `getStats()` a
  `UserService` (`GET /users/stats`), nueva página `admin-dashboard-overview.page.ts|html|scss`,
  cambiar el redirect por defecto de `admin.routes.ts` (hoy `'' -> 'prices'`) para que apunte a
  esta nueva vista, y agregar el link "Resumen" al sidebar de `admin-layout.page.html`. Ruta:
  delegado (rutas + layout compartido + página nueva).

- [ ] T10 — Nueva área de ubicaciones: `location.service.ts` nuevo cubriendo
  `CityController`/`DepartmentController`/`DestinationController` (api-documentation.md:883-973,
  leer antes de implementar — confirmar verbos/paths/campos exactos, incluye manejo de imágenes
  en destinos). Páginas bajo `features/admin/locations/` (ciudades, departamentos, destinos,
  siguiendo el patrón ya usado en festivities: listado + editor crear/editar). Activar rama
  `locations` en `admin.routes.ts` con `canActivate: [roleGuard]` + `data: { role: 'admin' }`, y
  agregar el link al sidebar de `admin-layout.page.html`. Ruta: delegado (servicio nuevo + varias
  páginas + rutas + sidebar).

Nota de secuenciación: T9 y T10 tocan los mismos archivos compartidos (`admin.routes.ts`,
`admin-layout.page.html`) — se ejecutan en secuencia (T8 → T9 → T10), nunca en paralelo, para
evitar conflictos de edición.

## Feature completa
Las 7 tareas están cerradas. El panel admin-dashboard cubre las 4 áreas confirmadas
(precios/usuarios/proveedores/festividades), está restringido a web, y el resto de la app
(turista/proveedor) queda enmarcado en pantallas grandes. Pendiente de decisión del usuario:
push/PR, y qué hacer con `package-lock.json`/`src/environments/environment.ts` (cambios ajenos
a esta feature, nunca commiteados a propósito).

## Próximo paso
Ninguno pendiente del scope planeado. A decisión del usuario: push, PR, o pruebas manuales
end-to-end descritas en el plan.
