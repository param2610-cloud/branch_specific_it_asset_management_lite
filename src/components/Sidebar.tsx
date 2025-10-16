'use client';
import React, { useContext, useState } from 'react';
import { HomeIcon, ComputerDesktopIcon, UsersIcon, ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthContext } from '@/context/AuthContext';
import axios from 'axios';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Assets', href: '/dashboard/assets', icon: ComputerDesktopIcon },
  { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const auth = useContext(AuthContext);
  const [branchName,setBranchName] = React.useState('Loading...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const loadBranchName = async () => {
      if (!auth) {
        return;
      }

      const locationId = auth.user?.locationId ?? auth.user?.location?.id;
      if (!locationId) {
        if (!auth.loading) {
          setBranchName('Unknown Branch');
        }
        return;
      }

      try {
        const response = await axios.get(`/api/locations/${locationId}`);
        if (response.status === 200 && typeof response.data?.name === 'string') {
          setBranchName(response.data.name);
        } else if (!auth.loading) {
          setBranchName('Unknown Branch');
        }
      } catch (error) {
        console.error('Failed to fetch branch name:', error);
        if (!auth.loading) {
          setBranchName('Unknown Branch');
        }
      }
    };

    void loadBranchName();
  }, [auth]);
  const handleLogout = async () => {
    if (auth && auth.logout) {
      await auth.logout();
    }
    localStorage.removeItem('token');
    router.push('/login');
  };

  const isActive = (href: string) => {
    if (!mounted) return false;
    return pathname === href ;
  };

  return (
    <>
      <button
        className="fixed top-4 left-4 z-40 p-2 text-white bg-gray-800 rounded-md md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
      </button>
      <div
        className={`fixed inset-y-0 left-0 z-30 flex h-full w-72 flex-col bg-neutral-darker-gray text-neutral-base shadow-xl transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0`}
      >
        <div className="border-b border-support/20 p-6">
          <Logo />
          <div className="mt-4 rounded-lg bg-support/10 border border-support/20 px-3 py-1 text-xs font-semibold text-support uppercase tracking-wide shadow-sm">
            {branchName}
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  active
                    ? 'bg-support/25 text-neutral-base shadow-sm'
                    : 'text-gray-400 hover:bg-neutral-base/5 hover:text-white'
                }`}
              >
                <item.icon className={`h-6 w-6 ${active ? 'text-support' : 'text-gray-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-support/20 p-6 text-white">
          <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl bg-neutral-base/5 px-4 py-3 text-sm font-medium text-neutral-base/70 transition-all hover:bg-accent hover:text-neutral-base"
          >
              <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              Logout
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
