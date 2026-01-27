import { Link } from 'react-router-dom';
import { FolderKanban, Clock, CheckCircle2, AlertCircle, Plus, Users, ArrowRight, Activity } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useMembers } from '../hooks/useMembers';
import { ProjectCard } from '../components/projects/ProjectCard';
import { ActivityFeed } from '../components/activities/ActivityFeed';
import { useCurrentUser } from '../context/UserContext';
import { Card, Button, EmptyState, PageLoading } from '../components/ui';

export function DashboardPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { currentUser } = useCurrentUser();

  if (projectsLoading || membersLoading) return <PageLoading />;

  const activeProjects = projects?.filter(p => p.status !== 'completed') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];
  const inProgressProjects = activeProjects.filter(p => p.status === 'in_progress');
  const onHoldProjects = activeProjects.filter(p => p.status === 'on_hold');

  const myProjects = currentUser
    ? activeProjects.filter(p => p.ownerId === currentUser.id)
    : [];

  const familyMembers = members?.filter(m => m.type === 'family') || [];

  const stats = [
    {
      label: 'Active Projects',
      value: activeProjects.length,
      icon: FolderKanban,
      color: 'var(--color-primary-500)',
      bgColor: 'var(--color-primary-50)',
      link: '/projects',
    },
    {
      label: 'In Progress',
      value: inProgressProjects.length,
      icon: Clock,
      color: 'var(--color-info)',
      bgColor: 'var(--color-info-light)',
      link: '/projects?status=in_progress',
    },
    {
      label: 'On Hold',
      value: onHoldProjects.length,
      icon: AlertCircle,
      color: 'var(--color-warning)',
      bgColor: 'var(--color-warning-light)',
      link: '/projects?status=on_hold',
    },
    {
      label: 'Completed',
      value: completedProjects.length,
      icon: CheckCircle2,
      color: 'var(--color-success)',
      bgColor: 'var(--color-success-light)',
      link: '/projects?status=completed',
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>
          {currentUser ? `Welcome back, ${currentUser.name.split(' ')[0]}` : 'Dashboard'}
        </h1>
        <p style={{ color: 'var(--color-stone-500)', fontSize: '1.0625rem' }}>
          Track and manage your home improvement projects
        </p>
      </div>

      {/* Alerts */}
      {!currentUser && familyMembers.length > 0 && (
        <Card
          style={{
            marginBottom: '24px',
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} color="var(--color-primary-600)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, color: 'var(--color-stone-800)', marginBottom: '2px' }}>
                Sign in to see your projects
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-stone-600)' }}>
                Select yourself from the sidebar to view personalized content
              </p>
            </div>
            <Link to="/login">
              <Button size="sm">Sign In</Button>
            </Link>
          </div>
        </Card>
      )}

      {familyMembers.length === 0 && (
        <Card
          style={{
            marginBottom: '24px',
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-100)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={20} color="var(--color-primary-600)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, color: 'var(--color-stone-800)', marginBottom: '2px' }}>
                Get started by adding family members
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-stone-600)' }}>
                Add people who will be working on projects around the house
              </p>
            </div>
            <Link to="/members">
              <Button size="sm" icon={<Plus size={16} />}>Add Members</Button>
            </Link>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '32px' }}>
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} to={stat.link} style={{ textDecoration: 'none' }}>
              <Card padding="md" hover>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{
                      fontSize: '0.875rem',
                      color: 'var(--color-stone-500)',
                      marginBottom: '8px',
                    }}>
                      {stat.label}
                    </p>
                    <p style={{
                      fontSize: '2rem',
                      fontWeight: 600,
                      color: 'var(--color-stone-900)',
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1,
                    }}>
                      {stat.value}
                    </p>
                  </div>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: stat.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} color={stat.color} />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className={`content-grid ${currentUser && myProjects.length > 0 ? 'two-col' : ''}`}>
        {/* My Projects */}
        {currentUser && myProjects.length > 0 && (
          <div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}>
              <h2 style={{ fontSize: '1.25rem' }}>My Projects</h2>
              <Link
                to="/projects"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  color: 'var(--color-primary-600)',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myProjects.slice(0, 4).map((project, index) => (
                <div key={project.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-in-up">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* In Progress */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <h2 style={{ fontSize: '1.25rem' }}>In Progress</h2>
            <Link
              to="/projects"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--color-primary-600)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>
          {inProgressProjects.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {inProgressProjects.slice(0, 4).map((project, index) => (
                <div key={project.id} style={{ animationDelay: `${index * 50}ms` }} className="animate-slide-in-up">
                  <ProjectCard project={project} />
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={<Clock size={28} />}
                title="No projects in progress"
                description="Start working on a project to see it here"
                action={
                  <Link to="/projects">
                    <Button size="sm" icon={<Plus size={16} />}>New Project</Button>
                  </Link>
                }
              />
            </Card>
          )}
        </div>
      </div>

      {/* Empty state when no projects */}
      {activeProjects.length === 0 && completedProjects.length === 0 && familyMembers.length > 0 && (
        <Card style={{ marginTop: '24px' }}>
          <EmptyState
            icon={<FolderKanban size={28} />}
            title="No projects yet"
            description="Create your first project to start tracking your home improvements"
            action={
              <Link to="/projects">
                <Button icon={<Plus size={16} />}>Create Project</Button>
              </Link>
            }
          />
        </Card>
      )}

      {/* Activity Feed */}
      <div style={{ marginTop: '40px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px',
        }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-50)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Activity size={18} color="var(--color-primary-600)" />
          </div>
          <h2 style={{ fontSize: '1.25rem' }}>Recent Activity</h2>
        </div>
        <Card>
          <ActivityFeed limit={15} />
        </Card>
      </div>
    </div>
  );
}
