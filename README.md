# Parent-Teacher Contact Notebook

A modern, digital platform that replaces traditional paper notebooks for parent-teacher communication. Built with Next.js, Supabase, and Tailwind CSS.

## 🚀 Features

### For Parents
- **Easy Access**: Login with phone number and password
- **Timeline View**: Chronological display of daily notes
- **Smart Filtering**: Filter by date range and keywords
- **Comments**: Comment on teacher notes
- **PDF Export**: Download notes and history as PDF
- **Email Notifications**: Get notified when new notes are posted
- **Mobile-First**: Responsive design for all devices

### For Teachers
- **Student Management**: View all assigned students
- **Daily Notes**: Upload notes with text and file attachments
- **Class Organization**: Manage multiple classes and schools
- **Parent Communication**: View and respond to parent comments
- **File Uploads**: Attach images, PDFs, and documents
- **Real-time Updates**: Instant updates across the platform

### For Administrators
- **User Management**: Create and manage user accounts
- **School Management**: Add and manage schools and classes
- **Student Assignment**: Assign students to classes and parents
- **Activity Monitoring**: Track system usage and activity
- **Data Export**: Export reports and analytics

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching and caching
- **React Hook Form** - Form management
- **Lucide React** - Beautiful icons
- **jsPDF** - PDF generation

### Backend
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Database
- **Row Level Security** - Data security
- **Supabase Auth** - Authentication
- **Supabase Storage** - File storage

### Additional Services
- **Email Service** - Notifications (configurable)
- **PDF Generation** - Export functionality
- **File Upload** - Secure file handling

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd parent-teacher-notebook
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Go to Settings > Database to get your service role key

### 4. Configure Environment Variables

```bash
cp env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database/schema.sql`
4. Run the SQL script to create all tables and policies

### 6. Configure Storage

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `note-attachments`
3. Set it to public if you want direct access to files

### 7. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage

### Getting Started

1. **Sign Up**: Create an account with your phone number and role
2. **Admin Setup**: Admins can create schools, classes, and assign users
3. **Teacher Setup**: Teachers get assigned to classes and can start adding students
4. **Parent Access**: Parents can view notes for their assigned children

### User Roles

- **Parent**: View notes, comment, export PDFs
- **Teacher**: Create notes, manage students, view comments
- **Admin**: Manage users, schools, classes, and system settings

## 🔧 Configuration

### Email Notifications

To enable email notifications, configure your email service in `.env.local`:

```env
# For SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com

# Or configure your preferred email service
```

### File Storage

The app uses Supabase Storage by default. For production, consider:

- AWS S3
- Cloudinary
- Or any S3-compatible storage

### Security

- All data is encrypted in transit (HTTPS)
- Row Level Security (RLS) protects data access
- JWT tokens for authentication
- Password hashing handled by Supabase

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── dashboard/         # Dashboard components
│   ├── landing/           # Landing page components
│   └── providers/         # Context providers
├── lib/                   # Utility libraries
│   ├── supabase/          # Supabase configuration
│   ├── email-service.ts   # Email functionality
│   └── pdf-generator.ts   # PDF generation
└── types/                 # TypeScript type definitions
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

## 🔒 Security Features

- **Authentication**: Secure phone number + password login
- **Authorization**: Role-based access control
- **Data Protection**: Row Level Security (RLS)
- **File Security**: Secure file upload and storage
- **HTTPS**: Encrypted data transmission
- **Input Validation**: Client and server-side validation

## 📊 Database Schema

The database includes tables for:
- Users (parents, teachers, admins)
- Schools and Classes
- Students
- Daily Notes
- Comments
- File Attachments
- Email Notifications
- Activity Logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- Mobile app with push notifications
- Real-time chat between parents and teachers
- Analytics dashboard
- Multi-language support
- Advanced reporting features
- Integration with school management systems

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Database powered by [Supabase](https://supabase.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)

---

**Made with ❤️ for better parent-teacher communication**