import NextAuth from "next-auth/next";
import RedditProvider from "next-auth/providers/reddit";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
    providers: [
        RedditProvider({
            clientId: process.env.REDDIT_CLIENT_ID,
            clientSecret: process.env.REDDIT_CLIENT_SECRET,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        })
    ]
});

export {handler as GET, handler as POST};