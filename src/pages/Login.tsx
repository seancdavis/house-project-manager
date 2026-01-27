import { useNavigate } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import { useMembers } from '../hooks/useMembers';
import { useCurrentUser } from '../context/UserContext';
import { Card, Avatar, PageLoading } from '../components/ui';
import type { Member } from '../types';

export function LoginPage() {
  const navigate = useNavigate();
  const { data: members, isLoading } = useMembers();
  const { setCurrentUser } = useCurrentUser();

  const handleSelectMember = (member: Member) => {
    setCurrentUser(member);
    navigate('/');
  };

  if (isLoading) return <PageLoading />;

  const familyMembers = members?.filter(m => m.type === 'family') || [];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-cream)',
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
        }}
        className="animate-fade-in"
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <Home size={32} color="white" />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: 'var(--color-stone-900)',
              marginBottom: '8px',
            }}
          >
            House Projects
          </h1>
          <p
            style={{
              color: 'var(--color-stone-500)',
              textAlign: 'center',
            }}
          >
            Select your profile to continue
          </p>
        </div>

        {/* Member Selection */}
        <Card>
          {familyMembers.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '24px',
              }}
            >
              <p style={{ color: 'var(--color-stone-600)', marginBottom: '16px' }}>
                No family members found. Add members to get started.
              </p>
              <button
                onClick={() => navigate('/members')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary-600)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  fontSize: '0.9375rem',
                }}
              >
                Add Members
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {familyMembers.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => handleSelectMember(member)}
                  className="animate-slide-in-up"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-stone-100)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    textAlign: 'left',
                    width: '100%',
                    animationDelay: `${index * 50}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-stone-50)';
                    e.currentTarget.style.borderColor = 'var(--color-stone-200)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--color-stone-100)';
                  }}
                >
                  <Avatar initials={member.initials} color={member.color} size="md" />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: 500,
                        color: 'var(--color-stone-800)',
                        marginBottom: '2px',
                      }}
                    >
                      {member.name}
                    </div>
                    <div
                      style={{
                        fontSize: '0.8125rem',
                        color: 'var(--color-stone-500)',
                      }}
                    >
                      Family Member
                    </div>
                  </div>
                  <ArrowRight size={20} color="var(--color-stone-300)" />
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Skip Link */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '24px',
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-stone-500)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-stone-700)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-stone-500)'}
          >
            Continue as guest
          </button>
        </div>
      </div>
    </div>
  );
}
