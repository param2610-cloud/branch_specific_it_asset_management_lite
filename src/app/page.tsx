'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { ArrowRightIcon, ShieldCheckIcon, ChartBarIcon, GlobeAsiaAustraliaIcon } from '@heroicons/react/24/solid';

const LandingPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-primary text-neutral-base flex flex-col">
      <header className="w-full border-b border-white/20 bg-gray-200 backdrop-blur-lg shadow-lg">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Logo />
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/login')}
              className="btn-secondary"
            >
              Launch App
            </button>
          </div>
        </div>
      </header>

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-primary via-primary/80 to-neutral-darker-gray/80 opacity-80 blur-3xl" aria-hidden />
        <p className="text-sm uppercase tracking-[0.35em] text-support">
          AUM CAPITAL LITE PLATFORM
        </p>
        <h1 className="mt-6 max-w-3xl text-5xl font-heading leading-tight text-white drop-shadow-lg md:text-6xl">
          IT Asset Management for Every Branch
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-white/85">
          Gain real-time visibility into hardware distribution, streamline compliance,
          and empower branch teams with actionable insights across the AUM Capital network.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button
            onClick={() => router.push('/login')}
            className="btn-primary"
          >
            Start Managing Assets <ArrowRightIcon className="h-5 w-5" />
          </button>
          <button
            onClick={() => router.push('/login')}
            className="btn-secondary"
          >
            View Live Dashboard
          </button>
        </div>
      </main>

      <section className="w-full bg-neutral-base py-20 text-neutral-dark-gray">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Products & Services
            </p>
            <h2 className="mt-4 text-4xl font-heading text-primary">
              Purpose-built for AUM Capital branches
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Branch Asset Visibility',
                description: 'Track device lifecycle, health, and ownership with confidence for every location.',
                icon: GlobeAsiaAustraliaIcon,
              },
              {
                title: 'Compliance & Governance',
                description: 'Automated alerts and audit-ready reports ensure adherence to corporate policies.',
                icon: ShieldCheckIcon,
              },
              {
                title: 'Insights & Optimization',
                description: 'Identify underused assets, forecast demand, and optimize inventory movement.',
                icon: ChartBarIcon,
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-support/40 bg-white/80 p-8 shadow-sm transition-transform hover:-translate-y-2 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-support/30 text-primary">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-2xl font-heading text-primary">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm text-neutral-dark-gray/80">
                  {feature.description}
                </p>
                <div className="mt-6 h-[3px] w-16 rounded-full bg-gradient-to-r from-support to-accent" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-neutral-darker-gray/90 py-8 text-sm text-neutral-base/80">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} AUM Capital. All rights reserved.</p>
          <p className="text-support/80">Your Trust is Our Wealth.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
