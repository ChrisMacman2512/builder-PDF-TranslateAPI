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

    // Parse the PDF and extract actual text content
    const pdfBuffer = Buffer.from(req.body);
    let extractedText = "";
    let pageCount = 1;

    try {
      // Load the PDF document
      const existingPdfDoc = await PDFDocument.load(pdfBuffer);
      pageCount = existingPdfDoc.getPageCount();

      // Since pdf-lib doesn't extract text well, we'll use a simple approach
      // In a production environment, you'd use a more sophisticated text extraction library
      // For now, let's try to extract using the PDF buffer directly

      // Convert buffer to string and try to extract readable text
      const pdfString = pdfBuffer.toString("latin1");

      // Basic text extraction using regex patterns to find readable text
      // This is a simplified approach - in production you'd use proper PDF parsing
      const textMatches = pdfString.match(/\(([^)]+)\)/g);
      const streamMatches = pdfString.match(/stream\s*(.*?)\s*endstream/gs);

      let rawText = "";

      if (textMatches) {
        textMatches.forEach((match) => {
          const text = match.slice(1, -1); // Remove parentheses
          if (text.length > 3 && /[a-zA-Z]/.test(text)) {
            rawText += text + " ";
          }
        });
      }

      if (streamMatches) {
        streamMatches.forEach((stream) => {
          const content = stream.replace(/stream|endstream/g, "").trim();
          // Look for text that appears to be readable content
          const readableText = content.match(/[A-Za-z][A-Za-z\s]{10,}/g);
          if (readableText) {
            rawText += readableText.join(" ") + " ";
          }
        });
      }

      // Clean up the extracted text
      extractedText = rawText
        .replace(/\s+/g, " ") // Normalize whitespace
        .replace(/[^\w\s.,!?;:()\[\]"'-]/g, "") // Remove special characters
        .trim();

      // If we couldn't extract meaningful text, try a different approach
      if (!extractedText || extractedText.length < 50) {
        // Try to find text in the PDF structure
        const pdfContent = pdfBuffer.toString(
          "utf8",
          0,
          Math.min(pdfBuffer.length, 10000),
        );
        const textSegments = pdfContent.match(
          /[A-Z][a-z]+(?:\s+[A-Za-z]+){2,}/g,
        );

        if (textSegments && textSegments.length > 0) {
          extractedText = textSegments.join(". ");
        }
      }
    } catch (error) {
      console.error("PDF parsing error:", error);
    }

    // If all extraction methods failed, inform the user
    if (!extractedText || extractedText.length < 20) {
      return res.status(400).json({
        success: false,
        error:
          "Could not extract readable text from the PDF. Please ensure the PDF contains selectable text (not just images).",
      } as TranslationResult);
    }

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
