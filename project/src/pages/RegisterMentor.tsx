import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const brazilianStates = [
  'Acre', 'Alagoas', 'Amapá', 'Amazonas', 'Bahia', 'Ceará', 'Distrito Federal',
  'Espírito Santo', 'Goiás', 'Maranhão', 'Mato Grosso', 'Mato Grosso do Sul',
  'Minas Gerais', 'Pará', 'Paraíba', 'Paraná', 'Pernambuco', 'Piauí',
  'Rio de Janeiro', 'Rio Grande do Norte', 'Rio Grande do Sul', 'Rondônia',
  'Roraima', 'Santa Catarina', 'São Paulo', 'Sergipe', 'Tocantins'
];

interface RegisterMentorProps {
  onNavigate: (view: string) => void;
}

export default function RegisterMentor({ onNavigate }: RegisterMentorProps) {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: '',
    state: '',
    city: '',
    linkedinUrl: '',
    mentorFTC: false,
    mentorFLL: false,
    knowledgeAreas: [] as string[]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!formData.mentorFTC && !formData.mentorFLL) {
      setError('Selecione pelo menos uma área de mentoria');
      return;
    }

    const birthDate = new Date(formData.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    if (age < 16) {
      setError('Você deve ter pelo menos 16 anos');
      return;
    }

    setLoading(true);

    try {
      await signUp(formData.email, formData.password, {
        user_type: 'mentor',
        full_name: formData.fullName,
        email: formData.email,
        state: formData.state,
        city: formData.city,
        linkedin_url: formData.linkedinUrl
      });

      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase.from('mentor_details').insert({
          profile_id: user.id,
          mentor_ftc: formData.mentorFTC,
          mentor_fll: formData.mentorFLL,
          knowledge_areas: formData.knowledgeAreas
        });
      }

      onNavigate('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  const toggleKnowledgeArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      knowledgeAreas: prev.knowledgeAreas.includes(area)
        ? prev.knowledgeAreas.filter(a => a !== area)
        : [...prev.knowledgeAreas, area]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 py-12">
      <div className="container mx-auto px-4">
        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-[#930200] mb-6 hover:underline"
        >
          <ArrowLeft size={20} />
          Voltar
        </button>

        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-[#930200] to-[#ff8e00] bg-clip-text text-transparent" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
            Cadastro de Mentor
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nome Completo *</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Data de Nascimento *</label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estado *</label>
                <select
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
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
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">E-mail *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn (opcional)</label>
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Senha *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirmar Senha *</label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#ff8e00] focus:border-transparent"
                  minLength={6}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Área de Mentoria *</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mentorFTC}
                    onChange={(e) => setFormData({ ...formData, mentorFTC: e.target.checked })}
                    className="w-5 h-5 text-[#ff8e00] focus:ring-[#ff8e00]"
                  />
                  <span>FTC</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mentorFLL}
                    onChange={(e) => setFormData({ ...formData, mentorFLL: e.target.checked })}
                    className="w-5 h-5 text-[#ff8e00] focus:ring-[#ff8e00]"
                  />
                  <span>FLL</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-3">Áreas de Conhecimento</label>
              <div className="grid grid-cols-2 gap-2">
                {['Robô', 'Projeto', 'Core Values', 'Outreach', 'Engenharia', 'Programação'].map(area => (
                  <label key={area} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.knowledgeAreas.includes(area)}
                      onChange={() => toggleKnowledgeArea(area)}
                      className="w-4 h-4 text-[#ff8e00] focus:ring-[#ff8e00]"
                    />
                    <span className="text-sm">{area}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#930200] to-[#ff8e00] text-white py-3 rounded-lg font-semibold hover:scale-105 transition-transform disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
