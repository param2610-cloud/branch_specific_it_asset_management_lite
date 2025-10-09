'use client';
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const navigate = useRouter();

  return (
    <div className="w-full min-h-[100vh] overflow-y-auto border-box p-[1rem] box-border">
      <button onClick={() => navigate.push("/login")}>Access The System</button>
      <h1>
        Aum Capital IT Asset Management System
      </h1>
      
    </div>
  );
}
