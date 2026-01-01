# Webhook Tester

A webhook endpoint testing tool built with Next.js. Create webhook endpoints, receive requests, and inspect them in real-time.

## Features

- Create multiple webhook endpoints
- Receive and inspect webhook requests in real-time
- Filter webhooks by HTTP method and search content
- View detailed request information including headers, body, and query parameters
- Modern UI with dark/light/system theme support
- Email/password authentication with OTP verification
- Real-time updates via Server-Sent Events (SSE)
- Optional authentication bypass for development

## Prerequisites

- Node.js 18+ or Bun
- MariaDB/MySQL database
- SMTP server (required only if using email authentication)

## Installation

1. Clone the repository and install dependencies:

```bash
bun install
```

2. Create `.env.local` file with the following variables:

```env
# Database
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=your_user
MARIADB_PASSWORD=your_password
MARIADB_DATABASE=api-tester

# Auth
AUTH_SECRET=your_random_secret_here
DISABLE_AUTH=false

# SMTP (required if DISABLE_AUTH=false)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_smtp_user
SMTP_PASSWORD=your_smtp_password
SMTP_FROM="Your Name <noreply@example.com>"

# App URL
NEXTAUTH_URL=http://localhost:3000

# Webhook Base URL (optional)
# Set this to your public domain or local IP for webhook URLs
# If not set, will use the current browser origin
# Examples:
#   NEXT_PUBLIC_WEBHOOK_BASE_URL=http://192.168.1.100:3000  # Local IP
#   NEXT_PUBLIC_WEBHOOK_BASE_URL=https://webhooks.example.com  # Production domain
NEXT_PUBLIC_WEBHOOK_BASE_URL=
```

3. Push database schema:

```bash
bun run db:push
```

4. Start the development server:

```bash
bun run dev
```

5. Open http://localhost:3000 in your browser.

## Usage

### With Authentication (Default)

1. Register an account at `/register`
2. Check your email for the 6-digit OTP code
3. Verify your email at `/verify-email`
4. Sign in at `/login`
5. Create a webhook endpoint using the "+ New Endpoint" button
6. Copy the generated webhook URL
7. Send requests to the webhook URL
8. View received webhooks in the dashboard

### Without Authentication

Set `DISABLE_AUTH=true` in `.env.local` to disable authentication. When authentication is disabled:

- No login required - dashboard is accessible directly
- Anonymous sessions are used to isolate data per browser
- Each browser gets a unique session ID stored in a cookie (30-day expiration)
- Endpoints and webhooks are isolated per browser session
- Data persists in the database but is only accessible from the same browser

**Note:** When auth is disabled, you do not need to configure SMTP settings.

## API Endpoints

### Public Webhook Receiver

```
POST/PUT/PATCH/DELETE/GET /api/webhook/[slug]
```

Send webhooks to this URL. All HTTP methods are supported. The webhook receiver is always public and does not require authentication.

### Application APIs

All application APIs require authentication (or anonymous session when auth is disabled):

- `GET /api/endpoints` - List your endpoints
- `POST /api/endpoints` - Create new endpoint
- `GET /api/endpoints/[id]` - Get endpoint details
- `DELETE /api/endpoints/[id]` - Delete endpoint
- `GET /api/endpoints/[id]/webhooks` - List webhooks for endpoint (supports ?method= and ?search= query params)
- `GET /api/endpoints/[id]/events` - SSE stream for real-time webhook updates

## Development

```bash
# Run development server
bun run dev

# Build for production
bun run build

# Start production server
bun run start

# Database migrations
bun run db:push
```

## Tech Stack

- Framework: Next.js 16 (App Router)
- Database: MariaDB/MySQL with Drizzle ORM
- Authentication: NextAuth.js v5
- UI Components: shadcn/ui
- Styling: Tailwind CSS
- Theme: next-themes

## License

MIT
