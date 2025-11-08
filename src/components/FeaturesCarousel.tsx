import { useState, useRef } from "react"
import { ChevronLeft, ChevronRight, Zap, Brain, Satellite, Gamepad2, Target, Shield } from "lucide-react"
import { GamingCard, GamingCardContent, GamingCardDescription, GamingCardHeader, GamingCardTitle } from "./ui/gaming-card"
import { GamingButton } from "./ui/gaming-button"

const features = [
  {
    id: 1,
    icon: Brain,
    title: "IA Predictiva",
    description: "Machine learning entrenado con tu granja específica. Predice crecimiento, sugiere técnicas de cultivo y optimiza recursos basándose en tus datos históricos y actuales.",
    category: "Inteligencia Artificial",
    color: "text-secondary",
    benefits: ["Predicciones personalizadas", "Análisis en tiempo real", "Aprende de tus decisiones"]
  },
  {
    id: 2,
    icon: Satellite,
    title: "Datos Satelitales",
    description: "Monitoreo espacial de tu terreno en tiempo real. Visualiza cada parcela en pixel art mientras el sistema detecta cambios en vegetación, humedad y salud del cultivo.",
    category: "Monitoreo Espacial",
    color: "text-accent",
    benefits: ["Imágenes satelitales actualizadas", "Detección temprana de problemas", "Mapeo automático"]
  },
  {
    id: 3,
    icon: Gamepad2,
    title: "Interfaz de Juego",
    description: "Panel de control visual donde ves tu granja como un juego 2D. Cada métrica (agua, fertilizantes, salud del cultivo) es fácil de entender y actuar sobre ella.",
    category: "Gaming Interface",
    color: "text-highlight",
    benefits: ["Datos visuales simples", "Toma decisiones rápido", "Ve el impacto al instante"]
  },
  {
    id: 4,
    icon: Target,
    title: "Sistema de Misiones",
    description: "Objetivos diarios y semanales basados en tu granja real. Completa tareas (revisar humedad, ajustar riego) y mejora progresivamente tu gestión agrícola.",
    category: "Gamificación",
    color: "text-earth",
    benefits: ["Tareas adaptadas a ti", "Aprende haciendo", "Mejora continua"]
  },
  {
    id: 5,
    icon: Shield,
    title: "Alertas Inteligentes",
    description: "Notificaciones en tiempo real sobre heladas, plagas, sequías o tormentas. El sistema detecta amenazas antes de que lleguen a tu cultivo real.",
    category: "Prevención",
    color: "text-secondary",
    benefits: ["Avisos anticipados", "Evita pérdidas", "Actúa a tiempo"]
  },
  {
    id: 6,
    icon: Zap,
    title: "Boost de Rendimiento",
    description: "Optimización automática de recursos que incrementa tu yield como un power-up permanente. Más cosecha, menos esfuerzo.",
    category: "Optimización",
    color: "text-accent",
    benefits: ["Incremento 40% rendimiento", "Ahorro de recursos", "ROI mejorado"]
  }
]

export const FeaturesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return
    
    const cardWidth = 350
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth
    
    scrollContainerRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    })

    setCurrentIndex(prev => {
      if (direction === 'left') {
        return prev === 0 ? features.length - 1 : prev - 1
      } else {
        return prev === features.length - 1 ? 0 : prev + 1
      }
    })
  }

  const handleFeatureSelect = (featureId: number) => {
    setSelectedFeature(selectedFeature === featureId ? null : featureId)
  }

  return (
    <section className="py-24 relative overflow-hidden bg-gradient-to-b from-background to-background">
      {/* Background Pattern */}
      <div className="absolute inset-0 pixel-bg opacity-5" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-secondary animate-pixel-pulse" />
            <span className="font-code text-secondary text-sm tracking-wider uppercase">
              Power-ups Disponibles
            </span>
            <div className="w-2 h-2 bg-secondary animate-pixel-pulse" />
          </div>
          <h2 className="font-pixel text-2xl md:text-4xl font-bold gradient-text mb-6">
            ¡Desbloquea Todas las Habilidades!
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-code">
            Cada feature es un power-up para tu granja. Combínalos todos y convierte tu agricultura en la aventura más épica.
          </p>
        </div>

        {/* Features Grid */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 z-20 pixel-panel p-3 hover-pixel transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-secondary" />
          </button>
          
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20 pixel-panel p-3 hover-pixel transition-all"
          >
            <ChevronRight className="w-6 h-6 text-secondary" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {features.map((feature) => {
              const IconComponent = feature.icon
              const isSelected = selectedFeature === feature.id
              
              return (
                <div
                  key={feature.id}
                  className="flex-shrink-0 w-80"
                >
                  <GamingCard 
                    variant={isSelected ? "glow" : "default"}
                    className={`h-full cursor-pointer transition-all duration-300 ${
                      isSelected ? 'scale-105 animate-pixel-grow' : 'hover:scale-102'
                    }`}
                    onClick={() => handleFeatureSelect(feature.id)}
                  >
                    <GamingCardHeader>
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`pixel-panel p-3 ${feature.color}`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-xs font-code text-muted-foreground uppercase tracking-wide mb-1">
                            {feature.category}
                          </div>
                          <GamingCardTitle className="text-lg">
                            {feature.title}
                          </GamingCardTitle>
                        </div>
                      </div>
                    </GamingCardHeader>
                    
                    <GamingCardContent>
                      <GamingCardDescription className="mb-6 font-code">
                        {feature.description}
                      </GamingCardDescription>
                      
                      {/* Benefits List */}
                      {isSelected && (
                        <div className="space-y-3 mb-6 animate-slide-up">
                          <div className="font-pixel text-sm text-secondary mb-2">Beneficios:</div>
                          {feature.benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-secondary animate-pixel-pulse" />
                              <span className="text-sm font-code">{benefit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <GamingButton 
                        variant={isSelected ? "cyber" : "outline"} 
                        size="sm" 
                        className="w-full"
                      >
                        {isSelected ? "¡Equipado!" : "Equipar Power-up"}
                      </GamingButton>
                    </GamingCardContent>
                  </GamingCard>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="pixel-panel p-8 max-w-2xl mx-auto">
            <h3 className="font-pixel text-xl font-bold gradient-text mb-4">
              ¿Listo para Probar Todas las Características?
            </h3>
            <p className="text-muted-foreground mb-6 font-code">
              Accede a todas las funcionalidades de AgroVerse. Crea tu gemelo digital y recibe
              el máximo de recomendaciones personalizadas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GamingButton variant="cyber" size="lg" className="animate-pixel-bounce">
                ¡Activar Todos!
              </GamingButton>
              <GamingButton variant="outline" size="lg">
                Ver Demo Interactivo
              </GamingButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}