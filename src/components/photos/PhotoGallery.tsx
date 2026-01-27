import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, Trash2, ImageIcon } from 'lucide-react';
import { usePhotos, useUploadPhoto, useUpdatePhoto, useDeletePhoto } from '../../hooks/usePhotos';
import { useCurrentUser } from '../../context/UserContext';
import { Modal, Button, EmptyState, Loading, InlineEdit } from '../ui';
import type { Photo } from '../../types';

interface PhotoGalleryProps {
  projectId: string;
}

export function PhotoGallery({ projectId }: PhotoGalleryProps) {
  const { photoId } = useParams<{ photoId?: string }>();
  const navigate = useNavigate();
  const { data: photos, isLoading } = usePhotos(projectId);
  const uploadPhoto = useUploadPhoto();
  const updatePhoto = useUpdatePhoto();
  const deletePhoto = useDeletePhoto();
  const { currentUser } = useCurrentUser();

  const [isUploading, setIsUploading] = useState(false);
  const [uploadCaption, setUploadCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get selected photo from URL
  const selectedPhoto = photoId ? photos?.find(p => p.id === photoId) || null : null;

  const setSelectedPhoto = (photo: Photo | null) => {
    if (photo) {
      navigate(`/projects/${projectId}/photos/${photo.id}`);
    } else {
      navigate(`/projects/${projectId}`);
    }
  };

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
      {/* Upload Section - only show when signed in */}
      {currentUser && (
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
          <Button
            variant="secondary"
            icon={<Upload size={16} />}
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload Photo'}
          </Button>
        </div>
      )}

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
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  backgroundColor: 'var(--color-stone-100)',
                  marginBottom: '8px',
                }}
              >
                <img
                  src={photo.url}
                  alt={photo.caption || photo.filename}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'var(--color-stone-700)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {photo.filename}
              </div>
              {photo.caption && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--color-stone-500)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<ImageIcon size={32} />}
          title="No photos yet"
          description="Upload photos to document this project's progress"
        />
      )}

      {/* Photo Modal */}
      <Modal
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title={
          selectedPhoto ? (
            <InlineEdit
              value={selectedPhoto.filename}
              onSave={(filename) => updatePhoto.mutate({ id: selectedPhoto.id, data: { filename } })}
              required
              disabled={!currentUser}
              isPending={updatePhoto.isPending}
              variant="title"
            />
          ) : 'Photo'
        }
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
                src={selectedPhoto.url}
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

            {/* Caption */}
            <div style={{ marginBottom: '16px' }}>
              <InlineEdit
                value={selectedPhoto.caption || ''}
                onSave={(caption) => updatePhoto.mutate({ id: selectedPhoto.id, data: { caption: caption || undefined } })}
                placeholder={currentUser ? 'Click to add a caption...' : 'No caption'}
                disabled={!currentUser}
                isPending={updatePhoto.isPending}
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
                {selectedPhoto.size >= 1024 * 1024
                  ? `${(selectedPhoto.size / (1024 * 1024)).toFixed(1)} MB`
                  : `${(selectedPhoto.size / 1024).toFixed(1)} KB`}
              </div>
              {currentUser && (
                <Button
                  variant="ghost"
                  icon={<Trash2 size={16} />}
                  onClick={() => handleDelete(selectedPhoto)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
