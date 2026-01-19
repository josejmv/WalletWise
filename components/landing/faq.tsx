"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Es realmente gratis?",
    answer:
      "Si, WalletWise es completamente gratuito y lo sera para siempre. No hay costos ocultos, no hay planes premium, no hay limites artificiales. Creemos que todos merecen acceso a herramientas financieras de calidad.",
  },
  {
    question: "Como se protegen mis datos?",
    answer:
      "Utilizamos encriptacion de extremo a extremo (E2E) para proteger tus datos sensibles. Esto significa que tus datos se encriptan en tu dispositivo antes de enviarse a nuestros servidores. Ni siquiera nosotros podemos ver tu informacion financiera.",
  },
  {
    question: "Puedo usar WalletWise con multiples monedas?",
    answer:
      "Si, WalletWise soporta multiples monedas incluyendo USD, COP, VES y criptomonedas como USDT. Las tasas de cambio se actualizan automaticamente desde fuentes oficiales y de mercado.",
  },
  {
    question: "Puedo exportar mis datos?",
    answer:
      "Absolutamente. Puedes exportar todos tus datos en cualquier momento en formato JSON. Tambien puedes eliminar completamente tu cuenta y todos los datos asociados cuando lo desees.",
  },
  {
    question: "Funciona en dispositivos moviles?",
    answer:
      "Si, WalletWise es una aplicacion web progresiva (PWA) que funciona perfectamente en cualquier dispositivo: computadoras, tablets y telefonos. Puedes instalarla en tu telefono para acceso rapido.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 bg-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-lg text-muted-foreground">
            Respuestas a las preguntas mas comunes sobre WalletWise.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b">
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between py-4 text-left font-medium transition-all hover:underline"
              >
                {faq.question}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-200",
                    openIndex === index && "rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  openIndex === index ? "max-h-96 pb-4" : "max-h-0"
                )}
              >
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
