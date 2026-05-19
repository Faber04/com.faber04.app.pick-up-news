import type { SubpageContainerProps } from '../types/component-props';

export const SubpageContainer = ({ title, children }: SubpageContainerProps) => {
  return (
    <div className="app-container py-6 stagger-in">
      <h2 className="mb-5 text-[22px] font-bold text-primary">{title}</h2>
      <div>{children}</div>
    </div>
  );
};

