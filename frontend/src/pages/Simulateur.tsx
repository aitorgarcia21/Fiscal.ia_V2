import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCountry } from '../contexts/CountryContext';

export const Simulateur: React.FC = () => {
  const { country } = useCountry();
  const navigate = useNavigate();

  useEffect(() => {
    if (country === 'CH') {
      navigate('/simulateur-impot-suisse', { replace: true });
    } else if (country === 'AD') {
      navigate('/simulateur-irpf', { replace: true });
    } else if (country === 'LU') {
      navigate('/simulateur-impot-luxembourg', { replace: true });
    } else {
      navigate('/simulateur-impot', { replace: true });
    }
  }, [country, navigate]);

  return null;
}; 