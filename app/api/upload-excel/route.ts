import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Excel upload processing...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      console.log('No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Check file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      console.log('Invalid file type:', file.name);
      return NextResponse.json({ error: 'Invalid file type. Please upload an Excel (.xlsx, .xls) or CSV file.' }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log('File too large:', file.size);
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB.' }, { status: 400 });
    }

    console.log('Reading file buffer...');
    // Read the file
    const buffer = await file.arrayBuffer();
    console.log('Buffer size:', buffer.byteLength);

    console.log('Processing with XLSX...');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    console.log('Workbook sheets:', workbook.SheetNames);
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      console.log('No sheets found in workbook');
      return NextResponse.json({ error: 'No sheets found in the Excel file.' }, { status: 400 });
    }
    
    const worksheet = workbook.Sheets[sheetName];
    console.log('Worksheet processed');
    
    // Convert to JSON with headers
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('JSON data length:', jsonData.length);

    if (jsonData.length === 0) {
      console.log('File appears to be empty');
      return NextResponse.json({ error: 'File appears to be empty.' }, { status: 400 });
    }

    // Try to find the email column
    let emailColumnIndex = -1;
    let nameColumnIndex = -1;
    let classColumnIndex = -1;
    let yearGroupColumnIndex = -1;
    
    // Check if first row contains headers
    const firstRow = jsonData[0] as any[];
    console.log('First row:', firstRow);
    
    const hasHeaders = firstRow && firstRow.some(cell => 
      cell && typeof cell === 'string' && 
      (cell.toLowerCase().includes('email') || cell.toLowerCase().includes('mail'))
    );
    console.log('Has headers:', hasHeaders);

    if (hasHeaders) {
      // Look for email column in headers
      for (let i = 0; i < firstRow.length; i++) {
        const header = String(firstRow[i]).toLowerCase();
        if (header.includes('email') || header.includes('mail')) {
          emailColumnIndex = i;
        }
        if (header.includes('name') || header.includes('student')) {
          nameColumnIndex = i;
        }
        if (header.includes('class')) {
          classColumnIndex = i;
        }
        if (header.includes('year') || header.includes('grade')) {
          yearGroupColumnIndex = i;
        }
      }
    } else {
      // No headers, try to detect email column by content
      if (jsonData.length > 1) {
        const secondRow = jsonData[1] as any[];
        console.log('Second row:', secondRow);
        for (let i = 0; i < secondRow.length; i++) {
          const cell = String(secondRow[i]);
          if (cell.includes('@') && cell.includes('.')) {
            emailColumnIndex = i;
            break;
          }
        }
      }
    }

    // If no email column found, default to second column (index 1)
    if (emailColumnIndex === -1) {
      emailColumnIndex = 1;
    }

    console.log('Email column index:', emailColumnIndex, 'Name column index:', nameColumnIndex, 'Class column index:', classColumnIndex, 'Year group column index:', yearGroupColumnIndex);

    // Extract emails and names
    const emails: string[] = [];
    const names: string[] = [];
    const classes: string[] = [];
    const yearGroups: string[] = [];
    const startRow = hasHeaders ? 1 : 0;
    
    for (let i = startRow; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (row && row[emailColumnIndex]) {
        const email = String(row[emailColumnIndex]).trim();
        // Basic email validation
        if (email.includes('@') && email.includes('.')) {
          emails.push(email);
          
          // Get name if available
          const name = nameColumnIndex >= 0 && row[nameColumnIndex] 
            ? String(row[nameColumnIndex]).trim() 
            : '';
          names.push(name);
          
          // Get class if available
          const classValue = classColumnIndex >= 0 && row[classColumnIndex] 
            ? String(row[classColumnIndex]).trim() 
            : '';
          classes.push(classValue);
          
          // Get year group if available
          const yearGroup = yearGroupColumnIndex >= 0 && row[yearGroupColumnIndex] 
            ? String(row[yearGroupColumnIndex]).trim() 
            : '';
          yearGroups.push(yearGroup);
        }
      }
    }

    console.log('Extracted emails count:', emails.length);

    if (emails.length === 0) {
      console.log('No valid emails found');
      return NextResponse.json({ 
        error: `No valid email addresses found in column ${emailColumnIndex + 1}. Please ensure emails are in a column with header containing "email" or in the second column.` 
      }, { status: 400 });
    }

    // Remove duplicates while preserving names, classes, and year groups
    const uniqueData = new Map<string, { name: string; class: string; yearGroup: string }>();
    for (let i = 0; i < emails.length; i++) {
      if (!uniqueData.has(emails[i])) {
        uniqueData.set(emails[i], {
          name: names[i],
          class: classes[i],
          yearGroup: yearGroups[i]
        });
      }
    }

    const uniqueEmails = Array.from(uniqueData.keys());
    const uniqueNames = Array.from(uniqueData.values()).map(d => d.name);
    const uniqueClasses = Array.from(uniqueData.values()).map(d => d.class);
    const uniqueYearGroups = Array.from(uniqueData.values()).map(d => d.yearGroup);

    console.log('Processing complete. Unique emails:', uniqueEmails.length);

    return NextResponse.json({ 
      success: true, 
      emails: uniqueEmails,
      names: uniqueNames,
      classes: uniqueClasses,
      yearGroups: uniqueYearGroups,
      count: uniqueEmails.length,
      emailColumn: emailColumnIndex + 1,
      nameColumn: nameColumnIndex >= 0 ? nameColumnIndex + 1 : null,
      classColumn: classColumnIndex >= 0 ? classColumnIndex + 1 : null,
      yearGroupColumn: yearGroupColumnIndex >= 0 ? yearGroupColumnIndex + 1 : null,
      hasHeaders: hasHeaders
    });

  } catch (error) {
    console.error('Error processing Excel file:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json({ 
      error: 'Failed to process file. Please ensure it\'s a valid Excel or CSV file.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 