import React, { useEffect, useRef, useState } from 'react';
import { Users, Target, Award, UserPlus, Globe, MessageSquare, Video, LogIn } from 'lucide-react';
import StatesTable from '../components/StatesTable';

interface LandingProps {
  onNavigate: (view: string) => void;
}

export default function Landing({ onNavigate }: LandingProps) {
  const inPageButtonRef = useRef<HTMLButtonElement | null>(null);
  const [floatingVisible, setFloatingVisible] = useState(true);

  useEffect(() => {
    const el = inPageButtonRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const ent = entries[0];
        // when the in-page button is visible, hide floating button
        setFloatingVisible(!ent.isIntersecting);
      },
      { root: null, threshold: 0.1 }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#fff7f2] to-[#fff2e8] overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-20 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-[#ffefe6] to-[#ffd5b3] opacity-60 blur-3xl transform rotate-12 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-tr from-[#ffe8e6] to-[#ffcbb0] opacity-60 blur-3xl transform -rotate-12 pointer-events-none" />

      <div className="container mx-auto px-6 py-20 relative z-10">
        <header className="grid md:grid-cols-2 gap-8 items-center mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#930200] to-[#ff8e00] flex items-center justify-center shadow-lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15 8H9L12 2Z" fill="#fff" />
                </svg>
              </div>
              <span className="text-sm font-medium text-[#930200] uppercase tracking-wider">OutMentor</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#ff8e00] via-[#ffb57a] to-[#930200]" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
              Conectando mentores e equipes de robótica no Brasil
            </h1>

            <p className="text-lg text-gray-700 max-w-2xl mb-8">
              Encontre orientação especializada para sua equipe ou compartilhe sua experiência como mentor — tudo em uma plataforma focada em FTC e FLL.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => onNavigate('register-team')}
                className="flex items-center justify-center gap-3 bg-gradient-to-br from-[#ff8e00] to-[#ff6a3d] text-white px-6 py-3 rounded-2xl text-lg font-semibold shadow-xl hover:scale-105 transition"
              >
                <Target size={20} />
                Sou Equipe
              </button>

              <button
                onClick={() => onNavigate('register-mentor')}
                className="flex items-center justify-center gap-3 bg-white text-[#930200] px-6 py-3 rounded-2xl text-lg font-semibold border-2 border-[#ffd1b0] shadow-sm hover:shadow-md transition"
              >
                <Users size={20} />
                Sou Mentor
              </button>
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-3xl shadow-2xl">
              <h4 className="text-sm text-gray-500">Por que usar</h4>
              <p className="text-2xl font-bold text-[#930200] mb-3">Conecte com segurança e facilidade</p>

              <ul className="mt-3 space-y-3 text-gray-600 text-sm">
                <li className="flex items-start gap-3">
                  <UserPlus className="mt-1 text-[#ff8e00]" size={18} />
                  <span><strong>Registre-se</strong> como mentor ou equipe — perfis completos e verificados.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Globe className="mt-1 text-[#ff8e00]" size={18} />
                  <span><strong>Conecte-se</strong> com pessoas de todo o Brasil rapidamente.</span>
                </li>
                <li className="flex items-start gap-3">
                  <MessageSquare className="mt-1 text-[#ff8e00]" size={18} />
                  <span><strong>Chat em tempo real</strong> visando eficiência na comunicação.</span>
                </li>
                <li className="flex items-start gap-3">
                  <Video className="mt-1 text-[#ff8e00]" size={18} />
                  <span><strong>Integração com Google Meet</strong> para agendar reuniões online rapidamente.</span>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <div className="mb-12 bg-white rounded-3xl p-6 shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-[#930200]" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
            Cobertura Nacional
          </h2>
          <StatesTable />
        </div>

        <section className="mt-8 grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-[#930200] to-[#ff8e00] rounded-full">
                <Users className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#930200]" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
                FIRST Tech Challenge
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              Programa de robótica para estudantes do ensino médio — desafios reais, inovação e trabalho em equipe.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center gap-4 mb-3">
              <div className="p-3 bg-gradient-to-r from-[#ff8e00] to-[#930200] rounded-full">
                <Award className="text-white" size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#ff8e00]" style={{ fontFamily: 'Intro Rust, sans-serif' }}>
                FIRST LEGO League
              </h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              Introduz ciência e tecnologia para jovens com aprendizado prático através de atividades com LEGO.
            </p>
          </div>
        </section>

        <div className="text-center mt-12">
          <button
            ref={inPageButtonRef}
            onClick={() => onNavigate('login')}
            className="inline-flex items-center justify-center gap-3 bg-gradient-to-br from-[#930200] to-[#ff8e00] text-white px-8 py-4 rounded-2xl text-lg font-bold shadow-2xl transform hover:scale-105 hover:shadow-amber-400/40 transition"
          >
            <LogIn size={18} />
            Já tenho conta
          </button>
        </div>
      </div>

      {/* Floating login button (fixed) */}
      <button
        onClick={() => onNavigate('login')}
        aria-label="Entrar"
        className={
          `fixed top-6 right-6 md:top-8 md:right-8 z-50 inline-flex items-center gap-2 bg-gradient-to-br from-[#930200] to-[#ff8e00] text-white px-4 py-3 rounded-full text-sm font-semibold shadow-2xl hover:scale-105 transition transform ${
            floatingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'
          }`
        }
      >
        <LogIn size={16} />
        <span className="hidden sm:inline">Já tenho conta</span>
      </button>
    </div>
  );
}
