import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Advert, Campaign } from '../../types/database';

interface AdvertFormProps {
  advert: Advert | null;
  campaigns: Campaign[];
  onClose: () => void;
  onSave: () => void;
}

export function AdvertForm({ advert, campaigns, onClose, onSave }: AdvertFormProps) {
  const [formData, setFormData] = useState({
    campaign_id: '',
    title: '',
    description: '',
    format: 'digital' as 'video' | 'print' | 'digital' | 'social' | 'billboard' | 'radio',
    production_status: 'concept' as 'concept' | 'in_production' | 'review' | 'approved' | 'completed',
    production_notes: '',
    cost: '',
    due_date: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (advert) {
      setFormData({
        campaign_id: advert.campaign_id,
        title: advert.title,
        description: advert.description,
        format: advert.format,
        production_status: advert.production_status,
        production_notes: advert.production_notes,
        cost: advert.cost.toString(),
        due_date: advert.due_date || '',
      });
    }
  }, [advert]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const dataToSave = {
      campaign_id: formData.campaign_id,
      title: formData.title,
      description: formData.description,
      format: formData.format,
      production_status: formData.production_status,
      production_notes: formData.production_notes,
      cost: parseFloat(formData.cost) || 0,
      due_date: formData.due_date || null,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = advert
      ? await supabase.from('adverts').update(dataToSave).eq('id', advert.id)
      : await supabase.from('adverts').insert([dataToSave]);

    if (saveError) {
      setError(saveError.message);
      setLoading(false);
    } else {
      onSave();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {advert ? 'Edit Advert' : 'Add Advert'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Campaign *
          </label>
          <select
            required
            value={formData.campaign_id}
            onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          >
            <option value="">Select a campaign</option>
            {campaigns.map((campaign) => (
              <option key={campaign.id} value={campaign.id}>
                {campaign.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Format *
            </label>
            <select
              required
              value={formData.format}
              onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            >
              <option value="video">Video</option>
              <option value="print">Print</option>
              <option value="digital">Digital</option>
              <option value="social">Social</option>
              <option value="billboard">Billboard</option>
              <option value="radio">Radio</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Production Status *
            </label>
            <select
              required
              value={formData.production_status}
              onChange={(e) => setFormData({ ...formData, production_status: e.target.value as any })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            >
              <option value="concept">Concept</option>
              <option value="in_production">In Production</option>
              <option value="review">Review</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Production Notes
          </label>
          <textarea
            value={formData.production_notes}
            onChange={(e) => setFormData({ ...formData, production_notes: e.target.value })}
            rows={2}
            placeholder="Track progress and notes here..."
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Cost
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
