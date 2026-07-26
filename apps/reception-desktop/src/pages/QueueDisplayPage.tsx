import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, ArrowUp, CheckCircle, XCircle, Volume2, Clock, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { queueAPI } from '../lib/api';

export default function QueueDisplayPage() {
  const queryClient = useQueryClient();
  const [displayMode, setDisplayMode] = useState<'full' | 'kiosk'>('full');

  const { data: queue, isLoading } = useQuery({
    queryKey: ['queue'],
    queryFn: async () => { const r = await queueAPI.getQueue(); return r.data.data; },
    refetchInterval: 5000,
  });

  const callNextMut = useMutation({
    mutationFn: () => queueAPI.callNext(),
    onSuccess: (r) => { toast.success(`Called patient ${r.data.data?.queueNumber}`); queryClient.invalidateQueries({ queryKey: ['queue'] }); },
    onError: () => toast.error('No patients in queue'),
  });

  const completeMut = useMutation({
    mutationFn: (id: string) => queueAPI.complete(id),
    onSuccess: () => { toast.success('Patient completed'); queryClient.invalidateQueries({ queryKey: ['queue'] }); },
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => queueAPI.cancel(id),
    onSuccess: () => { toast.error('Patient removed from queue'); queryClient.invalidateQueries({ queryKey: ['queue'] }); },
  });

  const queueData = queue || { current: null, waiting: [], completed: [] };
  const waitingList = queueData.waiting || [];

  return (
    <div className={`p-6 ${displayMode === 'kiosk' ? 'text-2xl' : ''}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
          <p className="text-gray-500 text-sm mt-1">Real-time patient queue display</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setDisplayMode(displayMode === 'full' ? 'kiosk' : 'full')} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
            {displayMode === 'full' ? '🖥️ Kiosk Mode' : '📋 Normal Mode'}
          </button>
          <button onClick={() => callNextMut.mutate()} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Volume2 size={16} /> Call Next
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} /> Current Patient
            </h3>
            {queueData.current ? (
              <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-8 text-white call-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-200 text-sm mb-1">NOW SERVING</p>
                    <p className="text-6xl font-bold queue-number">#{queueData.current.queueNumber}</p>
                    <p className="text-xl mt-3">{queueData.current.patient?.firstName} {queueData.current.patient?.lastName}</p>
                    <p className="text-primary-200 text-sm mt-1">Dr. {queueData.current.visit?.doctor?.lastName || 'Assigned Doctor'}</p>
                  </div>
                  <div className="text-right">
                    <button onClick={() => queueData.current && completeMut.mutate(queueData.current.id)} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm mb-2 w-full transition-colors">
                      ✓ Complete
                    </button>
                    <button onClick={() => queueData.current && cancelMut.mutate(queueData.current.id)} className="bg-red-500/30 hover:bg-red-500/50 text-white px-4 py-2 rounded-lg text-sm w-full transition-colors">
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-12 text-center">
                <Users size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-400 text-lg">No patient currently being served</p>
                <p className="text-gray-300 text-sm mt-1">Click "Call Next" to serve the next patient</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Waiting Queue ({waitingList.length})</h3>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {waitingList.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">Queue is empty</p>
              ) : (
                waitingList.map((entry: any, idx: number) => (
                  <div key={entry.id} className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${entry.priority === 'URGENT' ? 'bg-red-50 border-red-200' : entry.priority === 'VIP' ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${entry.priority === 'URGENT' ? 'bg-red-500 text-white' : entry.priority === 'VIP' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'}`}>
                      {entry.queueNumber}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{entry.patient?.firstName} {entry.patient?.lastName}</p>
                      <p className="text-xs text-gray-500">{entry.patient?.phone} | Dr. {entry.visit?.doctor?.lastName || 'TBD'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.priority === 'URGENT' && <AlertTriangle size={16} className="text-red-500" />}
                      {entry.priority === 'VIP' && <span className="text-yellow-600 text-xs font-bold">VIP</span>}
                      <button onClick={() => toast.success(`Called #${entry.queueNumber}`)} className="p-2 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors" title="Call patient">
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Queue Statistics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">In Queue</span>
                <span className="font-bold text-lg text-gray-900">{waitingList.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Completed Today</span>
                <span className="font-bold text-lg text-green-600">{(queueData.completed || []).length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <span className="text-sm text-gray-600">Avg Wait Time</span>
                <span className="font-bold text-lg text-gray-900">~{waitingList.length * 15}m</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Priority Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2">
                <div className="w-4 h-4 bg-red-500 rounded-full" />
                <span className="text-sm text-gray-700">Urgent</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-4 h-4 bg-yellow-500 rounded-full" />
                <span className="text-sm text-gray-700">VIP</span>
              </div>
              <div className="flex items-center gap-3 p-2">
                <div className="w-4 h-4 bg-gray-400 rounded-full" />
                <span className="text-sm text-gray-700">Normal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
