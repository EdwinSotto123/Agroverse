import { CheckCircle, ArrowRight, MapPin, Droplets, Sprout, Zap, TrendingUp, AlertTriangle } from "lucide-react"
import { GamingCard, GamingCardContent, GamingCardDescription, GamingCardHeader, GamingCardTitle } from "./ui/gaming-card"

const TutorialSection = () => {
  const steps = [
    {
      step: 1,
      icon: MapPin,
      title: "Registra Tu Granja",
      description: "Ingresa la ubicación geográfica exacta de tus terrenos, dimensiones y tipos de cultivos que tienes actualmente.",
      details: ["Ubicación GPS", "Tamaño de parcela", "Tipos de cultivos actuales"]
    },
    {
      step: 2,
      icon: Droplets,
      title: "Describe Tus Recursos Hídricos",
      description: "Menciona tus fuentes de agua: río, pozo, compras de agua, lluvias, etc.",
      details: ["Fuentes de agua", "Capacidad de almacenamiento", "Sistema de riego actual"]
    },
    {
      step: 3,
      icon: Sprout,
      title: "Técnicas de Cultivo",
      description: "Detalla las técnicas de cultivo que utilizas actualmente.",
      details: ["Métodos de siembra", "Rotación de cultivos", "Prácticas de manejo"]
    },
    {
      step: 4,
      icon: Zap,
      title: "Fertilizantes y Nutrientes",
      description: "Especifica qué fertilizantes y nutrientes utilizas en tus cultivos.",
      details: ["Tipo de fertilizantes", "Frecuencia de aplicación", "Análisis de suelo"]
    },
    {
      step: 5,
      icon: TrendingUp,
      title: "Tecnología Automática",
      description: "Satélites, sensores IoT e IA monitorean tu granja 24/7 sin intervención manual.",
      details: ["Análisis de suelo y humedad", "Detección de sequías", "Alertas de tormentas", "Datos meteorológicos en vivo"]
    },
    {
      step: 6,
      icon: AlertTriangle,
      title: "Alertas y Recomendaciones IA",
      description: "Recibe alertas inteligentes y recomendaciones basadas en RAGs.",
      details: ["Alertas de plagas", "Recomendaciones de riego", "Cambios de cultivo", "Técnicas mixtas"]
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-3xl md:text-4xl mb-6 gradient-text">
            ¿Cómo Funciona AgroVerse?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-code leading-relaxed">
            En 6 pasos, crea tu granja digital que refleja tu granja real. Luego, el sistema combina
            tus datos con IoT, satélites e IA para darte alertas y recomendaciones en tiempo real.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <GamingCard key={step.step} className="hover-pixel group relative">
                <div className="absolute -top-4 -left-4 pixel-panel p-3">
                  <span className="font-pixel text-2xl text-secondary">{step.step}</span>
                </div>

                <GamingCardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="pixel-panel p-3 group-hover:animate-pixel-pulse">
                      <IconComponent className="w-8 h-8 text-secondary" />
                    </div>
                    <GamingCardTitle className="font-pixel text-lg">
                      {step.title}
                    </GamingCardTitle>
                  </div>
                </GamingCardHeader>

                <GamingCardContent>
                  <GamingCardDescription className="font-code leading-relaxed mb-4">
                    {step.description}
                  </GamingCardDescription>

                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div key={detailIndex} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-secondary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground font-code">{detail}</span>
                      </div>
                    ))}
                  </div>
                </GamingCardContent>

                {index < steps.length - 1 && (
                  <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
                    <ArrowRight className="w-8 h-8 text-secondary/50" />
                  </div>
                )}
              </GamingCard>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="pixel-panel p-8 max-w-4xl mx-auto">
            <h3 className="font-pixel text-2xl mb-6 gradient-text">
              ¡Empieza a Jugar con Tu Granja Real!
            </h3>
            <p className="text-muted-foreground font-code leading-relaxed mb-6">
              Regístrate gratis y en pocos clicks tendrás tu granja digital lista.
              Comienza a recibir alertas en tiempo real y recomendaciones personalizadas
              basadas en datos de satélites, IoT e inteligencia artificial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="pixel-panel bg-secondary hover:bg-secondary/80 text-white font-code px-8 py-3 hover-pixel font-bold neon-glow">
                ¡Comenzar Ahora!
              </button>
              <button className="pixel-panel border-2 border-secondary text-secondary font-code px-8 py-3 hover:bg-secondary/10 hover-pixel">
                Ver Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TutorialSection
