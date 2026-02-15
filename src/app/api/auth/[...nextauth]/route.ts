import NextAuth from 'next-auth/next';
import RedditProvider from 'next-auth/providers/reddit';
import GoogleProvider from 'next-auth/providers/google';
import { env } from '@/lib/env';

const handler = NextAuth({
  providers: [
    ...(env.REDDIT_CLIENT_ID && env.REDDIT_CLIENT_SECRET
      ? [
          RedditProvider({
            clientId: env.REDDIT_CLIENT_ID,
            clientSecret: env.REDDIT_CLIENT_SECRET,
          }),
        ]
      : []),
    ...(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  pages: {
    signIn: '/',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  secret: env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
