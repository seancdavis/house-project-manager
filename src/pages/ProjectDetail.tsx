import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Calendar, User, Wrench, DollarSign, Flag, Tag } from 'lucide-react';
import { useProject, useUpdateProject, useDeleteProject } from '../hooks/useProjects';
import { useMembers } from '../hooks/useMembers';
import { ProjectForm } from '../components/projects/ProjectForm';
import { TaskList } from '../components/tasks/TaskList';
import { Card, Button, StatusBadge, TypeBadge, PriorityBadge, Badge, Avatar, Modal, PageLoading, RequireAuthButton } from '../components/ui';
import type { ProjectInput } from '../types';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error } = useProject(id!);
  const { data: members } = useMembers();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (isLoading) return <PageLoading />;
  if (error) return <div>Error: {error.message}</div>;
  if (!project) return <div>Project not found</div>;

  const owner = members?.find(m => m.id === project.ownerId);
  const implementer = members?.find(m => m.id === project.implementerId);

  const handleUpdate = (data: ProjectInput) => {
    updateProject.mutate({ id: project.id, data }, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleDelete = () => {
    deleteProject.mutate(project.id, {
      onSuccess: () => navigate('/projects'),
    });
  };

  return (
    <div className="animate-fade-in">
      {/* Back link */}
      <Link
        to="/projects"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-stone-500)',
          textDecoration: 'none',
          fontSize: '0.9375rem',
          marginBottom: '24px',
          transition: 'color var(--transition-fast)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-stone-700)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-stone-500)'}
      >
        <ArrowLeft size={18} />
        Back to Projects
      </Link>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '1.75rem', margin: 0 }}>{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <TypeBadge type={project.type} />
            <PriorityBadge priority={project.priority} />
            {project.tags && project.tags.length > 0 && (
              <>
                {project.tags.map(tag => (
                  <Badge key={tag.id} variant="default">
                    <Tag size={12} style={{ marginRight: '4px' }} />
                    {tag.name}
                  </Badge>
                ))}
              </>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <RequireAuthButton variant="secondary" onClick={() => setIsEditing(true)} icon={<Edit2 size={16} />}>
            Edit
          </RequireAuthButton>
          <RequireAuthButton variant="ghost" onClick={() => setShowDeleteConfirm(true)} icon={<Trash2 size={16} />}>
            Delete
          </RequireAuthButton>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Edit Project" size="md">
        <ProjectForm project={project} onSubmit={handleUpdate} onCancel={() => setIsEditing(false)} />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Project" size="sm">
        <p style={{ marginBottom: '24px', color: 'var(--color-stone-600)' }}>
          Are you sure you want to delete this project? This will also delete all tasks associated with it. This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete Project
          </Button>
        </div>
      </Modal>

      {/* Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '24px',
        }}
      >
        {/* Main Content */}
        <div>
          {/* Description */}
          {project.description && (
            <Card style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--color-stone-700)' }}>
                Description
              </h3>
              <p style={{ color: 'var(--color-stone-600)', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {project.description}
              </p>
            </Card>
          )}

          {/* Tasks */}
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--color-stone-700)' }}>
              Tasks
            </h3>
            <TaskList projectId={project.id} />
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <h3 style={{ fontSize: '1rem', marginBottom: '20px', color: 'var(--color-stone-700)' }}>
              Details
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Owner */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--color-stone-500)',
                    marginBottom: '8px',
                  }}
                >
                  <User size={14} />
                  Owner
                </div>
                {owner ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar initials={owner.initials} color={owner.color} size="sm" />
                    <span style={{ fontWeight: 500 }}>{owner.name}</span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--color-stone-400)' }}>Unassigned</span>
                )}
              </div>

              {/* Implementer */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--color-stone-500)',
                    marginBottom: '8px',
                  }}
                >
                  <Wrench size={14} />
                  Implementer
                </div>
                {implementer ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Avatar initials={implementer.initials} color={implementer.color} size="sm" />
                    <span style={{ fontWeight: 500 }}>{implementer.name}</span>
                  </div>
                ) : (
                  <span style={{ color: 'var(--color-stone-400)' }}>Unassigned</span>
                )}
              </div>

              {/* Target Date */}
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8125rem',
                    color: 'var(--color-stone-500)',
                    marginBottom: '8px',
                  }}
                >
                  <Calendar size={14} />
                  Target Date
                </div>
                {project.targetDate ? (
                  <span style={{ fontWeight: 500 }}>
                    {new Date(project.targetDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                ) : (
                  <span style={{ color: 'var(--color-stone-400)' }}>Not set</span>
                )}
              </div>

              {/* Budget */}
              {(project.estimatedBudget !== null || project.actualBudget !== null) && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8125rem',
                      color: 'var(--color-stone-500)',
                      marginBottom: '8px',
                    }}
                  >
                    <DollarSign size={14} />
                    Budget
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {project.estimatedBudget !== null && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-stone-500)' }}>Estimated:</span>
                        <span style={{ fontWeight: 500 }}>
                          ${(project.estimatedBudget / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {project.actualBudget !== null && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--color-stone-500)' }}>Actual:</span>
                        <span style={{ fontWeight: 500 }}>
                          ${(project.actualBudget / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Priority */}
              {project.priority && (
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.8125rem',
                      color: 'var(--color-stone-500)',
                      marginBottom: '8px',
                    }}
                  >
                    <Flag size={14} />
                    Priority
                  </div>
                  <PriorityBadge priority={project.priority} />
                </div>
              )}

              {/* Timestamps */}
              <div
                style={{
                  paddingTop: '16px',
                  borderTop: '1px solid var(--color-stone-100)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-stone-400)',
                }}
              >
                <div style={{ marginBottom: '4px' }}>
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
                {project.completedAt && (
                  <div>
                    Completed {new Date(project.completedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
