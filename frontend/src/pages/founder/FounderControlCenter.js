import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import SEO from '../../components/SEO';
import { 
  Folder, CheckCircle, Clock, AlertCircle, 
  FileText, Scale, DollarSign, Heart, 
  Server, Globe, Activity, Map, Search,
  ExternalLink, Lock, Users, Zap, Settings,
  Wrench, Lightbulb, Code, Video, Mic,
  UserCircle, BookOpen, Calendar, Shield,
  Radar, Play, Pause, Trash2, Edit3, Plus,
  GripVertical, ArrowRight, Crown, Star,
  ThumbsUp, Check, User, Ban, BookMarked
} from 'lucide-react';
import { getEnabledModules, getUpcomingModules } from '../../config/moduleRegistry';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Founder Control Center v1.0
 * 
 * Internal dashboard for founder to track:
 * - Active builds & phases
 * - Neo handoffs & specs
 * - Legal/money tasks
 * - Health reminders
 * - System status
 * - System Map (3-tier view)
 * 
 * Route: /founder/command
 * Access: Founder only (super_admin role)
 */

// System/Internal Modules - NOT in moduleRegistry (static list)
const INTERNAL_MODULES = [
  { id: 'founder', name: 'Founder Tools', route: '/founder/command', icon: Shield, color: '#C8A857', description: 'Founder command center and control tools' },
  { id: 'analytics', name: 'Founder Analytics', route: '/founder/analytics', icon: Settings, color: '#10B981', description: 'System health and usage metrics dashboard' },
  { id: 'book-vault', name: 'Book Vault Studio', route: '/founder/book-vault', icon: BookMarked, color: '#F59E0B', description: 'Write and manage books chapter-by-chapter' },
  { id: 'admin', name: 'Admin Dashboards', route: '/admin/opportunities', icon: Settings, color: '#6366F1', description: 'Admin panels, moderation, analytics' },
  { id: 'settings', name: 'Settings Hub', route: '/settings', icon: Settings, color: '#64748B', description: 'User account and app settings' },
  { id: 'developer', name: 'Developer Portal', route: '/developer', icon: Code, color: '#10B981', description: 'API access and developer tools' },
  { id: 'contributor', name: 'Contributor Portal', route: '/contributor/login', icon: UserCircle, color: '#8B5CF6', description: 'Content contributor system' },
  { id: 'onboarding', name: 'Onboarding', route: '/onboarding', icon: Users, color: '#F59E0B', description: 'New user onboarding flow' },
  { id: 'resources', name: 'Resources', route: '/resources', icon: BookOpen, color: '#EC4899', description: 'Community resources and guides' },
  { id: 'events', name: 'Events', route: '/events', icon: Calendar, color: '#EF4444', description: 'Community events system' },
  { id: 'tv', name: 'BANIBS TV', route: '/portal/tv', icon: Video, color: '#DC2626', description: 'Video content and streaming' },
  { id: 'ccram', name: 'CCRAM', route: '/ccram', icon: Mic, color: '#7C3AED', description: 'CCR Anchor Module - Interview AI assistant' },
  { id: 'socialworld', name: 'SocialWorld', route: '/socialworld', icon: Globe, color: '#0EA5E9', description: 'Social experience cluster (Pulse, Frames, Notes, Circles, etc.)' },
  { id: 'ability', name: 'Ability Network', route: '/ability', icon: Zap, color: '#A855F7', description: 'Skills and ability marketplace' },
  { id: 'connect', name: 'BANIBS Connect', route: '/connect', icon: Users, color: '#14B8A6', description: 'Connection and networking hub' },
  { id: 'circles', name: 'Infinite Circles', route: '/social/circles', icon: Users, color: '#F97316', description: 'Trust circles and relationship engine' },
];

// Planned/Conceptual Modules - NOT built yet (static list)
const PLANNED_MODULES = [
  { id: 'hdos', name: 'HDOS Circle Trust Order System v2', status: 'planned', description: '7-level trust system for community hierarchy', expectedPhase: '17.0' },
  { id: 'bookvault', name: 'BANIBS Book Vault Studio', status: 'planned', description: 'Book authoring and publishing module', expectedPhase: '18.0' },
  { id: 'healthcore', name: 'Raymond Health Core System', status: 'planned', description: 'Daily health and wellness tracker', expectedPhase: '19.0' },
  { id: 'bglis', name: 'BGLIS Phone Authentication', status: 'mocked', description: 'Phone-first authentication system (currently mocked)', expectedPhase: '8.5' },
];

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

// Task Card Component for Kanban (inner component)
const TaskCardInner = ({ task, isDark, onEdit, onDelete, onMove, onStatusChange, dragHandleProps }) => {
  const priorityColors = {
    'LOW': '#6B7280',
    'MEDIUM': '#F59E0B',
    'HIGH': '#EF4444',
    'CRITICAL': '#DC2626'
  };
  const statusColors = {
    'OPEN': '#10B981',
    'IN_PROGRESS': '#C8A857',
    'DONE': '#6B7280',
    'BLOCKED': '#EF4444',
    'ARCHIVED': '#9CA3AF'
  };
  
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
          {/* Drag Handle */}
          <div {...dragHandleProps} style={{ cursor: 'grab', color: isDark ? '#6B7280' : '#9CA3AF', touchAction: 'none' }}>
            <GripVertical size={14} />
          </div>
          <h5 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: isDark ? '#F7F7F7' : '#111217',
            margin: 0,
            flex: 1
          }}>
            {task.title}
          </h5>
        </div>
        <span style={{
          padding: '2px 6px',
          borderRadius: '3px',
          backgroundColor: `${priorityColors[task.priority]}20`,
          color: priorityColors[task.priority],
          fontSize: '10px',
          fontWeight: '600'
        }}>
          {task.priority}
        </span>
      </div>
      
      {task.description && (
        <p style={{
          fontSize: '12px',
          color: isDark ? '#9CA3AF' : '#6B7280',
          margin: '0 0 8px 0',
          lineHeight: '1.4',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {task.description}
        </p>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          padding: '3px 8px',
          borderRadius: '4px',
          backgroundColor: `${statusColors[task.status]}15`,
          color: statusColors[task.status],
          fontSize: '10px',
          fontWeight: '500'
        }}>
          {task.status.replace('_', ' ')}
        </span>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task); }}
            title="Edit"
            style={{
              padding: '4px 6px',
              backgroundColor: 'transparent',
              color: isDark ? '#9CA3AF' : '#6B7280',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
            title="Delete"
            style={{
              padding: '4px 6px',
              backgroundColor: 'transparent',
              color: '#EF4444',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      
      {task.owner && task.owner !== 'Founder' && (
        <div style={{ marginTop: '6px', fontSize: '10px', color: isDark ? '#6B7280' : '#9CA3AF' }}>
          Owner: {task.owner}
        </div>
      )}
    </>
  );
};

// Sortable Task Card Component with @dnd-kit
const SortableTaskCard = ({ task, isDark, onEdit, onDelete, onMove, onStatusChange }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    padding: '12px',
    backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
    borderRadius: '6px',
    border: `1px solid ${isDragging ? '#C8A857' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`,
    cursor: 'default',
    touchAction: 'none'
  };
  
  return (
    <div ref={setNodeRef} style={style} data-testid={`task-card-${task.id}`} {...attributes}>
      <TaskCardInner
        task={task}
        isDark={isDark}
        onEdit={onEdit}
        onDelete={onDelete}
        onMove={onMove}
        onStatusChange={onStatusChange}
        dragHandleProps={listeners}
      />
    </div>
  );
};

// Droppable Column Component
const DroppableColumn = ({ columnId, columnLabel, columnColor, tasks, isDark, children }) => {
  return (
    <div
      data-testid={`column-${columnId}`}
      style={{
        backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
        borderRadius: '8px',
        padding: '16px',
        border: `2px solid ${isDark ? `${columnColor}50` : `${columnColor}30`}`,
        minHeight: '300px'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
      }}>
        <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: columnColor }} />
        <h4 style={{ fontSize: '15px', fontWeight: '600', color: isDark ? '#F7F7F7' : '#111217', margin: 0 }}>
          {columnLabel}
        </h4>
        <span style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF', marginLeft: 'auto' }}>
          {tasks.length}
        </span>
      </div>
      
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '100px' }}>
          {children}
          {tasks.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: isDark ? '#6B7280' : '#9CA3AF', fontSize: '13px' }}>
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};

// Status badge helper component - Constrained palette (max 5 statuses)
// Open=neutral, In Progress=blue, Blocked=red, Done=green, Pending=amber
const StatusBadge = ({ status, isDark }) => {
  const configs = {
    // Green - Success states
    complete: { 
      label: 'Complete', 
      color: '#10B981',
      bg: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
      icon: CheckCircle 
    },
    done: { 
      label: 'Done', 
      color: '#10B981',
      bg: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
      icon: CheckCircle 
    },
    online: { 
      label: 'Online', 
      color: '#10B981',
      bg: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
      icon: CheckCircle 
    },
    // Blue - Active/Progress states
    in_progress: { 
      label: 'In Progress', 
      color: '#3B82F6',
      bg: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
      icon: Clock 
    },
    // Neutral - Open/Waiting states
    open: { 
      label: 'Open', 
      color: isDark ? '#9CA3AF' : '#6B7280',
      bg: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(107, 114, 128, 0.08)',
      icon: AlertCircle 
    },
    planned: { 
      label: 'Planned', 
      color: isDark ? '#9CA3AF' : '#6B7280',
      bg: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(107, 114, 128, 0.08)',
      icon: Folder 
    },
    waiting: { 
      label: 'Waiting', 
      color: isDark ? '#9CA3AF' : '#6B7280',
      bg: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(107, 114, 128, 0.08)',
      icon: Clock 
    },
    not_started: { 
      label: 'Not Started', 
      color: isDark ? '#9CA3AF' : '#6B7280',
      bg: isDark ? 'rgba(156, 163, 175, 0.1)' : 'rgba(107, 114, 128, 0.08)',
      icon: AlertCircle 
    },
    // Amber - Pending/Warning states
    pending: { 
      label: 'Pending', 
      color: '#F59E0B',
      bg: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.08)',
      icon: Clock 
    },
    // Red - Blocked states
    blocked: { 
      label: 'Blocked', 
      color: '#EF4444',
      bg: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.08)',
      icon: AlertCircle 
    }
  };
  
  // Normalize status key
  const normalizedStatus = status?.toLowerCase?.().replace(/\s+/g, '_') || 'not_started';
  const config = configs[normalizedStatus] || configs.not_started;
  const Icon = config.icon;
  
  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '5px',
      padding: '3px 10px',
      borderRadius: '4px',
      backgroundColor: config.bg,
      fontSize: '12px',
      fontWeight: '500',
      color: config.color
    }}>
      <Icon size={12} />
      {config.label}
    </div>
  );
};

// Card component
const Card = ({ title, icon: Icon, children, className = '', isDark }) => (
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

const FounderControlCenter = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading, accessToken } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [currentDate] = useState(new Date());
  const [moduleSearch, setModuleSearch] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Ops Log state
  const [opsLogEntries, setOpsLogEntries] = useState([]);
  const [opsLogLoading, setOpsLogLoading] = useState(false);
  const [opsLogError, setOpsLogError] = useState(null);
  const [showOpsLogForm, setShowOpsLogForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [opsLogForm, setOpsLogForm] = useState({
    title: '',
    notes: '',
    category: '',
    status: 'Open'
  });
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    column: 'P0',
    status: 'OPEN',
    priority: 'MEDIUM',
    tags: [],
    owner: 'Founder',
    due_at: ''
  });
  
  // Detectors state
  const [detectors, setDetectors] = useState([]);
  const [detectorsLoading, setDetectorsLoading] = useState(false);
  const [detectorsError, setDetectorsError] = useState(null);
  const [showDetectorForm, setShowDetectorForm] = useState(false);
  const [editingDetector, setEditingDetector] = useState(null);
  const [detectorForm, setDetectorForm] = useState({
    name: '',
    domain: 'HDOS',
    type: 'CUSTOM',
    status: 'DRAFT',
    severity_default: 'MEDIUM',
    description: '',
    canonical_rules: []
  });
  
  // Drag and drop state
  const [activeTask, setActiveTask] = useState(null);
  
  // Documents state
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    doc_type: 'Other',
    tags: ''
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Trust Order state (HDOS v2)
  const [trustLevels, setTrustLevels] = useState([]);
  const [trustPolicies, setTrustPolicies] = useState([]);
  const [trustAssignments, setTrustAssignments] = useState([]);
  const [trustLoading, setTrustLoading] = useState(false);
  const [trustError, setTrustError] = useState(null);
  const [trustSubTab, setTrustSubTab] = useState('levels');
  const [showPolicyForm, setShowPolicyForm] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    subject_type: 'EMAIL',
    subject_id: '',
    subject_label: '',
    level_key: 'OTHERS',
    reason: ''
  });
  
  // Office Vault state (Phase 2)
  const [vaultStats, setVaultStats] = useState(null);
  const [vaultItems, setVaultItems] = useState([]);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultError, setVaultError] = useState(null);
  const [vaultSubTab, setVaultSubTab] = useState('archive');
  const [vaultFilter, setVaultFilter] = useState({ type: '', status: '', confidentiality: '', search: '' });
  const [selectedVaultItem, setSelectedVaultItem] = useState(null);
  const [vaultItemDetail, setVaultItemDetail] = useState(null);
  const [vaultDetailLoading, setVaultDetailLoading] = useState(false);
  const [ingestResult, setIngestResult] = useState(null);
  
  // Meta-Governance state (v1)
  const [govOverview, setGovOverview] = useState(null);
  const [govSignals, setGovSignals] = useState([]);
  const [govCircles, setGovCircles] = useState([]);
  const [govTemplates, setGovTemplates] = useState([]);
  const [govLoading, setGovLoading] = useState(false);
  const [govError, setGovError] = useState(null);
  const [govSubTab, setGovSubTab] = useState('overview');
  const [govSortBy, setGovSortBy] = useState('type');
  const [govFilterType, setGovFilterType] = useState('');
  const [govFilterStatus, setGovFilterStatus] = useState('');
  
  // DnD Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  // API base URL
  const API_URL = process.env.REACT_APP_BACKEND_URL || '';
  
  // Fetch Ops Log entries
  const fetchOpsLog = async () => {
    if (!accessToken) return;
    setOpsLogLoading(true);
    setOpsLogError(null);
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/ops-log`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch ops log');
      const result = await response.json();
      setOpsLogEntries(result.data || []);
    } catch (err) {
      setOpsLogError(err.message);
    } finally {
      setOpsLogLoading(false);
    }
  };
  
  // Create/Update Ops Log entry
  const saveOpsLogEntry = async () => {
    if (!accessToken || !opsLogForm.title.trim()) return;
    
    try {
      const url = editingEntry 
        ? `${API_URL}/api/founder-ops/ops-log/${editingEntry.id}`
        : `${API_URL}/api/founder-ops/ops-log`;
      
      const response = await fetch(url, {
        method: editingEntry ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: opsLogForm.title,
          notes: opsLogForm.notes,
          category: opsLogForm.category || null,
          status: opsLogForm.status
        })
      });
      
      if (!response.ok) throw new Error('Failed to save entry');
      
      // Reset form and refresh
      setOpsLogForm({ title: '', notes: '', category: '', status: 'Open' });
      setShowOpsLogForm(false);
      setEditingEntry(null);
      fetchOpsLog();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };
  
  // Delete Ops Log entry
  const deleteOpsLogEntry = async (entryId) => {
    if (!accessToken || !window.confirm('Delete this entry?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/ops-log/${entryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      fetchOpsLog();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };
  
  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'ops-log' && accessToken) {
      fetchOpsLog();
    }
    if (activeTab === 'tasks' && accessToken) {
      fetchTasks();
    }
    if (activeTab === 'detectors' && accessToken) {
      fetchDetectors();
    }
    if (activeTab === 'documents' && accessToken) {
      fetchDocuments();
    }
    if (activeTab === 'trust-order' && accessToken) {
      fetchTrustData();
    }
    if (activeTab === 'vault' && accessToken) {
      fetchVaultStats();
      fetchVaultItems();
    }
    if (activeTab === 'governance' && accessToken) {
      fetchGovernanceData();
    }
  }, [activeTab, accessToken]);
  
  // =====================
  // META-GOVERNANCE API FUNCTIONS (v1)
  // =====================
  
  const fetchGovernanceData = async () => {
    if (!accessToken) return;
    setGovLoading(true);
    setGovError(null);
    try {
      // Fetch all governance data in parallel
      const [overviewRes, signalsRes, circlesRes, templatesRes] = await Promise.all([
        fetch(`${API_URL}/api/governance/overview`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
        fetch(`${API_URL}/api/governance/signals`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
        fetch(`${API_URL}/api/governance/circles?sort_by=${govSortBy}`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
        fetch(`${API_URL}/api/governance/templates`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      ]);
      
      const overviewData = await overviewRes.json();
      const signalsData = await signalsRes.json();
      const circlesData = await circlesRes.json();
      const templatesData = await templatesRes.json();
      
      setGovOverview(overviewData);
      setGovSignals(signalsData.signals || []);
      setGovCircles(circlesData.circles || []);
      setGovTemplates(templatesData.templates || []);
    } catch (err) {
      setGovError(err.message);
    } finally {
      setGovLoading(false);
    }
  };
  
  const refreshGovernanceCircles = async () => {
    if (!accessToken) return;
    try {
      const params = new URLSearchParams({ sort_by: govSortBy });
      if (govFilterType) params.append('circle_type', govFilterType);
      if (govFilterStatus) params.append('status', govFilterStatus);
      
      const res = await fetch(`${API_URL}/api/governance/circles?${params}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const data = await res.json();
      setGovCircles(data.circles || []);
    } catch (err) {
      console.error('Failed to refresh circles:', err);
    }
  };
  
  // =====================
  // TRUST ORDER API FUNCTIONS (HDOS v2)
  // =====================
  
  const fetchTrustData = async () => {
    if (!accessToken) return;
    setTrustLoading(true);
    setTrustError(null);
    try {
      // Fetch all trust data in parallel
      const [levelsRes, policiesRes, assignmentsRes] = await Promise.all([
        fetch(`${API_URL}/api/hdos/trust/levels`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
        fetch(`${API_URL}/api/hdos/trust/policies`, { headers: { 'Authorization': `Bearer ${accessToken}` } }),
        fetch(`${API_URL}/api/hdos/trust/assignments`, { headers: { 'Authorization': `Bearer ${accessToken}` } })
      ]);
      
      const levelsData = await levelsRes.json();
      const policiesData = await policiesRes.json();
      const assignmentsData = await assignmentsRes.json();
      
      setTrustLevels(levelsData.data || []);
      setTrustPolicies(policiesData.data || []);
      setTrustAssignments(assignmentsData.data || []);
    } catch (err) {
      setTrustError(err.message);
    } finally {
      setTrustLoading(false);
    }
  };
  
  const saveTrustPolicy = async (levelKey, policyData) => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/hdos/trust/policies/by-level/${levelKey}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(policyData)
      });
      
      if (!response.ok) throw new Error('Failed to save policy');
      fetchTrustData();
      setShowPolicyForm(false);
      setEditingPolicy(null);
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };
  
  const createTrustAssignment = async () => {
    if (!accessToken || !assignmentForm.subject_id.trim()) {
      alert('Subject ID is required');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/api/hdos/trust/assignments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(assignmentForm)
      });
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail?.error?.message || 'Failed to create assignment');
      }
      
      setAssignmentForm({ subject_type: 'EMAIL', subject_id: '', subject_label: '', level_key: 'OTHERS', reason: '' });
      setShowAssignmentForm(false);
      fetchTrustData();
    } catch (err) {
      alert('Failed to create: ' + err.message);
    }
  };
  
  const updateTrustAssignment = async (assignmentId, newLevelKey) => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/hdos/trust/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ level_key: newLevelKey })
      });
      
      if (!response.ok) throw new Error('Failed to update');
      fetchTrustData();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };
  
  const deleteTrustAssignment = async (assignmentId) => {
    if (!accessToken || !window.confirm('Remove this trust assignment?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/hdos/trust/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      fetchTrustData();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };
  
  // =====================
  // OFFICE VAULT API FUNCTIONS
  // =====================
  
  const fetchVaultStats = async () => {
    if (!accessToken) return;
    try {
      const response = await fetch(`${API_URL}/api/office/stats`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch vault stats');
      const result = await response.json();
      setVaultStats(result.stats);
    } catch (err) {
      console.error('Vault stats error:', err);
    }
  };
  
  const fetchVaultItems = async (typeFilter = null) => {
    if (!accessToken) return;
    setVaultLoading(true);
    setVaultError(null);
    try {
      const params = new URLSearchParams();
      if (typeFilter) params.append('item_type', typeFilter);
      if (vaultFilter.status) params.append('status', vaultFilter.status);
      if (vaultFilter.confidentiality) params.append('confidentiality', vaultFilter.confidentiality);
      if (vaultFilter.search) params.append('search', vaultFilter.search);
      
      const response = await fetch(`${API_URL}/api/office/items?${params}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch vault items');
      const result = await response.json();
      setVaultItems(result.items || []);
    } catch (err) {
      setVaultError(err.message);
    } finally {
      setVaultLoading(false);
    }
  };
  
  const fetchVaultItemDetail = async (itemId) => {
    if (!accessToken) return;
    setVaultDetailLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/office/items/${itemId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch item detail');
      const result = await response.json();
      setVaultItemDetail(result.item);
    } catch (err) {
      alert('Failed to load item: ' + err.message);
    } finally {
      setVaultDetailLoading(false);
    }
  };
  
  const triggerVaultIngest = async () => {
    if (!accessToken) return;
    setIngestResult(null);
    try {
      const response = await fetch(`${API_URL}/api/office/ingest`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Ingest failed');
      const result = await response.json();
      setIngestResult(result);
      // Refresh items and stats
      fetchVaultStats();
      fetchVaultItems();
    } catch (err) {
      alert('Ingest failed: ' + err.message);
    }
  };
  
  // =====================
  // DOCUMENTS API FUNCTIONS
  // =====================
  
  const fetchDocuments = async () => {
    if (!accessToken) return;
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/documents`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch documents');
      const result = await response.json();
      setDocuments(result.data || []);
    } catch (err) {
      setDocumentsError(err.message);
    } finally {
      setDocumentsLoading(false);
    }
  };
  
  const uploadDocument = async () => {
    if (!accessToken || !uploadForm.title.trim() || !uploadFile) {
      alert('Title and file are required');
      return;
    }
    
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('doc_type', uploadForm.doc_type);
      formData.append('tags', uploadForm.tags);
      formData.append('file', uploadFile);
      
      const response = await fetch(`${API_URL}/api/founder-ops/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData
      });
      
      if (!response.ok) throw new Error('Failed to upload document');
      
      setUploadForm({ title: '', description: '', doc_type: 'Other', tags: '' });
      setUploadFile(null);
      setShowUploadForm(false);
      fetchDocuments();
    } catch (err) {
      alert('Failed to upload: ' + err.message);
    } finally {
      setUploading(false);
    }
  };
  
  const downloadDocument = async (docId, filename) => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/documents/${docId}/download`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to download');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert('Failed to download: ' + err.message);
    }
  };
  
  const deleteDocument = async (docId) => {
    if (!accessToken || !window.confirm('Delete this document? This cannot be undone.')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      fetchDocuments();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };
  
  // =====================
  // TASKS API FUNCTIONS
  // =====================
  
  const fetchTasks = async () => {
    if (!accessToken) return;
    setTasksLoading(true);
    setTasksError(null);
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/tasks?sort=order`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const result = await response.json();
      setTasks(result.data || []);
    } catch (err) {
      setTasksError(err.message);
    } finally {
      setTasksLoading(false);
    }
  };
  
  const saveTask = async () => {
    if (!accessToken || !taskForm.title.trim()) return;
    
    try {
      const url = editingTask 
        ? `${API_URL}/api/founder-ops/tasks/${editingTask.id}`
        : `${API_URL}/api/founder-ops/tasks`;
      
      const response = await fetch(url, {
        method: editingTask ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: taskForm.title,
          description: taskForm.description || null,
          column: taskForm.column,
          status: taskForm.status,
          priority: taskForm.priority,
          tags: taskForm.tags,
          owner: taskForm.owner,
          due_at: taskForm.due_at || null
        })
      });
      
      if (!response.ok) throw new Error('Failed to save task');
      
      setTaskForm({ title: '', description: '', column: 'P0', status: 'OPEN', priority: 'MEDIUM', tags: [], owner: 'Founder', due_at: '' });
      setShowTaskForm(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };
  
  const moveTask = async (taskId, toColumn, toOrder) => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/tasks/${taskId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ to_column: toColumn, to_order: toOrder })
      });
      
      if (!response.ok) throw new Error('Failed to move task');
      fetchTasks();
    } catch (err) {
      alert('Failed to move: ' + err.message);
    }
  };
  
  const updateTaskStatus = async (taskId, newStatus) => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) throw new Error('Failed to update status');
      fetchTasks();
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };
  
  const deleteTask = async (taskId) => {
    if (!accessToken || !window.confirm('Delete this task?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      fetchTasks();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };
  
  // =====================
  // DETECTORS API FUNCTIONS
  // =====================
  
  const fetchDetectors = async () => {
    if (!accessToken) return;
    setDetectorsLoading(true);
    setDetectorsError(null);
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/detectors`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!response.ok) throw new Error('Failed to fetch detectors');
      const result = await response.json();
      setDetectors(result.data || []);
    } catch (err) {
      setDetectorsError(err.message);
    } finally {
      setDetectorsLoading(false);
    }
  };
  
  const saveDetector = async () => {
    if (!accessToken || !detectorForm.name.trim() || !detectorForm.type) return;
    
    try {
      const url = editingDetector 
        ? `${API_URL}/api/founder-ops/detectors/${editingDetector.id}`
        : `${API_URL}/api/founder-ops/detectors`;
      
      const response = await fetch(url, {
        method: editingDetector ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: detectorForm.name,
          domain: detectorForm.domain,
          type: detectorForm.type,
          status: detectorForm.status,
          severity_default: detectorForm.severity_default,
          description: detectorForm.description || null,
          canonical_rules: detectorForm.canonical_rules
        })
      });
      
      if (!response.ok) throw new Error('Failed to save detector');
      
      setDetectorForm({ name: '', domain: 'HDOS', type: 'CUSTOM', status: 'DRAFT', severity_default: 'MEDIUM', description: '', canonical_rules: [] });
      setShowDetectorForm(false);
      setEditingDetector(null);
      fetchDetectors();
    } catch (err) {
      alert('Failed to save: ' + err.message);
    }
  };
  
  const deleteDetector = async (detectorId) => {
    if (!accessToken || !window.confirm('Delete this detector?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/founder-ops/detectors/${detectorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      fetchDetectors();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };
  
  // Group tasks by column for Kanban view
  const tasksByColumn = {
    P0: tasks.filter(t => t.column === 'P0').sort((a, b) => a.order - b.order),
    P1: tasks.filter(t => t.column === 'P1').sort((a, b) => a.order - b.order),
    LATER: tasks.filter(t => t.column === 'LATER').sort((a, b) => a.order - b.order)
  };
  
  // Find which column a task belongs to
  const findColumn = (taskId) => {
    for (const [col, colTasks] of Object.entries(tasksByColumn)) {
      if (colTasks.find(t => t.id === taskId)) {
        return col;
      }
    }
    return null;
  };
  
  // Handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task);
  };
  
  // Handle drag over (for cross-column drops)
  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    const activeColumn = findColumn(activeId);
    const overColumn = findColumn(overId);
    
    // If dragging to a different column
    if (activeColumn && overColumn && activeColumn !== overColumn) {
      // Optimistic update - move locally first
      const activeTask = tasks.find(t => t.id === activeId);
      if (activeTask) {
        const overTasks = tasksByColumn[overColumn];
        const overIndex = overTasks.findIndex(t => t.id === overId);
        const newOrder = overIndex >= 0 
          ? (overTasks[overIndex]?.order || 0) - 0.5
          : (overTasks.length > 0 ? overTasks[overTasks.length - 1].order + 1 : 0);
        
        // Update local state immediately
        setTasks(prev => prev.map(t => 
          t.id === activeId 
            ? { ...t, column: overColumn, order: newOrder }
            : t
        ));
      }
    }
  };
  
  // Handle drag end
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    
    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;
    
    // Determine target column
    let targetColumn = activeTask.column;
    const overTask = tasks.find(t => t.id === overId);
    if (overTask && overTask.column !== activeTask.column) {
      targetColumn = overTask.column;
    }
    
    // Calculate new order
    const columnTasks = tasks.filter(t => t.column === targetColumn && t.id !== activeId).sort((a, b) => a.order - b.order);
    const overIndex = columnTasks.findIndex(t => t.id === overId);
    
    let newOrder;
    if (columnTasks.length === 0) {
      newOrder = 0;
    } else if (overIndex === -1) {
      newOrder = columnTasks[columnTasks.length - 1].order + 1;
    } else if (overIndex === 0) {
      newOrder = columnTasks[0].order / 2;
    } else {
      const prevOrder = columnTasks[overIndex - 1]?.order || 0;
      const nextOrder = columnTasks[overIndex]?.order || prevOrder + 2;
      newOrder = (prevOrder + nextOrder) / 2;
    }
    
    // Call API to persist the move
    await moveTask(activeId, targetColumn, newOrder);
  };
  
  // Get modules from registry
  const enabledModules = getEnabledModules();
  const upcomingModules = getUpcomingModules();
  
  // Filter modules based on search (handles registry modules)
  const filterModules = (modules) => {
    if (!moduleSearch.trim()) return modules;
    const search = moduleSearch.toLowerCase();
    return modules.filter(m => 
      m.name.toLowerCase().includes(search) ||
      m.id.toLowerCase().includes(search) ||
      m.route?.toLowerCase().includes(search) ||
      m.phase?.toString().includes(search) ||
      m.description?.toLowerCase().includes(search)
    );
  };
  
  // Filter internal modules
  const filterInternalModules = (modules) => {
    if (!moduleSearch.trim()) return modules;
    const search = moduleSearch.toLowerCase();
    return modules.filter(m => 
      m.name.toLowerCase().includes(search) ||
      m.id.toLowerCase().includes(search) ||
      m.route?.toLowerCase().includes(search) ||
      m.description?.toLowerCase().includes(search)
    );
  };
  
  // Filter planned modules
  const filterPlannedModules = (modules) => {
    if (!moduleSearch.trim()) return modules;
    const search = moduleSearch.toLowerCase();
    return modules.filter(m => 
      m.name.toLowerCase().includes(search) ||
      m.id.toLowerCase().includes(search) ||
      m.description?.toLowerCase().includes(search) ||
      m.status?.toLowerCase().includes(search)
    );
  };
  
  const filteredEnabledModules = filterModules(enabledModules);
  const filteredUpcomingModules = filterModules(upcomingModules);
  const filteredInternalModules = filterInternalModules(INTERNAL_MODULES);
  const filteredPlannedModules = filterPlannedModules(PLANNED_MODULES);
  
  // Total counts for search results
  const totalFilteredCount = filteredEnabledModules.length + filteredUpcomingModules.length + 
                             filteredInternalModules.length + filteredPlannedModules.length;
  
  // Access control - founder only (hard-coded for now)
  useEffect(() => {
    // Wait for auth to finish loading before checking access
    if (loading) return;
    
    if (!isAuthenticated) {
      navigate('/auth/signin?redirect=/founder/command');
      return;
    }
    
    // Founder access check - production-safe
    // Access granted ONLY to founder@banibs.com or users with super_admin role
    // Support both 'role' (string) and 'roles' (array) formats
    const isFounder = user?.email === 'founder@banibs.com' || 
                      user?.role === 'super_admin' ||
                      user?.roles?.includes('super_admin');
    
    if (!isFounder) {
      // Redirect non-founders to home
      navigate('/');
    }
  }, [isAuthenticated, user, navigate, loading]);
  
  // Show loading while auth is initializing
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: isDark ? '#F7F7F7' : '#111217' }}>Loading...</p>
      </div>
    );
  }
  
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
          
          {/* Tabs Navigation */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '24px',
            borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            paddingBottom: '12px'
          }}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Activity },
              { id: 'system-map', label: 'System Map', icon: Map },
              { id: 'governance', label: 'Governance', icon: Shield },
              { id: 'ops-log', label: 'Ops Log', icon: FileText },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle },
              { id: 'detectors', label: 'Detectors', icon: Radar },
              { id: 'documents', label: 'Documents', icon: Folder },
              { id: 'trust-order', label: 'Trust Order', icon: Crown },
              { id: 'vault', label: 'Office Vault', icon: BookOpen },
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  data-testid={`tab-${tab.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    borderRadius: '8px 8px 0 0',
                    border: 'none',
                    backgroundColor: isActive 
                      ? (isDark ? '#1C1C1C' : '#FFFFFF')
                      : 'transparent',
                    color: isActive 
                      ? '#C8A857'
                      : (isDark ? '#9CA3AF' : '#6B7280'),
                    fontSize: '14px',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    borderBottom: isActive 
                      ? '2px solid #C8A857' 
                      : '2px solid transparent',
                    transition: 'all 0.2s'
                  }}
                >
                  <TabIcon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          {/* Dashboard Tab Content */}
          {activeTab === 'dashboard' && (
          <>
          {/* Two-column layout */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px'
          }}>
            {/* Left Column - Projects & Build Status */}
            <div>
              {/* Active Builds */}
              <Card isDark={isDark} title="Active Builds & Phases" icon={Folder}>
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
                        <StatusBadge isDark={isDark} status={build.status} />
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
              <Card isDark={isDark} title="Neo Handoffs" icon={FileText}>
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
                        <StatusBadge isDark={isDark} status={handoff.status} />
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
              <Card isDark={isDark} title="Legal & Money Tasks" icon={Scale}>
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
                        <StatusBadge isDark={isDark} status={task.status} />
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
              <Card isDark={isDark} title="Health & Rest" icon={Heart}>
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
                    <strong>Today&apos;s rest focus:</strong> Medium load
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
              <Card isDark={isDark} title="System Status (BANIBS)" icon={Server}>
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
                      <StatusBadge isDark={isDark} status={system.status} />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
          </>
          )}
          
          {/* System Map Tab Content */}
          {activeTab === 'system-map' && (
          <div style={{ marginTop: '0' }}>
            <Card isDark={isDark} title="System Map" icon={Map}>
              {/* Search Box */}
              <div style={{
                marginBottom: '24px',
                position: 'relative'
              }}>
                <Search 
                  size={18} 
                  style={{
                    position: 'absolute',
                    left: '14px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: isDark ? '#6B7280' : '#9CA3AF'
                  }}
                />
                <input
                  type="text"
                  placeholder="Search modules by name, route, phase..."
                  value={moduleSearch}
                  onChange={(e) => setModuleSearch(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '400px',
                    padding: '12px 12px 12px 44px',
                    fontSize: '14px',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                    color: isDark ? '#F7F7F7' : '#111217',
                    outline: 'none'
                  }}
                />
                {moduleSearch && (
                  <span style={{
                    marginLeft: '12px',
                    fontSize: '13px',
                    color: isDark ? '#9CA3AF' : '#6B7280'
                  }}>
                    {totalFilteredCount} results
                  </span>
                )}
              </div>
              
              {/* Enabled Modules Section */}
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px'
                }}>
                  <Zap size={18} style={{ color: '#10B981' }} />
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isDark ? '#F7F7F7' : '#111217',
                    margin: 0
                  }}>
                    Enabled Modules ({filteredEnabledModules.length})
                  </h4>
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '12px'
                }}>
                  {filteredEnabledModules.map(module => (
                    <div key={module.id} style={{
                      padding: '16px',
                      backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                      borderLeft: `4px solid ${module.color || '#C8A857'}`
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h5 style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: isDark ? '#F7F7F7' : '#111217',
                            margin: 0,
                            marginBottom: '4px'
                          }}>
                            {module.name}
                          </h5>
                          <p style={{
                            fontSize: '12px',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            margin: 0
                          }}>
                            Phase {module.phase}
                          </p>
                        </div>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                          fontSize: '11px',
                          fontWeight: '500',
                          color: '#10B981'
                        }}>
                          <CheckCircle size={11} />
                          Enabled
                        </div>
                      </div>
                      
                      <p style={{
                        fontSize: '13px',
                        color: isDark ? '#B3B3C2' : '#4A4B57',
                        marginBottom: '12px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {module.description}
                      </p>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <code style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: isDark ? '#0C0C0C' : '#E5E7EB',
                            color: isDark ? '#9CA3AF' : '#374151',
                            fontFamily: 'monospace'
                          }}>
                            {module.route}
                          </code>
                          {module.permissions?.includes('user') && !module.permissions?.includes('public') && (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '11px',
                              color: isDark ? '#6B7280' : '#9CA3AF'
                            }}>
                              <Lock size={10} />
                              Auth
                            </span>
                          )}
                          {module.subModules?.length > 0 && (
                            <span style={{
                              fontSize: '11px',
                              color: isDark ? '#6B7280' : '#9CA3AF'
                            }}>
                              {module.subModules.length} sub-modules
                            </span>
                          )}
                        </div>
                        
                        <Link
                          to={module.route}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            color: isDark ? '#F7F7F7' : '#374151',
                            fontSize: '12px',
                            fontWeight: '500',
                            textDecoration: 'none',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                          }}
                        >
                          Open
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Upcoming/Disabled Modules Section */}
              {filteredUpcomingModules.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <Clock size={18} style={{ color: '#6B7280' }} />
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: isDark ? '#F7F7F7' : '#111217',
                      margin: 0
                    }}>
                      Upcoming / Disabled ({filteredUpcomingModules.length})
                    </h4>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '12px'
                  }}>
                    {filteredUpcomingModules.map(module => (
                      <div key={module.id} style={{
                        padding: '16px',
                        backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                        borderRadius: '8px',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                        borderLeft: `4px solid ${isDark ? '#374151' : '#D1D5DB'}`,
                        opacity: 0.7
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h5 style={{
                              fontSize: '15px',
                              fontWeight: '600',
                              color: isDark ? '#F7F7F7' : '#111217',
                              margin: 0,
                              marginBottom: '4px'
                            }}>
                              {module.name}
                            </h5>
                            <p style={{
                              fontSize: '12px',
                              color: isDark ? '#9CA3AF' : '#6B7280',
                              margin: 0
                            }}>
                              Phase {module.phase}
                            </p>
                          </div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: isDark ? 'rgba(107, 114, 128, 0.1)' : 'rgba(107, 114, 128, 0.15)',
                            border: `1px solid ${isDark ? 'rgba(107, 114, 128, 0.3)' : 'rgba(107, 114, 128, 0.3)'}`,
                            fontSize: '11px',
                            fontWeight: '500',
                            color: '#6B7280'
                          }}>
                            <Clock size={12} />
                            Upcoming
                          </div>
                        </div>
                        
                        <p style={{
                          fontSize: '13px',
                          color: isDark ? '#B3B3C2' : '#4A4B57',
                          marginBottom: '12px',
                          lineHeight: '1.4',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {module.description}
                        </p>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <code style={{
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: isDark ? '#0C0C0C' : '#E5E7EB',
                            color: isDark ? '#6B7280' : '#9CA3AF',
                            fontFamily: 'monospace'
                          }}>
                            {module.route}
                          </code>
                          {module.subModules?.length > 0 && (
                            <span style={{
                              fontSize: '11px',
                              color: isDark ? '#6B7280' : '#9CA3AF'
                            }}>
                              {module.subModules.length} sub-modules planned
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* System/Internal Modules Section */}
              {filteredInternalModules.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <Wrench size={18} style={{ color: '#6366F1' }} />
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: isDark ? '#F7F7F7' : '#111217',
                      margin: 0
                    }}>
                      System / Internal ({filteredInternalModules.length})
                    </h4>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '12px'
                  }}>
                    {filteredInternalModules.map(module => {
                      const IconComponent = module.icon || Settings;
                      return (
                        <div key={module.id} style={{
                          padding: '14px 16px',
                          backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                          borderLeft: `4px solid ${module.color || '#6366F1'}`
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '6px',
                                backgroundColor: `${module.color}20`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <IconComponent size={16} style={{ color: module.color }} />
                              </div>
                              <div>
                                <h5 style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: isDark ? '#F7F7F7' : '#111217',
                                  margin: 0
                                }}>
                                  {module.name}
                                </h5>
                              </div>
                            </div>
                            <div style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backgroundColor: 'rgba(99, 102, 241, 0.1)',
                              border: '1px solid rgba(99, 102, 241, 0.3)',
                              fontSize: '10px',
                              fontWeight: '600',
                              color: '#6366F1',
                              textTransform: 'uppercase'
                            }}>
                              Internal
                            </div>
                          </div>
                          
                          <p style={{
                            fontSize: '12px',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            marginBottom: '10px',
                            lineHeight: '1.4'
                          }}>
                            {module.description}
                          </p>
                          
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <code style={{
                              fontSize: '11px',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              backgroundColor: isDark ? '#0C0C0C' : '#E5E7EB',
                              color: isDark ? '#9CA3AF' : '#374151',
                              fontFamily: 'monospace'
                            }}>
                              {module.route}
                            </code>
                            
                            <Link
                              to={module.route}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '5px 10px',
                                borderRadius: '5px',
                                backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                color: isDark ? '#F7F7F7' : '#374151',
                                fontSize: '11px',
                                fontWeight: '500',
                                textDecoration: 'none',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                              }}
                            >
                              Open
                              <ExternalLink size={10} />
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Planned/Conceptual Modules Section */}
              {filteredPlannedModules.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    <Lightbulb size={18} style={{ color: '#F59E0B' }} />
                    <h4 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: isDark ? '#F7F7F7' : '#111217',
                      margin: 0
                    }}>
                      Planned / Conceptual ({filteredPlannedModules.length})
                    </h4>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '12px'
                  }}>
                    {filteredPlannedModules.map(module => (
                      <div key={module.id} style={{
                        padding: '14px 16px',
                        backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                        borderRadius: '8px',
                        border: `1px dashed ${isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.5)'}`,
                        opacity: 0.85
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div style={{ flex: 1 }}>
                            <h5 style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: isDark ? '#F7F7F7' : '#111217',
                              margin: 0,
                              marginBottom: '2px'
                            }}>
                              {module.name}
                            </h5>
                            {module.expectedPhase && (
                              <p style={{
                                fontSize: '11px',
                                color: isDark ? '#6B7280' : '#9CA3AF',
                                margin: 0
                              }}>
                                Expected Phase {module.expectedPhase}
                              </p>
                            )}
                          </div>
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: module.status === 'mocked' 
                              ? 'rgba(239, 68, 68, 0.1)' 
                              : 'rgba(245, 158, 11, 0.1)',
                            border: `1px solid ${module.status === 'mocked' 
                              ? 'rgba(239, 68, 68, 0.3)' 
                              : 'rgba(245, 158, 11, 0.3)'}`,
                            fontSize: '10px',
                            fontWeight: '600',
                            color: module.status === 'mocked' ? '#EF4444' : '#F59E0B',
                            textTransform: 'uppercase'
                          }}>
                            {module.status === 'mocked' ? 'Mocked' : 'Planned'}
                          </div>
                        </div>
                        
                        <p style={{
                          fontSize: '12px',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          marginBottom: '8px',
                          lineHeight: '1.4'
                        }}>
                          {module.description}
                        </p>
                        
                        <div style={{
                          fontSize: '11px',
                          color: isDark ? '#4B5563' : '#9CA3AF',
                          fontStyle: 'italic'
                        }}>
                          Not runnable – development pending
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Summary Stats */}
              <div style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor: isDark ? '#0C0C0C' : '#F3F4F6',
                borderRadius: '8px',
                display: 'flex',
                gap: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle size={16} style={{ color: '#10B981' }} />
                  <span style={{ fontSize: '13px', color: isDark ? '#B3B3C2' : '#4A4B57' }}>
                    <strong>{enabledModules.length}</strong> Enabled
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={16} style={{ color: '#6B7280' }} />
                  <span style={{ fontSize: '13px', color: isDark ? '#B3B3C2' : '#4A4B57' }}>
                    <strong>{upcomingModules.length}</strong> Upcoming
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Wrench size={16} style={{ color: '#6366F1' }} />
                  <span style={{ fontSize: '13px', color: isDark ? '#B3B3C2' : '#4A4B57' }}>
                    <strong>{INTERNAL_MODULES.length}</strong> Internal
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Lightbulb size={16} style={{ color: '#F59E0B' }} />
                  <span style={{ fontSize: '13px', color: isDark ? '#B3B3C2' : '#4A4B57' }}>
                    <strong>{PLANNED_MODULES.length}</strong> Planned
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Globe size={16} style={{ color: '#C8A857' }} />
                  <span style={{ fontSize: '13px', color: isDark ? '#B3B3C2' : '#4A4B57' }}>
                    <strong>{enabledModules.length + upcomingModules.length + INTERNAL_MODULES.length + PLANNED_MODULES.length}</strong> Total
                  </span>
                </div>
              </div>
            </Card>
          </div>
          )}
          
          {/* Ops Log Tab Content */}
          {activeTab === 'ops-log' && (
          <div>
            <Card isDark={isDark} title="Ops Log" icon={FileText}>
              {/* Header with Add Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  margin: 0
                }}>
                  Operational memory • Decisions • Bugs • Features • Notes
                </p>
                <button
                  onClick={() => {
                    setOpsLogForm({ title: '', notes: '', category: '', status: 'Open' });
                    setEditingEntry(null);
                    setShowOpsLogForm(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#C8A857',
                    color: '#0C0C0C',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  + New Entry
                </button>
              </div>
              
              {/* Entry Form */}
              {showOpsLogForm && (
                <div style={{
                  marginBottom: '24px',
                  padding: '20px',
                  backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isDark ? '#F7F7F7' : '#111217',
                    marginBottom: '16px'
                  }}>
                    {editingEntry ? 'Edit Entry' : 'New Entry'}
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        marginBottom: '6px'
                      }}>
                        Title *
                      </label>
                      <input
                        type="text"
                        value={opsLogForm.title}
                        onChange={(e) => setOpsLogForm({...opsLogForm, title: e.target.value})}
                        placeholder="Brief title for this entry"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{
                        display: 'block',
                        fontSize: '13px',
                        fontWeight: '500',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        marginBottom: '6px'
                      }}>
                        Notes
                      </label>
                      <textarea
                        value={opsLogForm.notes}
                        onChange={(e) => setOpsLogForm({...opsLogForm, notes: e.target.value})}
                        placeholder="Detailed notes, context, or description..."
                        rows={4}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          marginBottom: '6px'
                        }}>
                          Category
                        </label>
                        <select
                          value={opsLogForm.category}
                          onChange={(e) => setOpsLogForm({...opsLogForm, category: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '14px',
                            borderRadius: '8px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                            color: isDark ? '#F7F7F7' : '#111217',
                            outline: 'none'
                          }}
                        >
                          <option value="">-- Select --</option>
                          <option value="Decision">Decision</option>
                          <option value="Bug">Bug</option>
                          <option value="Feature">Feature</option>
                          <option value="Ops">Ops</option>
                          <option value="Infra">Infra</option>
                          <option value="HDOS">HDOS</option>
                          <option value="Note">Note</option>
                        </select>
                      </div>
                      
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          marginBottom: '6px'
                        }}>
                          Status
                        </label>
                        <select
                          value={opsLogForm.status}
                          onChange={(e) => setOpsLogForm({...opsLogForm, status: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '12px',
                            fontSize: '14px',
                            borderRadius: '8px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                            color: isDark ? '#F7F7F7' : '#111217',
                            outline: 'none'
                          }}
                        >
                          <option value="Open">Open</option>
                          <option value="Locked">Locked</option>
                          <option value="Superseded">Superseded</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => {
                          setShowOpsLogForm(false);
                          setEditingEntry(null);
                        }}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: 'transparent',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveOpsLogEntry}
                        disabled={!opsLogForm.title.trim()}
                        style={{
                          padding: '10px 24px',
                          backgroundColor: opsLogForm.title.trim() ? '#C8A857' : '#4B5563',
                          color: '#0C0C0C',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: opsLogForm.title.trim() ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {editingEntry ? 'Update' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading State */}
              {opsLogLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Loading entries...
                </div>
              )}
              
              {/* Error State */}
              {opsLogError && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#EF4444',
                  marginBottom: '16px'
                }}>
                  Error: {opsLogError}
                </div>
              )}
              
              {/* Entries List */}
              {!opsLogLoading && !opsLogError && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {opsLogEntries.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: isDark ? '#6B7280' : '#9CA3AF'
                    }}>
                      <FileText size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <p style={{ fontSize: '16px', marginBottom: '8px' }}>No entries yet</p>
                      <p style={{ fontSize: '14px' }}>Create your first ops log entry above</p>
                    </div>
                  ) : (
                    opsLogEntries.map(entry => {
                      const categoryColors = {
                        'Decision': '#8B5CF6',
                        'Bug': '#EF4444',
                        'Feature': '#10B981',
                        'Ops': '#F59E0B',
                        'Infra': '#6366F1',
                        'HDOS': '#C8A857',
                        'Note': '#6B7280'
                      };
                      const statusColors = {
                        'Open': '#10B981',
                        'Locked': '#6B7280',
                        'Superseded': '#9CA3AF'
                      };
                      
                      return (
                        <div key={entry.id} style={{
                          padding: '16px 20px',
                          backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                          borderLeft: `4px solid ${categoryColors[entry.category] || '#6B7280'}`
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: isDark ? '#F7F7F7' : '#111217',
                                margin: 0,
                                marginBottom: '4px'
                              }}>
                                {entry.title}
                              </h4>
                              <p style={{
                                fontSize: '12px',
                                color: isDark ? '#6B7280' : '#9CA3AF',
                                margin: 0
                              }}>
                                {new Date(entry.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {entry.category && (
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '4px',
                                  backgroundColor: `${categoryColors[entry.category]}20`,
                                  color: categoryColors[entry.category],
                                  fontSize: '11px',
                                  fontWeight: '600'
                                }}>
                                  {entry.category}
                                </span>
                              )}
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: `${statusColors[entry.status]}20`,
                                color: statusColors[entry.status],
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {entry.status}
                              </span>
                            </div>
                          </div>
                          
                          {entry.notes && (
                            <p style={{
                              fontSize: '14px',
                              color: isDark ? '#B3B3C2' : '#4A4B57',
                              marginBottom: '12px',
                              lineHeight: '1.5',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {entry.notes}
                            </p>
                          )}
                          
                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                          }}>
                            <button
                              onClick={() => {
                                setOpsLogForm({
                                  title: entry.title,
                                  notes: entry.notes || '',
                                  category: entry.category || '',
                                  status: entry.status
                                });
                                setEditingEntry(entry);
                                setShowOpsLogForm(true);
                              }}
                              style={{
                                padding: '6px 14px',
                                backgroundColor: 'transparent',
                                color: isDark ? '#9CA3AF' : '#6B7280',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteOpsLogEntry(entry.id)}
                              style={{
                                padding: '6px 14px',
                                backgroundColor: 'transparent',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              
              {/* Entry Count */}
              {!opsLogLoading && opsLogEntries.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: isDark ? '#0C0C0C' : '#F3F4F6',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  textAlign: 'center'
                }}>
                  {opsLogEntries.length} entries total
                </div>
              )}
            </Card>
          </div>
          )}
          
          {/* Tasks Tab Content - Kanban Board */}
          {activeTab === 'tasks' && (
          <div data-testid="tasks-tab-content">
            <Card isDark={isDark} title="Tasks Kanban" icon={CheckCircle}>
              {/* Header with Add Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  margin: 0
                }}>
                  P0 (Now) • P1 (Next) • Later — Drag tasks between columns
                </p>
                <button
                  onClick={() => {
                    setTaskForm({ title: '', description: '', column: 'P0', status: 'OPEN', priority: 'MEDIUM', tags: [], owner: 'Founder', due_at: '' });
                    setEditingTask(null);
                    setShowTaskForm(true);
                  }}
                  data-testid="new-task-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#C8A857',
                    color: '#0C0C0C',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  New Task
                </button>
              </div>
              
              {/* Task Form Modal */}
              {showTaskForm && (
                <div style={{
                  marginBottom: '24px',
                  padding: '20px',
                  backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isDark ? '#F7F7F7' : '#111217',
                    marginBottom: '16px'
                  }}>
                    {editingTask ? 'Edit Task' : 'New Task'}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Title *
                      </label>
                      <input
                        type="text"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                        placeholder="Task title"
                        data-testid="task-title-input"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Column
                      </label>
                      <select
                        value={taskForm.column}
                        onChange={(e) => setTaskForm({...taskForm, column: e.target.value})}
                        data-testid="task-column-select"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217'
                        }}
                      >
                        <option value="P0">P0 (Now)</option>
                        <option value="P1">P1 (Next)</option>
                        <option value="LATER">Later</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Priority
                      </label>
                      <select
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                        data-testid="task-priority-select"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217'
                        }}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Status
                      </label>
                      <select
                        value={taskForm.status}
                        onChange={(e) => setTaskForm({...taskForm, status: e.target.value})}
                        data-testid="task-status-select"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217'
                        }}
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Owner
                      </label>
                      <input
                        type="text"
                        value={taskForm.owner}
                        onChange={(e) => setTaskForm({...taskForm, owner: e.target.value})}
                        placeholder="Owner"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Description
                      </label>
                      <textarea
                        value={taskForm.description}
                        onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                        placeholder="Task description..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setShowTaskForm(false); setEditingTask(null); }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveTask}
                      data-testid="save-task-btn"
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#C8A857',
                        color: '#0C0C0C',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {editingTask ? 'Update Task' : 'Create Task'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Loading State */}
              {tasksLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Loading tasks...
                </div>
              )}
              
              {/* Error State */}
              {tasksError && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#EF4444',
                  marginBottom: '16px'
                }}>
                  Error: {tasksError}
                </div>
              )}
              
              {/* Kanban Board with Drag and Drop */}
              {!tasksLoading && !tasksError && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCorners}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                >
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '16px',
                    minHeight: '400px'
                  }}>
                    {/* P0 Column */}
                    <DroppableColumn
                      columnId="P0"
                      columnLabel="P0 (Now)"
                      columnColor="#EF4444"
                      tasks={tasksByColumn.P0}
                      isDark={isDark}
                    >
                      {tasksByColumn.P0.map(task => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          isDark={isDark}
                          onEdit={(t) => {
                            setTaskForm({
                              title: t.title,
                              description: t.description || '',
                              column: t.column,
                              status: t.status,
                              priority: t.priority,
                              tags: t.tags || [],
                              owner: t.owner,
                              due_at: t.due_at || ''
                            });
                            setEditingTask(t);
                            setShowTaskForm(true);
                          }}
                          onDelete={deleteTask}
                          onMove={moveTask}
                          onStatusChange={updateTaskStatus}
                        />
                      ))}
                    </DroppableColumn>
                    
                    {/* P1 Column */}
                    <DroppableColumn
                      columnId="P1"
                      columnLabel="P1 (Next)"
                      columnColor="#C8A857"
                      tasks={tasksByColumn.P1}
                      isDark={isDark}
                    >
                      {tasksByColumn.P1.map(task => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          isDark={isDark}
                          onEdit={(t) => {
                            setTaskForm({
                              title: t.title,
                              description: t.description || '',
                              column: t.column,
                              status: t.status,
                              priority: t.priority,
                              tags: t.tags || [],
                              owner: t.owner,
                              due_at: t.due_at || ''
                            });
                            setEditingTask(t);
                            setShowTaskForm(true);
                          }}
                          onDelete={deleteTask}
                          onMove={moveTask}
                          onStatusChange={updateTaskStatus}
                        />
                      ))}
                    </DroppableColumn>
                    
                    {/* Later Column */}
                    <DroppableColumn
                      columnId="LATER"
                      columnLabel="Later"
                      columnColor="#6B7280"
                      tasks={tasksByColumn.LATER}
                      isDark={isDark}
                    >
                      {tasksByColumn.LATER.map(task => (
                        <SortableTaskCard
                          key={task.id}
                          task={task}
                          isDark={isDark}
                          onEdit={(t) => {
                            setTaskForm({
                              title: t.title,
                              description: t.description || '',
                              column: t.column,
                              status: t.status,
                              priority: t.priority,
                              tags: t.tags || [],
                              owner: t.owner,
                              due_at: t.due_at || ''
                            });
                            setEditingTask(t);
                            setShowTaskForm(true);
                          }}
                          onDelete={deleteTask}
                          onMove={moveTask}
                          onStatusChange={updateTaskStatus}
                        />
                      ))}
                    </DroppableColumn>
                  </div>
                  
                  {/* Drag Overlay - shows the dragged item */}
                  <DragOverlay>
                    {activeTask ? (
                      <div style={{
                        padding: '12px',
                        backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                        borderRadius: '6px',
                        border: '2px solid #C8A857',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                        opacity: 0.9,
                        width: '280px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <GripVertical size={14} style={{ color: '#C8A857' }} />
                          <span style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#F7F7F7' : '#111217' }}>
                            {activeTask.title}
                          </span>
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              )}
              
              {/* Task Count */}
              {!tasksLoading && tasks.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: isDark ? '#0C0C0C' : '#F3F4F6',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  textAlign: 'center'
                }}>
                  {tasks.length} tasks total
                </div>
              )}
            </Card>
          </div>
          )}
          
          {/* Detectors Tab Content */}
          {activeTab === 'detectors' && (
          <div data-testid="detectors-tab-content">
            <Card isDark={isDark} title="HDOS Detectors" icon={Radar}>
              {/* Header with Add Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  margin: 0
                }}>
                  HDOS / BANIBS Detectors & Safety Layers — First-class systems
                </p>
                <button
                  onClick={() => {
                    setDetectorForm({ name: '', domain: 'HDOS', type: 'CUSTOM', status: 'DRAFT', severity_default: 'MEDIUM', description: '', canonical_rules: [] });
                    setEditingDetector(null);
                    setShowDetectorForm(true);
                  }}
                  data-testid="new-detector-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#C8A857',
                    color: '#0C0C0C',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  New Detector
                </button>
              </div>
              
              {/* Detector Form Modal */}
              {showDetectorForm && (
                <div style={{
                  marginBottom: '24px',
                  padding: '20px',
                  backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isDark ? '#F7F7F7' : '#111217',
                    marginBottom: '16px'
                  }}>
                    {editingDetector ? 'Edit Detector' : 'New Detector'}
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Name *
                      </label>
                      <input
                        type="text"
                        value={detectorForm.name}
                        onChange={(e) => setDetectorForm({...detectorForm, name: e.target.value})}
                        placeholder="Detector name (e.g., DOG Detector v1)"
                        data-testid="detector-name-input"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Domain
                      </label>
                      <select
                        value={detectorForm.domain}
                        onChange={(e) => setDetectorForm({...detectorForm, domain: e.target.value})}
                        data-testid="detector-domain-select"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217'
                        }}
                      >
                        <option value="HDOS">HDOS</option>
                        <option value="BANIBS">BANIBS</option>
                        <option value="TRUST">TRUST</option>
                        <option value="IDENTITY">IDENTITY</option>
                        <option value="SOCIAL">SOCIAL</option>
                        <option value="BUSINESS">BUSINESS</option>
                        <option value="NEWS">NEWS</option>
                        <option value="SECURITY">SECURITY</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Type *
                      </label>
                      <select
                        value={detectorForm.type}
                        onChange={(e) => setDetectorForm({...detectorForm, type: e.target.value})}
                        data-testid="detector-type-select"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217'
                        }}
                      >
                        <option value="DOG">DOG</option>
                        <option value="BDL_BIS">BDL/BIS</option>
                        <option value="LPL">LPL</option>
                        <option value="SPOOFING_FRIEND">Spoofing Friend</option>
                        <option value="SPOOFING_FAMILY">Spoofing Family</option>
                        <option value="SPOOFING_IDENTITY">Spoofing Identity</option>
                        <option value="SPOOFING_WORKPLACE">Spoofing Workplace</option>
                        <option value="TRUST_EROSION_LOOP">Trust Erosion Loop</option>
                        <option value="PRESSURE_TRANSFER">Pressure Transfer</option>
                        <option value="CUSTOM">Custom</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Status
                      </label>
                      <select
                        value={detectorForm.status}
                        onChange={(e) => setDetectorForm({...detectorForm, status: e.target.value})}
                        data-testid="detector-status-select"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217'
                        }}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="ACTIVE">Active</option>
                        <option value="PAUSED">Paused</option>
                        <option value="DEPRECATED">Deprecated</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Default Severity
                      </label>
                      <select
                        value={detectorForm.severity_default}
                        onChange={(e) => setDetectorForm({...detectorForm, severity_default: e.target.value})}
                        data-testid="detector-severity-select"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217'
                        }}
                      >
                        <option value="INFO">Info</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Description
                      </label>
                      <textarea
                        value={detectorForm.description}
                        onChange={(e) => setDetectorForm({...detectorForm, description: e.target.value})}
                        placeholder="Detector description..."
                        rows={3}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setShowDetectorForm(false); setEditingDetector(null); }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveDetector}
                      data-testid="save-detector-btn"
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#C8A857',
                        color: '#0C0C0C',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {editingDetector ? 'Update Detector' : 'Create Detector'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Loading State */}
              {detectorsLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Loading detectors...
                </div>
              )}
              
              {/* Error State */}
              {detectorsError && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#EF4444',
                  marginBottom: '16px'
                }}>
                  Error: {detectorsError}
                </div>
              )}
              
              {/* Detectors List */}
              {!detectorsLoading && !detectorsError && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {detectors.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: isDark ? '#6B7280' : '#9CA3AF'
                    }}>
                      <Radar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <p style={{ fontSize: '16px', marginBottom: '8px' }}>No detectors yet</p>
                      <p style={{ fontSize: '14px' }}>Create your first HDOS detector above</p>
                    </div>
                  ) : (
                    detectors.map(detector => {
                      const statusColors = {
                        'DRAFT': '#6B7280',
                        'ACTIVE': '#10B981',
                        'PAUSED': '#F59E0B',
                        'DEPRECATED': '#9CA3AF'
                      };
                      const severityColors = {
                        'INFO': '#6B7280',
                        'LOW': '#10B981',
                        'MEDIUM': '#F59E0B',
                        'HIGH': '#EF4444',
                        'CRITICAL': '#DC2626'
                      };
                      const domainColors = {
                        'HDOS': '#C8A857',
                        'BANIBS': '#6366F1',
                        'TRUST': '#10B981',
                        'IDENTITY': '#8B5CF6',
                        'SOCIAL': '#0EA5E9',
                        'BUSINESS': '#F59E0B',
                        'NEWS': '#EC4899',
                        'SECURITY': '#EF4444'
                      };
                      
                      return (
                        <div key={detector.id} data-testid={`detector-${detector.id}`} style={{
                          padding: '16px 20px',
                          backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                          borderLeft: `4px solid ${domainColors[detector.domain] || '#C8A857'}`
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: isDark ? '#F7F7F7' : '#111217',
                                margin: 0,
                                marginBottom: '4px'
                              }}>
                                {detector.name}
                              </h4>
                              <p style={{
                                fontSize: '12px',
                                color: isDark ? '#6B7280' : '#9CA3AF',
                                margin: 0
                              }}>
                                {detector.type} • {detector.domain}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: `${severityColors[detector.severity_default]}20`,
                                color: severityColors[detector.severity_default],
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {detector.severity_default}
                              </span>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: `${statusColors[detector.status]}20`,
                                color: statusColors[detector.status],
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                {detector.status}
                              </span>
                            </div>
                          </div>
                          
                          {detector.description && (
                            <p style={{
                              fontSize: '14px',
                              color: isDark ? '#B3B3C2' : '#4A4B57',
                              marginBottom: '12px',
                              lineHeight: '1.5'
                            }}>
                              {detector.description}
                            </p>
                          )}
                          
                          {detector.canonical_rules && detector.canonical_rules.length > 0 && (
                            <div style={{ marginBottom: '12px' }}>
                              <p style={{ fontSize: '12px', fontWeight: '600', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                                Canonical Rules:
                              </p>
                              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                                {detector.canonical_rules.map((rule, idx) => (
                                  <li key={idx} style={{ fontSize: '13px', color: isDark ? '#B3B3C2' : '#4A4B57', marginBottom: '4px' }}>
                                    {rule}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          <div style={{
                            display: 'flex',
                            gap: '12px',
                            justifyContent: 'flex-end'
                          }}>
                            <button
                              onClick={() => {
                                setDetectorForm({
                                  name: detector.name,
                                  domain: detector.domain,
                                  type: detector.type,
                                  status: detector.status,
                                  severity_default: detector.severity_default,
                                  description: detector.description || '',
                                  canonical_rules: detector.canonical_rules || []
                                });
                                setEditingDetector(detector);
                                setShowDetectorForm(true);
                              }}
                              style={{
                                padding: '6px 14px',
                                backgroundColor: 'transparent',
                                color: isDark ? '#9CA3AF' : '#6B7280',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Edit3 size={12} />
                              Edit
                            </button>
                            <button
                              onClick={() => deleteDetector(detector.id)}
                              style={{
                                padding: '6px 14px',
                                backgroundColor: 'transparent',
                                color: '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Trash2 size={12} />
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              
              {/* Detector Count */}
              {!detectorsLoading && detectors.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: isDark ? '#0C0C0C' : '#F3F4F6',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  textAlign: 'center'
                }}>
                  {detectors.length} detectors total
                </div>
              )}
            </Card>
          </div>
          )}
          
          {/* Documents Tab Content */}
          {activeTab === 'documents' && (
          <div data-testid="documents-tab-content">
            <Card isDark={isDark} title="Documents Vault" icon={Folder}>
              {/* Header with Upload Button */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  margin: 0
                }}>
                  Secure document storage — Canonical artifacts only
                </p>
                <button
                  onClick={() => {
                    setUploadForm({ title: '', description: '', doc_type: 'Other', tags: '' });
                    setUploadFile(null);
                    setShowUploadForm(true);
                  }}
                  data-testid="upload-document-btn"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 20px',
                    backgroundColor: '#C8A857',
                    color: '#0C0C0C',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={16} />
                  Upload Document
                </button>
              </div>
              
              {/* Upload Form Modal */}
              {showUploadForm && (
                <div style={{
                  marginBottom: '24px',
                  padding: '20px',
                  backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}>
                  <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: isDark ? '#F7F7F7' : '#111217',
                    marginBottom: '16px'
                  }}>
                    Upload New Document
                  </h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Title *
                      </label>
                      <input
                        type="text"
                        value={uploadForm.title}
                        onChange={(e) => setUploadForm({...uploadForm, title: e.target.value})}
                        placeholder="Document title"
                        data-testid="document-title-input"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Type
                      </label>
                      <select
                        value={uploadForm.doc_type}
                        onChange={(e) => setUploadForm({...uploadForm, doc_type: e.target.value})}
                        data-testid="document-type-select"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217'
                        }}
                      >
                        <option value="Architecture">Architecture</option>
                        <option value="Module">Module</option>
                        <option value="Legal">Legal</option>
                        <option value="Book">Book</option>
                        <option value="HDOS">HDOS</option>
                        <option value="Spec">Spec</option>
                        <option value="Canonical">Canonical</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Tags (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={uploadForm.tags}
                        onChange={(e) => setUploadForm({...uploadForm, tags: e.target.value})}
                        placeholder="hdos, canonical, spec"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none'
                        }}
                      />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        Description
                      </label>
                      <textarea
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm({...uploadForm, description: e.target.value})}
                        placeholder="Brief description of this document..."
                        rows={2}
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217',
                          outline: 'none',
                          resize: 'vertical'
                        }}
                      />
                    </div>
                    
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '6px' }}>
                        File *
                      </label>
                      <input
                        type="file"
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        data-testid="document-file-input"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                          color: isDark ? '#F7F7F7' : '#111217'
                        }}
                      />
                      {uploadFile && (
                        <p style={{ fontSize: '12px', color: '#10B981', marginTop: '6px' }}>
                          Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(1)} KB)
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => { setShowUploadForm(false); setUploadFile(null); }}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: isDark ? '#9CA3AF' : '#6B7280',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={uploadDocument}
                      disabled={uploading}
                      data-testid="submit-upload-btn"
                      style={{
                        padding: '10px 20px',
                        backgroundColor: uploading ? '#6B7280' : '#C8A857',
                        color: '#0C0C0C',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: uploading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {uploading ? 'Uploading...' : 'Upload Document'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Loading State */}
              {documentsLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Loading documents...
                </div>
              )}
              
              {/* Error State */}
              {documentsError && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  color: '#EF4444',
                  marginBottom: '16px'
                }}>
                  Error: {documentsError}
                </div>
              )}
              
              {/* Documents List */}
              {!documentsLoading && !documentsError && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {documents.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '60px 20px',
                      color: isDark ? '#6B7280' : '#9CA3AF'
                    }}>
                      <Folder size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <p style={{ fontSize: '16px', marginBottom: '8px' }}>No documents yet</p>
                      <p style={{ fontSize: '14px' }}>Upload your first canonical document above</p>
                    </div>
                  ) : (
                    documents.map(doc => {
                      const typeColors = {
                        'Architecture': '#6366F1',
                        'Module': '#10B981',
                        'Legal': '#F59E0B',
                        'Book': '#EC4899',
                        'HDOS': '#C8A857',
                        'Spec': '#0EA5E9',
                        'Canonical': '#8B5CF6',
                        'Other': '#6B7280'
                      };
                      
                      const formatBytes = (bytes) => {
                        if (!bytes) return '0 B';
                        if (bytes < 1024) return bytes + ' B';
                        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
                        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
                      };
                      
                      return (
                        <div key={doc.id} data-testid={`document-${doc.id}`} style={{
                          padding: '16px 20px',
                          backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                          borderRadius: '8px',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                          borderLeft: `4px solid ${typeColors[doc.doc_type] || '#6B7280'}`
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '8px'
                          }}>
                            <div style={{ flex: 1 }}>
                              <h4 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: isDark ? '#F7F7F7' : '#111217',
                                margin: 0,
                                marginBottom: '4px'
                              }}>
                                {doc.title}
                              </h4>
                              <p style={{
                                fontSize: '12px',
                                color: isDark ? '#6B7280' : '#9CA3AF',
                                margin: 0
                              }}>
                                {doc.filename} • {formatBytes(doc.size_bytes)} • {doc.content_type}
                              </p>
                            </div>
                            <span style={{
                              padding: '4px 10px',
                              borderRadius: '4px',
                              backgroundColor: `${typeColors[doc.doc_type] || '#6B7280'}20`,
                              color: typeColors[doc.doc_type] || '#6B7280',
                              fontSize: '11px',
                              fontWeight: '600'
                            }}>
                              {doc.doc_type}
                            </span>
                          </div>
                          
                          {doc.description && (
                            <p style={{
                              fontSize: '14px',
                              color: isDark ? '#B3B3C2' : '#4A4B57',
                              marginBottom: '8px',
                              lineHeight: '1.5'
                            }}>
                              {doc.description}
                            </p>
                          )}
                          
                          {doc.tags && doc.tags.length > 0 && (
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                              {doc.tags.map((tag, idx) => (
                                <span key={idx} style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                  color: isDark ? '#9CA3AF' : '#6B7280',
                                  fontSize: '11px'
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}>
                            <span style={{
                              fontSize: '11px',
                              color: isDark ? '#6B7280' : '#9CA3AF'
                            }}>
                              SHA256: {doc.sha256?.substring(0, 16)}...
                            </span>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => downloadDocument(doc.id, doc.filename)}
                                data-testid={`download-${doc.id}`}
                                style={{
                                  padding: '6px 14px',
                                  backgroundColor: '#C8A857',
                                  color: '#0C0C0C',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                Download
                              </button>
                              <button
                                onClick={() => deleteDocument(doc.id)}
                                style={{
                                  padding: '6px 14px',
                                  backgroundColor: 'transparent',
                                  color: '#EF4444',
                                  border: '1px solid rgba(239, 68, 68, 0.3)',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              
              {/* Document Count */}
              {!documentsLoading && documents.length > 0 && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  backgroundColor: isDark ? '#0C0C0C' : '#F3F4F6',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: isDark ? '#6B7280' : '#9CA3AF',
                  textAlign: 'center'
                }}>
                  {documents.length} documents total
                </div>
              )}
            </Card>
          </div>
          )}
          
          {/* Trust Order Tab Content (HDOS v2) */}
          {activeTab === 'trust-order' && (
          <div data-testid="trust-order-tab-content">
            <Card isDark={isDark} title="Circle Trust Order (HDOS v2)" icon={Crown}>
              {/* Description */}
              <p style={{
                fontSize: '14px',
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                7-level trust hierarchy for managing access and permissions across BANIBS systems.
                Structure is extensible for future modes and configurations.
              </p>
              
              {/* Sub-tabs for Levels, Policies, Assignments */}
              <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '24px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                paddingBottom: '12px'
              }}>
                {[
                  { id: 'levels', label: 'Levels', icon: Crown },
                  { id: 'policies', label: 'Policies', icon: Shield },
                  { id: 'assignments', label: 'Assignments', icon: Users }
                ].map(subTab => {
                  const SubIcon = subTab.icon;
                  const isSubActive = trustSubTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      onClick={() => setTrustSubTab(subTab.id)}
                      data-testid={`trust-subtab-${subTab.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '6px 6px 0 0',
                        border: 'none',
                        backgroundColor: isSubActive 
                          ? (isDark ? '#0C0C0C' : '#FFFFFF')
                          : 'transparent',
                        color: isSubActive 
                          ? '#C8A857'
                          : (isDark ? '#6B7280' : '#9CA3AF'),
                        fontSize: '13px',
                        fontWeight: isSubActive ? '600' : '500',
                        cursor: 'pointer',
                        borderBottom: isSubActive 
                          ? '2px solid #C8A857' 
                          : '2px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <SubIcon size={14} />
                      {subTab.label}
                    </button>
                  );
                })}
              </div>
              
              {/* Loading and Error States */}
              {trustLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Loading trust data...
                </div>
              )}
              
              {trustError && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  marginBottom: '24px'
                }}>
                  Error: {trustError}
                </div>
              )}
              
              {/* LEVELS SUB-TAB (Read-Only) */}
              {!trustLoading && trustSubTab === 'levels' && (
                <div data-testid="trust-levels-section">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: isDark ? '#F7F7F7' : '#111217',
                      margin: 0
                    }}>
                      Trust Levels ({trustLevels.length})
                    </h4>
                    <span style={{
                      fontSize: '12px',
                      color: isDark ? '#6B7280' : '#9CA3AF',
                      fontStyle: 'italic'
                    }}>
                      Read-only • Canonical hierarchy
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trustLevels.map((level, index) => {
                      // Map icon strings to components
                      const iconMap = {
                        'crown': Crown,
                        'star': Star,
                        'thumbs-up': ThumbsUp,
                        'check': Check,
                        'user': User,
                        'shield': Shield,
                        'ban': Ban
                      };
                      const LevelIcon = iconMap[level.icon] || User;
                      
                      return (
                        <div
                          key={level.id || level.key}
                          data-testid={`trust-level-${level.key}`}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '16px',
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            borderRadius: '8px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                            borderLeft: `4px solid ${level.color}`
                          }}
                        >
                          {/* Order Badge */}
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: `${level.color}20`,
                            color: level.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '14px'
                          }}>
                            {level.order}
                          </div>
                          
                          {/* Icon */}
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: `${level.color}15`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <LevelIcon size={20} style={{ color: level.color }} />
                          </div>
                          
                          {/* Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <h5 style={{
                                fontSize: '15px',
                                fontWeight: '600',
                                color: isDark ? '#F7F7F7' : '#111217',
                                margin: 0
                              }}>
                                {level.name}
                              </h5>
                              <code style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: isDark ? '#0C0C0C' : '#E5E7EB',
                                color: isDark ? '#6B7280' : '#374151',
                                fontFamily: 'monospace'
                              }}>
                                {level.key}
                              </code>
                            </div>
                            <p style={{
                              fontSize: '13px',
                              color: isDark ? '#9CA3AF' : '#6B7280',
                              margin: 0,
                              lineHeight: '1.4'
                            }}>
                              {level.description}
                            </p>
                          </div>
                          
                          {/* Color Swatch */}
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '4px',
                            backgroundColor: level.color,
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                          }} title={level.color} />
                        </div>
                      );
                    })}
                    
                    {trustLevels.length === 0 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: isDark ? '#6B7280' : '#9CA3AF'
                      }}>
                        No trust levels found. Levels will be seeded on first API access.
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* POLICIES SUB-TAB (CRUD) */}
              {!trustLoading && trustSubTab === 'policies' && (
                <div data-testid="trust-policies-section">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: isDark ? '#F7F7F7' : '#111217',
                      margin: 0
                    }}>
                      Trust Policies ({trustPolicies.length})
                    </h4>
                    <span style={{
                      fontSize: '12px',
                      color: isDark ? '#6B7280' : '#9CA3AF'
                    }}>
                      Define rules per trust level
                    </span>
                  </div>
                  
                  {/* Policy Edit Form */}
                  {showPolicyForm && editingPolicy && (
                    <div style={{
                      marginBottom: '24px',
                      padding: '20px',
                      backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                      borderRadius: '8px',
                      border: `2px solid #C8A857`
                    }}>
                      <h5 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isDark ? '#F7F7F7' : '#111217',
                        marginBottom: '16px'
                      }}>
                        Edit Policy: {editingPolicy.level_key}
                      </h5>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          marginBottom: '6px'
                        }}>
                          Allowed Modules (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={editingPolicy.allowed_modules?.join(', ') || ''}
                          onChange={(e) => setEditingPolicy({
                            ...editingPolicy,
                            allowed_modules: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                          })}
                          placeholder="news, social, marketplace..."
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            color: isDark ? '#F7F7F7' : '#111217',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          marginBottom: '6px'
                        }}>
                          Notes / Canonical Rules
                        </label>
                        <textarea
                          value={editingPolicy.notes || ''}
                          onChange={(e) => setEditingPolicy({ ...editingPolicy, notes: e.target.value })}
                          placeholder="Enter policy notes and rules..."
                          rows={3}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            color: isDark ? '#F7F7F7' : '#111217',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => saveTrustPolicy(editingPolicy.level_key, {
                            allowed_modules: editingPolicy.allowed_modules,
                            notes: editingPolicy.notes
                          })}
                          data-testid="save-policy-btn"
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#C8A857',
                            color: '#0C0C0C',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Save Policy
                        </button>
                        <button
                          onClick={() => { setShowPolicyForm(false); setEditingPolicy(null); }}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Policies List - Show all levels with policy status */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trustLevels.map(level => {
                      const policy = trustPolicies.find(p => p.level_key === level.key);
                      const hasPolicy = !!policy;
                      
                      return (
                        <div
                          key={level.key}
                          data-testid={`policy-row-${level.key}`}
                          style={{
                            padding: '16px',
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            borderRadius: '8px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                            borderLeft: `4px solid ${level.color}`
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: hasPolicy ? '12px' : '0'
                          }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  backgroundColor: level.color,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: '#fff',
                                  fontSize: '11px',
                                  fontWeight: '700'
                                }}>
                                  {level.order}
                                </span>
                                <h5 style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: isDark ? '#F7F7F7' : '#111217',
                                  margin: 0
                                }}>
                                  {level.name}
                                </h5>
                                {hasPolicy ? (
                                  <span style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    color: '#10B981',
                                    fontWeight: '500'
                                  }}>
                                    Configured
                                  </span>
                                ) : (
                                  <span style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    borderRadius: '4px',
                                    backgroundColor: 'rgba(156, 163, 175, 0.1)',
                                    color: '#9CA3AF',
                                    fontWeight: '500'
                                  }}>
                                    No Policy
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => {
                                setEditingPolicy(policy || { level_key: level.key, allowed_modules: [], notes: '' });
                                setShowPolicyForm(true);
                              }}
                              data-testid={`edit-policy-${level.key}`}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '6px 12px',
                                backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                                color: isDark ? '#F7F7F7' : '#111217',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                borderRadius: '6px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              <Edit3 size={12} />
                              {hasPolicy ? 'Edit' : 'Configure'}
                            </button>
                          </div>
                          
                          {/* Policy Details */}
                          {hasPolicy && (
                            <div style={{
                              padding: '12px',
                              backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                              borderRadius: '6px'
                            }}>
                              <div style={{ marginBottom: '8px' }}>
                                <span style={{
                                  fontSize: '12px',
                                  fontWeight: '500',
                                  color: isDark ? '#6B7280' : '#9CA3AF'
                                }}>
                                  Allowed Modules:
                                </span>
                                <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                  {policy.allowed_modules?.length > 0 ? (
                                    policy.allowed_modules.map(mod => (
                                      <span key={mod} style={{
                                        fontSize: '11px',
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        backgroundColor: isDark ? '#1C1C1C' : '#E5E7EB',
                                        color: isDark ? '#B3B3C2' : '#374151'
                                      }}>
                                        {mod}
                                      </span>
                                    ))
                                  ) : (
                                    <span style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF', fontStyle: 'italic' }}>
                                      All modules (default)
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              {policy.notes && (
                                <div>
                                  <span style={{
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    color: isDark ? '#6B7280' : '#9CA3AF'
                                  }}>
                                    Notes:
                                  </span>
                                  <p style={{
                                    fontSize: '12px',
                                    color: isDark ? '#B3B3C2' : '#4A4B57',
                                    margin: '4px 0 0 0',
                                    lineHeight: '1.4'
                                  }}>
                                    {policy.notes}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* ASSIGNMENTS SUB-TAB (CRUD) */}
              {!trustLoading && trustSubTab === 'assignments' && (
                <div data-testid="trust-assignments-section">
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px'
                  }}>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: isDark ? '#F7F7F7' : '#111217',
                      margin: 0
                    }}>
                      Trust Assignments ({trustAssignments.length})
                    </h4>
                    <button
                      onClick={() => {
                        setAssignmentForm({ subject_type: 'EMAIL', subject_id: '', subject_label: '', level_key: 'OTHERS', reason: '' });
                        setShowAssignmentForm(true);
                      }}
                      data-testid="add-assignment-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        backgroundColor: '#C8A857',
                        color: '#0C0C0C',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={14} />
                      Add Assignment
                    </button>
                  </div>
                  
                  {/* Assignment Create Form */}
                  {showAssignmentForm && (
                    <div style={{
                      marginBottom: '24px',
                      padding: '20px',
                      backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                      borderRadius: '8px',
                      border: `2px solid #C8A857`
                    }}>
                      <h5 style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isDark ? '#F7F7F7' : '#111217',
                        marginBottom: '16px'
                      }}>
                        New Trust Assignment
                      </h5>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            marginBottom: '6px'
                          }}>
                            Subject Type
                          </label>
                          <select
                            value={assignmentForm.subject_type}
                            onChange={(e) => setAssignmentForm({ ...assignmentForm, subject_type: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              fontSize: '14px',
                              borderRadius: '6px',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                              color: isDark ? '#F7F7F7' : '#111217',
                              outline: 'none'
                            }}
                          >
                            <option value="EMAIL">Email</option>
                            <option value="USER">User ID</option>
                            <option value="PHONE">Phone</option>
                            <option value="DEVICE">Device</option>
                            <option value="IP">IP Address</option>
                          </select>
                        </div>
                        
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '13px',
                            fontWeight: '500',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            marginBottom: '6px'
                          }}>
                            Trust Level
                          </label>
                          <select
                            value={assignmentForm.level_key}
                            onChange={(e) => setAssignmentForm({ ...assignmentForm, level_key: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              fontSize: '14px',
                              borderRadius: '6px',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                              backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                              color: isDark ? '#F7F7F7' : '#111217',
                              outline: 'none'
                            }}
                          >
                            {trustLevels.map(level => (
                              <option key={level.key} value={level.key}>
                                {level.order}. {level.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          marginBottom: '6px'
                        }}>
                          Subject ID *
                        </label>
                        <input
                          type="text"
                          value={assignmentForm.subject_id}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, subject_id: e.target.value })}
                          placeholder="e.g., user@example.com"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            color: isDark ? '#F7F7F7' : '#111217',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          marginBottom: '6px'
                        }}>
                          Label (optional)
                        </label>
                        <input
                          type="text"
                          value={assignmentForm.subject_label}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, subject_label: e.target.value })}
                          placeholder="Human-readable name"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            color: isDark ? '#F7F7F7' : '#111217',
                            outline: 'none'
                          }}
                        />
                      </div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '13px',
                          fontWeight: '500',
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          marginBottom: '6px'
                        }}>
                          Reason
                        </label>
                        <textarea
                          value={assignmentForm.reason}
                          onChange={(e) => setAssignmentForm({ ...assignmentForm, reason: e.target.value })}
                          placeholder="Why this trust level?"
                          rows={2}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            fontSize: '14px',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            color: isDark ? '#F7F7F7' : '#111217',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                      
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={createTrustAssignment}
                          data-testid="save-assignment-btn"
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#C8A857',
                            color: '#0C0C0C',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            cursor: 'pointer'
                          }}
                        >
                          Create Assignment
                        </button>
                        <button
                          onClick={() => setShowAssignmentForm(false)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {/* Assignments List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {trustAssignments.map(assignment => {
                      const level = trustLevels.find(l => l.key === assignment.level_key);
                      const levelColor = level?.color || '#6B7280';
                      
                      return (
                        <div
                          key={assignment.id}
                          data-testid={`assignment-row-${assignment.id}`}
                          style={{
                            padding: '16px',
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            borderRadius: '8px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                            borderLeft: `4px solid ${levelColor}`
                          }}
                        >
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start'
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <h5 style={{
                                  fontSize: '14px',
                                  fontWeight: '600',
                                  color: isDark ? '#F7F7F7' : '#111217',
                                  margin: 0
                                }}>
                                  {assignment.subject_label || assignment.subject_id}
                                </h5>
                                <span style={{
                                  fontSize: '11px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: `${levelColor}20`,
                                  color: levelColor,
                                  fontWeight: '600'
                                }}>
                                  {assignment.level_name || assignment.level_key}
                                </span>
                              </div>
                              
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                                <span style={{
                                  fontSize: '12px',
                                  color: isDark ? '#6B7280' : '#9CA3AF'
                                }}>
                                  {assignment.subject_type}: <code style={{ fontFamily: 'monospace' }}>{assignment.subject_id}</code>
                                </span>
                              </div>
                              
                              {assignment.reason && (
                                <p style={{
                                  fontSize: '12px',
                                  color: isDark ? '#9CA3AF' : '#6B7280',
                                  margin: 0,
                                  fontStyle: 'italic'
                                }}>
                                  &ldquo;{assignment.reason}&rdquo;
                                </p>
                              )}
                              
                              <div style={{ marginTop: '8px', fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>
                                Assigned by: {assignment.assigned_by || 'System'}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {/* Level Quick Change */}
                              <select
                                value={assignment.level_key}
                                onChange={(e) => updateTrustAssignment(assignment.id, e.target.value)}
                                data-testid={`change-level-${assignment.id}`}
                                style={{
                                  padding: '6px 10px',
                                  fontSize: '12px',
                                  borderRadius: '6px',
                                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                                  backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                                  color: isDark ? '#F7F7F7' : '#111217',
                                  outline: 'none',
                                  cursor: 'pointer'
                                }}
                              >
                                {trustLevels.map(level => (
                                  <option key={level.key} value={level.key}>
                                    {level.order}. {level.name}
                                  </option>
                                ))}
                              </select>
                              
                              <button
                                onClick={() => deleteTrustAssignment(assignment.id)}
                                data-testid={`delete-assignment-${assignment.id}`}
                                title="Remove assignment"
                                style={{
                                  padding: '6px 10px',
                                  backgroundColor: 'transparent',
                                  color: '#EF4444',
                                  border: `1px solid rgba(239, 68, 68, 0.3)`,
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  cursor: 'pointer'
                                }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    
                    {trustAssignments.length === 0 && (
                      <div style={{
                        textAlign: 'center',
                        padding: '40px',
                        color: isDark ? '#6B7280' : '#9CA3AF'
                      }}>
                        <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p style={{ margin: 0 }}>No trust assignments yet.</p>
                        <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
                          Add subjects (users, emails, etc.) to assign trust levels.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
          )}
          
          {/* Office Vault Tab Content (Phase 2) */}
          {activeTab === 'vault' && (
          <div data-testid="vault-tab-content">
            <Card isDark={isDark} title="Founder Office Vault" icon={BookOpen}>
              {/* Description */}
              <p style={{
                fontSize: '14px',
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginBottom: '24px',
                lineHeight: '1.6'
              }}>
                Server-side vault for canonical work: discoveries, inventions, contacts, books, and more.
                Filesystem at /opt/banibs-office/ is source of truth.
              </p>
              
              {/* Stats Bar */}
              {vaultStats && (
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  marginBottom: '24px',
                  padding: '16px',
                  backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                  borderRadius: '8px',
                  flexWrap: 'wrap'
                }}>
                  <div>
                    <span style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Total</span>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#C8A857' }}>{vaultStats.total_items}</div>
                  </div>
                  <div style={{ borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingLeft: '16px' }}>
                    <span style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Locked</span>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#10B981' }}>{vaultStats.by_status?.LOCKED || 0}</div>
                  </div>
                  <div style={{ borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingLeft: '16px' }}>
                    <span style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Draft</span>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#F59E0B' }}>{vaultStats.by_status?.DRAFT || 0}</div>
                  </div>
                  <div style={{ borderLeft: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingLeft: '16px' }}>
                    <span style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Private</span>
                    <div style={{ fontSize: '20px', fontWeight: '700', color: '#EF4444' }}>{vaultStats.by_confidentiality?.PRIVATE || 0}</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <button
                      onClick={triggerVaultIngest}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                        borderRadius: '6px',
                        color: isDark ? '#F7F7F7' : '#111217',
                        fontSize: '13px',
                        cursor: 'pointer'
                      }}
                      data-testid="vault-ingest-btn"
                    >
                      Process Inbox
                    </button>
                  </div>
                </div>
              )}
              
              {/* Ingest Result */}
              {ingestResult && (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '24px',
                  fontSize: '13px',
                  color: '#10B981'
                }}>
                  Ingest complete: {ingestResult.result?.inserted || 0} inserted, {ingestResult.result?.versioned || 0} versioned, {ingestResult.result?.skipped || 0} skipped
                </div>
              )}
              
              {/* Sub-tabs for Archive, Contacts, Inventions, Books */}
              <div style={{
                display: 'flex',
                gap: '4px',
                marginBottom: '24px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                paddingBottom: '12px'
              }}>
                {[
                  { id: 'archive', label: 'Archive', icon: Folder },
                  { id: 'contacts', label: 'Contacts', icon: Users },
                  { id: 'inventions', label: 'Inventions', icon: Lightbulb },
                  { id: 'books', label: 'Books', icon: BookOpen }
                ].map(subTab => {
                  const SubIcon = subTab.icon;
                  const isSubActive = vaultSubTab === subTab.id;
                  return (
                    <button
                      key={subTab.id}
                      onClick={() => {
                        setVaultSubTab(subTab.id);
                        setSelectedVaultItem(null);
                        setVaultItemDetail(null);
                        // Fetch with type filter
                        if (subTab.id === 'contacts') fetchVaultItems('contacts');
                        else if (subTab.id === 'inventions') fetchVaultItems('inventions');
                        else if (subTab.id === 'books') fetchVaultItems('books');
                        else fetchVaultItems();
                      }}
                      data-testid={`vault-subtab-${subTab.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '6px 6px 0 0',
                        border: 'none',
                        backgroundColor: isSubActive 
                          ? (isDark ? '#0C0C0C' : '#FFFFFF')
                          : 'transparent',
                        color: isSubActive 
                          ? '#C8A857'
                          : (isDark ? '#6B7280' : '#9CA3AF'),
                        fontSize: '13px',
                        fontWeight: isSubActive ? '600' : '500',
                        cursor: 'pointer',
                        borderBottom: isSubActive 
                          ? '2px solid #C8A857' 
                          : '2px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <SubIcon size={14} />
                      {subTab.label}
                    </button>
                  );
                })}
              </div>
              
              {/* Loading and Error States */}
              {vaultLoading && (
                <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                  Loading vault data...
                </div>
              )}
              
              {vaultError && (
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#EF4444',
                  marginBottom: '24px'
                }}>
                  Error: {vaultError}
                </div>
              )}
              
              {/* Search/Filter Bar */}
              {!vaultLoading && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '16px',
                  flexWrap: 'wrap'
                }}>
                  <input
                    type="text"
                    placeholder="Search by title..."
                    value={vaultFilter.search}
                    onChange={(e) => setVaultFilter({ ...vaultFilter, search: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (vaultSubTab === 'contacts') fetchVaultItems('contacts');
                        else if (vaultSubTab === 'inventions') fetchVaultItems('inventions');
                        else if (vaultSubTab === 'books') fetchVaultItems('books');
                        else fetchVaultItems();
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                      color: isDark ? '#F7F7F7' : '#111217',
                      fontSize: '14px'
                    }}
                    data-testid="vault-search-input"
                  />
                  <select
                    value={vaultFilter.status}
                    onChange={(e) => {
                      setVaultFilter({ ...vaultFilter, status: e.target.value });
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                      color: isDark ? '#F7F7F7' : '#111217',
                      fontSize: '14px'
                    }}
                    data-testid="vault-status-filter"
                  >
                    <option value="">All Status</option>
                    <option value="LOCKED">Locked</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                  <select
                    value={vaultFilter.confidentiality}
                    onChange={(e) => {
                      setVaultFilter({ ...vaultFilter, confidentiality: e.target.value });
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                      color: isDark ? '#F7F7F7' : '#111217',
                      fontSize: '14px'
                    }}
                    data-testid="vault-confidentiality-filter"
                  >
                    <option value="">All Confidentiality</option>
                    <option value="PUBLIC">Public</option>
                    <option value="PRIVATE">Private</option>
                  </select>
                  <button
                    onClick={() => {
                      if (vaultSubTab === 'contacts') fetchVaultItems('contacts');
                      else if (vaultSubTab === 'inventions') fetchVaultItems('inventions');
                      else if (vaultSubTab === 'books') fetchVaultItems('books');
                      else fetchVaultItems();
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#C8A857',
                      color: '#0C0C0C',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                    data-testid="vault-apply-filter-btn"
                  >
                    Apply
                  </button>
                </div>
              )}
              
              {/* Items List */}
              {!vaultLoading && !selectedVaultItem && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {vaultItems.length === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px',
                      color: isDark ? '#6B7280' : '#9CA3AF'
                    }}>
                      <Folder size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                      <p style={{ margin: 0 }}>No items found.</p>
                      <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}>
                        {vaultSubTab === 'archive' 
                          ? 'Drop JSON files in /opt/banibs-office/inbox/ and click "Process Inbox".'
                          : `No ${vaultSubTab} in the vault yet.`}
                      </p>
                    </div>
                  ) : (
                    vaultItems.map(item => {
                      const typeColors = {
                        'DISCOVERY': '#8B5CF6',
                        'INVENTION': '#EC4899',
                        'CONTACT': '#3B82F6',
                        'PROJECT': '#10B981',
                        'TASK': '#F59E0B',
                        'BOOK': '#06B6D4',
                        'GLOSSARY': '#84CC16',
                        'MECHANISM': '#F97316',
                        'SCRIPT': '#6366F1',
                        'DETECTOR': '#EF4444',
                        'POLICY': '#14B8A6',
                        'OPS': '#A855F7'
                      };
                      const typeColor = typeColors[item.type] || '#6B7280';
                      
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedVaultItem(item);
                            fetchVaultItemDetail(item.id);
                          }}
                          data-testid={`vault-item-${item.id}`}
                          style={{
                            padding: '16px',
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            borderRadius: '8px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                            borderLeft: `4px solid ${typeColor}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <h5 style={{
                                  fontSize: '15px',
                                  fontWeight: '600',
                                  color: isDark ? '#F7F7F7' : '#111217',
                                  margin: 0
                                }}>
                                  {item.title}
                                </h5>
                                <span style={{
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: `${typeColor}20`,
                                  color: typeColor,
                                  fontWeight: '600'
                                }}>
                                  {item.type}
                                </span>
                                {item.confidentiality === 'PRIVATE' && (
                                  <Lock size={12} style={{ color: '#EF4444' }} />
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF' }}>
                                <span>v{item.version}</span>
                                <span>{item.status}</span>
                                {item.created_at && (
                                  <span>{new Date(item.created_at).toLocaleDateString()}</span>
                                )}
                              </div>
                            </div>
                            <ArrowRight size={16} style={{ color: isDark ? '#6B7280' : '#9CA3AF' }} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
              
              {/* Item Detail View */}
              {selectedVaultItem && (
                <div data-testid="vault-item-detail">
                  <button
                    onClick={() => {
                      setSelectedVaultItem(null);
                      setVaultItemDetail(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 0',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: isDark ? '#9CA3AF' : '#6B7280',
                      fontSize: '13px',
                      cursor: 'pointer',
                      marginBottom: '16px'
                    }}
                    data-testid="vault-back-to-list"
                  >
                    ← Back to list
                  </button>
                  
                  {vaultDetailLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                      Loading item details...
                    </div>
                  ) : vaultItemDetail ? (
                    <div style={{
                      padding: '24px',
                      backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <h3 style={{
                          fontSize: '20px',
                          fontWeight: '700',
                          color: isDark ? '#F7F7F7' : '#111217',
                          margin: 0
                        }}>
                          {vaultItemDetail.title}
                        </h3>
                        {vaultItemDetail.confidentiality === 'PRIVATE' && (
                          <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            color: '#EF4444'
                          }}>
                            <Lock size={10} />
                            PRIVATE
                          </span>
                        )}
                      </div>
                      
                      {/* Metadata Grid */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '12px',
                        marginBottom: '24px',
                        padding: '16px',
                        backgroundColor: isDark ? '#0C0C0C' : '#F9FAFB',
                        borderRadius: '6px'
                      }}>
                        <div>
                          <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Type</span>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#F7F7F7' : '#111217' }}>
                            {vaultItemDetail.type}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Status</span>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: vaultItemDetail.status === 'LOCKED' ? '#10B981' : '#F59E0B' }}>
                            {vaultItemDetail.status}
                          </div>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Version</span>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#F7F7F7' : '#111217' }}>
                            v{vaultItemDetail.version}
                          </div>
                        </div>
                        {vaultItemDetail.source_thread && (
                          <div>
                            <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Source Thread</span>
                            <div style={{ fontSize: '14px', color: isDark ? '#B3B3C2' : '#4A4B57' }}>
                              {vaultItemDetail.source_thread}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {vaultItemDetail.tags && vaultItemDetail.tags.length > 0 && (
                        <div style={{ marginBottom: '24px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: isDark ? '#6B7280' : '#9CA3AF' }}>Tags</span>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '8px' }}>
                            {vaultItemDetail.tags.map(tag => (
                              <span key={tag} style={{
                                fontSize: '12px',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                backgroundColor: isDark ? '#0C0C0C' : '#E5E7EB',
                                color: isDark ? '#B3B3C2' : '#374151'
                              }}>
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Content - For PRIVATE inventions, show summary only */}
                      {vaultItemDetail.summary && (
                        <div style={{ marginBottom: '24px' }}>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: isDark ? '#6B7280' : '#9CA3AF' }}>Summary</span>
                          <p style={{
                            fontSize: '14px',
                            color: isDark ? '#9CA3AF' : '#6B7280',
                            marginTop: '8px',
                            fontStyle: 'italic'
                          }}>
                            {vaultItemDetail.summary}
                          </p>
                          <p style={{
                            fontSize: '12px',
                            color: '#EF4444',
                            marginTop: '8px'
                          }}>
                            Implementation details hidden (PRIVATE inventory)
                          </p>
                        </div>
                      )}
                      
                      {vaultItemDetail.body && (
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: isDark ? '#6B7280' : '#9CA3AF' }}>Content</span>
                          <div style={{
                            marginTop: '8px',
                            padding: '16px',
                            backgroundColor: isDark ? '#0C0C0C' : '#F9FAFB',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '13px',
                            lineHeight: '1.6',
                            color: isDark ? '#B3B3C2' : '#4A4B57',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '400px',
                            overflowY: 'auto'
                          }}>
                            {vaultItemDetail.body}
                          </div>
                        </div>
                      )}
                      
                      {/* Contact Data */}
                      {vaultItemDetail.data && (
                        <div>
                          <span style={{ fontSize: '12px', fontWeight: '500', color: isDark ? '#6B7280' : '#9CA3AF' }}>Contact Data</span>
                          <div style={{
                            marginTop: '8px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                            gap: '12px'
                          }}>
                            {vaultItemDetail.data.email && (
                              <div>
                                <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Email</span>
                                <div style={{ fontSize: '14px', color: isDark ? '#F7F7F7' : '#111217' }}>{vaultItemDetail.data.email}</div>
                              </div>
                            )}
                            {vaultItemDetail.data.phone && (
                              <div>
                                <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Phone</span>
                                <div style={{ fontSize: '14px', color: isDark ? '#F7F7F7' : '#111217' }}>{vaultItemDetail.data.phone}</div>
                              </div>
                            )}
                            {vaultItemDetail.data.organization && (
                              <div>
                                <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Organization</span>
                                <div style={{ fontSize: '14px', color: isDark ? '#F7F7F7' : '#111217' }}>{vaultItemDetail.data.organization}</div>
                              </div>
                            )}
                            {vaultItemDetail.data.role && (
                              <div>
                                <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Role</span>
                                <div style={{ fontSize: '14px', color: isDark ? '#F7F7F7' : '#111217' }}>{vaultItemDetail.data.role}</div>
                              </div>
                            )}
                            {vaultItemDetail.data.trust_level && (
                              <div>
                                <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Trust Level</span>
                                <div style={{ fontSize: '14px', color: isDark ? '#F7F7F7' : '#111217' }}>{vaultItemDetail.data.trust_level}</div>
                              </div>
                            )}
                            {vaultItemDetail.data.notes && (
                              <div style={{ gridColumn: '1 / -1' }}>
                                <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>Notes</span>
                                <div style={{ fontSize: '14px', color: isDark ? '#B3B3C2' : '#4A4B57', marginTop: '4px' }}>{vaultItemDetail.data.notes}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Hash */}
                      {vaultItemDetail.hash_sha256 && (
                        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                          <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>SHA256</span>
                          <code style={{
                            display: 'block',
                            marginTop: '4px',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            color: isDark ? '#6B7280' : '#9CA3AF',
                            wordBreak: 'break-all'
                          }}>
                            {vaultItemDetail.hash_sha256}
                          </code>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}
            </Card>
          </div>
          )}
          
          {/* Meta-Governance Tab Content */}
          {activeTab === 'governance' && (
          <div>
            {/* Governance Sub-tabs */}
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '24px',
              padding: '8px',
              backgroundColor: isDark ? '#1C1C1C' : '#F3F4F6',
              borderRadius: '8px',
              width: 'fit-content'
            }}>
              {[
                { id: 'overview', label: 'System Overview' },
                { id: 'signals', label: 'Attention Signals' },
                { id: 'inventory', label: 'Circle Inventory' },
                { id: 'templates', label: 'Templates' }
              ].map(subtab => (
                <button
                  key={subtab.id}
                  onClick={() => setGovSubTab(subtab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: govSubTab === subtab.id 
                      ? (isDark ? '#C8A857' : '#C8A857')
                      : 'transparent',
                    color: govSubTab === subtab.id 
                      ? (isDark ? '#000' : '#000')
                      : (isDark ? '#9CA3AF' : '#6B7280'),
                    fontSize: '13px',
                    fontWeight: govSubTab === subtab.id ? '600' : '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {subtab.label}
                </button>
              ))}
            </div>
            
            {/* Governance Governing Rule Notice */}
            <div style={{
              padding: '16px 20px',
              marginBottom: '24px',
              backgroundColor: isDark ? 'rgba(200, 168, 87, 0.1)' : 'rgba(200, 168, 87, 0.15)',
              border: `1px solid ${isDark ? 'rgba(200, 168, 87, 0.3)' : 'rgba(200, 168, 87, 0.4)'}`,
              borderRadius: '8px'
            }}>
              <p style={{
                fontSize: '13px',
                color: isDark ? '#C8A857' : '#92400E',
                margin: 0,
                fontWeight: '500'
              }}>
                <Shield size={14} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'middle' }} />
                <strong>Governing Rule:</strong> Meta-Governance may <em>Observe, Flag, Suggest</em>. 
                It may NOT <em>Decide, Enforce, Punish, or Override Circle sovereignty</em>.
              </p>
            </div>
            
            {govLoading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: isDark ? '#9CA3AF' : '#6B7280' }}>
                Loading governance data...
              </div>
            ) : govError ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#EF4444' }}>
                Error: {govError}
              </div>
            ) : (
              <>
                {/* System Overview */}
                {govSubTab === 'overview' && govOverview && (
                  <div>
                    <Card isDark={isDark} title="System Overview (Counts Only)" icon={Globe}>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: '16px',
                        marginBottom: '24px'
                      }}>
                        {/* Total Circles */}
                        <div style={{
                          padding: '20px',
                          backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                        }}>
                          <p style={{ fontSize: '32px', fontWeight: '700', color: '#C8A857', margin: '0 0 8px 0' }}>
                            {govOverview.total_circles}
                          </p>
                          <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', margin: 0 }}>
                            Total Circles
                          </p>
                        </div>
                        
                        {/* Orphaned */}
                        <div style={{
                          padding: '20px',
                          backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: `1px solid ${govOverview.orphaned_count > 0 ? 'rgba(239, 68, 68, 0.3)' : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')}`
                        }}>
                          <p style={{ fontSize: '32px', fontWeight: '700', color: govOverview.orphaned_count > 0 ? '#EF4444' : '#10B981', margin: '0 0 8px 0' }}>
                            {govOverview.orphaned_count}
                          </p>
                          <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', margin: 0 }}>
                            Orphaned (No Admin)
                          </p>
                        </div>
                        
                        {/* Dormant */}
                        <div style={{
                          padding: '20px',
                          backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                        }}>
                          <p style={{ fontSize: '32px', fontWeight: '700', color: govOverview.dormant_count > 0 ? '#F59E0B' : '#10B981', margin: '0 0 8px 0' }}>
                            {govOverview.dormant_count}
                          </p>
                          <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', margin: 0 }}>
                            Dormant (90+ days)
                          </p>
                        </div>
                        
                        {/* Large without governance */}
                        <div style={{
                          padding: '20px',
                          backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                          borderRadius: '8px',
                          textAlign: 'center',
                          border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                        }}>
                          <p style={{ fontSize: '32px', fontWeight: '700', color: isDark ? '#F7F7F7' : '#111217', margin: '0 0 8px 0' }}>
                            {govOverview.large_without_governance}
                          </p>
                          <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', margin: 0 }}>
                            Large (100+) with &lt;2 Admins
                          </p>
                        </div>
                      </div>
                      
                      {/* By Type */}
                      <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#F7F7F7' : '#111217', marginBottom: '12px' }}>
                          Circles by Type
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          {Object.entries(govOverview.circles_by_type || {}).map(([type, count]) => (
                            <div key={type} style={{
                              padding: '8px 16px',
                              backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                              borderRadius: '6px',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                            }}>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#C8A857' }}>{count}</span>
                              <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', marginLeft: '8px', textTransform: 'capitalize' }}>{type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* By Visibility */}
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: isDark ? '#F7F7F7' : '#111217', marginBottom: '12px' }}>
                          Circles by Visibility
                        </h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          {Object.entries(govOverview.circles_by_visibility || {}).map(([vis, count]) => (
                            <div key={vis} style={{
                              padding: '8px 16px',
                              backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                              borderRadius: '6px',
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                            }}>
                              <span style={{ fontSize: '14px', fontWeight: '600', color: '#C8A857' }}>{count}</span>
                              <span style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', marginLeft: '8px', textTransform: 'capitalize' }}>{vis}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
                
                {/* Attention Signals */}
                {govSubTab === 'signals' && (
                  <div>
                    <Card isDark={isDark} title="Attention Signals (Informational Only)" icon={AlertCircle}>
                      <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '20px' }}>
                        These signals are observations only. No automated actions are taken.
                      </p>
                      
                      {govSignals.length === 0 ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '48px',
                          backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                          borderRadius: '8px',
                          color: '#10B981'
                        }}>
                          <CheckCircle size={32} style={{ marginBottom: '12px' }} />
                          <p style={{ margin: 0 }}>No attention signals at this time.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {govSignals.map((signal, idx) => (
                            <div key={idx} style={{
                              padding: '16px',
                              backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                              borderRadius: '8px',
                              borderLeft: `4px solid ${signal.severity === 'warning' ? '#F59E0B' : '#3B82F6'}`,
                              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                  fontSize: '11px',
                                  fontWeight: '600',
                                  backgroundColor: signal.severity === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                                  color: signal.severity === 'warning' ? '#F59E0B' : '#3B82F6',
                                  textTransform: 'uppercase'
                                }}>
                                  {signal.signal_type.replace('_', ' ')}
                                </span>
                                <span style={{ fontSize: '11px', color: isDark ? '#6B7280' : '#9CA3AF' }}>
                                  {signal.severity}
                                </span>
                              </div>
                              <p style={{ fontSize: '14px', color: isDark ? '#F7F7F7' : '#111217', margin: '0 0 8px 0', fontWeight: '500' }}>
                                {signal.message}
                              </p>
                              <p style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF', margin: 0 }}>
                                Circle: {signal.circle_name}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </Card>
                  </div>
                )}
                
                {/* Circle Inventory */}
                {govSubTab === 'inventory' && (
                  <div>
                    <Card isDark={isDark} title="Circle Inventory (Structural View)" icon={Users}>
                      {/* Filters */}
                      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        <select
                          value={govSortBy}
                          onChange={(e) => { setGovSortBy(e.target.value); setTimeout(refreshGovernanceCircles, 100); }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                            color: isDark ? '#F7F7F7' : '#111217',
                            fontSize: '13px'
                          }}
                        >
                          <option value="type">Sort by Type</option>
                          <option value="size">Sort by Size</option>
                          <option value="status">Sort by Status</option>
                        </select>
                        
                        <select
                          value={govFilterType}
                          onChange={(e) => { setGovFilterType(e.target.value); setTimeout(refreshGovernanceCircles, 100); }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                            color: isDark ? '#F7F7F7' : '#111217',
                            fontSize: '13px'
                          }}
                        >
                          <option value="">All Types</option>
                          <option value="community">Community</option>
                          <option value="support">Support</option>
                          <option value="prayer">Prayer</option>
                          <option value="faith">Faith</option>
                        </select>
                        
                        <select
                          value={govFilterStatus}
                          onChange={(e) => { setGovFilterStatus(e.target.value); setTimeout(refreshGovernanceCircles, 100); }}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
                            color: isDark ? '#F7F7F7' : '#111217',
                            fontSize: '13px'
                          }}
                        >
                          <option value="">All Status</option>
                          <option value="active">Active</option>
                          <option value="dormant">Dormant</option>
                          <option value="orphaned">Orphaned</option>
                        </select>
                      </div>
                      
                      {/* Table */}
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                          <thead>
                            <tr style={{ borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}` }}>
                              <th style={{ textAlign: 'left', padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>Name</th>
                              <th style={{ textAlign: 'left', padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>Type</th>
                              <th style={{ textAlign: 'left', padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>Visibility</th>
                              <th style={{ textAlign: 'center', padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>Members</th>
                              <th style={{ textAlign: 'center', padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>Admins</th>
                              <th style={{ textAlign: 'center', padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>Mods</th>
                              <th style={{ textAlign: 'center', padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>Rules</th>
                              <th style={{ textAlign: 'left', padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>Entry</th>
                              <th style={{ textAlign: 'left', padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', fontWeight: '600' }}>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {govCircles.map((circle, idx) => (
                              <tr key={circle.id} style={{ 
                                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`,
                                backgroundColor: idx % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
                              }}>
                                <td style={{ padding: '12px 8px', color: isDark ? '#F7F7F7' : '#111217', fontWeight: '500' }}>{circle.name}</td>
                                <td style={{ padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'capitalize' }}>{circle.circle_type}</td>
                                <td style={{ padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'capitalize' }}>{circle.visibility}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', color: isDark ? '#F7F7F7' : '#111217' }}>{circle.member_count}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', color: circle.admin_count === 0 ? '#EF4444' : (isDark ? '#F7F7F7' : '#111217') }}>{circle.admin_count}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center', color: isDark ? '#9CA3AF' : '#6B7280' }}>{circle.moderator_count}</td>
                                <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                  {circle.has_rules ? (
                                    <Check size={16} style={{ color: '#10B981' }} />
                                  ) : (
                                    <span style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>—</span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 8px', color: isDark ? '#9CA3AF' : '#6B7280', textTransform: 'capitalize' }}>{circle.entry_control}</td>
                                <td style={{ padding: '12px 8px' }}>
                                  <span style={{
                                    padding: '3px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    backgroundColor: circle.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 
                                                     circle.status === 'dormant' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                    color: circle.status === 'active' ? '#10B981' : 
                                           circle.status === 'dormant' ? '#F59E0B' : '#EF4444',
                                    textTransform: 'capitalize'
                                  }}>
                                    {circle.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {govCircles.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '32px', color: isDark ? '#6B7280' : '#9CA3AF' }}>
                          No circles match your filters.
                        </div>
                      )}
                    </Card>
                  </div>
                )}
                
                {/* Templates */}
                {govSubTab === 'templates' && (
                  <div>
                    <Card isDark={isDark} title="Governance Templates (Opt-In Guidance)" icon={FileText}>
                      <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', marginBottom: '20px' }}>
                        Templates provide suggestions only. Circles may accept, ignore, or customize. No enforcement.
                      </p>
                      
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '16px'
                      }}>
                        {govTemplates.map(template => (
                          <div key={template.template_id} style={{
                            padding: '20px',
                            backgroundColor: isDark ? '#1C1C1C' : '#F9FAFB',
                            borderRadius: '8px',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                          }}>
                            <h4 style={{ fontSize: '15px', fontWeight: '600', color: isDark ? '#F7F7F7' : '#111217', margin: '0 0 8px 0' }}>
                              {template.name}
                            </h4>
                            <p style={{ fontSize: '13px', color: isDark ? '#9CA3AF' : '#6B7280', margin: '0 0 16px 0' }}>
                              {template.description}
                            </p>
                            <div style={{ fontSize: '12px', color: isDark ? '#6B7280' : '#9CA3AF' }}>
                              <strong>Suggested Configuration:</strong>
                              <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px' }}>
                                {Object.entries(template.suggested_config || {}).map(([key, value]) => (
                                  <li key={key} style={{ marginBottom: '4px' }}>
                                    {key.replace(/_/g, ' ')}: <span style={{ color: '#C8A857' }}>{String(value)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </div>
          )}
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default FounderControlCenter;
