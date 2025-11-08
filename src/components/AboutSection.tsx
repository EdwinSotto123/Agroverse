import { Sprout, Users, Target, Zap } from "lucide-react"
import { GamingCard, GamingCardContent, GamingCardDescription, GamingCardHeader, GamingCardTitle } from "./ui/gaming-card"

const AboutSection = () => {
  const features = [
    {
      icon: Sprout,
      title: "Tu Granja en Pixel Art",
      description: "Recrea tu terreno real en un juego 2D. Cada parcela, cultivo, animal y recurso de tu granja se convierte en tu personaje jugable."
    },
    {
      icon: Users,
      title: "Para Cualquier Escala",
      description: "Desde pequeñas huertas hasta grandes cooperativas. El juego se adapta a tu realidad agrícola, sea cual sea tu tamaño."
    },
    {
      icon: Target,
      title: "Alertas en Tiempo Real",
      description: "Recibe notificaciones de heladas, plagas, sequías o tormentas antes de que afecten tu cultivo real. Actúa a tiempo."
    },
    {
      icon: Zap,
      title: "Recomendaciones con IA",
      description: "La IA analiza tus recursos, conocimientos y entorno para sugerirte las mejores decisiones según tu situación específica."
    }
  ]

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-3xl md:text-4xl mb-6 gradient-text">
            ¿Qué es AgroVerse?
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-code leading-relaxed">
            AgroVerse es una plataforma de agricultura de precisión que combina un gemelo digital interactivo con inteligencia artificial de Google Cloud. Usando datos satelitales de Earth Engine, predicciones con Machine Learning y asistencia con Gemini AI, democratiza
            la agricultura inteligente. Con solo dibujar tu terreno, cultivos y recursos, recibes
            alertas en tiempo real (heladas, plagas, sequías) y recomendaciones personalizadas para tomar
            mejores decisiones. Tu granja digital te ayuda a optimizar tu granja real.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <GamingCard key={index} className="hover-pixel animate-pixel-grow">
                <GamingCardHeader>
                  <div className="pixel-panel p-3 w-fit mb-4">
                    <IconComponent className="w-8 h-8 text-secondary" />
                  </div>
                  <GamingCardTitle className="font-pixel text-lg">
                    {feature.title}
                  </GamingCardTitle>
                </GamingCardHeader>
                <GamingCardContent>
                  <GamingCardDescription className="font-code">
                    {feature.description}
                  </GamingCardDescription>
                </GamingCardContent>
              </GamingCard>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="pixel-panel p-8 max-w-4xl mx-auto">
            <h3 className="font-pixel text-2xl mb-4 gradient-text">
              Tu Granja Real, En Formato Juego
            </h3>
            <p className="text-muted-foreground font-code leading-relaxed">
              Ingresa tu ubicación, cultivos, animales, técnicas de riego y recursos disponibles.
              La plataforma combina datos satelitales, sensores IoT e inteligencia artificial para crear
              una simulación 2D interactiva de tu granja. Juega, experimenta y recibe insights que puedes
              aplicar directamente en tu terreno real.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection
