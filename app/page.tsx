"use client"
import React, { useState } from 'react';
import { ChevronDown, Lock, Database, Key } from 'lucide-react';

export default function DatabaseArchitecture() {
  const [expandedSection, setExpandedSection] = useState('auth');

  const sections = {
    auth: {
      title: 'Authentication & User Core',
      tables: [
        {
          name: 'auth.users',
          desc: 'Supabase managed authentication table',
          fields: [
            { name: 'id', type: 'UUID', pk: true, required: true },
            { name: 'email', type: 'TEXT', required: true },
            { name: 'encrypted_password', type: 'TEXT', required: true },
          ],
          rls: 'Managed by Supabase Auth'
        },
        {
          name: 'profiles',
          desc: 'User profile information and metadata',
          fields: [
            { name: 'id', type: 'UUID', pk: true, fk: 'auth.users.id', required: true },
            { name: 'full_name', type: 'TEXT', required: false },
            { name: 'plan', type: 'ENUM(free|pro)', required: true, default: 'free' },
            { name: 'created_at', type: 'TIMESTAMP', required: true },
            { name: 'updated_at', type: 'TIMESTAMP', required: true },
          ],
          rls: 'Users can only access their own profile'
        }
      ]
    },
    content: {
      title: 'Content Management',
      tables: [
        {
          name: 'documents',
          desc: 'Store files and links with metadata',
          fields: [
            { name: 'id', type: 'UUID', pk: true, required: true },
            { name: 'user_id', type: 'UUID', fk: 'profiles.id', required: true },
            { name: 'title', type: 'TEXT', required: true },
            { name: 'category', type: 'ENUM', required: true },
            { name: 'document_type', type: 'ENUM(file|link)', required: true },
            { name: 'file_path', type: 'TEXT', required: false },
            { name: 'file_name', type: 'TEXT', required: false },
            { name: 'file_size', type: 'INTEGER', required: false },
            { name: 'link_url', type: 'TEXT', required: false },
            { name: 'expiry_date', type: 'DATE', required: false },
            { name: 'notes', type: 'TEXT', required: false },
            { name: 'created_at', type: 'TIMESTAMP', required: true },
            { name: 'updated_at', type: 'TIMESTAMP', required: true },
          ],
          rls: 'Users can only access their own documents'
        },
        {
          name: 'checklists',
          desc: 'Reusable checklist templates and instances',
          fields: [
            { name: 'id', type: 'UUID', pk: true, required: true },
            { name: 'user_id', type: 'UUID', fk: 'profiles.id', required: true },
            { name: 'title', type: 'TEXT', required: true },
            { name: 'is_template', type: 'BOOLEAN', required: true, default: false },
            { name: 'is_system_template', type: 'BOOLEAN', required: true, default: false },
            { name: 'created_at', type: 'TIMESTAMP', required: true },
            { name: 'updated_at', type: 'TIMESTAMP', required: true },
          ],
          rls: 'Users can access their own checklists + system templates'
        },
        {
          name: 'checklist_items',
          desc: 'Individual items within checklists',
          fields: [
            { name: 'id', type: 'UUID', pk: true, required: true },
            { name: 'checklist_id', type: 'UUID', fk: 'checklists.id', required: true },
            { name: 'user_id', type: 'UUID', fk: 'profiles.id', required: true },
            { name: 'title', type: 'TEXT', required: true },
            { name: 'is_completed', type: 'BOOLEAN', required: true, default: false },
            { name: 'sort_order', type: 'INTEGER', required: true },
            { name: 'created_at', type: 'TIMESTAMP', required: true },
          ],
          rls: 'Users can only access their own items'
        }
      ]
    },
    scheduling: {
      title: 'Scheduling & Events',
      tables: [
        {
          name: 'events',
          desc: 'Important dates and recurring events',
          fields: [
            { name: 'id', type: 'UUID', pk: true, required: true },
            { name: 'user_id', type: 'UUID', fk: 'profiles.id', required: true },
            { name: 'title', type: 'TEXT', required: true },
            { name: 'event_date', type: 'DATE', required: true },
            { name: 'event_time', type: 'TIME', required: false },
            { name: 'repeat_type', type: 'ENUM(none|daily|weekly|monthly|yearly)', required: true, default: 'none' },
            { name: 'is_active', type: 'BOOLEAN', required: true, default: true },
            { name: 'created_at', type: 'TIMESTAMP', required: true },
            { name: 'updated_at', type: 'TIMESTAMP', required: true },
          ],
          rls: 'Users can only access their own events'
        }
      ]
    },
    notifications: {
      title: 'Alerts & Notifications',
      tables: [
        {
          name: 'alerts',
          desc: 'Reminder alerts for documents and events',
          fields: [
            { name: 'id', type: 'UUID', pk: true, required: true },
            { name: 'user_id', type: 'UUID', fk: 'profiles.id', required: true },
            { name: 'document_id', type: 'UUID', fk: 'documents.id', required: false },
            { name: 'event_id', type: 'UUID', fk: 'events.id', required: false },
            { name: 'alert_type', type: 'ENUM(expiry|deadline|reminder)', required: true },
            { name: 'days_before', type: 'INTEGER', required: false },
            { name: 'hours_before', type: 'INTEGER', required: false },
            { name: 'exact_datetime', type: 'TIMESTAMP', required: false },
            { name: 'is_active', type: 'BOOLEAN', required: true, default: true },
            { name: 'is_auto_created', type: 'BOOLEAN', required: true, default: false },
            { name: 'created_at', type: 'TIMESTAMP', required: true },
          ],
          rls: 'Users can only access their own alerts'
        },
        {
          name: 'notification_logs',
          desc: 'Audit trail for notification delivery',
          fields: [
            { name: 'id', type: 'UUID', pk: true, required: true },
            { name: 'user_id', type: 'UUID', fk: 'profiles.id', required: true },
            { name: 'alert_id', type: 'UUID', fk: 'alerts.id', required: true },
            { name: 'notification_type', type: 'ENUM(email|push|sms)', required: true },
            { name: 'status', type: 'ENUM(sent|failed|pending)', required: true },
            { name: 'error_message', type: 'TEXT', required: false },
            { name: 'retry_count', type: 'INTEGER', required: true, default: 0 },
            { name: 'sent_at', type: 'TIMESTAMP', required: false },
            { name: 'created_at', type: 'TIMESTAMP', required: true },
          ],
          rls: 'Users can only access their own logs'
        }
      ]
    },
    user: {
      title: 'User Settings & Billing',
      tables: [
        {
          name: 'user_preferences',
          desc: 'User customization settings',
          fields: [
            { name: 'user_id', type: 'UUID', pk: true, fk: 'profiles.id', required: true },
            { name: 'timezone', type: 'TEXT', required: true, default: 'UTC' },
            { name: 'push_enabled', type: 'BOOLEAN', required: true, default: true },
            { name: 'email_enabled', type: 'BOOLEAN', required: true, default: true },
            { name: 'default_alerts_enabled', type: 'BOOLEAN', required: true, default: true },
            { name: 'updated_at', type: 'TIMESTAMP', required: true },
          ],
          rls: 'Users can only access their own preferences'
        },
        {
          name: 'subscriptions',
          desc: 'Stripe integration and billing management',
          fields: [
            { name: 'id', type: 'UUID', pk: true, required: true },
            { name: 'user_id', type: 'UUID', fk: 'profiles.id', required: true, unique: true },
            { name: 'stripe_customer_id', type: 'TEXT', required: false, unique: true },
            { name: 'stripe_subscription_id', type: 'TEXT', required: false, unique: true },
            { name: 'plan_type', type: 'ENUM(free|pro)', required: true },
            { name: 'billing_interval', type: 'ENUM(monthly|yearly)', required: false },
            { name: 'status', type: 'ENUM(active|cancelled|expired)', required: true },
            { name: 'current_period_start', type: 'TIMESTAMP', required: false },
            { name: 'current_period_end', type: 'TIMESTAMP', required: false },
            { name: 'created_at', type: 'TIMESTAMP', required: true },
            { name: 'updated_at', type: 'TIMESTAMP', required: true },
          ],
          rls: 'Users can only access their own subscription'
        }
      ]
    }
  };

  const FieldBadge = ({ field }) => (
    <div className="mb-3 p-3 bg-slate-700 rounded border border-slate-600">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <code className="text-sm font-mono font-bold text-cyan-300">{field.name}</code>
        <span className="text-xs px-2 py-1 bg-slate-600 text-blue-300 rounded font-mono border border-slate-500">{field.type}</span>
        {field.pk && <span className="text-xs px-2 py-1 bg-amber-900 text-amber-300 rounded flex items-center gap-1 border border-amber-700"><Key size={12} /> PK</span>}
        {field.fk && <span className="text-xs px-2 py-1 bg-emerald-900 text-emerald-300 rounded border border-emerald-700">FK: {field.fk}</span>}
        {field.unique && <span className="text-xs px-2 py-1 bg-purple-900 text-purple-300 rounded border border-purple-700">UNIQUE</span>}
        {!field.required && <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded border border-slate-500">NULLABLE</span>}
      </div>
      {field.default && <div className="text-xs text-slate-400 ml-0">default: <code className="text-cyan-400">{field.default}</code></div>}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Tido V0 Database Architecture</h1>
          <p className="text-slate-400 text-lg">Complete schema documentation with relationships and security policies</p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg border-l-4 border-purple-500 hover:bg-slate-750 transition">
            <div className="flex items-center gap-3 mb-2">
              <Database size={20} className="text-purple-400" />
              <span className="text-sm font-semibold text-slate-300">Tables</span>
            </div>
            <p className="text-2xl font-bold text-white">11</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg border-l-4 border-red-500 hover:bg-slate-750 transition">
            <div className="flex items-center gap-3 mb-2">
              <Lock size={20} className="text-red-400" />
              <span className="text-sm font-semibold text-slate-300">RLS Enabled</span>
            </div>
            <p className="text-2xl font-bold text-white">100%</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg border-l-4 border-green-500 hover:bg-slate-750 transition">
            <div className="flex items-center gap-3 mb-2">
              <Key size={20} className="text-green-400" />
              <span className="text-sm font-semibold text-slate-300">Foreign Keys</span>
            </div>
            <p className="text-2xl font-bold text-white">11</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4 shadow-lg border-l-4 border-blue-500 hover:bg-slate-750 transition">
            <div className="flex items-center gap-3 mb-2">
              <Database size={20} className="text-blue-400" />
              <span className="text-sm font-semibold text-slate-300">User-Scoped</span>
            </div>
            <p className="text-2xl font-bold text-white">Yes</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-4 mb-8">
          {Object.entries(sections).map(([key, section]) => (
            <div key={key} className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
              {/* Section Header */}
              <button
                onClick={() => setExpandedSection(expandedSection === key ? '' : key)}
                className="w-full px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border-b border-slate-700 flex items-center justify-between transition"
              >
                <h2 className="text-lg font-bold text-white">{section.title}</h2>
                <ChevronDown
                  size={20}
                  className={`text-slate-400 transition ${expandedSection === key ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Section Content */}
              {expandedSection === key && (
                <div className="p-6 space-y-6">
                  {section.tables.map((table, idx) => (
                    <div key={idx} className="border border-slate-700 rounded-lg p-5 bg-slate-750">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-cyan-300 mb-1">{table.name}</h3>
                        <p className="text-sm text-slate-400 mb-2">{table.desc}</p>
                        <div className="flex items-center gap-2">
                          <Lock size={14} className="text-red-400" />
                          <span className="text-xs font-semibold text-red-400">{table.rls}</span>
                        </div>
                      </div>

                      <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                        <div className="space-y-0">
                          {table.fields.map((field, fidx) => (
                            <FieldBadge key={fidx} field={field} />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Relationships */}
        <div className="bg-slate-800 rounded-lg shadow-lg p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-bold text-white mb-4">Relationships</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-slate-700 rounded border border-slate-600">
              <span className="text-sm text-cyan-300"><strong>auth.users</strong></span>
              <span className="text-slate-500">→ 1:1 →</span>
              <span className="text-sm text-cyan-300"><strong>profiles</strong></span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-700 rounded border border-slate-600">
              <span className="text-sm text-cyan-300"><strong>profiles</strong></span>
              <span className="text-slate-500">→ 1:N →</span>
              <span className="text-sm text-slate-300"><strong>documents, events, alerts, checklists, subscriptions, user_preferences, notification_logs</strong></span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-700 rounded border border-slate-600">
              <span className="text-sm text-cyan-300"><strong>checklists</strong></span>
              <span className="text-slate-500">→ 1:N →</span>
              <span className="text-sm text-cyan-300"><strong>checklist_items</strong></span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-700 rounded border border-slate-600">
              <span className="text-sm text-cyan-300"><strong>documents, events</strong></span>
              <span className="text-slate-500">→ 1:N →</span>
              <span className="text-sm text-slate-300"><strong>alerts</strong> (optional)</span>
            </div>
            <div className="flex items-center gap-4 p-3 bg-slate-700 rounded border border-slate-600">
              <span className="text-sm text-cyan-300"><strong>alerts</strong></span>
              <span className="text-slate-500">→ 1:N →</span>
              <span className="text-sm text-cyan-300"><strong>notification_logs</strong></span>
            </div>
          </div>
        </div>

        {/* Architecture Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Security Features</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Row Level Security (RLS) on all tables</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Users isolated to their own data</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>System templates accessible to all users</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Service role for admin operations</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-400 font-bold">✓</span>
                <span>Foreign key constraints with CASCADE delete</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-4">Performance Optimizations</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">⚡</span>
                <span>Indexes on all foreign keys</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">⚡</span>
                <span>Indexes on frequently queried fields</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">⚡</span>
                <span>Composite indexes for sorting and filtering</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">⚡</span>
                <span>Partial indexes for active records</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-400 font-bold">⚡</span>
                <span>Timestamps with auto-update triggers</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700 mb-8">
          <h3 className="text-lg font-bold text-white mb-4">Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-amber-900 text-amber-300 rounded text-xs font-mono border border-amber-700">PK</span>
              <span className="text-slate-300">Primary Key</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-emerald-900 text-emerald-300 rounded text-xs font-mono border border-emerald-700">FK</span>
              <span className="text-slate-300">Foreign Key</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-purple-900 text-purple-300 rounded text-xs font-mono border border-purple-700">UNIQUE</span>
              <span className="text-slate-300">Unique Constraint</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-slate-600 text-slate-300 rounded text-xs font-mono border border-slate-500">NULLABLE</span>
              <span className="text-slate-300">Optional Field</span>
            </div>
          </div>
        </div>

        {/* Database Functions Section */}
        <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-6">Database Functions & Stored Procedures</h2>
          
          <div className="space-y-6">
            {/* Document Functions */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">📄 Document Functions</h3>
              <div className="space-y-3 text-sm text-slate-300">
                
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">get_document_days_remaining(doc_id)</p>
                  <p className="text-slate-400 text-xs mb-3">Calculate days remaining until document expiry</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> doc_id = '550e8400-e29b-41d4-a716-446655440000'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong> INTEGER → 45</p>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">get_expiring_documents(user_id, days_threshold)</p>
                  <p className="text-slate-400 text-xs mb-3">Get all documents expiring within X days</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001', days_threshold = 30</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>id | title | category | expiry_date | days_remaining</p>
                      <p>550e8400-...440010 | Passport | id_passport | 2025-01-15 | 28</p>
                      <p>550e8400-...440011 | Lease | contracts | 2025-02-10 | 23</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">get_document_stats(user_id)</p>
                  <p className="text-slate-400 text-xs mb-3">Dashboard stats: total, files, links, expiring soon</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>total_documents: 15 | file_count: 8 | link_count: 7 | expiring_soon: 4</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">get_documents_by_category(user_id, category)</p>
                  <p className="text-slate-400 text-xs mb-3">Filter documents by category with days remaining</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001', category = 'id_passport'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>id | title | type | expiry_date | days_remaining</p>
                      <p>550e8400-...440010 | Passport | file | 2025-01-15 | 28</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Functions */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">⏰ Event & Reminder Functions</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">get_upcoming_events(user_id, days_ahead)</p>
                  <p className="text-slate-400 text-xs mb-3">Get upcoming events within X days with days until display</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001', days_ahead = 30</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>id | title | event_date | event_time | repeat_type | days_until</p>
                      <p>660e8400-...440001 | Car Maintenance | 2025-01-05 | 10:00:00 | monthly | 18</p>
                      <p>660e8400-...440002 | Doctor Appt | 2025-01-12 | 14:30:00 | none | 25</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">get_event_stats(user_id)</p>
                  <p className="text-slate-400 text-xs mb-3">Event dashboard stats: total, active, upcoming, recurring</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>total_events: 8 | active_events: 7 | upcoming_this_month: 3 | repeat_events: 5</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alert Functions */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">🔔 Alert & Notification Functions</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="bg-slate-700 p-3 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono">create_auto_expiry_alerts(user_id, doc_id, category)</p>
                  <p className="text-slate-400 text-xs mt-1">Auto-create category-specific expiry alerts (ID 6mo/3mo/1mo/1wk, Contracts 3mo/2mo/1mo/1wk)</p>
                </div>
                <div className="bg-slate-700 p-3 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono">get_active_alerts(user_id)</p>
                  <p className="text-slate-400 text-xs mt-1">Get all active alerts with calculated trigger datetimes</p>
                </div>
                <div className="bg-slate-700 p-3 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono">get_alerts_due_now(minutes_threshold)</p>
                  <p className="text-slate-400 text-xs mt-1">Get alerts due within X minutes (for cron job triggering)</p>
                </div>
                <div className="bg-slate-700 p-3 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono">log_notification(user_id, alert_id, type, status, error)</p>
                  <p className="text-slate-400 text-xs mt-1">Log notification delivery (sent/failed/pending) with error tracking</p>
                </div>
                <div className="bg-slate-700 p-3 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono">get_notification_stats(user_id, days_back)</p>
                  <p className="text-slate-400 text-xs mt-1">Notification delivery stats: success rate, push/email breakdown</p>
                </div>
              </div>
            </div>

            {/* Checklist Functions */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">✅ Checklist & Template Functions</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">get_checklist_details(checklist_id)</p>
                  <p className="text-slate-400 text-xs mb-3">Get checklist with all items and progress percentage</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> checklist_id = '990e8400-e29b-41d4-a716-446655440001'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>id | title | total_items | completed_items | progress_percentage</p>
                      <p>990e8400-...440001 | Vacation Prep | 8 | 5 | 62.5</p>

                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">get_checklist_stats(user_id)</p>
                  <p className="text-slate-400 text-xs mb-3">Checklist stats: total, templates, completion rate</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>total_checklists: 5 | total_templates: 3 | custom_templates: 2</p>
                      <p>total_items: 24 | completed_items: 18</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">copy_template_to_checklist(user_id, template_id)</p>
                  <p className="text-slate-400 text-xs mb-3">Copy system template with all items to new checklist</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001', template_id = '990e8400-...440100'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong> UUID → '990e8400-e29b-41d4-a716-446655440050'</p>
                    <p className="text-slate-400 text-xs">(New checklist created with 8 items copied)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subscription Functions */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">💳 Subscription & Plan Functions</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">get_user_plan(user_id)</p>
                  <p className="text-slate-400 text-xs mb-3">Get current plan, status, billing dates, interval</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>plan_type: pro | status: active | billing_interval: monthly</p>
                      <p>current_period_start: 2024-12-18 | current_period_end: 2025-01-18</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">check_plan_limits(user_id, resource_type)</p>
                  <p className="text-slate-400 text-xs mb-3">Check if user hit limits for resource</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001', resource_type = 'documents' (free plan)</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>current_count: 5 | limit_count: 5 | exceeded: true</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Preference Functions */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">⚙️ User Preference Functions</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="bg-slate-700 p-3 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono">get_user_preferences(user_id)</p>
                  <p className="text-slate-400 text-xs mt-1">Get timezone, notification settings, alert preferences</p>
                </div>
              </div>
            </div>

            {/* Search Functions */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">🔍 Search & Filter Functions</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">search_documents(user_id, search_term)</p>
                  <p className="text-slate-400 text-xs mb-3">Full-text search in title, notes, category (case-insensitive)</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001', search_term = 'pass'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>id | title | category | document_type | expiry_date</p>
                      <p>550e8400-...440010 | Passport | id_passport | file | 2025-01-15</p>
                      <p>550e8400-...440014 | Birth Certificate | id_passport | file | 2030-05-20</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">search_events(user_id, search_term)</p>
                  <p className="text-slate-400 text-xs mb-3">Search events by title (case-insensitive)</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001', search_term = 'doctor'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>id | title | event_date | event_time | repeat_type</p>
                      <p>660e8400-...440002 | Doctor Appointment | 2025-01-12 | 14:30:00 | none</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Maintenance Functions */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">🧹 Cleanup & Maintenance Functions</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">cleanup_old_notification_logs()</p>
                  <p className="text-slate-400 text-xs mb-3">Remove notification logs older than 90 days</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> (no parameters - runs as scheduled cron)</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>deleted_count: 1847</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">deactivate_past_events()</p>
                  <p className="text-slate-400 text-xs mb-3">Auto-deactivate non-recurring events after their date</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> (no parameters - runs as scheduled cron)</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>updated_count: 23</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Batch Operations */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">⚡ Batch Operations</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">update_alerts_status(alert_ids[], new_status)</p>
                  <p className="text-slate-400 text-xs mb-3">Bulk enable/disable multiple alerts at once</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> alert_ids = ['770e8400-...440001', '770e8400-...440002'], new_status = false</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>updated_count: 2</p>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">delete_documents_batch(document_ids[])</p>
                  <p className="text-slate-400 text-xs mb-3">Bulk delete multiple documents with cascading cleanup</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> document_ids = ['550e8400-...440010', '550e8400-...440011', '550e8400-...440012']</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong></p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>deleted_count: 3</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Functions */}
            <div className="border border-slate-700 rounded-lg p-4 bg-slate-750">
              <h3 className="text-lg font-bold text-cyan-300 mb-3">📥 Export Functions</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="bg-slate-700 p-4 rounded border border-slate-600">
                  <p className="text-cyan-300 font-mono font-bold mb-2">export_user_data(user_id)</p>
                  <p className="text-slate-400 text-xs mb-3">Export all user data as JSON (GDPR compliant)</p>
                  <div className="bg-slate-800 p-2 rounded text-xs space-y-1 mb-2">
                    <p className="text-amber-300"><strong>INPUT:</strong> user_id = '550e8400-...440001'</p>
                    <p className="text-emerald-300"><strong>OUTPUT:</strong> JSONB</p>
                    <div className="text-slate-400 font-mono text-xs ml-2">
                      <p>{'{profile: {...}, documents: [...] events: [...], checklists: [...]}'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-slate-700 border border-slate-600 rounded">
            <p className="text-sm text-slate-300">
              <span className="text-green-400 font-bold">✓</span> All functions include RLS security checks and are scoped to authenticated users
            </p>
            <p className="text-sm text-slate-300 mt-2">
              <span className="text-green-400 font-bold">✓</span> Support dashboard queries, cron job triggering, and API endpoints
            </p>
            <p className="text-sm text-slate-300 mt-2">
              <span className="text-green-400 font-bold">✓</span> Includes comprehensive error handling and edge case management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}