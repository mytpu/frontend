import type { ReactNode } from 'react';
import { useState } from 'react';

import { Icon } from './Icon';

import './stepper.css';

export interface StepDef {
  title: string;
  content: ReactNode;
}

interface StepperProps {
  steps: StepDef[];
  completeLabel?: string;
  blocked?: boolean;
  onComplete: () => void;
  onCancel?: () => void;
}

/* Шаги из Stepper (React Bits), ужатые до продукта: номера, стрелки, липкий футер.
   Анимации — CSS-переход, без motion/react. */
export function Stepper({ steps, completeLabel = 'Готово', blocked = false, onComplete, onCancel }: StepperProps) {
  const [current, setCurrent] = useState(0);
  const last = current === steps.length - 1;
  const step = steps[current];

  return (
    <div className="stepper">
      <ol className="stepper__rail">
        {steps.map((item, index) => (
          <li key={item.title} className="stepper__point" data-state={index < current ? 'done' : index === current ? 'now' : 'next'}>
            <span className="stepper__num" aria-hidden="true">
              {index < current ? <Icon name="check" size={13} /> : index + 1}
            </span>
            <span className="stepper__name" aria-current={index === current ? 'step' : undefined}>
              {item.title}
            </span>
          </li>
        ))}
      </ol>

      <div className="stepper__body" key={current}>
        {step.content}
      </div>

      <div className="stepper__foot">
        {onCancel ? (
          <button className="btn btn--outline" type="button" onClick={onCancel}>
            Отмена
          </button>
        ) : (
          <span />
        )}

        <div className="stepper__arrows">
          {current > 0 ? (
            <button className="stepper__back" type="button" aria-label="Назад" onClick={() => setCurrent((value) => value - 1)}>
              <Icon name="arrow" size={16} className="stepper__back-icon" />
            </button>
          ) : null}

          <button
            className="btn btn--contrast"
            type="button"
            disabled={blocked}
            onClick={() => (last ? onComplete() : setCurrent((value) => value + 1))}
          >
            {last ? completeLabel : 'Далее'}
            {last ? null : <Icon name="arrow" size={15} />}
          </button>
        </div>
      </div>
    </div>
  );
}
