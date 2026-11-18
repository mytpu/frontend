import { useNavigate } from 'react-router-dom';

import { api } from '@/api/client';
import type { ServiceId } from '@/api/types';
import { useAsync } from '@/shared/lib/useAsync';
import { Chip, ErrorBlock, Skeleton } from '@/shared/ui/Card';
import { Icon } from '@/shared/ui/Icon';
import type { IconName } from '@/shared/ui/Icon';
import { PageHeader } from '@/shared/ui/PageHeader';

import './pages.css';

const ICON: Record<ServiceId, IconName> = {
  lk: 'user',
  rasp: 'calendar',
  moodle: 'book',
  mail: 'mail',
  help: 'help',
  docs: 'docs',
};

/* Вопрос, который имеет смысл задать помощнику про этот сервис. */
const PROMPT: Record<ServiceId, string> = {
  lk: 'Как посмотреть свои оценки в личном кабинете ТПУ?',
  rasp: 'Найди в расписании аудиторию 403',
  moodle: 'Как записаться на курс в Moodle?',
  mail: 'Как настроить почту ТПУ на телефоне?',
  help: 'Как создать заявку в help.tpu.ru?',
  docs: 'Где найти инструкции для сотрудников ТПУ?',
};

export function ServicesPage() {
  const services = useAsync(api.services);
  const actions = useAsync(api.quickActions);
  const navigate = useNavigate();

  const ask = (question: string) => navigate(`/assistant?q=${encodeURIComponent(question)}`);

  return (
    <>
      <PageHeader eyebrow="6 сервисов · общий слой интеграций" title="Сервисы" />

      {actions.state.status === 'ready' ? (
        <section className="section">
          <h2 className="section__title">Спросить помощника</h2>
          <div className="actions">
            {actions.state.data.map((action) => (
              <button key={action.id} className="action" type="button" onClick={() => ask(action.prompt)}>
                {action.title}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section className="section">
        <h2 className="section__title">Все сервисы</h2>

        {services.state.status === 'loading' ? <Skeleton lines={4} /> : null}
        {services.state.status === 'error' ? (
          <ErrorBlock message={services.state.message} onRetry={services.reload} />
        ) : null}

        {services.state.status === 'ready' ? (
          <div className="tiles">
            {services.state.data.map((service) => (
              <article key={service.id} className={`tile${service.via === 'gateway' ? ' tile--gateway' : ''}`}>
                <div className="tile__head">
                  <span className="tile__icon" aria-hidden="true">
                    <Icon name={ICON[service.id]} size={18} />
                  </span>
                  <span className="tile__names">
                    <h3 className="tile__title">{service.title}</h3>
                    <p className="tile__subtitle">{service.subtitle}</p>
                  </span>
                </div>

                <div className="tile__foot">
                  <Chip tone={service.via === 'gateway' ? 'ok' : 'neutral'}>
                    {service.via === 'gateway' ? 'через шлюз' : 'только ссылка'}
                  </Chip>

                  {service.via === 'gateway' ? (
                    <button className="tile__action" type="button" onClick={() => ask(PROMPT[service.id])}>
                      Спросить помощника
                      <Icon name="arrow" size={15} />
                    </button>
                  ) : (
                    <a className="tile__action" href={service.url} target="_blank" rel="noreferrer">
                      Открыть сайт
                      <Icon name="external" size={15} />
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
