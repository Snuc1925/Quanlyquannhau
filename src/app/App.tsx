import { AppRouter } from "@/app/router";
import { ToastProvider } from "@/app/providers/ToastProvider";

export function App() {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}
