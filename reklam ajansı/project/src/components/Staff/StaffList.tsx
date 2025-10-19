import { useEffect, useState } from 'react';
import { Plus, Mail, Phone, Pencil, Trash2, UserCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Staff, StaffGrade } from '../../types/database';
import { StaffForm } from './StaffForm';

export function StaffList() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [grades, setGrades] = useState<StaffGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [staffResult, gradesResult] = await Promise.all([
      supabase.from('staff').select('*').order('created_at', { ascending: false }),
      supabase.from('staff_grades').select('*').order('name')
    ]);

    if (staffResult.data) setStaff(staffResult.data);
    if (gradesResult.data) setGrades(gradesResult.data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this staff member?')) return;

    const { error } = await supabase.from('staff').delete().eq('id', id);

    if (!error) {
      loadData();
    } else {
      alert('Error deleting staff member');
    }
  };

  const getGradeName = (gradeId?: string) => {
    if (!gradeId) return 'No Grade';
    const grade = grades.find(g => g.id === gradeId);
    return grade?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (showForm || editingStaff) {
    return (
      <StaffForm
        staff={editingStaff}
        grades={grades}
        onClose={() => {
          setShowForm(false);
          setEditingStaff(null);
        }}
        onSave={() => {
          setShowForm(false);
          setEditingStaff(null);
          loadData();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Staff Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Staff Member
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <UserCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No staff members yet</h3>
          <p className="text-slate-600 mb-6">Get started by adding your first staff member.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add Staff Member
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <div key={member.id} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {member.first_name} {member.last_name}
                  </h3>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                    member.staff_type === 'creative'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {member.staff_type}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingStaff(member)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                <div className="pt-2 mt-2 border-t border-slate-100">
                  <span className="text-slate-700 font-medium">Grade: </span>
                  <span className="text-slate-600">{getGradeName(member.grade_id)}</span>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1 ${
                    member.is_active ? 'text-green-600' : 'text-slate-400'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      member.is_active ? 'bg-green-600' : 'bg-slate-400'
                    }`} />
                    {member.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
