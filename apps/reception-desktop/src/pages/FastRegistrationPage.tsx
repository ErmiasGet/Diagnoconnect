import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Search, ChevronRight, Check, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { patientsAPI } from '../lib/api';

interface PatientForm {
  firstName: string; lastName: string; dateOfBirth: string; gender: string;
  phone: string; email: string; address: string; city: string;
  bloodGroup: string; emergencyContactName: string; emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

const INITIAL: PatientForm = {
  firstName: '', lastName: '', dateOfBirth: '', gender: '',
  phone: '', email: '', address: '', city: '',
  bloodGroup: '', emergencyContactName: '', emergencyContactPhone: '',
  emergencyContactRelationship: '',
};

export default function FastRegistrationPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<PatientForm>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => { firstNameRef.current?.focus(); }, [step]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F1') { e.preventDefault(); setStep(1); firstNameRef.current?.focus(); }
      if (e.key === 'F2') { e.preventDefault(); setStep(2); }
      if (e.key === 'F3') { e.preventDefault(); setStep(3); }
      if (e.key === 'Escape') navigate('/');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const update = (key: keyof PatientForm, value: string) => setForm((p) => ({ ...p, [key]: value }));

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const r = await patientsAPI.search(q);
      setSearchResults(r.data.data || []);
    } catch { setSearchResults([]); }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const r = await patientsAPI.create(form);
      toast.success(`Patient registered: ${r.data.data.medicalRecordNumber}`);
      setForm(INITIAL);
      setStep(1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors";
  const labelClass = "block text-xs font-medium text-gray-600 mb-1";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patient Registration</h1>
            <p className="text-gray-500 text-sm">F1: Personal | F2: Contact | F3: Emergency | Esc: Back</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${step >= s ? 'bg-primary-600 w-12' : 'bg-gray-200 w-8'}`} />
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Search size={16} className="text-gray-400" />
              <input
                type="text" placeholder="Quick search existing patient..." value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="flex-1 text-sm border-0 focus:ring-0"
              />
            </div>
            {searchResults.length > 0 && (
              <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto mb-4">
                {searchResults.map((p: any) => (
                  <button key={p.id} className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0">
                    <p className="font-medium text-sm">{p.firstName} {p.lastName}</p>
                    <p className="text-xs text-gray-500">MRN: {p.medicalRecordNumber} | {p.phone}</p>
                  </button>
                ))}
              </div>
            )}
            <h3 className="font-semibold text-gray-900 text-sm border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>First Name *</label>
                <input ref={firstNameRef} className={inputClass} value={form.firstName} onChange={(e) => update('firstName', e.target.value)} placeholder="First name" />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input className={inputClass} value={form.lastName} onChange={(e) => update('lastName', e.target.value)} placeholder="Last name" />
              </div>
              <div>
                <label className={labelClass}>Date of Birth *</label>
                <input type="date" className={inputClass} value={form.dateOfBirth} onChange={(e) => update('dateOfBirth', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Gender *</label>
                <select className={inputClass} value={form.gender} onChange={(e) => update('gender', e.target.value)}>
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Blood Group</label>
                <select className={inputClass} value={form.bloodGroup} onChange={(e) => update('bloodGroup', e.target.value)}>
                  <option value="">Select</option>
                  {['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'].map((bg) => (
                    <option key={bg} value={bg}>{bg.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setStep(2)} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm border-b pb-2">Contact Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Phone Number *</label>
                <input className={inputClass} value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+251 9XX XXX XXX" />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" className={inputClass} value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="email@example.com" />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Address</label>
                <input className={inputClass} value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Street address" />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input className={inputClass} value={form.city} onChange={(e) => update('city', e.target.value)} placeholder="Addis Ababa" />
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(1)} className="text-gray-600 hover:text-gray-800 px-4 py-2.5 text-sm font-medium">Back</button>
              <button onClick={() => setStep(3)} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm border-b pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contact Name *</label>
                <input className={inputClass} value={form.emergencyContactName} onChange={(e) => update('emergencyContactName', e.target.value)} placeholder="Full name" />
              </div>
              <div>
                <label className={labelClass}>Contact Phone *</label>
                <input className={inputClass} value={form.emergencyContactPhone} onChange={(e) => update('emergencyContactPhone', e.target.value)} placeholder="+251 9XX XXX XXX" />
              </div>
              <div>
                <label className={labelClass}>Relationship *</label>
                <select className={inputClass} value={form.emergencyContactRelationship} onChange={(e) => update('emergencyContactRelationship', e.target.value)}>
                  <option value="">Select</option>
                  {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mt-4">
              <h4 className="text-xs font-semibold text-gray-700 mb-3">SUMMARY</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-600">Name: <span className="text-gray-900 font-medium">{form.firstName} {form.lastName}</span></p>
                <p className="text-gray-600">DOB: <span className="text-gray-900 font-medium">{form.dateOfBirth || 'Not set'}</span></p>
                <p className="text-gray-600">Gender: <span className="text-gray-900 font-medium">{form.gender || 'Not set'}</span></p>
                <p className="text-gray-600">Phone: <span className="text-gray-900 font-medium">{form.phone || 'Not set'}</span></p>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <button onClick={() => setStep(2)} className="text-gray-600 hover:text-gray-800 px-4 py-2.5 text-sm font-medium">Back</button>
              <button
                onClick={handleSubmit} disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                {loading ? 'Registering...' : <><Check size={16} /> Register Patient</>}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-xs text-gray-400">
        Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-gray-500">F1</kbd>-<kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-gray-500">F3</kbd> to switch steps | <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-gray-500">Esc</kbd> to go back
      </div>
    </div>
  );
}
