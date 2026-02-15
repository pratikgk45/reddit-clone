'use client';

import { XMarkIcon } from '@heroicons/react/16/solid';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

export default function FileUpload({ updateFileUrl }: { updateFileUrl: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');

  const triggerFileUpload = () => {
    fileRef?.current?.click();
    setSelectedFile(null);
    setShowError(false);
  };

  const uploadFile = async (e: ChangeEvent) => {
    const file = (e.target as HTMLInputElement).files?.[0];

    if (file) {
      // Validate file type and size
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        setShowError(true);
        return;
      }

      if (file.size > maxSize) {
        setShowError(true);
        return;
      }

      // Create a local URL for preview
      const url = URL.createObjectURL(file);
      setSelectedFile(file);
      setSelectedFileUrl(url);
    }
  };

  const clearFile = () => {
    if (selectedFileUrl) {
      URL.revokeObjectURL(selectedFileUrl);
    }
    setSelectedFile(null);
    setSelectedFileUrl('');
    setShowError(false);
  };

  useEffect(() => {
    updateFileUrl(selectedFileUrl);
  }, [selectedFileUrl, updateFileUrl]);

  return (
    <div className="flex items-center min-h-10">
      <input ref={fileRef} type="file" className="hidden" accept="image/*" onChange={uploadFile} />
      <div className="flex space-x-4">
        {!selectedFileUrl ? (
          <button
            onClick={triggerFileUpload}
            className="flex space-x-2 p-2 bg-green-500 text-white rounded-xl"
          >
            <div className="flex h-6 space-x-2">
              <p>Upload Image</p>
              <ArrowUpTrayIcon />
            </div>
          </button>
        ) : (
          <div className="flex items-center">
            Image selected: &nbsp;
            <span className="font-semibold">{selectedFile?.name}</span>
          </div>
        )}
        {selectedFileUrl && (
          <XMarkIcon
            onClick={clearFile}
            className="h-6 w-6 text-gray-400 hover:text-red-600 cursor-pointer"
          >
            <p>Clear</p>
          </XMarkIcon>
        )}
      </div>
      {showError && (
        <div className="pl-2 text-sm text-red-500">
          Supported files: png, jpeg, jpg, gif • Max size: 10MB
        </div>
      )}
    </div>
  );
}
