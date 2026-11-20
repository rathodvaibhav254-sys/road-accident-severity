import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, Skull } from 'lucide-react';

export default function SeverityBadge({ severity, size = "md", showIcon = true }) {
  const configs = {
    Minor: {
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/40",
      text: "text-emerald-400",
      icon: ShieldCheck,
      label: "Minor Severity"
    },
    Moderate: {
      bg: "bg-amber-500/15",
      border: "border-amber-500/40",
      text: "text-amber-400",
      icon: AlertCircle,
      label: "Moderate Severity"
    },
    Severe: {
      bg: "bg-orange-500/15",
      border: "border-orange-500/40",
      text: "text-orange-400",
      icon: AlertTriangle,
      label: "Severe Severity"
    },
    Fatal: {
      bg: "bg-red-500/15",
      border: "border-red-500/40",
      text: "text-red-400",
      icon: Skull,
      label: "Fatal Severity"
    }
  };

  const config = configs[severity] || configs.Moderate;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs font-medium gap-1.5",
    lg: "px-3.5 py-1.5 text-sm font-semibold gap-2"
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${config.border} ${config.text} ${sizeClasses[size]}`}>
      {showIcon && <Icon size={iconSizes[size]} />}
      <span>{severity}</span>
    </span>
  );
}

