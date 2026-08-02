import React, { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';

export default function Editor() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: '<p>Start writing your tech article...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert focus:outline-none min-h-[400px] max-w-none border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-900',
      },
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      // Call the API endpoint (Vercel function) to handle upload and compression
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      
      const { url } = await res.json();
      
      // Insert the uploaded image into the editor
      editor.chain().focus().setImage({ src: url }).run();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const saveArticle = () => {
    if (!editor) return;
    const html = editor.getHTML();
    console.log('Saving article:', { title, category, content: html });
    alert('Article saved successfully! (Simulated)');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Title</label>
        <input 
          type="text" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          placeholder="Enter article title..."
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Category</label>
        <input 
          type="text" 
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          placeholder="e.g. AI, Hardware, Web Dev..."
        />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Content</label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-3 py-1 rounded text-slate-700 dark:text-slate-300 transition-colors">
              {isUploading ? 'Uploading...' : 'Insert Image'}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
            </label>
          </div>
        </div>
        <EditorContent editor={editor} />
      </div>

      <div className="flex justify-end pt-4">
        <button onClick={saveArticle} className="px-6 py-2 bg-primary text-white font-medium rounded-lg hover:bg-secondary transition-colors">
          Publish Article
        </button>
      </div>
    </div>
  );
}
