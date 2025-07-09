import React, { useEffect, useState } from 'react';

interface Step {
  id: string;
  label: string;
}

interface StepperVerticalProps {
  steps: Step[];
}

export const StepperVertical: React.FC<StepperVerticalProps> = ({ steps }) => {
  const [activeId, setActiveId] = useState<string>(steps[0]?.id || '');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Trouver la première section réellement visible afin d'éviter les sauts
        const firstVisible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (firstVisible) {
          setActiveId(firstVisible.target.id);
        }
      },
      {
        rootMargin: '-40% 0px -50% 0px', // marge pour déclencher un peu avant le centre
        threshold: 0.25,
      }
    );

    steps.forEach((step) => {
      const el = document.getElementById(step.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [steps]);

  const handleClick = (id: string) => {
    const el = document.getElementById(id);
    // Mette à jour immédiatement l'étape active pour éviter le "saut" visuel
    setActiveId(id);
    if (el) {
      // Scroll avec un léger offset pour ne pas être caché sous le header sticky
      const headerOffset = 80; // hauteur approximative du header
      const elementPosition = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: 'smooth',
      });
    }
  };

  return (
    <nav className="hidden lg:block w-60 sticky top-28 self-start">
      <ul className="space-y-4 border-l-2 border-[#2A3F6C]/60 pl-4">
        {steps.map((step, index) => (
          <li key={step.id} className="relative">
            <button
              onClick={() => handleClick(step.id)}
              className={`text-left text-sm font-medium transition-colors focus:outline-none ${
                activeId === step.id ? 'text-[#c5a572]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span
                className={`absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 ${
                  activeId === step.id ? 'bg-[#c5a572] border-[#c5a572]' : 'bg-[#1a2942] border-[#2A3F6C]'
                }`}
              />
              {index + 1}. {step.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}; 