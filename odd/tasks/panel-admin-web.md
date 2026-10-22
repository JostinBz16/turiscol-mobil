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

## Plan de referencia
`C:\Users\Usuario\.claude\plans\analiza-mi-comet-zippy.md` (plan aprobado en esta sesión).

## Modo TDD efectivo
**Desactivado.** Fuente: no hay ningún archivo `*.spec.ts` en `src/` pese a existir el script
`ng test` (Karma por defecto de Angular). No se inventa infraestructura de test nueva; se
valida cada tarea con `ng build` y `ng lint` como checks funcionales, más verificación manual
end-to-end descrita en el plan.

## Tareas

- [ ] T1 — Guard `web-only.guard.ts` (`src/app/core/guards/web-only.guard.ts`), usa
  `Capacitor.isNativePlatform()`, redirige a `/tabs/home` si es nativo. Ruta: delegado directo
  (archivo único, ya entendido por el plan aprobado).

- [x] T2 — Rama de rutas `admin-dashboard` en `app.routes.ts` + `admin.routes.ts` (nuevo) con
  las 4 subrutas protegidas por `roleGuard` + `canMatch: [webOnlyGuard]` + layout
  `admin-layout.page.ts|html|scss` (sidebar `ion-menu`/`ion-split-pane`). Ruta: delegado
  (3+ archivos no triviales).

- [x] T3 — Migrar `admin-prices` desde `tabs.routes.ts` (líneas 137-151) hacia
  `admin-dashboard/prices`; quitar bloque `admin` de `tabs.routes.ts`; quitar tab "Admin" e
  íconos no usados de `tabs.page.html`/`.ts`. Ruta: delegado.

- [ ] T4 — Ampliar `UserService` (`getById`, `getByRole`, `activate`, `deactivate`, según
  `api-documentation.md:223-343`) + páginas `admin-users` (lista + detalle). Ruta: delegado.

- [ ] T5 — `provider-admin.service.ts` nuevo (sobre `UserService.getByRole('PROVIDER')` +
  `activate`/`deactivate`) + páginas `admin-providers` (lista + detalle), con TODO explícito
  sobre falta de endpoint de aprobación diferenciado. Ruta: delegado.

- [ ] T6 — Ampliar `FestivityService` (`create`, `update`, `delete`, según
  `api-documentation.md:2452-2538`) + páginas `admin-festivities` (lista + editor). Ruta: delegado.

- [ ] T7 — "Mobile frame" responsive: media query `@media (min-width: 768px)` en
  `tabs.page.scss` y `auth-layout.component.scss`. Ruta: delegado directo (CSS, 2 archivos).

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
  `AdminPricesPlaceholderPage`. Sin commit (no solicitado).

## Próximo paso
Empezar T4 (ampliar `UserService` + páginas `admin-users`).
