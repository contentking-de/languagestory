import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.' }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    // Read the file
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Extract emails from the first column (assuming emails are in column A)
    const emails: string[] = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (row && row[0]) {
        const email = String(row[0]).trim();
        // Basic email validation
        if (email.includes('@') && email.includes('.')) {
          emails.push(email);
        }
      }
    }

    if (emails.length === 0) {
      return NextResponse.json({ error: 'No valid email addresses found in the file. Please ensure emails are in the first column.' }, { status: 400 });
    }

    // Remove duplicates
    const uniqueEmails = [...new Set(emails)];

    return NextResponse.json({ 
      success: true, 
      emails: uniqueEmails,
      count: uniqueEmails.length
    });

  } catch (error) {
    console.error('Error processing Excel file:', error);
    return NextResponse.json({ error: 'Failed to process file. Please ensure it\'s a valid Excel or CSV file.' }, { status: 500 });
  }
} 