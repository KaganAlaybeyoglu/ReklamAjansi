import { useEffect, useState } from 'react';
import { Plus, Mail, Phone, MapPin, Pencil, Trash2, Building2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Client, Staff } from '../../types/database';
import { ClientForm } from './ClientForm';

export function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [clientsResult, staffResult] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('staff').select('*').eq('is_active', true)
    ]);

    if (clientsResult.data) setClients(clientsResult.data);
    if (staffResult.data) setStaff(staffResult.data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    const { error } = await supabase.from('clients').delete().eq('id', id);

    if (!error) {
      loadData();
    } else {
      alert('Error deleting client');
    }
  };

  const getStaffContact = (staffId?: string) => {
    if (!staffId) return 'No contact assigned';
    const staffMember = staff.find(s => s.id === staffId);
    return staffMember ? `${staffMember.first_name} ${staffMember.last_name}` : 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (showForm || editingClient) {
    return (
      <ClientForm
        client={editingClient}
        staff={staff}
        onClose={() => {
          setShowForm(false);
          setEditingClient(null);
        }}
        onSave={() => {
          setShowForm(false);
          setEditingClient(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Client Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No clients yet</h3>
          <p className="text-slate-600 mb-6">Start building your client base.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add Client
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{client.name}</h3>
                  {client.contact_person && (
                    <p className="text-sm text-slate-600 mt-1">{client.contact_person}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingClient(client)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {client.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{client.phone}</span>
                  </div>
                )}
                {(client.city || client.country) && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {[client.city, client.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-medium">Contact: </span>
                  <span className="text-slate-600">{getStaffContact(client.staff_contact_id)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
