// components/AuthButtons.tsx
"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { UserCircle } from "lucide-react";

const AuthButtons = () => {
  const { data: session, status } = useSession();

  // Show a loading state while the session is being fetched
  if (status === "loading") {
    return <div className="w-24 h-8 rounded-lg bg-hover-bg animate-pulse"></div>;
  }

  // If the user is authenticated, show their info and a Sign Out button
  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          {session.user?.image ? (
            <img 
              src={session.user.image} 
              alt={session.user.name || "User"} 
              className="w-8 h-8 rounded-full" 
            />
          ) : (
            <UserCircle className="w-8 h-8 text-gray-400" />
          )}
          <span className="text-white font-medium hidden sm:block">
            {session.user?.name}
          </span>
        </div>
        <button
          onClick={() => signOut()}
          className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // If the user is not authenticated, show a Sign In button
  return (
    <button
      onClick={() => signIn("google")}
      className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-hover transition-colors"
    >
      Sign In
    </button>
  );
};

export default AuthButtons;