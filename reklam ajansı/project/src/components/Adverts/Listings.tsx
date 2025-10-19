import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileText, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Advert, Campaign } from '../../types/database';
import { AdvertForm } from './AdvertForm';

export function Listings() {
  const [adverts, setAdverts] = useState<Advert[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAdvert, setEditingAdvert] = useState<Advert | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [advertsResult, campaignsResult] = await Promise.all([
      supabase.from('adverts').select('*').order('created_at', { ascending: false }),
      supabase.from('campaigns').select('*')
    ]);

    if (advertsResult.data) setAdverts(advertsResult.data);
    if (campaignsResult.data) setCampaigns(campaignsResult.data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advert?')) return;

    const { error } = await supabase.from('adverts').delete().eq('id', id);

    if (!error) {
      loadData();
    } else {
      alert('Error deleting advert');
    }
  };

  const getCampaignName = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    return campaign?.name || 'Unknown Campaign';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concept': return 'bg-blue-100 text-blue-700';
      case 'in_production': return 'bg-yellow-100 text-yellow-700';
      case 'review': return 'bg-orange-100 text-orange-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (showForm || editingAdvert) {
    return (
      <AdvertForm
        advert={editingAdvert}
        campaigns={campaigns}
        onClose={() => {
          setShowForm(false);
          setEditingAdvert(null);
        }}
        onSave={() => {
          setShowForm(false);
          setEditingAdvert(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Advert Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Advert
        </button>
      </div>

      {adverts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No adverts yet</h3>
          <p className="text-slate-600 mb-6">Create your first advertisement.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add Advert
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adverts.map((advert) => (
            <div key={advert.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{advert.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{getCampaignName(advert.campaign_id)}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {advert.format}
                    </span>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(advert.production_status)}`}>
                      {formatStatus(advert.production_status)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingAdvert(advert)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(advert.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {advert.description && (
                <p className="text-sm text-slate-600 mb-4">{advert.description}</p>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">${advert.cost.toLocaleString()}</span>
                </div>
                {advert.due_date && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(advert.due_date).toLocaleDateString()}</span>
                  </div>
                )}
                {advert.production_notes && (
                  <div className="pt-2 mt-2 border-t border-slate-100">
                    <p className="text-xs text-slate-600 italic">{advert.production_notes}</p>
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
