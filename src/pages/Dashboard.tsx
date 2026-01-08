import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useMembers } from '../hooks/useMembers';
import { ProjectCard } from '../components/projects/ProjectCard';
import { useCurrentUser } from '../context/UserContext';

export function DashboardPage() {
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: members, isLoading: membersLoading } = useMembers();
  const { currentUser } = useCurrentUser();

  if (projectsLoading || membersLoading) return <div>Loading...</div>;

  const activeProjects = projects?.filter(p => p.status !== 'completed') || [];
  const completedProjects = projects?.filter(p => p.status === 'completed') || [];

  const myProjects = currentUser
    ? activeProjects.filter(p => p.ownerId === currentUser.id)
    : [];

  const inProgressProjects = activeProjects.filter(p => p.status === 'in_progress');

  return (
    <div>
      <h1>Dashboard</h1>

      {!currentUser && members && members.filter(m => m.type === 'family').length > 0 && (
        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', marginBottom: '1rem', borderRadius: '4px' }}>
          Select yourself from the dropdown above to see your projects.
        </div>
      )}

      {members?.filter(m => m.type === 'family').length === 0 && (
        <div style={{ padding: '1rem', backgroundColor: '#fef3c7', marginBottom: '1rem', borderRadius: '4px' }}>
          <Link to="/members">Add family members</Link> to get started.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{activeProjects.length}</div>
          <div style={{ color: '#666' }}>Active Projects</div>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{inProgressProjects.length}</div>
          <div style={{ color: '#666' }}>In Progress</div>
        </div>
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{completedProjects.length}</div>
          <div style={{ color: '#666' }}>Completed</div>
        </div>
      </div>

      {currentUser && myProjects.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>My Projects ({myProjects.length})</h2>
          {myProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {inProgressProjects.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2>In Progress ({inProgressProjects.length})</h2>
          {inProgressProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {activeProjects.length === 0 && (
        <div style={{ marginTop: '1rem' }}>
          <p>No active projects.</p>
          <Link to="/projects">Create your first project</Link>
        </div>
      )}
    </div>
  );
}
