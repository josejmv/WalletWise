import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function CTA() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground md:px-16 md:py-24">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10">
            <div className="absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-1/4 -right-1/4 h-1/2 w-1/2 rounded-full bg-white/10 blur-3xl" />
          </div>

          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Comienza a tomar el control de tus finanzas hoy
          </h2>
          <p className="mx-auto max-w-xl text-lg text-primary-foreground/80 mb-8">
            Unete a miles de personas que ya estan gestionando su dinero de
            forma inteligente con WalletWise.
          </p>

          <Button size="lg" variant="secondary" asChild>
            <Link href="/register">
              Crear Cuenta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
