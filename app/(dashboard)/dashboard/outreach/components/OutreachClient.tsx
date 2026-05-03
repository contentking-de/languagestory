'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Upload,
  Plus,
  Mail,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  FileSpreadsheet,
  X,
} from 'lucide-react';

interface Contact {
  id: number;
  email: string;
  name: string | null;
  company: string | null;
  notes: string | null;
  source: string;
  createdAt: string;
  lastEmailStatus?: string | null;
  lastEmailDate?: string | null;
}

interface SendProgress {
  total: number;
  sent: number;
  failed: number;
  currentBatch: number;
  totalBatches: number;
  status: 'idle' | 'sending' | 'pausing' | 'done' | 'error';
  errors: string[];
}

export function OutreachClient() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Set<number>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sendProgress, setSendProgress] = useState<SendProgress>({
    total: 0, sent: 0, failed: 0, currentBatch: 0, totalBatches: 0, status: 'idle', errors: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef(false);

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/outreach/contacts');
      if (res.ok) {
        const data = await res.json();
        setContacts(data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/outreach/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        await fetchContacts();
        alert(`${data.imported} Kontakte erfolgreich importiert${data.skipped > 0 ? `, ${data.skipped} übersprungen (Duplikate)` : ''}`);
      } else {
        alert(data.error || 'Import fehlgeschlagen');
      }
    } catch (err) {
      alert('Import fehlgeschlagen');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedContacts.size === 0) return;
    if (!confirm(`${selectedContacts.size} Kontakt(e) wirklich löschen?`)) return;

    try {
      const res = await fetch('/api/outreach/contacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedContacts) }),
      });
      if (res.ok) {
        setSelectedContacts(new Set());
        await fetchContacts();
      }
    } catch (err) {
      alert('Löschen fehlgeschlagen');
    }
  };

  const handleSendEmails = async (subject: string, body: string) => {
    const contactIds = Array.from(selectedContacts);
    const targetContacts = contacts.filter(c => contactIds.includes(c.id));
    const batchSize = 10;
    const totalBatches = Math.ceil(targetContacts.length / batchSize);

    abortRef.current = false;
    setSendProgress({
      total: targetContacts.length,
      sent: 0,
      failed: 0,
      currentBatch: 0,
      totalBatches,
      status: 'sending',
      errors: [],
    });

    let totalSent = 0;
    let totalFailed = 0;
    const allErrors: string[] = [];

    for (let i = 0; i < totalBatches; i++) {
      if (abortRef.current) break;

      const batch = targetContacts.slice(i * batchSize, (i + 1) * batchSize);

      setSendProgress(prev => ({
        ...prev,
        currentBatch: i + 1,
        status: 'sending',
      }));

      try {
        const res = await fetch('/api/outreach/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contactIds: batch.map(c => c.id),
            subject,
            body,
          }),
        });
        const result = await res.json();
        totalSent += result.sent || 0;
        totalFailed += result.failed || 0;
        if (result.errors) allErrors.push(...result.errors);
      } catch {
        totalFailed += batch.length;
        allErrors.push(`Batch ${i + 1} komplett fehlgeschlagen`);
      }

      setSendProgress(prev => ({
        ...prev,
        sent: totalSent,
        failed: totalFailed,
        errors: allErrors,
      }));

      if (i < totalBatches - 1 && !abortRef.current) {
        setSendProgress(prev => ({ ...prev, status: 'pausing' }));
        await new Promise(resolve => setTimeout(resolve, 20000));
      }
    }

    setSendProgress(prev => ({ ...prev, status: 'done' }));
    await fetchContacts();
  };

  const toggleSelectAll = () => {
    if (selectedContacts.size === filteredContacts.length) {
      setSelectedContacts(new Set());
    } else {
      setSelectedContacts(new Set(filteredContacts.map(c => c.id)));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedContacts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredContacts = contacts.filter(c =>
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const statusIcon = (status: string | null | undefined) => {
    switch (status) {
      case 'sent': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed': case 'bounced': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <span className="h-4 w-4 inline-block" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Kontakte suchen..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <span className="text-sm text-gray-500">
            {filteredContacts.length} Kontakt{filteredContacts.length !== 1 ? 'e' : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
          >
            {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
            XLSX Import
          </Button>
          <Button variant="outline" onClick={() => setShowAddModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Kontakt hinzufügen
          </Button>
          {selectedContacts.size > 0 && (
            <>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={handleDeleteSelected}>
                <Trash2 className="h-4 w-4 mr-2" />
                {selectedContacts.size} löschen
              </Button>
              <Button onClick={() => setShowEmailModal(true)}>
                <Mail className="h-4 w-4 mr-2" />
                E-Mail an {selectedContacts.size} senden
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Send Progress */}
      {sendProgress.status !== 'idle' && (
        <SendProgressBar progress={sendProgress} onAbort={() => { abortRef.current = true; }} />
      )}

      {/* Contacts Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 text-left w-10">
                <input
                  type="checkbox"
                  checked={filteredContacts.length > 0 && selectedContacts.size === filteredContacts.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">E-Mail</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Firma</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Quelle</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Letzter Versand</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  {contacts.length === 0 
                    ? 'Noch keine Kontakte vorhanden. Importiere eine XLSX-Datei oder füge Kontakte manuell hinzu.'
                    : 'Keine Kontakte gefunden.'}
                </td>
              </tr>
            ) : (
              filteredContacts.map(contact => (
                <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedContacts.has(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="p-3 text-sm font-medium">{contact.email}</td>
                  <td className="p-3 text-sm text-gray-600">{contact.name || '—'}</td>
                  <td className="p-3 text-sm text-gray-600">{contact.company || '—'}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      contact.source === 'xlsx' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {contact.source}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-500">
                    {contact.lastEmailDate
                      ? new Date(contact.lastEmailDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td className="p-3">{statusIcon(contact.lastEmailStatus)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Contact Modal */}
      {showAddModal && (
        <AddContactModal
          onClose={() => setShowAddModal(false)}
          onAdded={() => { setShowAddModal(false); fetchContacts(); }}
        />
      )}

      {/* Email Compose Modal */}
      {showEmailModal && (
        <ComposeEmailModal
          selectedCount={selectedContacts.size}
          onClose={() => setShowEmailModal(false)}
          onSend={(subject, body) => {
            setShowEmailModal(false);
            handleSendEmails(subject, body);
          }}
        />
      )}
    </div>
  );
}

function SendProgressBar({ progress, onAbort }: { progress: SendProgress; onAbort: () => void }) {
  const pct = progress.total > 0 ? Math.round(((progress.sent + progress.failed) / progress.total) * 100) : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {progress.status === 'sending' && <Loader2 className="h-4 w-4 animate-spin text-orange-500" />}
          {progress.status === 'pausing' && <Clock className="h-4 w-4 text-yellow-500" />}
          {progress.status === 'done' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          <span className="text-sm font-medium">
            {progress.status === 'sending' && `Sende Batch ${progress.currentBatch}/${progress.totalBatches}...`}
            {progress.status === 'pausing' && `Pause vor nächstem Batch (20s)...`}
            {progress.status === 'done' && 'Versand abgeschlossen'}
            {progress.status === 'error' && 'Versand fehlgeschlagen'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {progress.sent} gesendet, {progress.failed} fehlgeschlagen / {progress.total} gesamt
          </span>
          {(progress.status === 'sending' || progress.status === 'pausing') && (
            <Button variant="outline" size="sm" onClick={onAbort}>Abbrechen</Button>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${progress.failed > 0 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {progress.errors.length > 0 && (
        <div className="text-sm text-red-600 space-y-1">
          {progress.errors.slice(-5).map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function AddContactModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setSaving(true);
    try {
      const res = await fetch('/api/outreach/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: name || null, company: company || null, notes: notes || null }),
      });
      if (res.ok) {
        onAdded();
      } else {
        const data = await res.json();
        alert(data.error || 'Fehler beim Speichern');
      }
    } catch {
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Kontakt hinzufügen</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-Mail *</Label>
            <Input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
          </div>
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Max Mustermann" />
          </div>
          <div>
            <Label htmlFor="company">Firma</Label>
            <Input id="company" value={company} onChange={e => setCompany(e.target.value)} placeholder="Musterfirma GmbH" />
          </div>
          <div>
            <Label htmlFor="notes">Notizen</Label>
            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-orange-500" placeholder="Optionale Notizen..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Speichern
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ComposeEmailModal({ selectedCount, onClose, onSend }: {
  selectedCount: number;
  onClose: () => void;
  onSend: (subject: string, body: string) => void;
}) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;
    onSend(subject, body);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Outreach E-Mail verfassen</h2>
            <p className="text-sm text-gray-500 mt-1">
              Wird an {selectedCount} Kontakt{selectedCount !== 1 ? 'e' : ''} gesendet (in 10er-Batches mit 20s Pause)
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <Label htmlFor="subject">Betreff *</Label>
            <Input id="subject" required value={subject} onChange={e => setSubject(e.target.value)} placeholder="Betreff der E-Mail" />
          </div>
          <div>
            <Label htmlFor="body">Nachricht * (HTML unterstützt)</Label>
            <textarea
              id="body"
              required
              value={body}
              onChange={e => setBody(e.target.value)}
              className="w-full border border-gray-200 rounded-md p-3 text-sm min-h-[250px] focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              placeholder={`<h2>Hallo!</h2>\n<p>Wir möchten Ihnen unsere Plattform vorstellen...</p>`}
            />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Hinweis:</strong> E-Mails werden in Batches von 10 versendet mit 20 Sekunden Pause zwischen den Batches. Der Fortschritt wird live angezeigt.
            </p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Abbrechen</Button>
            <Button type="submit" disabled={!subject.trim() || !body.trim()}>
              <Mail className="h-4 w-4 mr-2" />
              Jetzt senden
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
