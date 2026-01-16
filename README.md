# Font and Format

A modern web-based text editor that allows you to create, format, and export beautifully styled documents. Perfect for creating formatted text with various fonts, sizes, and styles, then exporting to PDF.

## Features

- **Block-Based Editing**: Create and edit text in individual blocks for better organization
- **Rich Formatting Toolbar**: Apply fonts, sizes, colors, alignment, and more
- **Live Preview**: See your formatted text in real-time
- **File Upload**: Import text files to edit
- **PDF Export**: Generate professional PDFs from your formatted content
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with Shadcn/ui components
- **PDF Generation**: jsPDF and html2canvas
- **State Management**: React hooks
- **Routing**: React Router
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or bun

### Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd font-and-format
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
bun run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
bun run build
```

### Running Tests

```bash
npm run test
# or
bun run test
```

## Usage

1. **Create Content**: Start typing in the editor to create text blocks
2. **Format Text**: Select a block and use the toolbar to apply formatting
3. **Preview**: See your changes in the live preview panel
4. **Upload Files**: Use the file upload feature to import existing text
5. **Export**: Generate a PDF of your formatted document

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn/ui components
│   ├── BlockEditor.tsx # Main text editor
│   ├── FormatToolbar.tsx # Formatting controls
│   ├── PreviewPanel.tsx # Live preview
│   └── ...
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript type definitions
└── utils/              # Helper functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm run test`
5. Submit a pull request

## Web Analytics

The application is deployed at [font-and-format.vercel.app](https://font-and-format.vercel.app) and uses Vercel Analytics to track visitors and page views.

### Setting up Vercel Analytics

To start counting visitors and page views, follow these steps:

#### 1. Install the package

Install `@vercel/analytics` in your project:

```bash
npm i @vercel/analytics
```

#### 2. Add the React component

Import and use the `<Analytics/>` React component in your app's main component (e.g., `src/main.tsx` or `src/App.tsx`):

```tsx
import { Analytics } from "@vercel/analytics/react"
```

Then add it to your app:

```tsx
export default function App() {
  return (
    <>
      {/* Your app content */}
      <Analytics />
    </>
  )
}
```

For full examples and further reference, please refer to the [Vercel Analytics documentation](https://vercel.com/docs/analytics).

#### 3. Deploy & Visit your Site

Deploy your changes and visit the deployment to start collecting page views.

If you don't see data after 30 seconds, please check for content blockers and try navigating between pages on your site.

## License

This project is private and proprietary.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
