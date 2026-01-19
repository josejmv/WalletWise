import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />

      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted/50 px-4 py-1.5 text-sm">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Tu dinero, tu control</span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Gestiona tus finanzas{" "}
            <span className="text-primary">con confianza</span>
          </h1>

          <p className="mb-10 text-lg text-muted-foreground md:text-xl">
            Toma el control de tu dinero con soporte multi-moneda, seguimiento
            inteligente de gastos e ingresos, presupuestos personalizados y
            datos protegidos con encriptacion de extremo a extremo.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Crear Cuenta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Ver Funcionalidades</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
