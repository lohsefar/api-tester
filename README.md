# Webhook Tester

Create webhook endpoints, receive requests, and inspect them in real-time.

## Setup

1. Install dependencies:
```bash
bun install
```

2. Create `.env.local`:
```env
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=your_user
MARIADB_PASSWORD=your_password
MARIADB_DATABASE=api-tester

AUTH_SECRET=your_random_secret_here
DISABLE_AUTH=false

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM="Your Name <noreply@example.com>"

NEXTAUTH_URL=http://localhost:3000

# Optional: Set webhook base URL (defaults to browser origin)
# NEXT_PUBLIC_WEBHOOK_BASE_URL=http://192.168.1.100:3000
```

3. Initialize database:
```bash
bun run db:push
```

4. Start server:
```bash
bun run dev
```

## Usage

**With authentication:** Register, verify email with OTP, then login. Create endpoints and copy webhook URLs.

**Without authentication:** Set `DISABLE_AUTH=true` in `.env.local`. Dashboard is accessible directly with anonymous sessions per browser.

## Webhook Endpoint

Send requests to `/api/webhook/[slug]` - all HTTP methods are supported. This endpoint is public and does not require authentication.

## Commands

```bash
bun run dev      # Development server
bun run build    # Production build
bun run start    # Production server
bun run db:push  # Update database schema
```
