import { cn } from "@/lib/utils";

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

function Spinner({ className, size = "default", ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent text-primary",
        {
          "h-4 w-4": size === "sm",
          "h-6 w-6": size === "default",
          "h-8 w-8": size === "lg",
        },
        className,
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  text?: string;
}

function LoadingState({ className, text, ...props }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center gap-4",
        className,
      )}
      {...props}
    >
      <Spinner size="lg" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}

export { Spinner, LoadingState };
