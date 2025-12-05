import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import SEO from '../../components/SEO';
import { 
  Folder, CheckCircle, Clock, AlertCircle, 
  FileText, Scale, DollarSign, Heart, 
  Server, Globe, Activity
} from 'lucide-react';

/**
 * Founder Control Center v1.0
 * 
 * Internal dashboard for founder to track:
 * - Active builds & phases
 * - Neo handoffs & specs
 * - Legal/money tasks
 * - Health reminders
 * - System status
 * 
 * Route: /founder/command
 * Access: Founder only (hard-coded for now)
 */

// Static data configuration
const ACTIVE_BUILDS = [
  {
    id: 1,
    title: "BGLIS v1.0 – Phone-First Auth",
    status: "in_progress",
    owner: "Neo",
    notes: "Backend foundation complete, UI flows next",
    link_to_spec: "#bglis-spec"
  },
  {
    id: 2,
    title: "Business Directory v2.1 – Hero Images",
    status: "complete",
    owner: "Neo",
    notes: "Black-centered imagery with proper framing",
    link_to_spec: "#bd-spec"
  },
  {
    id: 3,
    title: "Navigation v2 – Global Redesign",
    status: "in_progress",
    owner: "Neo",
    notes: "Preview ready for review at /founder/nav-v2-preview",
    link_to_spec: "/founder/nav-v2-preview"
  },
  {
    id: 4,
    title: "Notifications 8.6 – Real-time UI",
    status: "in_progress",
    owner: "Neo",
    notes: "Backend complete, UI implementation pending",
    link_to_spec: "#notif-spec"
  }
];

const NEO_HANDOFFS = [
  {
    id: 1,
    spec_name: "BGLIS v1.0 – Unified Auth Upgrade",
    status: "in_progress",
    handed_off: "2025-12-05",
    notes: "Phone-first global identity system"
  },
  {
    id: 2,
    spec_name: "Business Directory v2 – Redesign",
    status: "done",
    handed_off: "2025-12-04",
    notes: "NEO SPEC compliance verified"
  },
  {
    id: 3,
    spec_name: "Hero Image Fix – Representation",
    status: "done",
    handed_off: "2025-12-05",
    notes: "Black-centered, properly framed images"
  },
  {
    id: 4,
    spec_name: "Navigation v2 – Master Nav System",
    status: "waiting",
    handed_off: "2025-12-04",
    notes: "Blocked on BGLIS completion"
  }
];

const LEGAL_MONEY_TASKS = [
  {
    id: 1,
    task: "Dena Motors add-on cancellations & refunds",
    status: "pending",
    due_date: "Q1 2026",
    notes: "Follow up with service provider"
  },
  {
    id: 2,
    task: "Lentegrity / tradeline deletion",
    status: "in_progress",
    due_date: "Ongoing",
    notes: "Check follow-up date"
  },
  {
    id: 3,
    task: "LLC / EIN – BANIBS LLC setup",
    status: "not_started",
    due_date: "Q1 2026",
    notes: "Research Delaware vs Wyoming"
  },
  {
    id: 4,
    task: "Domain & trademark registration",
    status: "complete",
    due_date: "Complete",
    notes: "banibs.com secured"
  }
];

const SYSTEM_STATUS = [
  {
    id: 1,
    system: "BANIBS Frontend",
    status: "online",
    environment: "Development",
    notes: "Emergent platform"
  },
  {
    id: 2,
    system: "BGLIS v1.0",
    status: "in_progress",
    environment: "Development",
    notes: "Backend models & OTP system complete"
  },
  {
    id: 3,
    system: "Domain (banibs.com)",
    status: "online",
    environment: "Production",
    notes: "Configured & live"
  },
  {
    id: 4,
    system: "MongoDB",
    status: "online",
    environment: "Production",
    notes: "banibs_db operational"
  }
];

const FounderControlCenter = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [currentDate] = useState(new Date());
  
  // Access control - founder only (hard-coded for now)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/signin?redirect=/founder/command');
      return;
    }
    
    // TODO: Add proper founder role check
    // For now, allow access to any authenticated user in dev
    const isFounder = user?.email === 'founder@banibs.com' || 
                      user?.roles?.includes('super_admin') ||
                      process.env.NODE_ENV === 'development';
    
    if (!isFounder && process.env.NODE_ENV !== 'development') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);
  
  // Status badge helper
  const StatusBadge = ({ status }) => {
    const configs = {
      complete: { 
        label: 'Complete', 
        color: '#10B981',
        bg: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)',
        icon: CheckCircle 
      },
      done: { 
        label: 'Done', 
        color: '#10B981',
        bg: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)',
        icon: CheckCircle 
      },
      in_progress: { 
        label: 'In Progress', 
        color: '#C8A857',
        bg: isDark ? 'rgba(200, 168, 87, 0.1)' : 'rgba(200, 168, 87, 0.15)',
        icon: Clock 
      },
      planned: { 
        label: 'Planned', 
        color: '#6366F1',
        bg: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.15)',
        icon: Folder 
      },
      waiting: { 
        label: 'Waiting', 
        color: '#9CA3AF',
        bg: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.15)',
        icon: Clock 
      },
      not_started: { 
        label: 'Not Started', 
        color: '#9CA3AF',
        bg: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(156, 163, 175, 0.15)',
        icon: AlertCircle 
      },
      pending: { 
        label: 'Pending', 
        color: '#F59E0B',
        bg: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.15)',
        icon: Clock 
      },
      online: { 
        label: 'Online', 
        color: '#10B981',
        bg: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)',
        icon: CheckCircle 
      }
    };
    
    const config = configs[status] || configs.not_started;
    const Icon = config.icon;
    
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        borderRadius: '6px',
        backgroundColor: config.bg,
        border: `1px solid ${config.color}40`,
        fontSize: '13px',
        fontWeight: '500',
        color: config.color
      }}>
        <Icon size={14} />
        {config.label}
      </div>
    );
  };
  
  // Card component
  const Card = ({ title, icon: Icon, children, className = '' }) => (
    <div style={{
      backgroundColor: isDark ? '#161616' : '#FFFFFF',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '24px'
    }} className={className}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
      }}>
        <Icon size={24} style={{ color: '#C8A857' }} />
        <h3 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: isDark ? '#F7F7F7' : '#111217',
          margin: 0
        }}>
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
  
  return (
    <FullWidthLayout>
      <SEO
        title="Founder Control Center"
        description="BANIBS internal command dashboard"
      />
      
      <div style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7',
        padding: '32px 24px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              color: isDark ? '#F7F7F7' : '#111217',
              marginBottom: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Activity size={32} style={{ color: '#C8A857' }} />
              Founder Control Center
            </h1>
            <p style={{
              fontSize: '16px',
              color: isDark ? '#B3B3C2' : '#4A4B57',
              marginBottom: '8px'
            }}>
              All systems at a glance.
            </p>
            <p style={{
              fontSize: '14px',
              color: isDark ? '#6B7280' : '#9CA3AF'
            }}>
              {currentDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          {/* Two-column layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px'
          }}>
            {/* Left Column - Projects & Build Status */}
            <div>
              {/* Active Builds */}
              <Card title="Active Builds & Phases" icon={Folder}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {ACTIVE_BUILDS.map(build => (
                    <div key={build.id} style={{
                      padding: '16px',
                      backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <h4 style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: isDark ? '#F7F7F7' : '#111217',
                          margin: 0,
                          flex: 1
                        }}>
                          {build.title}
                        </h4>
                        <StatusBadge status={build.status} />
                      </div>
                      <p style={{
                        fontSize: '13px',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        marginBottom: '8px'
                      }}>
                        Owner: {build.owner}
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: isDark ? '#B3B3C2' : '#4A4B57',
                        marginBottom: 0
                      }}>
                        {build.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Neo Handoffs */}
              <Card title="Neo Handoffs" icon={FileText}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {NEO_HANDOFFS.map(handoff => (
                    <div key={handoff.id} style={{
                      padding: '16px',
                      backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <h4 style={{
                          fontSize: '15px',
                          fontWeight: '600',
                          color: isDark ? '#F7F7F7' : '#111217',
                          margin: 0,
                          flex: 1
                        }}>
                          {handoff.spec_name}
                        </h4>
                        <StatusBadge status={handoff.status} />
                      </div>
                      <p style={{
                        fontSize: '13px',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        marginBottom: '4px'
                      }}>
                        Handed off: {handoff.handed_off}
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: isDark ? '#B3B3C2' : '#4A4B57',
                        marginBottom: 0
                      }}>
                        {handoff.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            
            {/* Right Column - Life / Legal / Health */}
            <div>
              {/* Legal & Money Tasks */}
              <Card title="Legal & Money Tasks" icon={Scale}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {LEGAL_MONEY_TASKS.map(task => (
                    <div key={task.id} style={{
                      padding: '16px',
                      backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <h4 style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isDark ? '#F7F7F7' : '#111217',
                          margin: 0,
                          flex: 1
                        }}>
                          {task.task}
                        </h4>
                        <StatusBadge status={task.status} />
                      </div>
                      <p style={{
                        fontSize: '13px',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        marginBottom: '4px'
                      }}>
                        Due: {task.due_date}
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: isDark ? '#B3B3C2' : '#4A4B57',
                        marginBottom: 0
                      }}>
                        {task.notes}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
              
              {/* Health & Rest */}
              <Card title="Health & Rest" icon={Heart}>
                <div style={{
                  padding: '20px',
                  backgroundColor: isDark ? '#1C1C1C' : '#FEF3C7',
                  borderRadius: '8px',
                  border: `2px solid ${isDark ? 'rgba(251, 191, 36, 0.2)' : 'rgba(251, 191, 36, 0.3)'}`
                }}>
                  <p style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: isDark ? '#FCD34D' : '#B45309',
                    marginBottom: '12px'
                  }}>
                    ⚠️ Health Reminder
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: isDark ? '#FDE68A' : '#92400E',
                    marginBottom: '12px',
                    lineHeight: '1.6'
                  }}>
                    Diabetes + Kidney-safe choices only.
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: isDark ? '#B3B3C2' : '#4A4B57',
                    marginBottom: '12px',
                    lineHeight: '1.6'
                  }}>
                    <strong>Today's rest focus:</strong> Medium load
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: isDark ? '#9CA3AF' : '#6B7280',
                    marginBottom: 0,
                    fontStyle: 'italic'
                  }}>
                    Note: Avoid new heavy specs after midnight.
                  </p>
                </div>
              </Card>
              
              {/* System Status */}
              <Card title="System Status (BANIBS)" icon={Server}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {SYSTEM_STATUS.map(system => (
                    <div key={system.id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isDark ? '#F7F7F7' : '#111217',
                          marginBottom: '4px'
                        }}>
                          {system.system}
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          marginBottom: 0
                        }}>
                          {system.environment} • {system.notes}
                        </p>
                      </div>
                      <StatusBadge status={system.status} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default FounderControlCenter;
