import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface StateStats {
  state: string;
  mentors: number;
  teams: number;
  total: number;
}

const brazilianStates = [
  'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
  'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
  'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
  'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
  'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
];

export default function StatesTable() {
  const [statesData, setStatesData] = useState<StateStats[]>([]);
  const [sortBy, setSortBy] = useState<'state' | 'total' | 'mentors' | 'teams'>('total');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [tableVisible, setTableVisible] = useState(false);

  useEffect(() => {
    loadStateStatistics();
  }, []);

  const loadStateStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('state, user_type');

      if (error) {
        console.error('Error loading profiles for state statistics:', error);
        setStatesData([]);
        setLoading(false);
        return;
      }

      // Initialize map with all Brazilian states so we always show rows
      const map: Record<string, StateStats> = {};
      for (const st of brazilianStates) {
        map[st] = { state: st, mentors: 0, teams: 0, total: 0 };
      }

      // Aggregate counts per state with normalization + trimming + case-insensitive matching
      (data || []).forEach((p: any) => {
        // Normalize and trim incoming value
        const raw = (p.state ?? '').toString().trim().normalize('NFC');
        // Find matching canonical state from brazilianStates (case-insensitive)
        const matched = brazilianStates.find(
          s => s.normalize('NFC').toLowerCase() === raw.toLowerCase()
        );

        const key = matched ?? '';
        if (!map[key]) map[key] = { state: key, mentors: 0, teams: 0, total: 0 };

        if (p.user_type === 'mentor') map[key].mentors += 1;
        else if (p.user_type === 'team') map[key].teams += 1;

        map[key].total = map[key].mentors + map[key].teams;
      });

      // Keep brazilianStates ordering and include fallback '' at the end if present
      const stats: StateStats[] = brazilianStates.map(s => map[s]);
      if (map[''] && (map[''].mentors > 0 || map[''].teams > 0)) {
        stats.push(map['']);
      }

      setStatesData(stats);
    } catch (err) {
      console.error('Unexpected error while loading state statistics', err);
      setStatesData([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedData = [...statesData].sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    if (typeof aValue === 'string') {
      return sortOrder === 'asc'
        ? aValue.localeCompare(bValue as string)
        : (bValue as string).localeCompare(aValue);
    }

    return sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number);
  });

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ column }: { column: typeof sortBy }) => {
    if (sortBy !== column) return <div className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  const totalMentors = statesData.reduce((sum, s) => sum + s.mentors, 0);
  const totalTeams = statesData.reduce((sum, s) => sum + s.teams, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#930200] border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200">
          <div className="text-3xl font-bold text-[#930200]">{totalMentors}</div>
          <div className="text-gray-700 font-semibold mt-1">Mentores no Brasil</div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-2xl border border-red-200">
          <div className="text-3xl font-bold text-[#930200]">{totalTeams}</div>
          <div className="text-gray-700 font-semibold mt-1">Equipes no Brasil</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">{totalMentors + totalTeams}</div>
          <div className="text-gray-700 font-semibold mt-1">Total de Membros</div>
        </div>
      </div>

      {/* Toggle button for table visibility */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">Estatísticas por Estado</h2>
        <button
          onClick={() => setTableVisible(!tableVisible)}
          className="flex items-center gap-2 px-4 py-2 bg-[#930200] text-white rounded-lg hover:bg-[#7a0100] transition font-medium"
        >
          {tableVisible ? (
            <>
              <EyeOff size={18} />
              Esconder Tabela
            </>
          ) : (
            <>
              <Eye size={18} />
              Mostrar Tabela
            </>
          )}
        </button>
      </div>

      {/* Collapsible table */}
      {tableVisible && (
        <div>
          <div className="mb-4 p-4 bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white rounded-xl text-center font-bold text-lg">
            Nenhuma equipe ou mentor na sua região? Seja o primeiro(a)!
          </div>
          <div className="overflow-x-auto bg-white rounded-2xl shadow-lg">
            <table className="w-full">
            <thead className="bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white">
              <tr>
                <th
                  className="px-6 py-4 text-left font-bold cursor-pointer hover:bg-gradient-to-r hover:from-[#7a0100] hover:to-[#e67e00] transition"
                  onClick={() => handleSort('state')}
                >
                  <div className="flex items-center gap-2">
                    Estado
                    <SortIcon column="state" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-center font-bold cursor-pointer hover:bg-gradient-to-r hover:from-[#7a0100] hover:to-[#e67e00] transition"
                  onClick={() => handleSort('mentors')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Mentores
                    <SortIcon column="mentors" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-center font-bold cursor-pointer hover:bg-gradient-to-r hover:from-[#7a0100] hover:to-[#e67e00] transition"
                  onClick={() => handleSort('teams')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Equipes
                    <SortIcon column="teams" />
                  </div>
                </th>
                <th
                  className="px-6 py-4 text-center font-bold cursor-pointer hover:bg-gradient-to-r hover:from-[#7a0100] hover:to-[#e67e00] transition"
                  onClick={() => handleSort('total')}
                >
                  <div className="flex items-center justify-center gap-2">
                    Total
                    <SortIcon column="total" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((row, idx) => (
                <tr
                  key={row.state}
                  className={`${
                    idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } hover:bg-orange-50 transition border-b border-gray-200`}
                >
                  <td className="px-6 py-4 font-semibold text-gray-800">{row.state}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-bold text-sm">
                      {row.mentors}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full font-bold text-sm">
                      {row.teams}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                      {row.total}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
