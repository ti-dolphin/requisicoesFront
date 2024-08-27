import React, { createContext, useState } from "react";

// Definição da interface para o contexto
interface ResponsableContextProps {
  responsable: number;
  setResponsable: (responsable: number) => void;
}

// Criação do contexto com valores padrão
export const ResponsableContext = createContext<ResponsableContextProps>({
  responsable: 0,
  setResponsable: () => {},
});

// Provedor do contexto que envolverá os componentes que precisam acessar ou alterar o responsável
export const ResponsableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [responsable, setResponsable] = useState<number>(0);

  return (
    <ResponsableContext.Provider value={{ responsable, setResponsable }}>
      {children}
    </ResponsableContext.Provider>
  );
};

// Hook customizado para usar o contexto
