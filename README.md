# Contact Email Service

A simple Express.js API service for handling contact form submissions and sending emails via SMTP.

## Features

- Contact form API endpoint
- Email validation
- CORS support
- Health check endpoint
- Environment-based configuration

## Prerequisites

- Node.js 18+ 
- SMTP credentials (Gmail, SendGrid, etc.)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=8000
CLIENT_ORIGIN=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
CONTACT_RECEIVER_EMAIL=receiver@example.com
```

**Note:** For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

## Development

```bash
npm run dev
```

Server runs on `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /api/health
```

Response:
```json
{ "ok": true }
```

### Contact Form
```
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry",
  "message": "Hello, I have a question..."
}
```

Required fields: `name`, `email`, `message`
Optional fields: `subject`

## Deployment

### Deploy to Vercel

1. **Connect GitHub repository:**
   - Push your code to GitHub
   - Visit [Vercel](https://vercel.com) and sign in with GitHub
   - Click "Add New..." > "Project"
   - Select this repository

2. **Set environment variables in Vercel:**
   - Go to project Settings > Environment Variables
   - Add all variables from your `.env` file:
     - `SMTP_HOST`
     - `SMTP_PORT`
     - `SMTP_SECURE`
     - `SMTP_USER`
     - `SMTP_PASS`
     - `SMTP_FROM_EMAIL`
     - `CONTACT_RECEIVER_EMAIL`
     - `CLIENT_ORIGIN` (your frontend URL)

3. **Deploy:**
   - Vercel automatically deploys on every push to main branch
   - Your API will be available at `https://your-project.vercel.app`

## Security Notes

- ⚠️ **Never commit `.env` file** - it's already in `.gitignore`
- Use `.env.example` as a template with dummy values
- For Gmail: Use App Passwords, not your main password
- Keep SMTP credentials secure in Vercel Environment Variables

## License

MIT
