import NextAuth from 'next-auth';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Discord from 'next-auth/providers/discord';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: 'jwt' },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || 'mock_github_id',
      clientSecret: process.env.AUTH_GITHUB_SECRET || 'mock_github_secret',
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || 'mock_google_id',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || 'mock_google_secret',
    }),
    Discord({
      clientId: process.env.AUTH_DISCORD_ID || 'mock_discord_id',
      clientSecret: process.env.AUTH_DISCORD_SECRET || 'mock_discord_secret',
    }),
    Credentials({
      name: 'Guest Otaku Access',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return {
          id: 'demo-user-1',
          name: 'Demo Otaku',
          email: credentials.email as string,
          image: 'https://avatars.githubusercontent.com/u/9919?v=4',
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
