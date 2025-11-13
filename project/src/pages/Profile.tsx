import { useEffect, useState } from 'react';
import { ArrowLeft, Edit3, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ReportWidget from '../components/ReportWidget';

interface ProfilePageProps {
  profileId?: string;
  onNavigate: (view: string, id?: string) => void;
}

interface ProfileData {
  id: string;
  full_name?: string;
  email?: string;
  user_type?: 'mentor' | 'team';
  city?: string;
  state?: string;
  bio?: string;
  avatar_url?: string;
  is_mentor_verified?: boolean;
  mentor_details?: any;
  team_details?: any;
}

export default function Profile({ profileId, onNavigate }: ProfilePageProps) {
  const { profile: currentProfile } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [showFollowers, setShowFollowers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('Spam');
  const [details, setDetails] = useState('');

  const idToLoad = profileId || currentProfile?.id;

  useEffect(() => {
    if (idToLoad) {
      loadProfile();
      loadFollowerInfo();
    }
  }, [idToLoad]);

  const loadProfile = async () => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', idToLoad).maybeSingle();
    if (error) {
      console.error('fetch profile', error);
      return;
    }
    setProfile(data);
    setLoading(false);
  };

  const loadFollowerInfo = async () => {
    if (!currentProfile) return;

    const { data: followersList } = await supabase
      .from('followers')
      .select(`
        follower_id,
        profiles:follower_id(
          id,
          full_name,
          avatar_url,
          user_type
        )
      `)
      .eq('following_id', idToLoad);

    setFollowerCount(followersList?.length || 0);
    const followerProfiles = followersList?.map((f: any) => f.profiles).filter(Boolean) || [];
    setFollowers(followerProfiles);

    if (currentProfile.id !== idToLoad) {
      const { data: following } = await supabase
        .from('followers')
        .select('id')
        .eq('follower_id', currentProfile.id)
        .eq('following_id', idToLoad)
        .maybeSingle();

      setIsFollowing(!!following);
    }
  };

  const toggleFollow = async () => {
    if (!currentProfile || !profile) return;

    if (isFollowing) {
      await supabase
        .from('followers')
        .delete()
        .eq('follower_id', currentProfile.id)
        .eq('following_id', profile.id);
    } else {
      await supabase.from('followers').insert({
        follower_id: currentProfile.id,
        following_id: profile.id
      });
    }

    setIsFollowing(!isFollowing);
    await loadFollowerInfo();
  };

  const submitReport = async () => {
    if (!currentProfile) {
      alert('Você precisa estar logado para denunciar.');
      return;
    }
    if (!profile) return;
    try {
      const { error } = await supabase.from('reports').insert({
        reporter_id: currentProfile.id,
        reported_profile_id: profile.id,
        reason,
        details
      });
      if (error) throw error;
      alert('Denúncia enviada. Obrigado.');
      setReporting(false);
      setReason('Spam');
      setDetails('');
    } catch (e: any) {
      console.error(e);
      alert('Erro ao enviar denúncia: ' + (e?.message ?? e));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#930200] border-t-transparent"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-[#930200] mb-6">
          <ArrowLeft size={20} /> Voltar
        </button>
        <div className="text-center">Perfil não encontrado</div>
      </div>
    );
  }

  const isOwnProfile = currentProfile?.id === profile.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <button
        onClick={() => onNavigate('dashboard')}
        className="sticky top-4 left-4 flex items-center gap-2 text-[#930200] bg-white px-4 py-2 rounded-lg hover:bg-gray-100 transition z-10"
      >
        <ArrowLeft size={20} />
        Voltar
      </button>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div
            className="h-64 bg-gradient-to-r from-[#930200] to-[#ff8e00]"
            style={{ backgroundImage: profile.cover_image_url ? `url(${profile.cover_image_url})` : undefined, backgroundSize: 'cover' }}
          />

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-20 mb-8 relative z-10">
              <div
                className={`w-40 h-40 rounded-2xl bg-gradient-to-br from-[#ff8e00] to-[#930200] shadow-2xl flex items-center justify-center border-4 border-white text-4xl font-bold text-white overflow-hidden ${
                  isOwnProfile ? 'cursor-pointer hover:opacity-80 transition-all' : ''
                }`}
                style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : undefined, backgroundSize: 'cover' }}
                onClick={() => {
                  if (isOwnProfile) {
                    onNavigate('edit-profile');
                  }
                }}
              >
                {!profile.avatar_url && profile.full_name.charAt(0)}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-4xl font-bold text-gray-800">{profile.full_name}</h1>
                  {profile.is_mentor_verified && (
                    <span className="inline-flex items-center bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      ✓ Verificado
                    </span>
                  )}
                </div>

                <p className="text-xl text-gray-600 mt-2">
                  {profile.city}, {profile.state}
                </p>
                {profile.user_type === 'mentor' && profile.mentor_details && (
                  <div className="flex gap-3 mt-3">
                    {profile.mentor_details.mentor_ftc && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">FTC</span>
                    )}
                    {profile.mentor_details.mentor_fll && (
                      <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold">FLL</span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                {!isOwnProfile && (
                  <>
                    <button
                      onClick={toggleFollow}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                        isFollowing
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white hover:scale-105'
                      }`}
                    >
                      <Heart size={20} fill={isFollowing ? 'currentColor' : 'none'} />
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </button>
                    {currentProfile?.user_type !== profile.user_type && (
                      // Mensagem button replaced by ReportWidget as requested
                      <ReportWidget profileId={profile.id} />
                    )}
                  </>
                )}
                {isOwnProfile && (
                  <button
                    onClick={() => onNavigate('edit-profile')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white hover:scale-105 transition-all"
                  >
                    <Edit3 size={20} />
                    Editar Perfil
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 my-12 py-8 border-t border-b">
              <div
                className="text-center cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition"
                onClick={() => setShowFollowers(!showFollowers)}
              >
                <div className="text-3xl font-bold text-[#930200]">{followerCount}</div>
                <div className="text-gray-600">Seguidores</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-[#ff8e00]">
                  {profile.user_type === 'mentor'
                    ? profile.mentor_details?.knowledge_areas.length || 0
                    : profile.team_details?.interest_areas.length || 0}
                </div>
                <div className="text-gray-600">
                  {profile.user_type === 'mentor' ? 'Áreas de Conhecimento' : 'Áreas de Interesse'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {new Date(profile.created_at).getFullYear()}
                </div>
                <div className="text-gray-600">Membro desde</div>
              </div>
            </div>

            {showFollowers && followers.length > 0 && (
              <div className="my-8 p-6 bg-gradient-to-br from-blue-50 to-orange-50 rounded-2xl border-2 border-blue-200">
                <h2 className="text-2xl font-bold mb-4">Seguidores</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followers.map((follower) => (
                    <div
                      key={follower.id}
                      onClick={() => onNavigate('profile', follower.id)}
                      className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition cursor-pointer border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff8e00] to-[#930200] flex items-center justify-center text-white font-bold overflow-hidden"
                          style={{ backgroundImage: follower.avatar_url ? `url(${follower.avatar_url})` : undefined, backgroundSize: 'cover' }}
                        >
                          {!follower.avatar_url && follower.full_name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">{follower.full_name}</h3>
                          <p className="text-xs text-gray-500">
                            {follower.user_type === 'mentor' ? 'Mentor' : 'Equipe'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-8">
              {profile.bio && (
                <div>
                  <h2 className="text-2xl font-bold mb-3">Sobre</h2>
                  <p className="text-gray-700 leading-relaxed text-lg">{profile.bio}</p>
                </div>
              )}

              {profile.user_type === 'mentor' && profile.mentor_details && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Áreas de Conhecimento</h2>
                  <div className="flex flex-wrap gap-3">
                    {profile.mentor_details.knowledge_areas.map((area) => (
                      <div key={area} className="bg-gradient-to-r from-orange-100 to-red-100 text-[#930200] px-5 py-2 rounded-full font-semibold">
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {profile.user_type === 'team' && profile.team_details && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Informações da Equipe</h2>
                  <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                    <p className="text-lg">
                      <span className="font-bold">Número:</span> {profile.team_details.team_number}
                    </p>
                    <p className="text-lg">
                      <span className="font-bold">Tipo:</span> {profile.team_details.team_type}
                    </p>
                    {profile.team_details.interest_areas.length > 0 && (
                      <div>
                        <p className="font-bold mb-2">Áreas de Interesse:</p>
                        <div className="flex flex-wrap gap-2">
                          {profile.team_details.interest_areas.map((area) => (
                            <div key={area} className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-4 py-1 rounded-full text-sm font-semibold">
                              {area}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {profile.linkedin_url && (
                <div>
                  <h2 className="text-2xl font-bold mb-4">Conecte-se</h2>
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all hover:scale-105"
                  >
                    <ExternalLink size={20} />
                    Visitar LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* modal simples de denúncia */}
      {reporting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-[520px] max-w-full">
            <h3 className="text-lg font-semibold mb-3">Denunciar {profile.full_name}</h3>

            <label className="block text-sm font-medium text-gray-700">Motivo</label>
            <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full px-3 py-2 border rounded mb-3">
              <option>Spam</option>
              <option>Abuso</option>
              <option>Informação incorreta</option>
              <option>Outro</option>
            </select>

            <label className="block text-sm font-medium text-gray-700">Detalhes (opcional)</label>
            <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={5} className="w-full px-3 py-2 border rounded mb-4" />

            <div className="flex justify-end gap-2">
              <button onClick={() => setReporting(false)} className="px-3 py-1 bg-gray-200 rounded">Cancelar</button>
              <button onClick={submitReport} className="px-3 py-1 bg-red-600 text-white rounded">Enviar denúncia</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
