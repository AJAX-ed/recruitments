import { useCallback, useState } from 'react';
import type { TerminalEntry, TerminalState } from '@/types/recruitment';

const MAX_HISTORY = 100;

export function useTerminal() {
  const [state, setState] = useState<TerminalState>({
    currentDepartment: null,
    history: [],
    commandHistory: [],
    commandHistoryIndex: -1,
    isBootComplete: false,
  });

  const addEntry = useCallback((type: TerminalEntry['type'], content: string) => {
    setState(prev => ({
      ...prev,
      history: [
        ...prev.history.slice(-(MAX_HISTORY - 1)),
        { type, content, timestamp: Date.now() },
      ],
    }));
  }, []);

  const addCommandToHistory = useCallback((command: string) => {
    setState(prev => ({
      ...prev,
      commandHistory: [...prev.commandHistory.slice(-49), command],
      commandHistoryIndex: prev.commandHistory.length,
    }));
  }, []);

  const navigateCommandHistory = useCallback((direction: 'up' | 'down') => {
    setState(prev => {
      let newIndex = prev.commandHistoryIndex;
      if (direction === 'up' && prev.commandHistoryIndex > 0) {
        newIndex = prev.commandHistoryIndex - 1;
      } else if (direction === 'down' && prev.commandHistoryIndex < prev.commandHistory.length - 1) {
        newIndex = prev.commandHistoryIndex + 1;
      } else if (direction === 'down' && prev.commandHistoryIndex === prev.commandHistory.length - 1) {
        newIndex = prev.commandHistory.length;
        return { ...prev, commandHistoryIndex: newIndex };
      }

      const command = prev.commandHistory[newIndex] || '';
      
      // Dispatch custom event to update input
      window.dispatchEvent(new CustomEvent('terminal-command-history', { 
        detail: { command, index: newIndex } 
      }));

      return { ...prev, commandHistoryIndex: newIndex };
    });
  }, []);

  const setCurrentDepartment = useCallback((department: string | null) => {
    setState(prev => ({ ...prev, currentDepartment: department }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, history: [] }));
  }, []);

  const setBootComplete = useCallback(() => {
    setState(prev => ({ ...prev, isBootComplete: true }));
  }, []);

  return {
    state,
    addEntry,
    addCommandToHistory,
    navigateCommandHistory,
    setCurrentDepartment,
    clearHistory,
    setBootComplete,
  };
}
