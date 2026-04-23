"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { LinkButton } from "@/components/shared/link-button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const navItems = [
  { label: "소개", href: "/about" },
  { label: "인사이트", href: "/insights" },
  { label: "가이드", href: "/guide" },
  { label: "AI 챔피언", href: "/champions" },
  { label: "포트폴리오", href: "/portfolio" },
  { label: "정부 AI 공고", href: "/proc" },
  { label: "커뮤니티", href: "/join" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-color.svg"
            alt="PUBLIC-AX"
            width={130}
            height={35}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-base text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/40 text-sm">
                {user.user_metadata?.avatar_url ? (
                  <Image
                    src={user.user_metadata.avatar_url}
                    alt="avatar"
                    width={22}
                    height={22}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {(user.user_metadata?.name ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                )}
                <span className="text-foreground font-medium max-w-[100px] truncate">
                  {user.user_metadata?.name ?? user.email}
                </span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                로그아웃
              </button>
            </div>
          ) : (
            <LinkButton href="/login" className="hidden md:inline-flex px-5">
              로그인
            </LinkButton>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors md:hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" x2="20" y1="12" y2="12" />
                <line x1="4" x2="20" y1="6" y2="6" />
                <line x1="4" x2="20" y1="18" y2="18" />
              </svg>
              <span className="sr-only">메뉴</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-1 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="px-3 py-2.5 text-base text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                  >
                    {item.label}
                  </Link>
                ))}
                {user ? (
                  <button
                    onClick={logout}
                    className="mt-4 px-3 py-2.5 text-base text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted text-left"
                  >
                    로그아웃
                  </button>
                ) : (
                  <LinkButton href="/login" size="sm" className="mt-4">
                    로그인
                  </LinkButton>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
