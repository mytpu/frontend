import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AssistantPage } from '@/pages/AssistantPage';
import { HomePage } from '@/pages/HomePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SchedulePage } from '@/pages/SchedulePage';
import { ServicesPage } from '@/pages/ServicesPage';

import { AppShell } from './AppShell';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="assistant" element={<AssistantPage />} />`n          <Route path="schedule" element={<SchedulePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
