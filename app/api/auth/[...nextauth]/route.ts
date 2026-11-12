// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { BigQuery } from "@google-cloud/bigquery";

// Helper function to safely initialize BigQuery client lazily
function getBigQueryClient(): BigQuery | null {
  if (!process.env.GOOGLE_PROJECT_ID || !process.env.GOOGLE_CREDENTIALS) {
    return null;
  }
  try {
    return new BigQuery({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
    });
  } catch (error) {
    console.error("Failed to parse GOOGLE_CREDENTIALS for BigQuery:", error);
    return null;
  }
}

const providers = [];
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

const handler = NextAuth({
  // Configure one or more authentication providers
  providers,
  
  // A secret is required for production environments and for JWT.
  secret: process.env.NEXTAUTH_SECRET || "nexid-development-secret-key-change-in-production",

  // This is where we hook into the sign-in event to send data to BigQuery.
  events: {
    async signIn({ user }) {
      // We only proceed if the user object has an id and email.
      if (user && user.id && user.email) {
        const userData = {
          userId: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          signedInAt: new Date().toISOString(), // Use ISO format for TIMESTAMP
        };

        const bigquery = getBigQueryClient();
        if (bigquery && process.env.BIGQUERY_DATASET_ID && process.env.BIGQUERY_TABLE_ID) {
          try {
            await bigquery
              .dataset(process.env.BIGQUERY_DATASET_ID)
              .table(process.env.BIGQUERY_TABLE_ID)
              .insert([userData]);

            console.log(`User data for ${user.email} inserted into BigQuery.`);
          } catch (error) {
            console.error("BIGQUERY_INSERT_ERROR:", error);
          }
        }
      }
    },
  },
});

// Export the handler for both GET and POST requests, as required by NextAuth.js
export { handler as GET, handler as POST };
