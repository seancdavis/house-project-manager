import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from '../hooks/useMembers';
import { useCurrentUser } from '../context/UserContext';
import { MemberForm } from '../components/members/MemberForm';
import { Card, Button, Avatar, TypeBadge, EmptyState, Modal, PageLoading, ReadOnlyBanner } from '../components/ui';
import type { Member, MemberInput } from '../types';

export function MembersPage() {
  const navigate = useNavigate();
  const { id: editingMemberId } = useParams<{ id: string }>();
  const { currentUser } = useCurrentUser();
  const { data: members, isLoading, error } = useMembers();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const [showNewForm, setShowNewForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canEdit = !!currentUser;
  const editingMember = editingMemberId ? members?.find(m => m.id === editingMemberId) : null;

  const openNewMemberModal = () => {
    setShowNewForm(true);
  };

  const closeNewMemberModal = () => {
    setShowNewForm(false);
  };

  const openEditModal = (member: Member) => {
    navigate(`/members/${member.id}`);
  };

  const closeEditModal = () => {
    setShowDeleteConfirm(false);
    navigate('/members');
  };

  const handleCreate = (data: MemberInput) => {
    createMember.mutate(data, {
      onSuccess: () => closeNewMemberModal(),
    });
  };

  const handleUpdate = (data: MemberInput) => {
    if (!editingMember) return;
    updateMember.mutate({ id: editingMember.id, data }, {
      onSuccess: () => closeEditModal(),
    });
  };

  const handleDelete = () => {
    if (!editingMember) return;
    deleteMember.mutate(editingMember.id, {
      onSuccess: () => closeEditModal(),
    });
  };

  if (isLoading) return <PageLoading />;
  if (error) return <div>Error: {error.message}</div>;

  const familyMembers = members?.filter(m => m.type === 'family') || [];
  const contractors = members?.filter(m => m.type === 'contractor') || [];

  return (
    <div className="animate-fade-in">
      <ReadOnlyBanner />

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
          <h1 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Members</h1>
          <p style={{ color: 'var(--color-stone-500)' }}>
            Manage family members and contractors
          </p>
        </div>
        {canEdit && (
          <Button onClick={openNewMemberModal} icon={<Plus size={18} />}>
            Add Member
          </Button>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showNewForm} onClose={closeNewMemberModal} title="New Member" size="md">
        <MemberForm onSubmit={handleCreate} onCancel={closeNewMemberModal} />
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editingMember && canEdit} onClose={closeEditModal} title="Edit Member" size="md">
        {editingMember && (
          <>
            <MemberForm
              member={editingMember}
              onSubmit={handleUpdate}
              onCancel={closeEditModal}
            />
            <div
              style={{
                marginTop: '24px',
                paddingTop: '24px',
                borderTop: '1px solid var(--color-stone-200)',
              }}
            >
              {showDeleteConfirm ? (
                <div>
                  <p style={{ marginBottom: '16px', color: 'var(--color-stone-600)', fontSize: '0.875rem' }}>
                    Are you sure you want to delete <strong>{editingMember.name}</strong>? This action cannot be undone.
                  </p>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Button variant="danger" size="sm" onClick={handleDelete}>
                      Yes, Delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{ color: 'var(--color-warning)' }}
                >
                  Delete Member
                </Button>
              )}
            </div>
          </>
        )}
      </Modal>

      {/* Empty State */}
      {members?.length === 0 && (
        <Card>
          <EmptyState
            icon={<Users size={24} />}
            title="No members yet"
            description="Add family members and contractors to assign them to projects"
            action={canEdit ? (
              <Button size="sm" onClick={openNewMemberModal} icon={<Plus size={16} />}>
                Add Member
              </Button>
            ) : null}
          />
        </Card>
      )}

      {/* Family Members */}
      {familyMembers.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '12px', fontWeight: 600 }}>
            Family Members
            <span
              style={{
                marginLeft: '8px',
                fontSize: '0.875rem',
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {familyMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={canEdit ? () => openEditModal(member) : undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* Contractors */}
      {contractors.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '12px', fontWeight: 600 }}>
            Contractors
            <span
              style={{
                marginLeft: '8px',
                fontSize: '0.875rem',
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
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {contractors.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onClick={canEdit ? () => openEditModal(member) : undefined}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MemberCardProps {
  member: Member;
  onClick?: () => void;
}

function MemberCard({ member, onClick }: MemberCardProps) {
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <Avatar initials={member.initials} color={member.color} size="md" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3
          style={{
            fontSize: '0.9375rem',
            fontWeight: 500,
            margin: 0,
            marginBottom: '4px',
            color: 'var(--color-stone-900)',
          }}
        >
          {member.name}
        </h3>
        <TypeBadge type={member.type} />
      </div>
    </div>
  );

  if (onClick) {
    return (
      <Card padding="sm">
        <button
          onClick={onClick}
          style={{
            display: 'block',
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            padding: '4px',
          }}
        >
          {content}
        </button>
      </Card>
    );
  }

  return (
    <Card padding="sm">
      <div style={{ padding: '4px' }}>{content}</div>
    </Card>
  );
}
