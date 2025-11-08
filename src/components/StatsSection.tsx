import { useEffect, useState } from "react"
import { TrendingUp, Users, Globe, Award } from "lucide-react"
import { GamingButton } from "./ui/gaming-button"

const stats = [
  {
    id: 1,
    icon: TrendingUp,
    value: 35,
    suffix: "%",
    label: "Aumento de Rendimiento",
    description: "Mejora promedio reportada por usuarios",
    color: "text-secondary"
  },
  {
    id: 2,
    icon: Users,
    value: 15000,
    suffix: "+",
    label: "Agricultores Activos",
    description: "Usando la plataforma diariamente",
    color: "text-accent"
  },
  {
    id: 3,
    icon: Globe,
    value: 850,
    suffix: "K",
    label: "Hectáreas Monitoreadas",
    description: "Terrenos en simulación activa",
    color: "text-highlight"
  },
  {
    id: 4,
    icon: Award,
    value: 96,
    suffix: "%",
    label: "Satisfacción",
    description: "Usuarios que nos recomiendan",
    color: "text-earth"
  }
]

export const StatsSection = () => {
  const [animatedValues, setAnimatedValues] = useState<Record<number, number>>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    const section = document.getElementById('stats-section')
    if (section) {
      observer.observe(section)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    stats.forEach((stat) => {
      let current = 0
      const increment = stat.value / 60 // 60 frames for 1 second animation
      
      const animate = () => {
        current += increment
        if (current <= stat.value) {
          setAnimatedValues(prev => ({
            ...prev,
            [stat.id]: Math.floor(current)
          }))
          requestAnimationFrame(animate)
        } else {
          setAnimatedValues(prev => ({
            ...prev,
            [stat.id]: stat.value
          }))
        }
      }
      
      setTimeout(() => animate(), stat.id * 200) // Stagger animations
    })
  }, [isVisible])

  const formatValue = (value: number, originalValue: number, suffix: string) => {
    if (suffix === "M") {
      return (value / 1000000).toFixed(1)
    }
    if (suffix === "+") {
      return value.toLocaleString()
    }
    return value
  }

  return (
    <section id="stats-section" className="py-24 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 particle-bg opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/5 via-transparent to-accent/5" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-2 h-2 bg-secondary rounded-full animate-neon-pulse" />
            <span className="font-code text-secondary text-sm tracking-wider uppercase">
              Achievement Stats
            </span>
            <div className="w-2 h-2 bg-secondary rounded-full animate-neon-pulse" />
          </div>
          <h2 className="font-pixel text-2xl md:text-4xl font-bold gradient-text mb-6">
            Resultados Reales
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-code">
            Miles de agricultores ya están usando AgroVerse para mejorar sus cultivos con IA y datos satelitales.
            Únete a la comunidad y empieza a optimizar tu granja.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat) => {
            const IconComponent = stat.icon
            const animatedValue = animatedValues[stat.id] || 0
            
            return (
              <div
                key={stat.id}
                className="pixel-panel p-8 text-center hover-pixel group relative overflow-hidden"
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-10 transition-opacity rounded-gaming" />
                
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-16 h-16 pixel-panel mb-6 ${stat.color}`}>
                    <IconComponent className="w-8 h-8" />
                  </div>
                  
                  <div className="mb-4">
                    <div className="font-pixel text-2xl lg:text-3xl font-bold gradient-text">
                      {formatValue(animatedValue, stat.value, stat.suffix)}
                      <span className={stat.color}>{stat.suffix}</span>
                    </div>
                    <div className="font-pixel text-sm font-bold text-foreground mt-2">
                      {stat.label}
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {stat.description}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="mt-4 w-full bg-muted/20 rounded-full h-1 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-glow transition-all duration-1000 ease-out ${
                        isVisible ? 'w-full' : 'w-0'
                      }`}
                      style={{ 
                        transitionDelay: `${stat.id * 200}ms` 
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="pixel-panel p-8 max-w-2xl mx-auto">
            <div className="font-pixel text-2xl md:text-3xl font-bold gradient-text mb-4">
              ¿Listo para Empezar?
            </div>
            <p className="text-muted-foreground mb-6 font-code">
              Crea tu granja digital en minutos. Empieza a recibir alertas y recomendaciones para mejorar tu cultivo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GamingButton variant="cyber" className="animate-pixel-bounce">
                ¡Comenzar Quest!
              </GamingButton>
              <GamingButton variant="outline">
                Aprender Más
              </GamingButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}