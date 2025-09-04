declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
  }
}