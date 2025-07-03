# PDFTranslate - AI-Powered PDF Translation Service

A beautiful, modern web application that translates PDF documents to French while preserving layout, formatting, headers, footers, and hyperlinks. Powered by DeepL AI and built with React, Express, and TypeScript.

![PDFTranslate Demo](https://via.placeholder.com/800x400/7c3aed/ffffff?text=PDFTranslate+Demo)

## ✨ Features

- **🔥 Instant Translation**: Upload PDF and get French translation in seconds
- **🎨 Layout Preservation**: Maintains original formatting, headers, and footers
- **🔗 Hyperlink Support**: Preserves all clickable links in translated documents
- **🛡️ Secure Processing**: Documents processed securely and not stored
- **📱 Responsive Design**: Beautiful interface that works on all devices
- **⚡ Real-time Progress**: Live progress tracking during translation
- **🎯 Drag & Drop**: Intuitive file upload with drag-and-drop support

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS + Radix UI
- **Backend**: Express.js + TypeScript
- **AI Translation**: DeepL API
- **PDF Processing**: pdf-parse + pdf-lib
- **File Upload**: Multer + react-dropzone

## 📋 Prerequisites

Before running this application, you need:

1. **Node.js** (v18 or higher)
2. **DeepL API Key** (required for translation)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd pdf-translate
npm install
```

### 2. Get DeepL API Key

1. Go to [DeepL API](https://www.deepl.com/pro-api)
2. Sign up for a DeepL API account
3. Choose the DeepL API Free plan (500,000 characters/month free)
4. Copy your authentication key from the account settings

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# DeepL API Configuration
DEEPL_API_KEY=your_deepl_api_key_here

# Optional: Server Configuration
PORT=8080
```

**Important**: Never commit your `.env` file to version control. The `.env` file is already in `.gitignore`.

### 4. Run the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build and start
npm run build
npm start
```

The application will be available at `http://localhost:8080`

## 🔑 DeepL API Setup Guide

### Free vs Pro Account

- **DeepL API Free**: 500,000 characters/month at no cost
- **DeepL API Pro**: Higher limits and additional features

### Getting Your API Key

1. **Sign Up**: Visit [DeepL API Portal](https://www.deepl.com/pro-api)
2. **Choose Plan**: Select "DeepL API Free" for testing
3. **Verify Email**: Complete email verification
4. **Get Key**: Find your authentication key in Account → API Keys
5. **Add to App**: Copy the key to your `.env` file

### API Key Format

Your DeepL API key should look like:

```
DEEPL_API_KEY=abc123de-4567-8901-fg23-456789hijklm:fx
```

## 📖 Usage

1. **Open the App**: Navigate to `http://localhost:8080`
2. **Upload PDF**: Drag and drop your PDF file or click to browse
3. **Wait for Translation**: Watch the real-time progress indicator
4. **Download Result**: Click "Download Translated PDF" when complete

### Supported Features

- ✅ Text extraction with layout preservation
- ✅ French translation via DeepL AI
- ✅ Header and footer preservation
- ✅ Hyperlink preservation (basic)
- ✅ Multi-page document support
- ✅ File size up to 50MB
- ✅ Real-time progress tracking

## 🛠️ API Documentation

### POST `/api/translate-pdf`

Translates a PDF document to French.

**Request:**

- Method: `POST`
- Content-Type: `application/pdf`
- Body: PDF file bytes

**Response:**

- Success: PDF file download
- Error: JSON with error details

**Example using curl:**

```bash
curl -X POST \
  -H "Content-Type: application/pdf" \
  --data-binary @document.pdf \
  http://localhost:8080/api/translate-pdf \
  --output translated-document.pdf
```

## 🔧 Development

### Project Structure

```
├── client/                 # React frontend
│   ├── components/ui/      # Reusable UI components
│   ├── pages/             # Route components
│   └── lib/               # Utility functions
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   └── index.ts          # Server configuration
├── shared/               # Shared TypeScript types
└── public/              # Static assets
```

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm test          # Run tests
npm run typecheck # TypeScript validation
```

### Environment Variables

| Variable        | Description                  | Required |
| --------------- | ---------------------------- | -------- |
| `DEEPL_API_KEY` | DeepL API authentication key | Yes      |
| `PORT`          | Server port (default: 8080)  | No       |

## 🚀 Deployment

### Environment Setup

Make sure to set the `DEEPL_API_KEY` environment variable in your deployment platform:

**Vercel:**

```bash
vercel env add DEEPL_API_KEY
```

**Netlify:**

```bash
netlify env:set DEEPL_API_KEY your_key_here
```

**Docker:**

```bash
docker run -e DEEPL_API_KEY=your_key_here your-image
```

### Production Build

```bash
npm run build
npm start
```

## 🔐 Security Notes

- API keys are never exposed to the client
- PDF files are processed in memory and not stored
- All uploads are validated for PDF format
- File size limits prevent abuse
- CORS configured for security

## 🐛 Troubleshooting

### Common Issues

1. **"DeepL API key not configured"**

   - Check your `.env` file exists
   - Verify `DEEPL_API_KEY` is set correctly
   - Restart the server after adding the key

2. **"Translation failed"**

   - Verify your DeepL API key is valid
   - Check if you've exceeded your monthly quota
   - Ensure the PDF contains extractable text

3. **"Only PDF files are allowed"**

   - Make sure you're uploading a valid PDF file
   - Check file extension is `.pdf`

4. **Upload timeout**
   - Large files may take longer to process
   - Check your internet connection
   - Try a smaller PDF file

### Debug Mode

To enable detailed logging, set:

```bash
DEBUG=true npm run dev
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:

- Create an issue on GitHub
- Check the troubleshooting section above
- Review DeepL API documentation

---

**Built with ❤️ using React, Express, and DeepL AI**
