import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Filter, ClipboardList, ArrowRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { visitsAPI, patientsAPI } from '../lib/api';

const STATUS_BADGES: Record<string, string> = {
  REGISTERED: 'bg-gray-100 text-gray-700',
  IN_QUEUE: 'bg-yellow-100 text-yellow-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  LAB_PENDING: 'bg-orange-100 text-orange-800',
  COMPLETED: 'bg-green-100 text-green-800',
  BILLING_PENDING: 'bg-blue-100 text-blue-800',
};

export default function VisitManagementPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<any[]>([]);
  const [newVisit, setNewVisit] = useState({ patientId: '', type: 'WALK_IN', chiefComplaint: '', doctorId: '' });

  const { data: visits, isLoading } = useQuery({
    queryKey: ['visits', statusFilter, searchQuery],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery) params.search = searchQuery;
      const r = await visitsAPI.getAll(params);
      return r.data.data;
    },
    refetchInterval: 30000,
  });

  const searchPatients = async (q: string) => {
    setPatientSearch(q);
    if (q.length < 2) { setPatientResults([]); return; }
    try {
      const r = await patientsAPI.search(q);
      setPatientResults(r.data.data || []);
    } catch { setPatientResults([]); }
  };

  const createVisitMut = useMutation({
    mutationFn: (data: typeof newVisit) => visitsAPI.create(data),
    onSuccess: () => {
      toast.success('Visit created successfully');
      setShowCreateModal(false);
      setSelectedPatient(null);
      setNewVisit({ patientId: '', type: 'WALK_IN', chiefComplaint: '', doctorId: '' });
      queryClient.invalidateQueries({ queryKey: ['visits'] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || 'Failed to create visit'),
  });

  const visitList = visits || [];
  const statuses = ['ALL', 'REGISTERED', 'IN_QUEUE', 'IN_PROGRESS', 'LAB_PENDING', 'BILLING_PENDING', 'COMPLETED'];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Visit Management</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage patient visits</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus size={16} /> New Visit
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search by patient name, MRN, or visit number..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        {statuses.map((s) => (
          <button
            key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase">
          <div className="col-span-1">Visit #</div>
          <div className="col-span-2">Patient</div>
          <div className="col-span-2">Doctor</div>
          <div className="col-span-2">Chief Complaint</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Date</div>
        </div>
        {isLoading ? (
          <div className="text-center py-12 text-gray-400">Loading visits...</div>
        ) : visitList.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No visits found</p>
          </div>
        ) : (
          visitList.map((visit: any) => (
            <div key={visit.id} className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors items-center">
              <div className="col-span-1 text-sm font-mono font-medium text-gray-900">{visit.visitNumber}</div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-900">{visit.patient?.firstName} {visit.patient?.lastName}</p>
                <p className="text-xs text-gray-500">{visit.patient?.medicalRecordNumber}</p>
              </div>
              <div className="col-span-2 text-sm text-gray-700">Dr. {visit.doctor?.lastName || 'TBD'}</div>
              <div className="col-span-2 text-sm text-gray-600 truncate">{visit.chiefComplaint}</div>
              <div className="col-span-2">
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full">{visit.type?.replace(/_/g, ' ')}</span>
              </div>
              <div className="col-span-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_BADGES[visit.status] || 'bg-gray-100 text-gray-600'}`}>
                  {visit.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <div className="col-span-1 text-xs text-gray-500">{new Date(visit.createdAt).toLocaleDateString()}</div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create New Visit</h2>
              <p className="text-sm text-gray-500 mt-1">Select a patient and enter visit details</p>
            </div>
            <div className="p-6 space-y-4">
              {!selectedPatient ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Search Patient *</label>
                    <input
                      type="text" placeholder="Search by name, MRN, or phone..."
                      value={patientSearch} onChange={(e) => searchPatients(e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                      autoFocus
                    />
                  </div>
                  {patientResults.length > 0 && (
                    <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                      {patientResults.map((p: any) => (
                        <button key={p.id} onClick={() => { setSelectedPatient(p); setNewVisit((v) => ({ ...v, patientId: p.id })); }}
                          className="w-full text-left px-4 py-3 hover:bg-primary-50 border-b border-gray-100 last:border-0 transition-colors">
                          <p className="font-medium text-sm text-gray-900">{p.firstName} {p.lastName}</p>
                          <p className="text-xs text-gray-500">MRN: {p.medicalRecordNumber} | {p.phone}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between bg-primary-50 p-3 rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-gray-900">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                      <p className="text-xs text-gray-500">MRN: {selectedPatient.medicalRecordNumber}</p>
                    </div>
                    <button onClick={() => setSelectedPatient(null)} className="text-xs text-primary-600 hover:underline">Change</button>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Visit Type *</label>
                    <select value={newVisit.type} onChange={(e) => setNewVisit((v) => ({ ...v, type: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500">
                      <option value="WALK_IN">Walk-in</option>
                      <option value="APPOINTMENT">Appointment</option>
                      <option value="EMERGENCY">Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Chief Complaint *</label>
                    <textarea value={newVisit.chiefComplaint} onChange={(e) => setNewVisit((v) => ({ ...v, chiefComplaint: e.target.value }))}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500" rows={3}
                      placeholder="Describe the patient's main complaint..." />
                  </div>
                </>
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => { setShowCreateModal(false); setSelectedPatient(null); setPatientSearch(''); setPatientResults([]); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-800">Cancel</button>
              <button
                onClick={() => createVisitMut.mutate(newVisit)}
                disabled={!newVisit.patientId || !newVisit.chiefComplaint || createVisitMut.isPending}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createVisitMut.isPending ? 'Creating...' : 'Create Visit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
