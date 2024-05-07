import NextAuth from "next-auth/next";
import RedditProvider from "next-auth/providers/reddit";

const handler = NextAuth({
    providers: [
        RedditProvider({
            clientId: process.env.REDDIT_CLIENT_ID,
            clientSecret: process.env.REDDIT_CLIENT_SECRET,
        })
    ]
});

export {handler as GET, handler as POST};