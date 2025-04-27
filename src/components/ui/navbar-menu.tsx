// components/ui/navbar-menu.tsx
"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

export const MenuItem = ({
  item,
  href,
}: {
  item: string;
  href: string;
}) => {
  return (
    <Link href={href} className="px-4 py-2 text-white hover:text-gray-300 transition-colors duration-200">
      {item}
    </Link>
  );
};

export const Menu = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <nav className="relative flex justify-center space-x-4 px-8 py-2 bg-transparent rounded-full border border-white/[0.2]">
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-md"
      />
      <div>
        <h4 className="text-lg font-bold mb-1 text-white">
          {title}
        </h4>
        <p className="text-neutral-400 text-sm max-w-[10rem]">
          {description}
        </p>
      </div>
    </Link>
  );
};
