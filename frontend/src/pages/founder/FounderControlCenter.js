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
  GripVertical, ArrowRight
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
  { id: 'admin', name: 'Admin Dashboards', route: '/admin/opportunities', icon: Settings, color: '#6366F1', description: 'Admin panels, moderation, analytics' },
  { id: 'settings', name: 'Settings Hub', route: '/settings', icon: Settings, color: '#64748B', description: 'User account and app settings' },
  { id: 'developer', name: 'Developer Portal', route: '/developer', icon: Code, color: '#10B981', description: 'API access and developer tools' },
  { id: 'contributor', name: 'Contributor Portal', route: '/contributor/login', icon: UserCircle, color: '#8B5CF6', description: 'Content contributor system' },
  { id: 'onboarding', name: 'Onboarding', route: '/onboarding', icon: Users, color: '#F59E0B', description: 'New user onboarding flow' },
  { id: 'resources', name: 'Resources', route: '/resources', icon: BookOpen, color: '#EC4899', description: 'Community resources and guides' },
  { id: 'events', name: 'Events', route: '/events', icon: Calendar, color: '#EF4444', description: 'Community events system' },
  { id: 'tv', name: 'BANIBS TV', route: '/portal/tv', icon: Video, color: '#DC2626', description: 'Video content and streaming' },
  { id: 'ccram', name: 'CCRAM', route: '/ccram', icon: Mic, color: '#7C3AED', description: 'CCR Anchor Module - Interview AI assistant' },
  { id: 'socialworld', name: 'SocialWorld', route: '/socialworld', icon: Globe, color: '#0EA5E9', description: 'Social experience cluster (ShortForm, Moments, Stories, Live, etc.)' },
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

// Status badge helper component
const StatusBadge = ({ status, isDark }) => {
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
  }, [activeTab, accessToken]);
  
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
              { id: 'ops-log', label: 'Ops Log', icon: FileText },
              { id: 'tasks', label: 'Tasks', icon: CheckCircle },
              { id: 'detectors', label: 'Detectors', icon: Radar },
              { id: 'documents', label: 'Documents', icon: Folder },
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
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          fontSize: '11px',
                          fontWeight: '500',
                          color: '#10B981'
                        }}>
                          <CheckCircle size={12} />
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
                            backgroundColor: module.color || '#C8A857',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: '500',
                            textDecoration: 'none',
                            transition: 'opacity 0.2s'
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
                                backgroundColor: module.color || '#6366F1',
                                color: '#FFFFFF',
                                fontSize: '11px',
                                fontWeight: '500',
                                textDecoration: 'none'
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
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default FounderControlCenter;
