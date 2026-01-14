"use client";

import Image from "next/image";
import Loader from "../components/Loader";
import { useEffect } from 'react';
import { useSiteSettings } from '../context/SiteSettingsContext';

const Counter = ({ image, count, label }) => (
  <div className="flex flex-col items-center">
    <div className="flex items-center justify-center h-20">
      <Image src={image} alt={label} width={50} height={50} className="mb-4" />
    </div>
    <p className="text-4xl font-bold text-primary">{count}</p>
    <p className="text-md text-black">
      <i>{label}</i>
    </p>
  </div>
);

const CounterPage = () => {
  const { siteSettings, isLoading, error } = useSiteSettings();

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <section className="w-full bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-red-600">Error loading counter data</p>
        </div>
      </section>
    );
  }

  if (!siteSettings?.statitems || siteSettings.statitems.length === 0) {
    return (
      <section className="w-full bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">No counter data available</p>
        </div>
      </section>
    );
  }

  const statitems = siteSettings.statitems;
  const filteredStatitems = statitems.filter(item => item.visible);

  if (filteredStatitems.length === 0) {
    return (
      <section className="w-full bg-gray-100 py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">No visible counter data available</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gray-100 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {filteredStatitems.map((item) => (
            <Counter
              key={item.id}
              image={`/images/${item.icon}.svg`}
              count={item.value}
              label={item.label}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CounterPage;
