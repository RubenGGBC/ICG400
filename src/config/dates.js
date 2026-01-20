// Configuración de fechas para el sistema de propuestas
// Período de propuestas: 19/01/2026 (lunes) - 25/01/2026 (domingo) 23:59:59

const PROPOSAL_START_DATE = new Date('2026-01-19T00:00:00');
const PROPOSAL_END_DATE = new Date('2026-01-25T23:59:59');

// Verificar si estamos en el período de propuestas
const isProposalPeriod = () => {
  const now = new Date();
  return now >= PROPOSAL_START_DATE && now <= PROPOSAL_END_DATE;
};

// Verificar si el período de propuestas ya terminó
const hasProposalPeriodEnded = () => {
  const now = new Date();
  return now > PROPOSAL_END_DATE;
};

// Verificar si el período de propuestas aún no ha comenzado
const hasProposalPeriodNotStarted = () => {
  const now = new Date();
  return now < PROPOSAL_START_DATE;
};

// Obtener información del período
const getProposalPeriodInfo = () => {
  const now = new Date();
  return {
    startDate: PROPOSAL_START_DATE,
    endDate: PROPOSAL_END_DATE,
    isActive: isProposalPeriod(),
    hasEnded: hasProposalPeriodEnded(),
    hasNotStarted: hasProposalPeriodNotStarted(),
    daysRemaining: Math.max(0, Math.ceil((PROPOSAL_END_DATE - now) / (1000 * 60 * 60 * 24)))
  };
};

module.exports = {
  PROPOSAL_START_DATE,
  PROPOSAL_END_DATE,
  isProposalPeriod,
  hasProposalPeriodEnded,
  hasProposalPeriodNotStarted,
  getProposalPeriodInfo
};
