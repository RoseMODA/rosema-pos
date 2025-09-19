/**
 * Componente de tabs para sesiones de clientes en ventas
 */

import React from 'react';
import { formatPrice } from '../../utils/formatters.js';

const SessionTabs = ({
  sessions,
  activeSessionId,
  onSessionChange,
  onDeleteSession,
  onNewSession
}) => {
  return (
    <div className="flex space-x-2 mb-6">
      {sessions.map((session) => (
        <SessionTab
          key={session.id}
          session={session}
          isActive={activeSessionId === session.id}
          canDelete={sessions.length > 1}
          onSelect={() => onSessionChange(session.id)}
          onDelete={() => onDeleteSession(session.id)}
        />
      ))}

      {/* Botón para nueva sesión */}
      <button
        onClick={onNewSession}
        className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-t-lg font-medium transition-colors flex items-center space-x-1"
        title="Nueva venta"
      >
        <span>+</span>
        <span>Nueva</span>
      </button>
    </div>
  );
};

const SessionTab = ({ session, isActive, canDelete, onSelect, onDelete }) => {
  return (
    <div className="flex items-center">
      <button
        onClick={onSelect}
        className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${isActive
          ? 'bg-gray-700 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
      >
        {session.name}
      </button>

      {/* Indicador de total y botón eliminar */}
      <div className={`flex items-center px-2 py-2 ${isActive ? 'bg-green-200' : 'bg-gray-200'
        } rounded-t-lg`}>
        <span className={`text-sm mr-2 ${isActive ? 'text-black' : 'text-gray-600'
          }`}>
          {formatPrice(session.total)}
        </span>

        {canDelete && (
          <button
            onClick={onDelete}
            className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isActive
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            title="Eliminar sesión"
          >
            <span className="text-xs">×</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default SessionTabs;
