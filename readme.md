# Recruitment Portal

A comprehensive full-stack recruitment management system built with Next.js, Supabase, and TypeScript. This portal facilitates the entire recruitment process from application submission to candidate evaluation and selection.

## 🚀 Features

### For Applicants
- **User Registration & Authentication** - Secure signup/login with email verification
- **Application Submission** - Submit applications with department preferences and supporting documents
- **Application Tracking** - Real-time status updates on application progress
- **Profile Management** - Manage personal information and application details
- **Department Preferences** - Select first and second choice departments with detailed reasoning

### For Recruiters
- **Recruiter Dashboard** - Comprehensive overview of assigned departments and applications
- **Application Management** - Review, shortlist, waitlist, or reject applications
- **Department Assignment** - Assign recruiters to specific departments
- **User Role Management** - Promote applicants to recruiters and manage permissions
- **Export Functionality** - Export application data to CSV for external analysis
- **Detailed Application View** - Access complete applicant information including portfolios and reasoning

### System Features
- **Role-Based Access Control** - Secure access based on user roles (applicant/recruiter)
- **Real-time Updates** - Live application status updates
- **Responsive Design** - Mobile-friendly interface using Tailwind CSS
- **Data Export** - CSV export functionality for application data
- **Application Deadlines** - Configurable application deadlines with automatic enforcement

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ 
- npm or yarn
- A Supabase account
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone https://github.com/yourusername/recruitment-portal.git
cd recruitment-portal
\`\`\`

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

\`\`\`sql
-- Execute these scripts in your Supabase SQL editor
-- 1. Run the complete setup script
-- (Copy and paste the content from scripts/fix-profiles-and-recruiters.sql)
\`\`\`

### 5. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

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
- **Row Level Security**: Ensures users can only access authorized data

## 📱 Usage Guide

### For Applicants

1. **Register**: Create an account with email and password
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

## 🏗️ Project Structure

\`\`\`
recruitment-portal/
├── app/                          # Next.js app directory
│   ├── (authenticated)/          # Protected routes
│   │   ├── application/          # Application submission
│   │   ├── dashboard/            # User dashboards
│   │   │   └── recruiter/        # Recruiter-specific pages
│   │   └── profile/              # Profile management
│   ├── login/                    # Authentication pages
│   ├── register/
│   └── globals.css               # Global styles
├── components/                   # Reusable components
│   ├── ui/                       # shadcn/ui components
│   └── auth-layout.tsx           # Authentication layout
├── contexts/                     # React contexts
│   └── auth-context.tsx          # Authentication context
├── lib/                          # Utility libraries
│   └── supabase/                 # Supabase configuration
│       ├── client.ts             # Client-side Supabase
│       ├── server.ts             # Server-side Supabase
│       └── data-fetching.ts      # Data access functions
├── scripts/                      # Database scripts
└── middleware.ts                 # Route protection middleware
\`\`\`

## 🔧 Configuration

### Application Settings

Recruiters can configure:
- Application deadlines
- Department information
- User roles and permissions

### Environment Configuration

Key environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Manual Deployment

\`\`\`bash
npm run build
npm start
\`\`\`

## 🧪 Development

### Running Tests

\`\`\`bash
npm run test
# or
yarn test
\`\`\`

### Code Formatting

\`\`\`bash
npm run lint
npm run format
\`\`\`

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

## 🐛 Troubleshooting

### Common Issues

**Profile not created after signup**
- Ensure the trigger function is properly set up in Supabase
- Check if RLS policies allow profile creation

**Role changes not reflecting**
- Call `refreshUserRole()` from the auth context
- Verify database permissions for role updates

**Department assignments not working**
- Ensure user has recruiter role
- Check recruiter_departments table permissions

### Getting Help

1. Check the [Issues](https://github.com/yourusername/recruitment-portal/issues) page
2. Review Supabase documentation
3. Check Next.js documentation for framework-specific issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

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
