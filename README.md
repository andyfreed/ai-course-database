# AI Course Database

A production-ready AI-powered course management system that allows you to upload course materials (PDFs and Word documents) and exam questions, then search through them using semantic AI search.

## Features

- 📚 Upload and manage course materials (PDF and DOCX files)
- 🔍 AI-powered semantic search across all course content
- 📝 Store and search exam questions with answers
- 🤖 OpenAI integration for intelligent responses
- 💾 PostgreSQL with pgvector for vector embeddings
- ☁️ Supabase for managed database and file storage
- ⚡ Built with Next.js 14 and TypeScript
- 🎨 Tailwind CSS for styling
- 🚀 Ready for Vercel deployment

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Once created, go to Settings > Database
3. Enable the pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Fill in your Supabase credentials from the project settings:
   - `DATABASE_URL` - Connection string (Transaction mode)
   - `DIRECT_URL` - Direct connection string (Session mode)
   - `NEXT_PUBLIC_SUPABASE_URL` - Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon/Public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key
3. Add your OpenAI API key

### 3. Set up the Database

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push database schema to Supabase
npx prisma db push
```

### 4. Create Storage Bucket

In your Supabase dashboard:
1. Go to Storage
2. Create a new bucket called `course-documents`
3. Set it to public if you want direct file access

### 5. Run Locally

```bash
npm run dev
```

Visit `http://localhost:3000`

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables in Vercel dashboard:
   - All variables from `.env.local`
   - Use the Vercel environment variable names from `vercel.json`
4. Deploy!

## Usage

### Creating Courses
1. Navigate to "Manage Courses" tab
2. Fill in course details (title, description, version)
3. Click "Create Course"

### Uploading Documents
1. After creating a course, drag and drop PDF or Word files
2. Files are automatically processed and indexed for search

### Searching
1. Go to "Search Courses" tab
2. Enter your query
3. AI will search through all documents and provide relevant results

### Adding Exam Questions
Use the API endpoint `/api/courses/[courseId]/questions` to add exam questions programmatically.

## API Endpoints

- `GET /api/courses` - List all courses
- `POST /api/courses` - Create a new course
- `POST /api/courses/[courseId]/documents` - Upload document to course
- `GET /api/courses/[courseId]/questions` - Get course questions
- `POST /api/courses/[courseId]/questions` - Add single question
- `PUT /api/courses/[courseId]/questions` - Bulk import questions
- `POST /api/search` - Search across all content

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with pgvector extension (Supabase)
- **AI**: OpenAI API, LangChain
- **File Processing**: pdf-parse, mammoth
- **Deployment**: Vercel

## Security Notes

- All API keys are stored as environment variables
- Supabase provides row-level security (can be configured)
- File uploads are validated for type and size
- Service role key is only used server-side

## Contributing

Feel free to submit issues and pull requests!

## License

MIT