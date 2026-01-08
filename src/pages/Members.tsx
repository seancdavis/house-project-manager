import { useState } from 'react';
import { useMembers, useCreateMember, useUpdateMember, useDeleteMember } from '../hooks/useMembers';
import { MemberForm } from '../components/members/MemberForm';
import type { Member, MemberInput } from '../types';

export function MembersPage() {
  const { data: members, isLoading, error } = useMembers();
  const createMember = useCreateMember();
  const updateMember = useUpdateMember();
  const deleteMember = useDeleteMember();

  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

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

  const handleDelete = (id: string) => {
    if (confirm('Delete this member?')) {
      deleteMember.mutate(id);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>Members</h1>
        <button onClick={() => setShowForm(true)} style={{ padding: '0.5rem 1rem' }}>
          Add Member
        </button>
      </div>

      {showForm && (
        <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h2>New Member</h2>
          <MemberForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingMember && (
        <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc' }}>
          <h2>Edit Member</h2>
          <MemberForm member={editingMember} onSubmit={handleUpdate} onCancel={() => setEditingMember(null)} />
        </div>
      )}

      <div>
        {members?.length === 0 && <p>No members yet. Add one to get started.</p>}
        {members?.map(member => (
          <div
            key={member.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.75rem',
              borderBottom: '1px solid #eee',
            }}
          >
            <div
              style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: member.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {member.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold' }}>{member.name}</div>
              <div style={{ fontSize: '0.875rem', color: '#666' }}>
                {member.type === 'family' ? 'Family' : 'Contractor'}
              </div>
            </div>
            <button onClick={() => setEditingMember(member)} style={{ padding: '0.25rem 0.5rem' }}>
              Edit
            </button>
            <button onClick={() => handleDelete(member.id)} style={{ padding: '0.25rem 0.5rem' }}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
