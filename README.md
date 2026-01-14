# Lumina Blue

A modern healthcare and appointment management platform built with Next.js, designed to provide seamless patient experiences for medical practices.

## 🚀 Features

- **Appointment Management**: Schedule, reschedule, and confirm appointments
- **Patient Portal**: Secure access to personal health information
- **Online Booking**: Intuitive interface for patients to book appointments
- **Contact Lens Orders**: Streamlined ordering system for contact lenses
- **Practice Reviews**: Collect and manage patient feedback
- **Responsive Design**: Works seamlessly across all devices
- **Multi-location Support**: Manage multiple practice locations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Emotion
- **UI Components**: React Icons, Lucide Icons, React Modal
- **Form Handling**: React Hook Form
- **State Management**: React Context API
- **HTTP Client**: Axios, Node Fetch
- **Date/Time**: Moment Timezone
- **International Phone Input**: React Phone Input 2
- **Carousels & Sliders**: Swiper, React Slick
- **Calendar Integration**: iCal generator

## 🚀 Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/lumina-blue.git
   cd lumina-blue
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the necessary environment variables:
   ```env
   NEXT_PUBLIC_API_URL=your_api_url_here
   # Add other environment variables as needed
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Structure

```
src/
├── app/                    # App router pages and API routes
│   ├── api/                # API route handlers
│   ├── components/         # Reusable UI components
│   ├── context/            # React context providers
│   └── ...
├── public/                # Static files
└── styles/                # Global styles
```

## 📝 Common Tasks

### Running Linting
```bash
npm run lint
# or
yarn lint
```

### Building for Production
```bash
npm run build
# or
yarn build
```

### Starting Production Server
```bash
npm start
# or
yarn start
```

## 🔧 Environment Configuration

The application uses environment variables for configuration. See `.env.example` for required variables.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
