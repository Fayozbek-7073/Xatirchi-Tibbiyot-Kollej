# Xatirchi-Tibbiyot-Kollej — Foydalanish Qo'llanmasi

## 1. Loyiha haqida

**Xatirchi-Tibbiyot-Kollej** — tibbiyot kollej talabalari, kontrakt to'lovlari va qarzdorliklarini boshqarish tizimi.

**2 ta rol mavjud:**
| Rol | Huquqlar |
|-----|----------|
| Admin | To'liq boshqaruv — talaba, guruh, fakultet qo'shish/o'chirish, to'lov kiritish |
| Direktor | Faqat ko'rish — hech narsa o'zgartira olmaydi |

---

## 2. Talablar

- [Node.js 18+](https://nodejs.org)
- [PostgreSQL 14+](https://www.postgresql.org)
- npm (Node.js bilan birga keladi)

---

## 3. Backend ishga tushirish

```bash
cd backend
cp .env.example .env
```

`.env` faylini matn muharririda oching va quyidagilarni to'ldiring:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=xatirchi_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=any_random_long_string_min_32_chars
PORT=3000
```

Keyin:

```bash
npm install
npm run migrate   # Ma'lumotlar bazasi jadvallarini yaratadi
npm start         # Backend ishga tushadi: http://localhost:3000
```

---

## 4. Frontend ishga tushirish

```bash
cd frontend
cp .env.example .env
```

`.env` faylida quyidagicha bo'lishi kerak:

```env
VITE_API_URL=http://localhost:3000
```

Keyin:

```bash
npm install
npm run dev   # Frontend ishga tushadi: http://localhost:5173
```

---

## 5. Foydalanuvchilar (avtomatik yaratiladi)

`npm run migrate` bajarganingizda quyidagi foydalanuvchilar avtomatik yaratiladi:

| Rol | Login | Parol |
|-----|-------|-------|
| Admin | `admin` | `Admin@2025` |
| Direktor | `direktor` | `Direktor@2025` |

> **Eslatma:** Bu parollar faqat lokal sinov uchun. Haqiqiy serverda saytga kirib, parolni o'zgartirishingiz tavsiya etiladi.

---

## 7. Saytni ochish

| Xizmat | Manzil |
|--------|--------|
| Frontend (sayt) | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Sog'liqni tekshirish | http://localhost:3000/health |

---

## 8. Docker bilan ishga tushirish (eng oson yo'l)

Docker o'rnatilgan bo'lsa, hamma narsa bitta buyruq bilan ishga tushadi:

```bash
# Asosiy papkada
cp .env.example .env
# .env faylini to'ldiring (DB_PASSWORD va JWT_SECRET majburiy)

docker-compose up -d
```

Sayt: **http://localhost**

Docker barcha xizmatlarni o'zi boshqaradi:
- PostgreSQL ma'lumotlar bazasi
- Migratsiyalar (avtomatik)
- Backend API
- Nginx (frontend + proxy)

---

## 9. Qo'shimcha ma'lumot

- **Qarzdorlik** avtomatik hisoblanadi: `qarzdorlik = kontrakt_summasi - to'langan_summa`
- **Direktor** panelida barcha ma'lumotlar ko'rinadi, lekin hech qanday o'zgartirish tugmasi yo'q
- **Barcha ma'lumotlar** PostgreSQL da saqlanadi — server o'chirilsa ham yo'qolmaydi
- **To'lovlar tarixi** har bir talaba bo'yicha alohida saqlanadi
- **Ranglar:** Yashil = to'liq to'lagan, Sariq = qisman to'lagan, Qizil = katta qarzdor
