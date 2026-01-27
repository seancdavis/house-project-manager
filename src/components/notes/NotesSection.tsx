import { useState } from 'react';
import { MessageSquare, Send, Edit2, Trash2, X, Check } from 'lucide-react';
import { useProjectNotes, useCreateNote, useUpdateNote, useDeleteNote } from '../../hooks/useNotes';
import { useCurrentUser } from '../../context/UserContext';
import { Button, Avatar, EmptyState, Loading } from '../ui';
import type { Note } from '../../types';

interface NotesSectionProps {
  projectId: string;
}

export function NotesSection({ projectId }: NotesSectionProps) {
  const { data: notes, isLoading } = useProjectNotes(projectId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const { currentUser } = useCurrentUser();

  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !currentUser) return;

    await createNote.mutateAsync({
      projectId,
      content: newNote.trim(),
      authorId: currentUser.id,
    });
    setNewNote('');
  };

  const handleEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editContent.trim()) return;
    await updateNote.mutateAsync({ id: editingId, content: editContent.trim() });
    setEditingId(null);
    setEditContent('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await deleteNote.mutateAsync(id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) return <Loading />;

  return (
    <div>
      {/* Add Note Form - only show when signed in */}
      {currentUser && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          <div
            style={{
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <Avatar
              initials={currentUser.initials}
              color={currentUser.color}
              size="sm"
            />
            <div style={{ flex: 1 }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid var(--color-stone-200)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.9375rem',
                  resize: 'vertical',
                  minHeight: '80px',
                  backgroundColor: 'white',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newNote.trim() || createNote.isPending}
                  icon={<Send size={14} />}
                >
                  Add Note
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* Notes List */}
      {notes && notes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notes.map(note => (
            <div
              key={note.id}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'var(--color-stone-50)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {note.author ? (
                <Avatar
                  initials={note.author.initials}
                  color={note.author.color}
                  size="sm"
                />
              ) : (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-stone-200)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <MessageSquare size={14} color="var(--color-stone-400)" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 500, marginRight: '8px' }}>
                      {note.author?.name || 'Anonymous'}
                    </span>
                    <span style={{ color: 'var(--color-stone-400)', fontSize: '0.8125rem' }}>
                      {formatDate(note.createdAt)}
                      {note.updatedAt !== note.createdAt && ' (edited)'}
                    </span>
                  </div>
                  {currentUser?.id === note.authorId && editingId !== note.id && (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleEdit(note)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: 'var(--color-stone-400)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: 'var(--color-stone-400)',
                          borderRadius: 'var(--radius-sm)',
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {editingId === note.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid var(--color-stone-200)',
                        borderRadius: 'var(--radius-sm)',
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.9375rem',
                        resize: 'vertical',
                        minHeight: '60px',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <Button
                        size="sm"
                        onClick={handleSaveEdit}
                        disabled={!editContent.trim() || updateNote.isPending}
                        icon={<Check size={14} />}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleCancelEdit}
                        icon={<X size={14} />}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p
                    style={{
                      color: 'var(--color-stone-700)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      margin: 0,
                    }}
                  >
                    {note.content}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<MessageSquare size={32} />}
          title="No notes yet"
          description="Add notes to track discussions and decisions about this project"
        />
      )}
    </div>
  );
}
