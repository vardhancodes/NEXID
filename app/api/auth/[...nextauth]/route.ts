// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { BigQuery } from "@google-cloud/bigquery";

// This is a crucial step to ensure BigQuery client is initialized correctly.
// It uses the credentials you stored in the .env.local file.
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!),
});

const handler = NextAuth({
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  
  // A secret is required for production environments and for JWT.
  secret: process.env.NEXTAUTH_SECRET,

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

        try {
          // Select the dataset and table and insert the user data.
          await bigquery
            .dataset(process.env.BIGQUERY_DATASET_ID!)
            .table(process.env.BIGQUERY_TABLE_ID!)
            .insert([userData]);

          console.log(`User data for ${user.email} inserted into BigQuery.`);
        } catch (error) {
          console.error("BIGQUERY_INSERT_ERROR:", error);
          // Depending on your app's needs, you might want to prevent sign-in
          // if the database insert fails. For now, we just log the error.
        }
      }
    },
  },
});

// Export the handler for both GET and POST requests, as required by NextAuth.js
export { handler as GET, handler as POST };