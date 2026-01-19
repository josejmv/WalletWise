import { Lock, Eye, Server, Key } from "lucide-react";

const securityFeatures = [
  {
    icon: Lock,
    title: "Encriptacion AES-256",
    description:
      "Tus datos sensibles se encriptan con el mismo estandar que usan los bancos.",
  },
  {
    icon: Eye,
    title: "Zero-Knowledge",
    description:
      "Solo tu puedes ver tus datos financieros. Ni siquiera nosotros podemos acceder a ellos.",
  },
  {
    icon: Server,
    title: "Datos en tu Control",
    description:
      "Exporta o elimina todos tus datos en cualquier momento. Tu informacion es tuya.",
  },
  {
    icon: Key,
    title: "Autenticacion Segura",
    description:
      "Protege tu cuenta con autenticacion de dos factores y passkeys biometricos.",
  },
];

export function Security() {
  return (
    <section id="security" className="py-20">
      <div className="container">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Tu privacidad es nuestra prioridad
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              WalletWise fue disenado desde cero con la seguridad en mente.
              Utilizamos las mejores practicas de la industria para proteger tu
              informacion financiera.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              {securityFeatures.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-8 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-3xl" />
                <Lock className="relative h-32 w-32 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
