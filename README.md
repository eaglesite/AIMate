# AiMate — AI Tools Directory & Templates

A bilingual (Chinese/English) static website for discovering AI tools and downloading free templates. Features 520 AI tools across 7 categories, 36 templates across 3 categories, with a Go-powered newsletter subscription API.

## Features

- **520 AI Tools** across Writing, Image, Code, Video, Audio, Productivity, Design categories
- **36 Templates** across PPT, Resume, Contract categories with links to free resources
- **Bilingual**: Full Chinese and English versions
- **Powerful Search**: Unified search across tools and templates with debounced input
- **Filtering**: Category filter buttons with real-time results
- **Lazy Loading**: Cards load in batches (3 rows initially, 24 per scroll) for fast page loads
- **Responsive**: 4 breakpoints (1024/768/480/360px) for desktop, tablet, and mobile
- **Newsletter API**: Go + SQLite backend for email subscription management
- **SEO**: Semantic HTML5, Open Graph tags, canonical URLs, meta keywords
- **Accessibility**: `focus-visible` outlines, `prefers-reduced-motion` support, keyboard nav, aria-labels
- **Admin Dashboard**: Token-protected admin page to view all subscriptions

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, jQuery 3.7 |
| Backend | Go 1.25 (newsletter API) |
| Database | SQLite (via modernc.org/sqlite) |
| Generation | Python 3 (tool & template card generators) |

## Project Structure

```
├── index.html              # Chinese version
├── index-en.html           # English version
├── css/style.css           # All styles (responsive, animations)
├── js/main.js              # jQuery interactions (search, filter, lazy load, etc.)
├── logo.png                # Brand logo
├── gen_tools.py            # Generates 520 tool cards in both languages
├── gen_templates.py        # Generates 36 template cards with download URLs
├── api/
│   ├── main.go             # HTTP server, CORS, admin middleware
│   ├── handlers.go         # POST /api/email, GET /api/admin/emails
│   ├── db.go               # SQLite init, insert, query
│   ├── admin.html          # Token-protected subscription dashboard
│   ├── go.mod / go.sum     # Go module dependencies
│   └── api.exe             # Compiled binary
└── templates/              # Static template files (empty, all links are external)
```

## Quick Start

### Frontend (static site)

```bash
python -m http.server 8080
# Open http://localhost:8080 (Chinese) or http://localhost:8080/index-en.html (English)
```

### API Server

```bash
cd api
./api.exe
# Starts on :8081, admin token: admin123 (override via ADMIN_TOKEN env var)
```

### Regenerate Cards

```bash
# Generate AI tools (adds to both index.html and index-en.html)
python gen_tools.py

# Generate templates (adds to both index.html and index-en.html)
python gen_templates.py
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/email` | POST | Subscribe email `{"email":"...","source":"..."}` |
| `/api/admin/emails?token=admin123` | GET | List all subscriptions |
| `/admin.html` | GET | Admin dashboard |

## Admin Dashboard

Access at `http://localhost:8081/admin.html` with token `admin123` (default). Displays all subscriber emails, sources, and timestamps in a sortable table.

## License

MIT
