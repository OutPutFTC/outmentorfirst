import { useState, useEffect } from 'react';
import { Search, MapPin, MessageCircle, Video, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Chat from '../components/Chat';

const brazilianStates = [
  'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
  'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
  'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
  'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
  'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
];

interface Profile {
  id: string;
  user_type: 'mentor' | 'team';
  full_name: string;
  state: string;
  city: string;
  bio?: string;
  avatar_url?: string;
  is_mentor_verified?: boolean;
  mentor_details?: {
    mentor_ftc?: boolean;
    mentor_fll?: boolean;
    knowledge_areas?: string[];
  };
  team_details?: {
    team_number?: string;
    team_type?: 'FTC' | 'FLL';
    interest_areas?: string[];
  };
}

interface Connection {
  id: string;
  status: string;
  mentor_id: string;
  team_id: string;
  profile: Profile;
}

interface DashboardProps {
  onNavigate: (view: string, profileId?: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { profile: currentProfile } = useAuth();
  const [searchResults, setSearchResults] = useState<Profile[]>([]);
  const [myConnections, setMyConnections] = useState<Connection[]>([]);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [filters, setFilters] = useState({
    state: '',
    type: '',
    search: ''
  });

  useEffect(() => {
    loadConnections();
    searchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProfile]);

  const loadConnections = async () => {
    if (!currentProfile) return;

    const isMentor = currentProfile.user_type === 'mentor';
    const { data } = await supabase
      .from('connections')
      .select(`
        *,
        ${isMentor ? 'team_id' : 'mentor_id'}(*)
      `)
      .eq(isMentor ? 'mentor_id' : 'team_id', currentProfile.id)
      .eq('status', 'accepted');

    if (data) {
      const connections = (data as any).map((conn: any) => ({
        ...conn,
        profile: isMentor ? conn.team_id : conn.mentor_id
      }));
      setMyConnections(connections);
    }
  };

  const searchProfiles = async () => {
    if (!currentProfile) return;

    const targetType = currentProfile.user_type === 'mentor' ? 'team' : 'mentor';

    let query = supabase
      .from('profiles')
      .select(`
        id, user_type, full_name, state, city, bio, avatar_url, is_mentor_verified,
        mentor_details(*), team_details(*)
      `)
      .neq('id', currentProfile.id)
      .eq('user_type', targetType);

    if (filters.state) {
      query = query.eq('state', filters.state);
    }

    if (filters.search) {
      query = query.ilike('full_name', `%${filters.search}%`);
    }

    const { data } = await query.limit(50);
    setSearchResults((data as Profile[]) || []);
  };

  const createConnection = async (targetId: string, targetProfile: Profile) => {
    if (!currentProfile) return;

    const isMentor = currentProfile.user_type === 'mentor';
    const isTargetMentor = targetProfile.user_type === 'mentor';

    if (isMentor === isTargetMentor) return;

    await supabase.from('connections').insert({
      mentor_id: isMentor ? currentProfile.id : targetId,
      team_id: isMentor ? targetId : currentProfile.id,
      status: 'accepted'
    });

    loadConnections();
    searchProfiles();
  };

  const createMeeting = async (connectionId: string) => {
    const meetLink = `https://meet.google.com/new`;
    const title = `Reunião OutMentor`;

    await supabase.from('meetings').insert({
      connection_id: connectionId,
      title,
      scheduled_at: new Date().toISOString(),
      meet_link: meetLink
    });

    window.open(meetLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={onNavigate} />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-4">
          {currentProfile?.is_admin && (
            <button
              className="px-3 py-1 bg-indigo-600 text-white rounded ml-2"
              onClick={() => onNavigate('admin')}
            >
              Painel Admin
            </button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4 text-[#930200]" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
                {currentProfile?.user_type === 'mentor' ? 'Buscar Equipes' : 'Buscar Mentores'}
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Buscar por nome..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      onKeyUp={(e) => e.key === 'Enter' && searchProfiles()}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00]"
                    />
                  </div>
                  <button
                    onClick={searchProfiles}
                    className="bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white px-6 py-2 rounded-lg hover:scale-105 transition"
                  >
                    <Search size={20} />
                  </button>
                </div>

                <select
                  value={filters.state}
                  onChange={(e) => {
                    setFilters({ ...filters, state: e.target.value });
                    searchProfiles();
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00]"
                >
                  <option value="">Todos os estados</option>
                  {brazilianStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {searchResults.map((profile) => (
                  <div
                    key={profile.id}
                    onClick={() => onNavigate('profile', profile.id)}
                    className="bg-gradient-to-br from-white to-gray-50 rounded-2xl overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-200 hover:border-[#ff8e00]"
                  >
                    <div className="h-24 bg-gradient-to-r from-[#930200] to-[#ff8e00]" />

                    <div className="px-4 pb-4">
                      <div className="flex items-end gap-4 -mt-12 mb-4">
                        <div className="relative">
                          <div
                            className="w-20 h-20 rounded-xl bg-gradient-to-br from-[#ff8e00] to-[#930200] flex items-center justify-center text-2xl font-bold text-white border-4 border-white shadow-lg overflow-hidden"
                            style={{ backgroundImage: profile.avatar_url ? `url(${profile.avatar_url})` : undefined, backgroundSize: 'cover' }}
                          >
                            {!profile.avatar_url && profile.full_name.charAt(0)}
                          </div>
                          {profile.is_mentor_verified && (
                            <span className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs border-2 border-white" title="Verificado">
                              ✓
                            </span>
                          )}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            createConnection(profile.id, profile);
                          }}
                          className="ml-auto bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white px-4 py-2 rounded-lg hover:scale-105 transition text-sm font-bold"
                        >
                          Conectar
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg text-gray-800">{profile.full_name}</h3>
                        {profile.is_mentor_verified && (
                          <span className="ml-2 inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                            ✓ Verificado
                          </span>
                        )}
                      </div>

                      {profile.team_details && (
                        <p className="text-sm text-gray-600 font-semibold">
                          {profile.team_details.team_number} • {profile.team_details.team_type}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1 mb-3">
                        <MapPin size={14} />
                        {profile.city}, {profile.state}
                      </div>

                      {profile.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{profile.bio}</p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {profile.mentor_details && (
                          <>
                            {profile.mentor_details.mentor_ftc && (
                              <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-semibold">FTC</span>
                            )}
                            {profile.mentor_details.mentor_fll && (
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-semibold">FLL</span>
                            )}
                            {profile.mentor_details.knowledge_areas?.slice(0, 2).map(area => (
                              <span key={area} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                                {area}
                              </span>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-[#930200]" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
                Minhas Conexões
              </h2>

              {myConnections.length === 0 ? (
                <div className="text-center py-8">
                  <User className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">
                    Nenhuma conexão ainda. Comece buscando {currentProfile?.user_type === 'mentor' ? 'equipes' : 'mentores'}!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {myConnections.map((connection) => (
                    <div
                      key={connection.id}
                      onClick={() => onNavigate('profile', connection.profile.id)}
                      className="border-2 border-gray-200 rounded-xl p-4 hover:border-[#ff8e00] hover:shadow-lg transition cursor-pointer bg-gradient-to-r hover:from-orange-50 hover:to-red-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff8e00] to-[#930200] flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                            style={{ backgroundImage: connection.profile.avatar_url ? `url(${connection.profile.avatar_url})` : undefined, backgroundSize: 'cover' }}
                          >
                            {!connection.profile.avatar_url && connection.profile.full_name.charAt(0)}
                          </div>
                          {connection.profile.is_mentor_verified && (
                            <span className="absolute -bottom-0 -right-0 bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs border-2 border-white" title="Verificado">✓</span>
                          )}
                        </div>

                        <div
                          onClick={() => onNavigate('profile', connection.profile.id)}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <h4 className="font-bold text-gray-800 truncate">
                            {connection.profile.full_name}
                          </h4>
                          <p className="text-xs text-gray-500">{connection.profile.city}, {connection.profile.state}</p>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedConnection(connection);
                            }}
                            className="flex items-center gap-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-xs hover:shadow-md transition font-semibold"
                          >
                            <MessageCircle size={14} />
                            Chat
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              createMeeting(connection.id);
                            }}
                            className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg text-xs hover:shadow-md transition font-semibold"
                          >
                            <Video size={14} />
                            Meet
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedConnection && (
        <Chat
          connection={selectedConnection}
          onClose={() => setSelectedConnection(null)}
        />
      )}
    </div>
  );
}
