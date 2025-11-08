import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, Play, Zap, Cpu, Satellite } from "lucide-react"
import { GamingButton } from "./ui/gaming-button"
import heroFarm from "@/assets/pixel-farm.jpg"
import aiInterface from "@/assets/pixel-interface.jpg"
import smartFarm from "@/assets/pixel-smart-farm.jpg"

const slides = [
  {
    id: 1,
    image: heroFarm,
    title: "¡Tu Granja Real en Pixel Art!",
    subtitle: "Simula tu terreno, cultivos, casa y animales en un juego 2D interactivo",
    cta: "¡Empezar Ahora!",
    description: "Crea tu granja digital en pocos clicks. Recibe alertas en tiempo real de heladas, plagas y sequías usando IoT, satélites e IA.",
    icon: Zap
  },
  {
    id: 2,
    image: aiInterface,
    title: "Decisiones Informadas",
    subtitle: "Ve tu granja como un juego, pero con datos reales",
    cta: "Ver Dashboard",
    description: "Cada parcela, animal y recurso visible en tiempo real. La IA te sugiere las mejores acciones según tu situación específica.",
    icon: Cpu
  },
  {
    id: 3,
    image: smartFarm,
    title: "Tecnología que Funciona",
    subtitle: "IoT, satélites e IA trabajando para tu granja",
    cta: "Explorar Tech",
    description: "Monitoreo 24/7 de tu terreno real. Recibe recomendaciones personalizadas basadas en tus recursos, conocimientos y objetivos.",
    icon: Satellite
  }
]

export const HeroCarousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const navigate = useNavigate()

  const handlePlayGame = () => {
    navigate('/login')
  }

  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isPlaying])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <section className="relative h-screen overflow-hidden pt-16">
      {/* Background Slides */}
      <div className="absolute inset-0">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover pixelated"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent" />
            <div className="absolute inset-0 pixel-bg opacity-10" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl">
            {slides.map((slide, index) => {
              const IconComponent = slide.icon
              return (
                <div
                  key={slide.id}
                  className={`transition-all duration-700 ${
                    index === currentSlide 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 translate-x-8'
                  }`}
                  style={{ display: index === currentSlide ? 'block' : 'none' }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="pixel-panel p-3">
                      <IconComponent className="w-8 h-8 text-secondary" />
                    </div>
                    <span className="font-code text-secondary text-sm tracking-wider uppercase">
                      {slide.subtitle}
                    </span>
                  </div>
                  
                  <h1 className="font-pixel text-3xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text leading-tight">
                    {slide.title}
                  </h1>
                  
                  <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed font-code">
                    {slide.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <GamingButton 
                      variant="cyber" 
                      size="xl" 
                      className="group animate-pixel-bounce"
                      onClick={handlePlayGame}
                    >
                      {slide.cta}
                      <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </GamingButton>
                    <GamingButton variant="outline" size="xl">
                      Ver Demo
                    </GamingButton>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={prevSlide}
            className="pixel-panel p-3 hover-pixel transition-all"
          >
            <ChevronLeft className="w-6 h-6 text-secondary" />
          </button>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 transition-all ${
                  index === currentSlide
                    ? 'bg-secondary pixel-effect scale-125'
                    : 'bg-muted hover:bg-secondary/50'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="pixel-panel p-3 hover-pixel transition-all"
          >
            <ChevronRight className="w-6 h-6 text-secondary" />
          </button>
          
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="pixel-panel p-3 hover-pixel transition-all ml-2"
          >
            <Play className={`w-6 h-6 text-secondary transition-all ${isPlaying ? 'rotate-90' : 'rotate-0'}`} />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 right-8 z-20">
        <div className="pixel-panel p-2">
          <div className="w-6 h-12 border-2 border-secondary relative">
            <div className="w-1 h-3 bg-secondary absolute top-2 left-1/2 transform -translate-x-1/2 animate-pixel-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}