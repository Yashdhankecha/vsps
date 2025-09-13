import { useState, useRef } from 'react';
import { uploadToCloudinary, FOLDERS } from '../config/cloudinary';
import { toast } from 'react-hot-toast';

const TestUpload = () => {
  const [loading, setLoading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    try {
      // Test upload to different folders
      const imageUrl = await uploadToCloudinary(selectedFile, FOLDERS.USER_DATA);
      setUploadedUrl(imageUrl);
      toast.success('Upload successful!');
      console.log('Uploaded URL:', imageUrl);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Test Cloudinary Upload</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-purple-50 file:text-purple-700
              hover:file:bg-purple-100"
          />
        </div>

        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-48 object-cover rounded-lg"
            />
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading || !selectedFile}
          className={`w-full py-2 px-4 rounded-md text-white font-medium
            ${loading || !selectedFile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
            }`}
        >
          {loading ? 'Uploading...' : 'Upload to Cloudinary'}
        </button>

        {uploadedUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Image:</p>
            <img
              src={uploadedUrl}
              alt="Uploaded"
              className="max-w-full h-48 object-cover rounded-lg"
            />
            <p className="mt-2 text-sm text-gray-500 break-all">
              URL: {uploadedUrl}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUpload; 