import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import mammoth from 'mammoth';

export async function POST(req: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let extractedText = "";
    let extractionMessage: string | null = null;
    const fileExtension = path.extname(file.name).toLowerCase();

    switch (fileExtension) {
      case '.docx':
        const docxBaseDir = process.env.VERCEL ? '/tmp' : os.tmpdir();
        const safeOriginalFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const uniqueFilename = `${Date.now()}-${safeOriginalFilename}`;
        tempFilePath = path.join(docxBaseDir, uniqueFilename);
        await fs.writeFile(tempFilePath, new Uint8Array(fileBuffer.buffer, fileBuffer.byteOffset, fileBuffer.byteLength));
        const result = await mammoth.extractRawText({ path: tempFilePath });
        extractedText = result.value;
        extractionMessage = "DOCX content extracted.";
        break;
      case '.txt':
      case '.md':
        extractedText = fileBuffer.toString('utf-8');
        extractionMessage = "Text content read directly.";
        break;
      default:
        extractionMessage = `Unsupported file type: ${fileExtension}. Attempting to read as plain text.`;
        try {
          extractedText = fileBuffer.toString('utf-8');
        } catch {
          extractedText = "";
          extractionMessage += " Could not read file.";
        }
    }

    return NextResponse.json({
        fileName: file.name,
        fileType: file.type,
        extractedText: extractedText || "",
        message: extractionMessage || "File processed.",
    });

  } catch (e: any) {
    console.error('Error in /api/extract-text:', e);
    return NextResponse.json({ error: e.message || 'Failed to process file.' }, { status: 500 });
  } finally {
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (cleanupError) {
        console.error(`Error deleting temporary file:`, cleanupError);
      }
    }
  }
}


