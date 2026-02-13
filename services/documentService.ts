import { supabase } from './supabaseClient';
import { KnowledgeDocument } from '../types';
import { generateEmbedding } from './geminiService';
import * as pdfjs from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const getDocuments = async (): Promise<KnowledgeDocument[]> => {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching documents:', error);
    return [];
  }

  return (data || []).map(doc => ({
    id: doc.id,
    filename: doc.filename,
    title: doc.title,
    createdAt: new Date(doc.created_at).getTime(),
    status: doc.status as any,
    user_id: doc.user_id,
  }));
};

export const addDocument = async (title: string, content: string, fileType: string = 'txt', fileSize: number = 0): Promise<KnowledgeDocument> => {
  console.log(`[DocumentService] Adding document: "${title}" (${content.length} chars)`);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('[DocumentService] No user found for upload');
    throw new Error('You must be logged in to add documents.');
  }

  try {
    // 1. Insert into documents table
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .insert([
        { 
          filename: title,
          title: title,
          file_type: fileType,
          file_size: fileSize,
          user_id: user.id,
          status: 'processing',
          total_chunks: 1,
          indexed_chunks: 0
        }
      ])
      .select()
      .single();

    if (docError) {
      console.error('[DocumentService] Documents insert error:', docError);
      throw docError;
    }

    console.log('[DocumentService] Document record created. Generating embedding...');

    // 2. Generate embedding (single chunk for now)
    const processedContent = content.slice(0, 30000); 
    const embedding = await generateEmbedding(processedContent);
    console.log('[DocumentService] Embedding generated successfully');

    // 3. Insert into document_chunks table
    const { error: chunkError } = await supabase
      .from('document_chunks')
      .insert([
        {
          document_id: docData.id,
          user_id: user.id,
          content: content,
          chunk_index: 0,
          embedding: embedding,
          metadata: { filename: title }
        }
      ]);

    if (chunkError) {
      console.error('[DocumentService] document_chunks insert error:', chunkError);
      // We should probably delete the document record here or mark it as failed
      await supabase.from('documents').update({ status: 'failed' }).eq('id', docData.id);
      throw chunkError;
    }

    // 4. Mark document as active/indexed
    await supabase
      .from('documents')
      .update({ status: 'active', indexed_chunks: 1 })
      .eq('id', docData.id);

    console.log('[DocumentService] Document fully indexed and active');

    return {
      id: docData.id,
      filename: docData.filename,
      title: docData.title,
      createdAt: new Date(docData.created_at).getTime(),
      status: 'active',
      user_id: docData.user_id,
      content: content
    };
  } catch (error) {
    console.error('[DocumentService] Error in addDocument:', error);
    throw error;
  }
};

export const extractTextFromPDF = async (file: File): Promise<string> => {
  console.log(`[DocumentService] Extracting text from PDF: ${file.name}`);
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    
    // Add progress logging
    loadingTask.onProgress = (progress: { loaded: number, total: number }) => {
      const percent = Math.round((progress.loaded / progress.total) * 100);
      console.log(`[DocumentService] Loading PDF... ${percent}%`);
    };

    const pdf = await loadingTask.promise;
    console.log(`[DocumentService] PDF loaded. Pages: ${pdf.numPages}`);
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`[DocumentService] Processing page ${i}/${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      fullText += strings.join(' ') + '\n';
    }
    
    console.log(`[DocumentService] Extraction complete. Total length: ${fullText.length}`);
    return fullText;
  } catch (err) {
    console.error('[DocumentService] PDF extraction failed:', err);
    throw err;
  }
};

export const uploadFileDocument = async (file: File): Promise<KnowledgeDocument> => {
  console.log(`[DocumentService] Handling file upload: ${file.name} (${file.type})`);
  let content = '';
  let fileExt = 'txt';
  
  if (file.type === 'application/pdf') {
    content = await extractTextFromPDF(file);
    fileExt = 'pdf';
  } else if (file.type === 'text/plain') {
    content = await file.text();
    fileExt = 'txt';
  } else {
    throw new Error(`Unsupported file type: ${file.type}`);
  }

  if (!content.trim()) {
    throw new Error('No text content found in the file.');
  }

  return await addDocument(file.name, content, fileExt, file.size);
};

export const deleteDocument = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting document:', error);
  }
};
