# CS2 ARENA

Учебный проект — портал о Counter-Strike 2. Новости, команды, игроки, матчи и турниры.

[Открыть сайт](https://bissembayevd.github.io/React/) · [API](https://cs2-arena-api.onrender.com/docs)

Frontend: React, Vite, React Router, JavaScript и CSS.
Backend: Python, FastAPI, SQLAlchemy и SQLite.

Есть поиск, фильтры, пагинация, профили команд и игроков, результаты матчей и форма добавления свободного агента.

## Запуск локально

Нужны Node.js 22.12+ и Python 3.12+.

Backend, из корня проекта:

```powershell
cd backend
py -3 -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements.txt
.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Frontend, в другом терминале из корня проекта:

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

Если `.env` уже есть, оставьте его. Для локального backend используйте `VITE_API_BASE_URL=http://127.0.0.1:8000`.

Откройте http://localhost:5173/React/.

## Проверка

```sh
npm test
npm run build
```

Frontend размещён на GitHub Pages, backend — на Render Free. На бесплатном Render новые изменения SQLite могут теряться после перезапуска или деплоя.

Часть составов взята из датированных источников HLTV. Новости, рейтинги, расписания, результаты и непроверенные данные игроков используются как учебные примеры, а не актуальная киберспортивная статистика.
