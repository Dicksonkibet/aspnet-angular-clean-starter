# CleanStart

A clean-architecture starter for new projects: ASP.NET Core (Clean Architecture, no
MediatR) backend + Angular/TypeScript frontend. It's opinionated but minimal — pick
and delete what you don't need.

## What's included

**Backend** (`/backend`) — 4-project Clean Architecture solution:

- `CleanStart.Domain` — plain entities, zero dependencies. `BaseEntity` gives every
  entity an Id, audit timestamps and soft-delete for free.
- `CleanStart.Application` — plain application services, **no MediatR**: one file per
  feature holds its DTOs and FluentValidation validators, and one service class holds
  the use cases as ordinary methods (see `TodoItems/` for the pattern to copy —
  `TodoItemDtos.cs`, `ITodoItemService.cs`, `TodoItemService.cs`). Controllers depend
  on the feature's interface (e.g. `ITodoItemService`) and call it directly — no
  mediator, no pipeline, just constructor injection. A generic
  `IRepository<T>`/`IUnitOfWork` means new entities get full CRUD with no extra
  per-entity repository code, and the specification pattern (`BaseSpecification<T>`)
  covers filtered/paged/sorted queries without leaking EF Core up from Infrastructure.
- `CleanStart.Infrastructure` — EF Core + PostgreSQL, ASP.NET Identity, and the
  concrete `EfRepository<T>` / `UnitOfWork` that implement the Application interfaces.
- `CleanStart.API` — thin controllers (one line each: call the service, return the
  result), JWT auth (register/login), global exception-handling middleware that turns
  any unhandled exception into a consistent JSON error, CORS locked to an allow-list
  in non-Development environments, and a `/healthz` endpoint that checks real DB
  connectivity.

**Frontend** (`/frontend`) — Angular (standalone components + signals) + TypeScript +
Tailwind v4:

- `core/auth/auth.service.ts` — signal-based store for the logged-in user + JWT,
  persisted to `localStorage`.
- `core/auth/auth.interceptor.ts` — functional `HttpInterceptorFn` that attaches the
  JWT to every request.
- `core/auth/auth.guard.ts` — functional `CanActivateFn`; put it on any route that
  needs a logged-in user.
- `core/http/api-error.ts` — turns the API's JSON error shape into a readable message.
- Sample pages: Home, Login, Register, and a Dashboard that exercises the sample
  `TodoItems` API end to end (list/add/toggle/delete) so you can see the whole slice
  working before you write your own features.

## Getting started

### Backend

```bash
cd backend
dotnet restore

# set a real JWT signing key (don't commit one to appsettings.json)
dotnet user-secrets init --project CleanStart.API
dotnet user-secrets set "Jwt:Key" "$(openssl rand -base64 48)" --project CleanStart.API

# point ConnectionStrings:DefaultConnection at your own Postgres instance,
# then create the initial migration and apply it
dotnet ef migrations add InitialCreate --project CleanStart.Infrastructure --startup-project CleanStart.API
dotnet ef database update --project CleanStart.Infrastructure --startup-project CleanStart.API

dotnet run --project CleanStart.API
```

Swagger UI opens automatically in Development at `/swagger`.

### Frontend

```bash
cd frontend
npm install
npm start   # ng serve, defaults to http://localhost:4200
```

Set the API URL in `src/environments/environment.ts` (development) and
`src/environments/environment.production.ts` (production) — `apiBaseUrl`.

## Renaming for a new project

Everything is namespaced `CleanStart.*` / `cleanstart-*` so a find-and-replace is
enough:

1. Rename the 4 backend project folders and `.csproj` files (`CleanStart.Domain` →
   `YourApp.Domain`, etc.), and the `.sln`.
2. Find-and-replace `CleanStart` → `YourApp` across `/backend` (namespaces, project
   references, `UserSecretsId`).
3. Update `frontend/package.json` name, `angular.json` project name, and
   `frontend/src/index.html` title.
4. Delete the `TodoItems` sample feature (Application + the controller + the
   Dashboard page) once you've copied its pattern for your first real feature.

## Adding a new feature (backend)

1. Add the entity to `CleanStart.Domain/Entities`, inheriting `BaseEntity`.
2. Add a `DbSet<T>` + soft-delete query filter to `AppDbContext`.
3. Create a migration (`dotnet ef migrations add ...`).
4. Add a feature folder under `CleanStart.Application/<FeatureName>/` following the
   `TodoItems` pattern — DTOs + validators, an `I{Feature}Service` interface, and a
   `{Feature}Service` implementation with one method per use case.
5. Register the service in `CleanStart.Application/DependencyInjection.cs`
   (`services.AddScoped<IYourService, YourService>();`).
6. Add a thin controller under `CleanStart.API/Controllers` that injects the service
   interface and calls it.

Validators are still picked up automatically via assembly scanning
(`AddValidatorsFromAssembly`); everything else is explicit constructor injection —
no reflection magic to trace through when you're new to the codebase.

## Adding a new feature (frontend)

1. Add a folder under `src/app/features/<feature-name>/`.
2. Add a `{feature}.service.ts` with an injectable service wrapping `HttpClient`
   calls to your new controller (see `todo.service.ts` for the pattern).
3. Add a standalone component (`.ts` + `.html`) for the page.
4. Register the route in `src/app/app.routes.ts`, with `canActivate: [authGuard]` if
   it needs a logged-in user.

## Design choices worth knowing

- **No MediatR.** Controllers call plain application services directly. Less
  indirection to step through, at the cost of manually registering each new service
  in `DependencyInjection.cs` (one line each).
- **Soft delete by default.** `Remove()` on the repository never issues a physical
  `DELETE` — it flips `IsDeleted`. Add a query filter per entity in `AppDbContext` so
  deleted rows disappear from normal queries.
- **CORS wide-open only in Development.** Set `Cors:AllowedOrigins` for every other
  environment or the API will reject cross-origin requests.
- **JWT only, no refresh tokens.** Tokens expire after 2 hours (`JwtTokenGenerator`).
  Add a refresh-token flow once you need longer sessions.
- **Migrations run on startup.** Fine early on; switch to a separate deploy step once
  you have a real release process.
- **Angular standalone + signals, no NgModules.** `AuthService` holds session state
  in signals; the interceptor and guard both read from it. Zone.js is still used for
  change detection (simplest default) — switch to zoneless
  (`provideZoneChangeDetection` → `provideZonelessChangeDetection` once your Angular
  version's zoneless support is stable) if you want to drop it later.
