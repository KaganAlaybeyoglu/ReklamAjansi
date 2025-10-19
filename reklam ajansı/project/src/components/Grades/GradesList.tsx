import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Award } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { StaffGrade } from '../../types/database';
import { GradeForm } from './GradeForm';

export function GradesList() {
  const [grades, setGrades] = useState<StaffGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGrade, setEditingGrade] = useState<StaffGrade | null>(null);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('staff_grades')
      .select('*')
      .order('pay_rate', { ascending: false });

    if (data) setGrades(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    const { error } = await supabase.from('staff_grades').delete().eq('id', id);

    if (!error) {
      loadGrades();
    } else {
      alert('Error deleting grade. It may be assigned to staff members.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (showForm || editingGrade) {
    return (
      <GradeForm
        grade={editingGrade}
        onClose={() => {
          setShowForm(false);
          setEditingGrade(null);
        }}
        onSave={() => {
          setShowForm(false);
          setEditingGrade(null);
          loadGrades();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Staff Grades</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Grade
        </button>
      </div>

      {grades.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <Award className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No grades defined yet</h3>
          <p className="text-slate-600 mb-6">Create grade levels to organize your staff.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add Grade
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grades.map((grade) => (
            <div key={grade.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{grade.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    ${grade.pay_rate.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingGrade(grade)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(grade.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {grade.description && (
                <p className="text-sm text-slate-600">{grade.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
