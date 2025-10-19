import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StaffGrade } from '../../types/database';

interface GradeFormProps {
  grade: StaffGrade | null;
  onClose: () => void;
  onSave: () => void;
}

export function GradeForm({ grade, onClose, onSave }: GradeFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    pay_rate: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (grade) {
      setFormData({
        name: grade.name,
        pay_rate: grade.pay_rate.toString(),
        description: grade.description,
      });
    }
  }, [grade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const dataToSave = {
      name: formData.name,
      pay_rate: parseFloat(formData.pay_rate),
      description: formData.description,
      updated_at: new Date().toISOString(),
    };

    const { error: saveError } = grade
      ? await supabase.from('staff_grades').update(dataToSave).eq('id', grade.id)
      : await supabase.from('staff_grades').insert([dataToSave]);

    if (saveError) {
      setError(saveError.message);
      setLoading(false);
    } else {
      onSave();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">
          {grade ? 'Edit Grade' : 'Add Grade'}
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
            Grade Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Senior Creative Director"
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Pay Rate *
          </label>
          <input
            type="number"
            required
            step="0.01"
            min="0"
            value={formData.pay_rate}
            onChange={(e) => setFormData({ ...formData, pay_rate: e.target.value })}
            placeholder="0.00"
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
            placeholder="Describe this grade level..."
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
          />
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
