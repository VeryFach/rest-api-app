# REST API App (NestJS + Supabase)

README ini menjelaskan pola arsitektur yang dipilih untuk project ini, alasan pemilihannya, struktur proyek, cara menjalankan & testing, serta beberapa praktik terbaik. Dokumentasi ditulis dalam bahasa Indonesia.

## Ringkasan proyek
Aplikasi ini adalah REST API berbasis NestJS yang menggunakan Supabase sebagai backend database/service. Fitur utama meliputi: autentikasi (JWT), manajemen users, dan posts.

## Pola arsitektur yang dipilih
Pola yang dipilih: **Feature-based Modular Monolith** dengan pendekatan *Clean Architecture / Hexagonal-inspired separation*.

Secara praktis artinya:
- Aplikasi dibagi berdasarkan fitur/domain (mis. `users/`, `posts/`, `auth/`) — setiap fitur memiliki module, controller, service, DTO, dan entity sendiri.
- Terdapat lapisan-lapisan konseptual:
  - Controller (entry point HTTP)
  - Service (use-cases / business logic)
  - Repositories / external clients (pada project ini: panggilan Supabase melalui provider `SUPABASE_CLIENT`)
  - DTOs dan Entities untuk validasi dan tipe
- Global providers (mis. SUPABASE_CLIENT, APP_GUARD) dideklarasikan di `AppModule`.

Struktur :
```
src/
  app.module.ts
  common/
  auth/
    auth.module.ts
    auth.service.ts
    auth.controller.ts
  users/
    users.module.ts
    users.service.ts
    users.controller.ts
    dto/
    entities/
  posts/
    posts.module.ts
    posts.service.ts
    posts.controller.ts
    dto/
    entities/
test/
  setup.ts
  auth.e2e-spec.ts
  users.e2e-spec.ts
  posts.e2e-spec.ts
```

## Mengapa menggunakan pola ini?
1. Scalability (horizontal) dan evolusi ke microservices:
   - Modular feature-based memudahkan pemisahan domain ketika proyek tumbuh. Ketika perlu, module-feature dapat diekstrak menjadi layanan terpisah tanpa merombak seluruh struktur.
2. Separation of concerns & maintainability:
   - Controller hanya menangani request/response, service menangani logika, dan akses data dipisah (melalui client/provider). Ini membuat kode mudah dibaca dan di-debug.
3. Testability:
   - Dependensi di-inject (DI) sehingga mudah melakukan mocking/override pada unit/e2e test. Contohnya kita dapat override APP_GUARD atau SUPABASE_CLIENT pada test.
4. Konsistensi developer experience:
   - Konvensi per-feature memudahkan developer baru memahami lokasi fungsi-fungsi terkait.
5. Keamanan & kontrol:
   - Dengan provider global (mis. SUPABASE_CLIENT) kita konsisten menggunakan single source of truth untuk akses DB/service; mudah mengganti implementasi (mis. pindah dari Supabase ke Postgres + TypeORM) tanpa mengubah API luar.
6. Praktis untuk NestJS:
   - NestJS secara idiomatis mendukung modul, provider, dan DI — pola ini memanfaatkan fitur framework sehingga lebih idiomatik dan predictable.