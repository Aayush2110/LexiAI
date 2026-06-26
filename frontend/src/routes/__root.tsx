import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { ChatProvider } from "@/contexts/ChatContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Chat Companion AI" },
      { name: "description", content: "AI Legal Assistant for Contracts & Documents" },
      { name: "author", content: "Chat Companion AI" },
      { property: "og:title", content: "Chat Companion AI" },
      { property: "og:description", content: "AI Legal Assistant for Contracts & Documents" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/favicon.svg",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              (function (l) {
                if (l.search[1] === "/") {
                  var decoded = l.search
                    .slice(1)
                    .split("&")
                    .map(function (s) {
                      return s.replace(/~and~/g, "&");
                    })
                    .join("?");
                  window.history.replaceState(
                    null,
                    null,
                    l.pathname.slice(0, -1) + decoded + l.hash
                  );
                }
              })(window.location);
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChatProvider>
          <Outlet />
          <Toaster position="top-right" richColors closeButton />
        </ChatProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
