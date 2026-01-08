import { useMembers } from '../../hooks/useMembers';
import { useCurrentUser } from '../../context/UserContext';

export function UserPicker() {
  const { data: members, isLoading } = useMembers();
  const { currentUser, setCurrentUser } = useCurrentUser();

  if (isLoading) return <span>Loading...</span>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <select
        value={currentUser?.id || ''}
        onChange={(e) => {
          const member = members?.find(m => m.id === e.target.value);
          setCurrentUser(member || null);
        }}
        style={{ padding: '0.25rem' }}
      >
        <option value="">Select user...</option>
        {members?.filter(m => m.type === 'family').map(member => (
          <option key={member.id} value={member.id}>
            {member.name}
          </option>
        ))}
      </select>
      {currentUser && (
        <div
          style={{
            width: '1.5rem',
            height: '1.5rem',
            borderRadius: '50%',
            backgroundColor: currentUser.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          {currentUser.initials}
        </div>
      )}
    </div>
  );
}
