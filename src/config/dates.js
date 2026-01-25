// Configuración de fechas para el sistema de propuestas y votación
// Período de sugerencias: 19/01/2026 (lunes) - 25/01/2026 (domingo) 23:59:59
// Período de votación: 26/01/2026 (lunes) 00:00:00 - 28/01/2026 (miércoles) 17:00:00

const PROPOSAL_START_DATE = new Date('2026-01-19T00:00:00');
const PROPOSAL_END_DATE = new Date('2026-01-25T23:59:59');

const VOTING_START_DATE = new Date('2026-01-26T00:00:00');
const VOTING_END_DATE = new Date('2026-01-28T17:00:00');

// Verificar si estamos en el período de sugerencias
const isProposalPeriod = () => {
  const now = new Date();
  return now >= PROPOSAL_START_DATE && now <= PROPOSAL_END_DATE;
};

// Verificar si estamos en el período de votación
const isVotingPeriod = () => {
  const now = new Date();
  return now >= VOTING_START_DATE && now <= VOTING_END_DATE;
};

// Verificar si el período de sugerencias ya terminó
const hasProposalPeriodEnded = () => {
  const now = new Date();
  return now > PROPOSAL_END_DATE;
};

// Verificar si el período de votación ya terminó
const hasVotingPeriodEnded = () => {
  const now = new Date();
  return now > VOTING_END_DATE;
};

// Verificar si el período de propuestas aún no ha comenzado
const hasProposalPeriodNotStarted = () => {
  const now = new Date();
  return now < PROPOSAL_START_DATE;
};

// Obtener información del período de sugerencias
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

// Obtener información del período de votación
const getVotingPeriodInfo = () => {
  const now = new Date();
  return {
    startDate: VOTING_START_DATE,
    endDate: VOTING_END_DATE,
    isActive: isVotingPeriod(),
    hasEnded: hasVotingPeriodEnded(),
    hasNotStarted: now < VOTING_START_DATE,
    daysRemaining: Math.max(0, Math.ceil((VOTING_END_DATE - now) / (1000 * 60 * 60 * 24)))
  };
};

module.exports = {
  PROPOSAL_START_DATE,
  PROPOSAL_END_DATE,
  VOTING_START_DATE,
  VOTING_END_DATE,
  isProposalPeriod,
  isVotingPeriod,
  hasProposalPeriodEnded,
  hasVotingPeriodEnded,
  hasProposalPeriodNotStarted,
  getProposalPeriodInfo,
  getVotingPeriodInfo
};
