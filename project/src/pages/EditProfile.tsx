import { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface EditProfileProps {
  onNavigate: (view: string) => void;
}

export default function EditProfile({ onNavigate }: EditProfileProps) {
  const { profile, refreshProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    bio: '',
    linkedin_url: '',
    state: '',
    city: '',
    pronouns: ''
  });
  const [mentorData, setMentorData] = useState({
    mentor_ftc: false,
    mentor_fll: false,
    knowledge_areas: [] as string[]
  });
  const [teamData, setTeamData] = useState({
    team_number: '',
    team_type: 'FTC' as 'FTC' | 'FLL',
    interest_areas: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        linkedin_url: profile.linkedin_url || '',
        state: profile.state || '',
        city: profile.city || '',
        pronouns: profile.pronouns || ''
      });
      // set pronoun choice
      if (profile.pronouns) {
        const known = ['she/her', 'he/him', 'they/them', 'elle/elu', 'Prefer not to say'];
        if (known.includes(profile.pronouns)) {
          setPronounChoice(profile.pronouns);
        } else {
          setPronounChoice('Custom');
          setCustomPronouns(profile.pronouns);
        }
      }
    }
  }, [profile]);

  const [customPronouns, setCustomPronouns] = useState('');
  const [pronounChoice, setPronounChoice] = useState('');

  const toggleKnowledgeArea = (area: string) => {
    setMentorData(prev => ({
      ...prev,
      knowledge_areas: prev.knowledge_areas.includes(area)
        ? prev.knowledge_areas.filter(a => a !== area)
        : [...prev.knowledge_areas, area]
    }));
  };

  const toggleInterestArea = (area: string) => {
    setTeamData(prev => ({
      ...prev,
      interest_areas: prev.interest_areas.includes(area)
        ? prev.interest_areas.filter(a => a !== area)
        : [...prev.interest_areas, area]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const updatePayload: any = {
        ...formData,
        avatar_url: profile?.avatar_url
      };

      // Only include pronouns if this user is a mentor
      if (profile?.user_type !== 'mentor') {
        delete updatePayload.pronouns;
      }

      await supabase.from('profiles').update(updatePayload).eq('id', profile!.id);

      if (profile?.user_type === 'mentor') {
        await supabase
          .from('mentor_details')
          .update(mentorData)
          .eq('profile_id', profile!.id);
      } else {
        await supabase
          .from('team_details')
          .update(teamData)
          .eq('profile_id', profile!.id);
      }

      await refreshProfile();
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => onNavigate('profile'), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return null;

  const brazilianStates = [
    'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
    'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
    'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
    'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
    'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <button
        onClick={() => onNavigate('profile')}
        className="sticky top-4 left-4 flex items-center gap-2 text-[#930200] bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition z-10"
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className="max-w-2xl mx-auto p-4 mt-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-[#930200] to-[#ff8e00] bg-clip-text text-transparent" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
            Editar Perfil
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-2">Nome *</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Biografia</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent resize-none"
                placeholder="Conte sobre você ou sua equipe..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estado *</label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
                >
                  <option value="">Selecione</option>
                  {brazilianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cidade *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn (opcional)</label>
              <input
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
              />
            </div>

            {profile.user_type === 'mentor' && (
              <div>
                <label className="block text-sm font-medium mb-2">Pronomes (opcional)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {['she/her', 'he/him', 'they/them', 'elle/elu', 'Prefer not to say', 'Custom'].map(option => (
                    <button
                      type="button"
                      key={option}
                      onClick={() => {
                        setPronounChoice(option);
                        if (option !== 'Custom') {
                          setFormData({ ...formData, pronouns: option });
                          setCustomPronouns('');
                        } else {
                          setFormData({ ...formData, pronouns: '' });
                        }
                      }}
                      className={`px-3 py-2 rounded-lg border ${pronounChoice === option ? 'bg-[#ffefea] border-[#ff8e00]' : 'bg-white border-gray-200'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {pronounChoice === 'Custom' && (
                  <input
                    type="text"
                    placeholder="Digite seus pronomes (ex.: xe/xem)"
                    value={customPronouns}
                    onChange={(e) => {
                      setCustomPronouns(e.target.value);
                      setFormData({ ...formData, pronouns: e.target.value });
                    }}
                    className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
                  />
                )}
              </div>
            )}

            {profile.user_type === 'mentor' && (
              <div>
                <label className="block text-sm font-bold mb-4">Áreas de Conhecimento</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Robô', 'Projeto', 'Core Values', 'Outreach', 'Engenharia', 'Programação'].map(area => (
                    <label key={area} className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={mentorData.knowledge_areas.includes(area)}
                        onChange={() => toggleKnowledgeArea(area)}
                        className="w-5 h-5 text-[#ff8e00]"
                      />
                      <span className="font-medium">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {profile.user_type === 'team' && (
              <div>
                <label className="block text-sm font-bold mb-4">Áreas de Interesse</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Robô', 'Projeto', 'Core Values', 'Outreach', 'Engenharia', 'Programação'].map(area => (
                    <label key={area} className="flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={teamData.interest_areas.includes(area)}
                        onChange={() => toggleInterestArea(area)}
                        className="w-5 h-5 text-[#ff8e00]"
                      />
                      <span className="font-medium">{area}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-4 rounded-lg font-medium">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white py-4 rounded-xl font-bold text-lg hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
