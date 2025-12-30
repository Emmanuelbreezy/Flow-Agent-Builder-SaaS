import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs";

export default function Page() {
  return (
    <div>
      <header className="flex justify-between items-center p-4">
        <Logo />
        <LoginLink>
          <Button>Sign In</Button>
        </LoginLink>
      </header>

      <main className="p-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome to Flow AI</h1>
          <p className="mt-2">Your AI-powered workflow automation tool.</p>
        </div>
      </main>
    </div>
  );
}
