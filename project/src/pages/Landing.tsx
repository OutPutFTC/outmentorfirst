import { Users, Target, Award, Sparkles } from 'lucide-react';
import StatesTable from '../components/StatesTable';

interface LandingProps {
  onNavigate: (view: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-beige-700 via-beige-900 to-beige-500">
      <div className="container mx-auto px-4 py-20">
        <header className="text-center mb-20">
          <div className="mb-6 flex items-center justify-center gap-2">
            <Sparkles className="text-[#ff8e00] animate-spin" size={32} />
            <h1
              className="text-7xl font-bold bg-gradient-to-r from-[#ff8e00] via-orange-300 to-[#930200] bg-clip-text text-transparent drop-shadow-lg"
              style={{ fontFamily: 'Intro Rust, sans-serif' }}
            >
              OutMentor
            </h1>
            <Sparkles className="text-[#930200] animate-spin" size={32} />
          </div>
          <p className="text-2xl text-orange-900 max-w-3xl mx-auto font-light leading-relaxed mb-4">
            Conecte-se com mentores incríveis e equipes apaixonadas por robótica
          </p>
          <p className="text-lg text-orange-300">
            A maior rede de mentoria para FTC e FLL no Brasil
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6 justify-center mb-24">
          <button
            onClick={() => onNavigate('register-mentor')}
            className="group bg-gradient-to-br from-[#ff8e00] to-orange-600 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-orange-500/50"
          >
            <Users className="inline-block mr-3" size={28} />
            Sou Mentor
          </button>
          <button
            onClick={() => onNavigate('register-team')}
            className="group bg-gradient-to-br from-[#930200] to-red-700 text-white px-10 py-4 rounded-2xl text-xl font-bold hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-red-500/50"
          >
            <Target className="inline-block mr-3" size={28} />
            Sou Equipe
          </button>
        </div>

        <div className="mb-20 bg-white rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center text-[#930200]" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
            Cobertura Nacional
          </h2>
          <StatesTable />
        </div>

        <section className="mt-20 grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-[#930200] to-[#ff8e00] rounded-full">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#930200]" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
                FIRST Tech Challenge
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Programa de robótica para estudantes do ensino médio, desafiando equipes a projetar, construir, programar e operar robôs para competir em um jogo baseado em campo.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-r from-[#ff8e00] to-[#930200] rounded-full">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-[#ff8e00]" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
                FIRST LEGO League
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Programa que introduz ciência, tecnologia, engenharia e matemática para jovens através de aprendizado prático e robótica com LEGO, promovendo inovação e trabalho em equipe.
            </p>
          </div>
        </section>

        <div className="text-center mt-20">
          <button
            onClick={() => onNavigate('login')}
            className="bg-white text-[#930200] px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-xl transition-all border-2 border-[#930200]"
          >
            Já tenho conta
          </button>
        </div>
      </div>
    </div>
  );
}
