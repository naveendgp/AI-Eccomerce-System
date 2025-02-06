import React from "react";
import TopNavigation from "./Components/TopNavigation/TopNavigation";
import Sidenav from "./Components/SideNavigation/Sidenav";
const Layout = ({ children }) => {
  return (
    <div>
      <header>
        <TopNavigation />
      </header>
      <main className="flex mt-20">
        <aside className="w-[17vw] fixed top-0 left-5 h-full">
          <Sidenav />
        </aside>
        <section className="ml-[17vw] flex-1 p-6">{children}</section>
      </main>
    </div>
  );
};

export default Layout;
