import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET || 'kuronami_nexus_auto_secret_1234567890_abcdef',
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Guest Otaku Access',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        return {
          id: 'demo-user-1',
          name: 'Гость Отаку',
          email: (credentials?.email as string) || 'guest@kuronami.io',
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
