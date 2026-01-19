import {
  Coins,
  PiggyBank,
  LayoutDashboard,
  Shield,
  RefreshCw,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Coins,
    title: "Multi-Moneda",
    description:
      "Gestiona tus finanzas en multiples monedas con tasas de cambio actualizadas automaticamente.",
  },
  {
    icon: PiggyBank,
    title: "Presupuestos",
    description:
      "Crea presupuestos personalizados y realiza seguimiento de tus metas de ahorro facilmente.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard Intuitivo",
    description:
      "Visualiza tus finanzas con graficos claros y KPIs que te ayudan a tomar mejores decisiones.",
  },
  {
    icon: Shield,
    title: "Encriptacion E2E",
    description:
      "Tus datos financieros estan protegidos con encriptacion de extremo a extremo.",
  },
  {
    icon: RefreshCw,
    title: "Tasas en Tiempo Real",
    description:
      "Sincroniza tasas de cambio oficiales y de mercado paralelo automaticamente.",
  },
  {
    icon: Heart,
    title: "Gratis para Siempre",
    description:
      "Sin costos ocultos, sin suscripciones. WalletWise es y sera siempre gratuito.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Todo lo que necesitas para gestionar tu dinero
          </h2>
          <p className="text-lg text-muted-foreground">
            Herramientas poderosas y faciles de usar para tomar el control de
            tus finanzas personales.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-sm">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
