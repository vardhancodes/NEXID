// app/settings/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // This effect will redirect unauthenticated users to the homepage
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  // Show a loading state while session is being verified
  if (status === "loading") {
    return <div className="text-center text-xl text-gray-400 mt-20">Loading...</div>;
  }

  // If the user is authenticated, show the settings page
  if (status === "authenticated") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-8">Account Settings</h1>

        <div className="bg-hover-bg p-8 rounded-lg border border-border-color">
          <div className="flex items-center space-x-6">
            <img
              src={session.user?.image || ""}
              alt="Profile picture"
              className="w-24 h-24 rounded-full"
            />
            <div>
              <h2 className="text-2xl font-semibold text-white">{session.user?.name}</h2>
              <p className="text-gray-400">{session.user?.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-10">
            <h2 className="text-xl font-semibold text-white mb-4">Danger Zone</h2>
            <div className="bg-hover-bg p-8 rounded-lg border border-red-500/30">
                <p className="text-gray-300 mb-4">
                    Deleting your account is a permanent action and cannot be undone.
                </p>
                <button className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                    Delete Account
                </button>
            </div>
        </div>
      </motion.div>
    );
  }

  // Fallback for any other case (though unlikely)
  return null;
}