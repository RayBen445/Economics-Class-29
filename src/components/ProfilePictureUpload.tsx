import React, { useState, useRef, useCallback } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';
import { useNotifications } from '../hooks/useNotifications';

interface ProfilePictureUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (url: string) => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  isOpen,
  onClose,
  onUploadComplete
}) => {
  const { user } = useFirebaseAuth();
  const { addNotification } = useNotifications();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        addNotification({
          title: 'File Too Large',
          message: 'Please select an image smaller than 5MB.',
          type: 'error'
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        addNotification({
          title: 'Invalid File Type',
          message: 'Please select a valid image file.',
          type: 'error'
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [addNotification]);

  const handleDragStart = useCallback((event: React.MouseEvent) => {
    setIsDragging(true);
    const startX = event.clientX - cropArea.x;
    const startY = event.clientY - cropArea.y;

    const handleMouseMove = (e: MouseEvent) => {
      if (imageRef.current) {
        const rect = imageRef.current.getBoundingClientRect();
        const newX = Math.max(0, Math.min(e.clientX - startX, rect.width - cropArea.width));
        const newY = Math.max(0, Math.min(e.clientY - startY, rect.height - cropArea.height));
        setCropArea(prev => ({ ...prev, x: newX, y: newY }));
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [cropArea]);

  const getCroppedImage = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!imageRef.current || !canvasRef.current) {
        reject(new Error('Image or canvas not available'));
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const image = imageRef.current;

      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      // Set canvas size to crop area
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;

      // Calculate scale factors
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Draw cropped image
      ctx.drawImage(
        image,
        cropArea.x * scaleX,
        cropArea.y * scaleY,
        cropArea.width * scaleX,
        cropArea.height * scaleY,
        0,
        0,
        cropArea.width,
        cropArea.height
      );

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create cropped image'));
        }
      }, 'image/jpeg', 0.9);
    });
  }, [cropArea]);

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    try {
      const croppedImageBlob = await getCroppedImage();
      
      // Here you would upload to Firebase Storage
      // For now, we'll create a local URL and simulate upload
      const croppedUrl = URL.createObjectURL(croppedImageBlob);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      addNotification({
        title: 'Profile Picture Updated',
        message: 'Your profile picture has been successfully updated!',
        type: 'success'
      });

      onUploadComplete(croppedUrl);
      onClose();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      addNotification({
        title: 'Upload Failed',
        message: 'Failed to upload profile picture. Please try again.',
        type: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setCropArea({ x: 0, y: 0, width: 200, height: 200 });
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose} />
      <div className="profile-picture-modal">
        <div className="modal-header">
          <h2>📸 Upload Profile Picture</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          {!selectedFile ? (
            <div className="upload-area">
              <div className="upload-placeholder">
                <div className="upload-icon">📷</div>
                <h3>Select Your Profile Picture</h3>
                <p>Choose an image file to upload and crop as your profile picture.</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="file-input"
                  id="profile-picture-input"
                />
                <label htmlFor="profile-picture-input" className="btn btn-primary">
                  Choose Image
                </label>
                <div className="upload-requirements">
                  <p>✅ Maximum size: 5MB</p>
                  <p>✅ Formats: JPG, PNG, GIF</p>
                  <p>✅ Recommended: Square images work best</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="crop-area">
              <h3>Crop Your Image</h3>
              <p>Drag the crop area to select the part of the image you want to use.</p>
              
              <div className="image-container">
                <img
                  ref={imageRef}
                  src={previewUrl}
                  alt="Preview"
                  className="preview-image"
                  onLoad={() => {
                    if (imageRef.current) {
                      const rect = imageRef.current.getBoundingClientRect();
                      setCropArea({
                        x: Math.max(0, (rect.width - 200) / 2),
                        y: Math.max(0, (rect.height - 200) / 2),
                        width: Math.min(200, rect.width),
                        height: Math.min(200, rect.height)
                      });
                    }
                  }}
                />
                <div
                  className={`crop-overlay ${isDragging ? 'dragging' : ''}`}
                  style={{
                    left: cropArea.x,
                    top: cropArea.y,
                    width: cropArea.width,
                    height: cropArea.height
                  }}
                  onMouseDown={handleDragStart}
                >
                  <div className="crop-handles">
                    <div className="crop-handle top-left" />
                    <div className="crop-handle top-right" />
                    <div className="crop-handle bottom-left" />
                    <div className="crop-handle bottom-right" />
                  </div>
                </div>
              </div>

              <canvas
                ref={canvasRef}
                style={{ display: 'none' }}
              />

              <div className="crop-preview">
                <h4>Preview</h4>
                <div className="preview-circle">
                  <div
                    className="preview-content"
                    style={{
                      backgroundImage: `url(${previewUrl})`,
                      backgroundPosition: `-${cropArea.x}px -${cropArea.y}px`,
                      backgroundSize: imageRef.current ? 
                        `${imageRef.current.width}px ${imageRef.current.height}px` : 
                        'cover'
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={selectedFile ? resetForm : onClose}
            disabled={isUploading}
          >
            {selectedFile ? 'Back' : 'Cancel'}
          </button>
          {selectedFile && (
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <span className="loading-spinner" />
                  Uploading...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Set Profile Picture
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};