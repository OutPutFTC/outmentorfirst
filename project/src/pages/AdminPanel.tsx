import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ProfileRow {
  id: string;
  email?: string;
  full_name?: string;
  user_type?: string;
  is_admin?: boolean;
  is_mentor_verified?: boolean;
  gravatar_url?: string;
  avatar_url?: string;
  created_at?: string;
}

interface ReportRow {
  id: string;
  reporter_id: string;
  reported_profile_id: string;
  reason: string;
  details?: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at?: string;
  resolved_at?: string;
  resolver_id?: string;
  reporter?: { id: string; full_name?: string; email?: string };
  reported?: { id: string; full_name?: string; email?: string };
}

export default function AdminPanel() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [openReports, setOpenReports] = useState<Record<string, boolean>>({});
  const { user, toggleAdmin, verifyMentor, deleteProfile } = useAuth();
  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});
  const [loadingReports, setLoadingReports] = useState<Record<string, boolean>>({});

  useEffect(() => { fetchProfiles(); fetchReports(); }, []);

  const fetchProfiles = async () => {
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('fetch profiles error', error);
      return;
    }
    setProfiles(data ?? []);
  };

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id, reporter_id, reported_profile_id, reason, details, status, created_at, resolved_at, resolver_id,
        reporter:reporter_id(id, full_name, email),
        reported:reported_profile_id(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('fetch reports error', error);
      return;
    }
    setReports((data as ReportRow[]) ?? []);
  };

  const withLoading = async (id: string, fn: () => Promise<void>) => {
    setLoadingIds(prev => ({ ...prev, [id]: true }));
    try {
      await fn();
      await fetchProfiles();
      await fetchReports();
      alert('Operação realizada com sucesso');
    } catch (e: any) {
      console.error(e);
      alert('Erro: ' + (e?.message ?? e));
    } finally {
      setLoadingIds(prev => ({ ...prev, [id]: false }));
    }
  };

  const withReportLoading = async (id: string, fn: () => Promise<void>) => {
    setLoadingReports(prev => ({ ...prev, [id]: true }));
    try {
      await fn();
      await fetchReports();
      alert('Operação realizada com sucesso');
    } catch (e: any) {
      console.error(e);
      alert('Erro: ' + (e?.message ?? e));
    } finally {
      setLoadingReports(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleToggleAdmin = (id: string, current?: boolean) => {
    withLoading(id, () => toggleAdmin(id, !current));
  };

  const handleVerify = (id: string, current?: boolean) => {
    withLoading(id, () => verifyMentor(id, !current));
  };

  const handleDelete = (id: string) => {
    if (!confirm('Apagar row do profile? Isso NÃO remove o usuário do Auth.')) return;
    withLoading(id, () => deleteProfile(id));
  };

  const toggleReportOpen = (id: string) => {
    setOpenReports(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleResolveReport = (id: string) => {
    withReportLoading(id, async () => {
      const { error } = await supabase.from('reports').update({
        status: 'resolved',
        resolver_id: user?.id,
        resolved_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
    });
  };

  const handleRejectReport = (id: string) => {
    withReportLoading(id, async () => {
      const { error } = await supabase.from('reports').update({
        status: 'rejected',
        resolver_id: user?.id,
        resolved_at: new Date().toISOString()
      }).eq('id', id);
      if (error) throw error;
    });
  };

  const handleDeleteReport = (id: string, status: ReportRow['status']) => {
    if (status === 'pending') {
      alert('Somente denúncias já resolvidas ou rejeitadas podem ser excluídas.');
      return;
    }
    if (!confirm('Excluir denúncia permanentemente? Esta ação não pode ser desfeita.')) return;

    withReportLoading(id, async () => {
      const { error } = await supabase.from('reports').delete().eq('id', id);
      if (error) throw error;
    });
  };

  if (!user) return <div className="p-4">Login required</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Painel Admin</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Denúncias</h2>
        {reports.length === 0 ? (
          <div className="text-gray-500">Nenhuma denúncia registrada.</div>
        ) : (
          <div className="space-y-3">
            {reports.map(r => (
              <div key={r.id} className="border rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">
                      <strong>{r.reason}</strong> • {new Date(r.created_at || '').toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-800">
                      Reportado: {r.reported?.full_name ?? r.reported_profile_id} ({r.reported?.email ?? '—'})
                      <span className="mx-2">|</span>
                      Denunciante: {r.reporter?.full_name ?? r.reporter_id} ({r.reporter?.email ?? '—'})
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReportOpen(r.id)}
                      className="px-2 py-1 bg-gray-100 rounded"
                    >
                      {openReports[r.id] ? 'Fechar' : 'Abrir'}
                    </button>

                    <button
                      onClick={() => handleResolveReport(r.id)}
                      className="px-2 py-1 bg-green-600 text-white rounded"
                      disabled={!!loadingReports[r.id] || r.status === 'resolved'}
                    >
                      {loadingReports[r.id] ? '...' : 'Resolver'}
                    </button>

                    <button
                      onClick={() => handleRejectReport(r.id)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded"
                      disabled={!!loadingReports[r.id] || r.status === 'rejected'}
                    >
                      {loadingReports[r.id] ? '...' : 'Rejeitar'}
                    </button>

                    <button
                      onClick={() => handleDeleteReport(r.id, r.status)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      disabled={!!loadingReports[r.id] || r.status === 'pending'}
                      title={r.status === 'pending' ? 'Somente denúncias resolvidas ou rejeitadas podem ser excluídas' : 'Excluir denúncia'}
                    >
                      {loadingReports[r.id] ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {openReports[r.id] && (
                  <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">
                    {r.details || 'Sem detalhes adicionais.'}
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">Status: {r.status}</div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Usuarios</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left">Email</th>
                <th className="text-left">Nome</th>
                <th className="text-left">Tipo</th>
                <th className="text-left">Avatar</th>
                <th className="text-left">Admin</th>
                <th className="text-left">Mentor verified</th>
                <th className="text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.email}</td>
                  <td className="py-2">{p.full_name}</td>
                  <td className="py-2">{p.user_type}</td>
                  <td className="py-2">
                    <img src={p.avatar_url || p.gravatar_url || '/placeholder-avatar.png'} alt="avatar" className="h-8 w-8 rounded-full" />
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleToggleAdmin(p.id, p.is_admin)}
                      className="px-2 py-1 bg-gray-200 rounded"
                      disabled={!!loadingIds[p.id]}
                    >
                      {loadingIds[p.id] ? '...' : (p.is_admin ? 'Revoke' : 'Make admin')}
                    </button>
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleVerify(p.id, p.is_mentor_verified)}
                      className="px-2 py-1 bg-gray-200 rounded"
                      disabled={!!loadingIds[p.id]}
                    >
                      {loadingIds[p.id] ? '...' : (p.is_mentor_verified ? 'Unverify' : 'Verify')}
                    </button>
                  </td>
                  <td className="py-2">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="px-2 py-1 bg-red-500 text-white rounded"
                      disabled={!!loadingIds[p.id]}
                    >
                      {loadingIds[p.id] ? '...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}