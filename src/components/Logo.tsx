import React from 'react';
import Image from 'next/image';

const Logo = () => {
  return (
    <Image src="/logo.png" alt="AUM Capital" width={48} height={48} className="h-12 w-auto" />
  );
};

export default Logo;
