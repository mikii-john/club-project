import React, { useState, useEffect } from 'react';
import { getDocuments, addDocument, deleteDocument, uploadFileDocument } from '../services/documentService';
import { KnowledgeDocument } from '../types';
import { Trash2, Plus, FileText, Search, Database, Upload, Loader2 } from 'lucide-react';

const AdminPage: React.FC = () => {
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    refreshDocs();
  }, []);

  const refreshDocs = async () => {
    const docs = await getDocuments();
    setDocuments(docs);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setIsLoading(true);
    const doc = await addDocument(newTitle, newContent);
    setIsLoading(false);
    if (doc) {
      setNewTitle('');
      setNewContent('');
      setIsAdding(false);
      refreshDocs();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const doc = await uploadFileDocument(file);
      if (doc) {
        refreshDocs();
      }
    } catch (err) {
      alert('Error uploading file: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      await deleteDocument(id);
      refreshDocs();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 py-10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate font-serif">
              Knowledge Base Management
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              Manage the documents the AI uses to answer user questions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.txt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-amber-500 rounded-md shadow-sm text-sm font-medium text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Uploading...' : 'Upload File'}
            </button>
            <button
              onClick={() => setIsAdding(!isAdding)}
              disabled={isLoading}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-slate-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
            >
              {isAdding ? 'Cancel' : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Document
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white dark:bg-slate-900 overflow-hidden shadow-lg rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors duration-300">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-slate-400 truncate flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-amber-500" />
                Total Documents
              </dt>
              <dd className="text-3xl font-bold text-gray-900 dark:text-white">
                {documents.length}
              </dd>
            </div>
          </div>
        </div>

        {/* Add Form */}
        {isAdding && (
          <div className="bg-white dark:bg-slate-900 shadow sm:rounded-lg mb-8 border-l-4 border-amber-400 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">Add New Knowledge</h3>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Document Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-slate-700 border rounded-md p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="e.g., Return Policy"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Content
                  </label>
                  <textarea
                    id="content"
                    name="content"
                    rows={4}
                    className="mt-1 focus:ring-amber-500 focus:border-amber-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-slate-700 border rounded-md p-2.5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="The detailed text that the AI will reference..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                    This text will be injected into the AI's context window (Simulated RAG).
                  </p>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-slate-900 bg-amber-400 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors"
                  >
                    Save Document
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* List */}
        <div className="bg-white dark:bg-slate-900 shadow overflow-hidden sm:rounded-md border border-gray-100 dark:border-slate-800 transition-colors duration-300">
          <ul className="divide-y divide-gray-200 dark:divide-slate-800">
            {documents.length === 0 ? (
              <li className="px-4 py-12 text-center text-gray-500 dark:text-slate-400">
                <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-slate-700 mb-3" />
                <p>No documents found. Add some knowledge to get started.</p>
              </li>
            ) : (
              documents.map((doc) => (
                <li key={doc.id}>
                  <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-medium text-amber-600 dark:text-amber-400 truncate">{doc.title || doc.filename}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              doc.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 
                              doc.status === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400'
                            }`}>
                              {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                            </span>
                         </div>
                        <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-2 pr-4">
                          {doc.content || 'Click to view details'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">
                           ID: {doc.id} • Added: {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
