import { RequestHandler } from "express";
import { TranslationResult } from "@shared/api";
import { PDFDocument, rgb } from "pdf-lib";
import * as deepl from "deepl-node";

export const handleTranslatePdf: RequestHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    // Validate request
    if (!req.body || req.body.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No PDF data provided in request body",
      } as TranslationResult);
    }

    // Check if DeepL API key is configured
    if (!process.env.DEEPL_API_KEY) {
      return res.status(500).json({
        success: false,
        error: "DeepL API key not configured",
      } as TranslationResult);
    }

    // Initialize DeepL translator with API key from environment
    const translator = new deepl.Translator(process.env.DEEPL_API_KEY);

    // Parse the PDF - for demo purposes, we'll use sample text
    // In production, you would integrate with a robust PDF parsing library
    const pdfBuffer = Buffer.from(req.body);

    // Load the PDF to get basic info (page count, etc.)
    let pageCount = 1;
    try {
      const existingPdfDoc = await PDFDocument.load(pdfBuffer);
      pageCount = existingPdfDoc.getPageCount();
    } catch (error) {
      console.warn("Could not load PDF for page count:", error);
    }

    // For demo purposes, use sample text that represents typical PDF content
    const extractedText = `Sample Document Content

This is a demonstration of the PDF translation service. This text represents the content that would typically be extracted from your PDF document.

Key Features:
• Professional document translation
• Layout and formatting preservation
• Support for multiple languages
• High-quality AI-powered translation

The original document contained ${pageCount} page${pageCount !== 1 ? "s" : ""} of content. In a production environment, this service would extract the actual text from your PDF document while maintaining the original structure and formatting.

This translation service uses advanced AI technology to provide accurate and contextually appropriate translations while preserving the professional appearance of your documents.

Thank you for using our PDF translation service. The translated document will maintain all original formatting, headers, footers, and structural elements.`;

    // Split text into chunks for translation (DeepL has size limits)
    const textChunks = splitTextIntoChunks(extractedText, 5000);

    // Translate each chunk
    const translatedChunks: string[] = [];
    for (const chunk of textChunks) {
      try {
        const result = await translator.translateText(chunk, null, "fr");
        translatedChunks.push(result.text);
      } catch (error) {
        console.error("Translation error:", error);
        return res.status(500).json({
          success: false,
          error: "Translation failed",
        } as TranslationResult);
      }
    }

    const translatedText = translatedChunks.join("\n\n");

    // Create a new PDF with the translated text
    const newPdf = await PDFDocument.create();
    const page = newPdf.addPage([595.28, 841.89]); // A4 size

    // Set up font and layout
    const { width, height } = page.getSize();
    const fontSize = 12;
    const margin = 50;
    const maxWidth = width - 2 * margin;

    // Add header
    page.drawText("Translated Document", {
      x: margin,
      y: height - margin,
      size: 16,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Add translated text with basic word wrapping
    const lines = wrapText(translatedText, maxWidth, fontSize);
    let yPosition = height - margin - 40;

    for (const line of lines) {
      if (yPosition < margin + 20) {
        // Add new page if needed
        const newPage = newPdf.addPage([595.28, 841.89]);
        yPosition = height - margin;
        newPage.drawText(line, {
          x: margin,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
      } else {
        page.drawText(line, {
          x: margin,
          y: yPosition,
          size: fontSize,
          color: rgb(0, 0, 0),
        });
      }
      yPosition -= fontSize + 4;
    }

    // Add footer with timestamp
    const footer = `Translated on ${new Date().toLocaleDateString()} | Powered by DeepL`;
    page.drawText(footer, {
      x: margin,
      y: 30,
      size: 10,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Generate PDF bytes
    const pdfBytes = await newPdf.save();

    const processingTime = Date.now() - startTime;

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="translated-document.pdf"',
    );
    res.setHeader("Content-Length", pdfBytes.length);

    // Send the PDF
    res.end(Buffer.from(pdfBytes));
  } catch (error) {
    console.error("PDF translation error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error during PDF translation",
    } as TranslationResult);
  }
};

// Helper function to split text into manageable chunks
function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  const paragraphs = text.split("\n\n");

  let currentChunk = "";

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = paragraph;
      } else {
        // Single paragraph is too long, split by sentences
        const sentences = paragraph.split(". ");
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk.length > 0) {
              chunks.push(currentChunk.trim());
              currentChunk = sentence + ". ";
            } else {
              chunks.push(sentence);
            }
          } else {
            currentChunk += sentence + ". ";
          }
        }
      }
    } else {
      currentChunk += paragraph + "\n\n";
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

// Helper function for basic text wrapping
function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  // Approximate character width (this is rough, real implementation would measure text)
  const charWidth = fontSize * 0.6;
  const maxCharsPerLine = Math.floor(maxWidth / charWidth);

  for (const word of words) {
    if ((currentLine + word).length > maxCharsPerLine) {
      if (currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      } else {
        lines.push(word);
      }
    } else {
      currentLine += word + " ";
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.trim());
  }

  return lines;
}
