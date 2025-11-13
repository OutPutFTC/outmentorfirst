import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ReportWidget({ profileId }: { profileId: string }) {
  const { profile: currentProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [reason, setReason] = useState('Spam');
  const [details, setDetails] = useState('');

  const submit = async () => {
    if (!currentProfile) {
      alert('Você precisa entrar para enviar uma denúncia.');
      return;
    }
    if (currentProfile.id === profileId) {
      alert('Você não pode denunciar seu próprio perfil.');
      return;
    }

    try {
      setSending(true);
      const { error } = await supabase.from('reports').insert({
        reporter_id: currentProfile.id,
        reported_profile_id: profileId,
        reason,
        details
      });
      if (error) throw error;
      alert('Denúncia enviada. Obrigado.');
      setOpen(false);
      setReason('Spam');
      setDetails('');
    } catch (e: any) {
      console.error(e);
      alert('Erro ao enviar denúncia: ' + (e?.message ?? e));
    } finally {
      setSending(false);
    }
  };

  // Se estiver vendo próprio perfil, nada é renderizado (sem alteração de layout)
  if (!profileId || currentProfile?.id === profileId) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 bg-red-600 text-white rounded"
        title="Denunciar este perfil"
      >
        Denunciar
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 w-[520px] max-w-full">
            <h3 className="text-lg font-semibold mb-3">Denunciar usuário</h3>

            <label className="block text-sm font-medium text-gray-700">Motivo</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded mb-3"
            >
              <option>Spam</option>
              <option>Abuso</option>
              <option>Informação incorreta</option>
              <option>Outro</option>
            </select>

            <label className="block text-sm font-medium text-gray-700">Detalhes (opcional)</label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border rounded mb-4"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setOpen(false)} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
              <button
                onClick={submit}
                disabled={sending}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                {sending ? 'Enviando...' : 'Enviar denúncia'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}