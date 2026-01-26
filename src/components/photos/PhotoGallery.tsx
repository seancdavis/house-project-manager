import { useState, useRef } from 'react';
import { Upload, Trash2, ImageIcon } from 'lucide-react';
import { usePhotos, useUploadPhoto, useDeletePhoto } from '../../hooks/usePhotos';
import { useCurrentUser } from '../../context/UserContext';
import { Modal, EmptyState, Loading, RequireAuthButton } from '../ui';
import type { Photo } from '../../types';

interface PhotoGalleryProps {
  projectId: string;
}

export function PhotoGallery({ projectId }: PhotoGalleryProps) {
  const { data: photos, isLoading } = usePhotos(projectId);
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const { currentUser } = useCurrentUser();

  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await uploadPhoto.mutateAsync({
        projectId,
        file,
        caption: uploadCaption || undefined,
        uploadedById: currentUser?.id,
      });
      setUploadCaption('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (photo: Photo) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      await deletePhoto.mutateAsync(photo.id);
      setSelectedPhoto(null);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      {/* Upload Section */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          alignItems: 'center',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="photo-upload"
        />
        <RequireAuthButton
          variant="secondary"
          icon={<Upload size={16} />}
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Upload Photo'}
        </RequireAuthButton>
      </div>

      {/* Photo Grid */}
      {photos && photos.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '12px',
          }}
        >
          {photos.map(photo => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              style={{
                position: 'relative',
                aspectRatio: '1',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                backgroundColor: 'var(--color-stone-100)',
              }}
            >
              <img
                src={`${photo.url}&w=300&h=300&fit=cover`}
                alt={photo.caption || photo.filename}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform var(--transition-normal)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ImageIcon size={48} />}
          title="No photos yet"
          description="Upload photos to document this project's progress"
        />
      )}

      {/* Photo Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.caption || selectedPhoto?.filename || 'Photo'}
        size="lg"
      >
        {selectedPhoto && (
          <div>
            <div
              style={{
                position: 'relative',
                marginBottom: '16px',
              }}
            >
              <img
                src={`${selectedPhoto.url}&w=1200`}
                alt={selectedPhoto.caption || selectedPhoto.filename}
                style={{
                  width: '100%',
                  maxHeight: '60vh',
                  objectFit: 'contain',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-stone-100)',
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ color: 'var(--color-stone-500)', fontSize: '0.875rem' }}>
                {selectedPhoto.filename}
                <span style={{ margin: '0 8px' }}>·</span>
                {(selectedPhoto.size / 1024).toFixed(1)} KB
              </div>
              <RequireAuthButton
                variant="ghost"
                icon={<Trash2 size={16} />}
                onClick={() => handleDelete(selectedPhoto)}
              >
                Delete
              </RequireAuthButton>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
