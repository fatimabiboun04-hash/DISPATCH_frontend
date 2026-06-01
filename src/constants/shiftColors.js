export const getShiftColor = (type) => {
  const colors = {
    day: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      dot: 'bg-blue-500',
      border: 'border-blue-200',
    },
    night: {
      bg: 'bg-indigo-100',
      text: 'text-indigo-700',
      dot: 'bg-indigo-500',
      border: 'border-indigo-200',
    },
    conge: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      dot: 'bg-green-500',
      border: 'border-green-200',
    },
    absence: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      dot: 'bg-red-500',
      border: 'border-red-200',
    },
    emergency: {
      bg: 'bg-orange-100',
      text: 'text-orange-700',
      dot: 'bg-orange-500',
      border: 'border-orange-200',
    },
  }

  return colors[type] || colors.day
}