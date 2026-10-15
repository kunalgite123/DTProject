import React from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppLayout = ({ children, title }) => {
  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        <Topbar title={title} />
        <main className="app-main-content" style={{ flex: 1, minHeight: 'calc(100vh - 70px)', background: '#F8FAFC' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
