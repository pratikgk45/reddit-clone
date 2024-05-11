'use client';

import { useEdgeStore } from '@/context/EdgeStorageProvider';
import { XMarkIcon } from '@heroicons/react/16/solid';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ChangeEvent, useEffect, useRef, useState } from 'react';

export default function FileUpload({ updateFileUrl }: { updateFileUrl: (url: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showError, setShowError] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileUrl, setSelectedFileUrl] = useState<string>('');

  const { edgestore } = useEdgeStore();
  const [inProgress, setInProgress] = useState<boolean>(false);
  const [uploadProgress, setProgress] = useState<number>(0);

  const triggerFileUpload = () => {
    fileRef?.current?.click();
    setSelectedFile(null);
    setShowError(false);
  };

  const uploadFile = async (e: ChangeEvent) => {
    const file = (e.target as HTMLInputElement).files?.[0];

    if (file) {
      setInProgress(true);

      try {
        const res = await edgestore.publicFiles.upload({
          file,
          onProgressChange: setProgress,
        });

        setSelectedFile(file);
        setSelectedFileUrl(res.url);
      } catch {
        setShowError(true);
      }

      setProgress(0);
      setInProgress(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setSelectedFileUrl('');
    setProgress(0);
    setInProgress(false);
    setShowError(false);
  }

  useEffect(() => updateFileUrl(selectedFileUrl), [selectedFileUrl]);

  return (
    <div className='flex items-center min-h-10'>
      <input
        ref={fileRef}
        type="file"
        className='hidden'
        onChange={uploadFile}
      />
      <div className='flex space-x-4'>
        {!selectedFileUrl ? (
          <button onClick={triggerFileUpload}
            className="flex space-x-2 p-2 bg-green-500 text-white rounded-xl">
            {inProgress ? (
              <div>
                Uploading &nbsp;
                {Math.floor(uploadProgress)}%
              </div>
            ): (
              <div className='flex h-6 space-x-2'>
                <p>Upload Image</p>
                <ArrowUpTrayIcon /> </div>
            )}
          </button>
        ): (
          <div className='flex items-center'>
            Image uploaded: &nbsp; <Link href={selectedFileUrl} target='_blank' className='underline font-semibold'>{selectedFile?.name}</Link>
          </div>
        )}
        {selectedFileUrl && (
          <XMarkIcon onClick={clearFile} className='h-6 w-6 text-gray-400 hover:text-red-600 cursor-pointer'>
            <p>Clear</p>
          </XMarkIcon>
        )}
      </div>
      {showError && (
        <div className='pl-2 text-sm text-gray-400'>Supported files: png, jpeg • Max size: 10MB</div>
      )}
    </div>
  );
}