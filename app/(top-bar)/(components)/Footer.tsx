import { currentUser } from "@clerk/nextjs/server";

export async function Footer() {
  const user = await currentUser();
  return (
    <footer className="py-6 text-center text-sm text-muted-foreground border-t bottom-0 sticky bg-background cursor-default">
      <p>Signed in as {user?.firstName || user?.username}</p>
    </footer>
  );
}
