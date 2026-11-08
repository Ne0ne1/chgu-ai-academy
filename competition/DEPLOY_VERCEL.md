# Деплой CHGU AI Academy на Vercel Hobby (для владельца аккаунта)

Анонимный `vercel deploy --temporary` собрался, но публичные запросы вернули **403 Forbidden**. Локальный `127.0.0.1` публичной ссылкой не считается. Нужен вход в аккаунт Vercel.

## Быстрый путь (рекомендуется)

1. Откройте https://vercel.com и войдите (Hobby).
2. **Add New… → Project → Import** репозиторий `https://github.com/Ne0ne1/chgu-ai-academy`.
3. Framework: Next.js. Build Command уже в `package.json`: `npm run build` (webpack).
4. Environment Variables (Production):
   - `MENTOR_DISABLE_OLLAMA` = `1`  
     (или не задавайте `MENTOR_ENABLE_OLLAMA` — в production Ollama и так не вызывается).
5. Deploy.
6. Проверьте без авторизации:
   - `/` — проблема и CTA понятны;
   - `/learn/python/variables`;
   - `/practice/variables` — загрузка Pyodide, неверная попытка, подсказка, успех;
   - `/progress` — после успеха и после перезагрузки вкладки.
7. Вставьте Production URL в заявку/паспорт (поля со ссылкой на демо).

## Альтернатива через CLI

```bash
cd /Users/isadadasev/Documents/ChatGPT/chgu-ai-academy
npx vercel login
npx vercel link
npx vercel env add MENTOR_DISABLE_OLLAMA production   # значение 1
npx vercel --prod
```

## Если нужно «забрать» временный деплой

Claim URL (срок жизни короткий):  
https://vercel.com/claim-deployment?code=b674621d-9853-4c05-a5cb-62a14ad6aedf  

Если claim уже истёк — импортируйте GitHub-репозиторий заново.
