# Student Learning Platform — Admin Dashboard

A production-grade, decoupled React + TypeScript + Vite + Tailwind CSS administration web application for managing partner schools, student rosters, 10-digit cryptographic access codes, curriculum structure, and learning media resources.

## Key Features

- **Authentication & Role Security**: Secure JWT authentication, persistent admin session state, automatic token expiration handling, and request interceptors.
- **System Dashboard**: Real-time summary counters (Total Schools, Total Students, Total/Used/Unused/Inactive Access Codes, Classes, Subjects, and Content items).
- **School Management**: Full CRUD for partner schools, searchable school codes, contact details, status management, student rosters, and access code allocations.
- **Student Directory**: Multi-criteria filtering by School, Class, Status, and search. Detail profiles showing academic affiliations and access code redemption records.
- **Access Codes Engine**: Generate single and bulk 10-digit access codes, copy-to-clipboard, CSV export, school reassignment for unused codes, and activation toggling.
- **Curriculum & Content Management**: Hierarchical Class ➔ Subject ➔ Chapter ➔ Topic ➔ Media explorer with direct file upload to backend storage, URL linking, visibility controls, and built-in video, PDF, and image previewers.
- **Administrator Management**: Admin account creation, role tracking, and status controls.
- **Settings & Connectivity**: Environment verification and backend connection status monitor.

## Tech Stack

- **Framework**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite 6

## Development Setup

```bash
# Navigate to the admin dashboard directory
cd admin-dashboard

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev
```
