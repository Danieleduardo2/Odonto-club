# OdontoClub - Dental Clinic Management System 🦷

OdontoClub is a modern, full-stack web application designed to help dental clinics efficiently manage their patients and appointments. Built with a focus on seamless user experience, it features an automated WhatsApp reminder system that allows patients to select their appointment slots directly from their phones.

## 🚀 Features & Modules

### 1. Dashboard
A centralized view providing quick statistics about the clinic, such as the total number of registered patients, today's appointments, and recent WhatsApp reminders sent.

### 2. Patient Management Module
A complete directory to manage patient records. 
- View patient details including name, contact information, and email.
- Data is securely stored in a PostgreSQL database (Supabase).

### 3. Appointment Control Module
A system to schedule and keep track of all clinic appointments.
- Displays upcoming appointments with date, time, patient details, and current status.
- **WhatsApp Integration Action:** Features a quick-action button to trigger the WhatsApp reminder workflow for a specific patient.

### 4. WhatsApp Automation Module (Meta Cloud API)
The core feature of OdontoClub is its seamless communication channel with patients.
- **Interactive Messaging:** When triggered, the system sends an interactive WhatsApp message (using Meta's Cloud API) to the patient containing a native list of available time slots.
- **Webhook Listener:** The application includes a webhook endpoint (`/api/whatsapp/webhook`) that listens for the patient's response directly from WhatsApp, allowing the clinic to confirm the appointment automatically.

## 💻 Tech Stack

- **Frontend & Backend:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** Premium Custom Vanilla CSS (Glassmorphism, Modern UI)
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Messaging API:** [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)

## 🛠️ Setup & Installation

If you want to run this project locally or deploy it to a platform like Vercel, you need to set up the following environment variables:

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your `.env.local` file based on `.env.example`:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Meta WhatsApp Cloud API Configuration
   WHATSAPP_TOKEN=your_meta_api_token
   WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
   WHATSAPP_VERIFY_TOKEN=your_custom_webhook_verify_token
   ```

3. **Database Setup:** 
   Go to your Supabase project's SQL Editor and run the queries found in `/supabase/schema.sql` to generate the `patients`, `appointments`, and `settings` tables.

4. Run the development server:
   ```bash
   npm run dev
   ```

## 🌐 Deployment
This project is optimized for zero-config deployment on [Vercel](https://vercel.com). Simply import the GitHub repository, add your environment variables in the Vercel dashboard, and deploy.
