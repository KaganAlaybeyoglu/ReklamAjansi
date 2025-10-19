import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Campaign, Client } from '../../types/database';
import { CampaignForm } from './CampaignForm';

export function CampaignsList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [campaignsResult, clientsResult] = await Promise.all([
      supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
      supabase.from('clients').select('*')
    ]);

    if (campaignsResult.data) setCampaigns(campaignsResult.data);
    if (clientsResult.data) setClients(clientsResult.data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this campaign? This will also delete all associated adverts and concept notes.')) return;

    const { error } = await supabase.from('campaigns').delete().eq('id', id);

    if (!error) {
      loadData();
    } else {
      alert('Error deleting campaign');
    }
  };

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client?.name || 'Unknown Client';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'planning': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-slate-100 text-slate-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (showForm || editingCampaign) {
    return (
      <CampaignForm
        campaign={editingCampaign}
        clients={clients}
        onClose={() => {
          setShowForm(false);
          setEditingCampaign(null);
        }}
        onSave={() => {
          setShowForm(false);
          setEditingCampaign(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Campaign Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Campaign
        </button>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <TrendingUp className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No campaigns yet</h3>
          <p className="text-slate-600 mb-6">Create your first marketing campaign.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add Campaign
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{campaign.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{getClientName(campaign.client_id)}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCampaign(campaign)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(campaign.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {campaign.description && (
                <p className="text-sm text-slate-600 mb-4">{campaign.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">${campaign.budget.toLocaleString()}</span>
                </div>
                {(campaign.start_date || campaign.end_date) && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {campaign.start_date && new Date(campaign.start_date).toLocaleDateString()}
                      {campaign.start_date && campaign.end_date && ' - '}
                      {campaign.end_date && new Date(campaign.end_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
