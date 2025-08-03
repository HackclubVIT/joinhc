# Recruitment Portal

A full-stack recruitment portal built with Next.js, Supabase, and TypeScript.

## Features

- User authentication and authorization
- Role-based access control (Applicant/Recruiter)
- Application submission and management
- Department preferences
- Application status tracking
- Export functionality for recruiters

## Tech Stack

- **Framework:** Next.js 14 with App Router
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **UI:** Tailwind CSS + shadcn/ui
- **Language:** TypeScript

## Setup

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Database Schema

The application uses the following main tables:
- `profiles`: User profiles with roles
- `applications`: Application submissions
- `departments`: Available departments
- `recruiter_departments`: Department assignments for recruiters
- `application_settings`: Global application settings

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 4. Supabase Setup

1. Create a new project in [Supabase](https://supabase.com)
2. Get your project URL and anon key from the project settings
3. Run the database setup scripts in the following order:

```sql
-- Execute these scripts in your Supabase SQL editor
-- 1. Run the complete setup script
-- (Copy and paste the content from scripts/schema.sql)

-- 2. Run the email domain validation script
-- (Copy and paste the content from scripts/email_domain_validation.sql)
```

**Important**: The email domain validation script ensures only `@vitstudent.ac.in` emails can register new accounts. Admin accounts with `@gmail.com` emails created before this restriction will continue to work.

### 5. Run the Development Server

\`\`\`
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

### Core Tables

- **profiles** - User profiles with roles and personal information
- **departments** - Available departments for recruitment
- **applications** - Application submissions with preferences and status
- **recruiter_departments** - Department assignments for recruiters
- **application_settings** - System-wide settings like deadlines

### Key Relationships

- Users can have one profile (1:1)
- Applications belong to users (1:many)
- Recruiters can be assigned to multiple departments (many:many)
- Applications reference departments for preferences (many:1)

## 🔐 Authentication & Authorization

The system uses Supabase Auth with role-based access control:

- **Applicants**: Can submit and manage their own applications
- **Recruiters**: Can view and manage applications for assigned departments
- **Admins**: Can manage users, departments, and system settings
- **Row Level Security**: Ensures users can only access authorized data

## 📱 Usage Guide

### For Applicants

1. **Register**: Create an account with your `@vitstudent.ac.in` email
2. **Complete Profile**: Add personal information and register number
3. **Submit Application**: 
   - Select first and second preference departments
   - Provide detailed reasoning for each choice
   - Add portfolio links or resume
4. **Track Progress**: Monitor application status in the dashboard

### For Recruiters

1. **Access Management**: Navigate to "Manage Recruiters" to assign roles
2. **Department Assignment**: Assign departments to recruiters
3. **Review Applications**: 
   - View applications for assigned departments
   - Filter by status, preference, or search criteria
   - Review detailed applicant information
4. **Make Decisions**: Shortlist, waitlist, or reject applications
5. **Export Data**: Download application data as CSV

### For Admins

1. **User Management**: Manage all users and their roles
2. **Department Management**: Create and manage departments
3. **System Settings**: Configure application deadlines and system settings
4. **Recruiter Assignment**: Assign recruiters to departments

## 🔧 Configuration

### Application Settings

Admins can configure:
- Application deadlines
- Shortlist deadlines
- Department information
- User roles and permissions

### Environment Configuration

Key environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🚀 Deployment

### Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

```bash
npm run build
npm start
```

## 🧪 Development

### Running Tests

```bash
npm run test
# or
yarn test
```

### Code Formatting

```bash
npm run lint
npm run format
```

### Database Migrations

When making database changes:
1. Update the SQL scripts in the `scripts/` directory
2. Test changes in a development environment
3. Apply changes to production database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

---

**WEB DEV DEPT**


todo:
confirm 1 - 1 relation for panel time slot and applicant
notification panel