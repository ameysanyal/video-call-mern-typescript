import React from 'react'; // Explicitly import React

import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

type LayoutProps = {
  /**
   * The content to be rendered inside the layout.
   * Can be any valid React node (elements, strings, numbers, fragments, etc.).
   */
  children: React.ReactNode;
  showSidebar?: boolean;
};

const Layout = ({ children, showSidebar = false }: LayoutProps): React.JSX.Element => {
  return (
    <div className="min-h-screen">
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
