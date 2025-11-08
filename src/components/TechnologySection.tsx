import { Satellite, Cpu, Database, Cloud, Wifi, Eye } from "lucide-react"
import { GamingCard, GamingCardContent, GamingCardDescription, GamingCardHeader, GamingCardTitle } from "./ui/gaming-card"
import { Progress } from "./ui/progress"

const TechnologySection = () => {
  const technologies = [
    {
      icon: Satellite,
      title: "Datos Satelitales",
      description: "Imágenes de alta resolución y datos espectrales para monitoreo continuo de vegetación, humedad y salud del cultivo.",
      level: 95,
      color: "text-secondary"
    },
    {
      icon: Cpu,
      title: "Inteligencia Artificial",
      description: "Machine learning entrenado con datos agrícolas locales para predicciones y recomendaciones personalizadas.",
      level: 90,
      color: "text-accent"
    },
    {
      icon: Database,
      title: "Información Agrícola",
      description: "Datos históricos de clima, suelos y cultivos para análisis predictivo y comparativo.",
      level: 88,
      color: "text-highlight"
    },
    {
      icon: Cloud,
      title: "Procesamiento en la Nube",
      description: "Servidor distribuido que procesa datos en tiempo real, accesible desde cualquier dispositivo.",
      level: 92,
      color: "text-earth"
    },
    {
      icon: Wifi,
      title: "Sensores IoT",
      description: "Integración con sensores de humedad, temperatura y otros dispositivos para datos más precisos.",
      level: 100,
      color: "text-secondary"
    },
    {
      icon: Eye,
      title: "Visión por Computadora",
      description: "Detección automática de plagas, enfermedades y estados de crecimiento mediante análisis de imágenes.",
      level: 87,
      color: "text-accent"
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-3xl md:text-4xl mb-6 gradient-text">
            Tecnología Integrada
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-code leading-relaxed">
            Combinamos múltiples fuentes de datos (satélites, IoT, clima) con inteligencia artificial
            para crear simulaciones precisas y recomendaciones personalizadas para tu granja.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {technologies.map((tech, index) => {
            const IconComponent = tech.icon
            return (
              <GamingCard key={index} className="hover-pixel group">
                <GamingCardHeader>
                  <div className="pixel-panel p-3 w-fit mb-4 group-hover:animate-pixel-pulse">
                    <IconComponent className={`w-8 h-8 ${tech.color}`} />
                  </div>
                  <GamingCardTitle className="font-pixel text-lg">
                    {tech.title}
                  </GamingCardTitle>
                </GamingCardHeader>
                <GamingCardContent>
                  <GamingCardDescription className="font-code mb-4">
                    {tech.description}
                  </GamingCardDescription>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-code">Precisión</span>
                      <span className="font-pixel text-secondary">{tech.level}%</span>
                    </div>
                    <Progress value={tech.level} className="pixel-panel h-3" />
                  </div>
                </GamingCardContent>
              </GamingCard>
            )
          })}
        </div>

        <div className="mt-16">
          <div className="pixel-panel p-8 max-w-4xl mx-auto text-center">
            <h3 className="font-pixel text-2xl mb-6 gradient-text">
              Alertas Inteligentes en Tiempo Real
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="pixel-panel p-4">
                  <span className="font-pixel text-lg text-secondary">Sequías</span>
                </div>
                <p className="text-sm text-muted-foreground font-code">
                  Predicción de falta de agua basada en datos meteorológicos y humedad del suelo
                </p>
              </div>
              <div className="space-y-2">
                <div className="pixel-panel p-4">
                  <span className="font-pixel text-lg text-accent">Plagas</span>
                </div>
                <p className="text-sm text-muted-foreground font-code">
                  Detección temprana mediante imágenes satelitales y patrones de vegetación
                </p>
              </div>
              <div className="space-y-2">
                <div className="pixel-panel p-4">
                  <span className="font-pixel text-lg text-highlight">Heladas</span>
                </div>
                <p className="text-sm text-muted-foreground font-code">
                  Avisos anticipados de temperaturas bajas que pueden dañar tus cultivos
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TechnologySection
