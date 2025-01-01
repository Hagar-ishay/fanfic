'use client';

import { createContext, ReactNode, useContext, useState, useTransition } from 'react';

interface TransitionContextValue {
  pendingIds: Set<number>;
  startTransition: (id: number, cb: () => void) => void;
  isPending: (id?: number) => boolean;
}

interface TransitionProviderProps {
  children: ReactNode;
  contextName?: string;
}

const createTransitionContext = (name: string = 'Transition') => {
  const Context = createContext<TransitionContextValue | null>(null);

  const useTransitionContext = () => {
    const context = useContext(Context);
    if (!context) {
      throw new Error(`use${name} must be used within a ${name}Provider`);
    }
    return context;
  };

  const Provider = ({ children }: TransitionProviderProps) => {
    const [, startReactTransition] = useTransition();
    const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

    const startTransition = (id: number, cb: () => void) => {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });

      startReactTransition(() => {
        cb();
        setPendingIds(prev => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      });
    };

    const isPending = (id?: number) => {
      if (!id) return pendingIds.size > 0;
      return pendingIds.has(id);
    };

    return (
      <Context.Provider
        value={{
          pendingIds,
          startTransition,
          isPending,
        }}
      >
        {children}
      </Context.Provider>
    );
  };

  return {
    Provider,
    useTransition: useTransitionContext,
  };
};

export default createTransitionContext; 