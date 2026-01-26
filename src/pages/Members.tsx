import { useState } from 'react';
import { Plus, Users, Edit2, Trash2 } from 'lucide-react';
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from '../hooks/useMembers';
import { MemberForm } from '../components/members/MemberForm';
import { Card, Button, Avatar, TypeBadge, EmptyState, Modal, PageLoading, RequireAuthButton } from '../components/ui';
import type { Member, MemberInput } from '../types';

export function MembersPage() {
  const { data: members, isLoading, error } = useMembers();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [deletingMember, setDeletingMember] = useState<Member | null>(null);

  const handleCreate = (data: MemberInput) => {
    createMember.mutate(data, {
      onSuccess: () => setShowForm(false),
    });
  };

  const handleUpdate = (data: MemberInput) => {
    if (!editingMember) return;
    updateMember.mutate({ id: editingMember.id, data }, {
      onSuccess: () => setEditingMember(null),
    });
  };

  const handleDelete = () => {
    if (!deletingMember) return;
    deleteMember.mutate(deletingMember.id, {
      onSuccess: () => setDeletingMember(null),
    });
  };

  if (isLoading) return <PageLoading />;
  if (error) return <div>Error: {error.message}</div>;

  const familyMembers = members?.filter(m => m.type === 'family') || [];
  const contractors = members?.filter(m => m.type === 'contractor') || [];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '32px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Members</h1>
          <p style={{ color: 'var(--color-stone-500)', fontSize: '1.0625rem' }}>
            Manage family members and contractors
          </p>
        </div>
        <RequireAuthButton onClick={() => setShowForm(true)} icon={<Plus size={18} />}>
          Add Member
        </RequireAuthButton>
      </div>

      {/* Create Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="New Member" size="md">
        <MemberForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingMember} onClose={() => setEditingMember(null)} title="Edit Member" size="md">
        {editingMember && (
          <MemberForm member={editingMember} onSubmit={handleUpdate} onCancel={() => setEditingMember(null)} />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!deletingMember} onClose={() => setDeletingMember(null)} title="Delete Member" size="sm">
        <p style={{ marginBottom: '24px', color: 'var(--color-stone-600)' }}>
          Are you sure you want to delete <strong>{deletingMember?.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setDeletingMember(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Member
          </Button>
        </div>
      </Modal>

      {/* Empty State */}
      {members?.length === 0 && (
        <Card>
          <EmptyState
            icon={<Users size={28} />}
            title="No members yet"
            description="Add family members and contractors to assign them to projects"
            action={
              <RequireAuthButton onClick={() => setShowForm(true)} icon={<Plus size={16} />}>
                Add Member
              </RequireAuthButton>
            }
          />
        </Card>
      )}

      {/* Family Members */}
      {familyMembers.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
            Family Members
            <span
              style={{
                marginLeft: '10px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-stone-400)',
                fontWeight: 400,
              }}
            >
              {familyMembers.length}
            </span>
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {familyMembers.map((member, index) => (
              <div key={member.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-in-up">
                <MemberCard
                  member={member}
                  onEdit={() => setEditingMember(member)}
                  onDelete={() => setDeletingMember(member)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contractors */}
      {contractors.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>
            Contractors
            <span
              style={{
                marginLeft: '10px',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-body)',
                color: 'var(--color-stone-400)',
                fontWeight: 400,
              }}
            >
              {contractors.length}
            </span>
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
            }}
          >
            {contractors.map((member, index) => (
              <div key={member.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-in-up">
                <MemberCard
                  member={member}
                  onEdit={() => setEditingMember(member)}
                  onDelete={() => setDeletingMember(member)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MemberCardProps {
  member: Member;
  onEdit: () => void;
  onDelete: () => void;
}

function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  return (
    <Card hover>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Avatar initials={member.initials} color={member.color} size="lg" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: '1.0625rem',
              fontFamily: 'var(--font-display)',
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {member.name}
          </h3>
          <TypeBadge type={member.type} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button variant="ghost" size="sm" onClick={onEdit} style={{ padding: '8px' }}>
            <Edit2 size={16} />
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} style={{ padding: '8px' }}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </Card>
  );
}
