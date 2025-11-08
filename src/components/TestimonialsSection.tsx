import { Star, Quote } from "lucide-react"
import { GamingCard, GamingCardContent, GamingCardDescription, GamingCardHeader, GamingCardTitle } from "./ui/gaming-card"

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      name: "María González",
      role: "Productora de Maíz - Cajamarca",
      avatar: "🌽",
      rating: 5,
      text: "Las alertas de heladas me salvaron la cosecha el año pasado. Me avisaron con 2 días de anticipación y pude proteger mis cultivos. Aumenté mi producción 40% usando las recomendaciones del juego.",
      achievement: "🏆 Top Farmer 2024"
    },
    {
      id: 2,
      name: "Carlos Rodríguez",
      role: "Cultivador de Café - Junín",
      avatar: "☕",
      rating: 5,
      text: "Ver mi granja como un juego hace que sea más fácil entender qué está pasando. Simulo diferentes técnicas en el juego antes de aplicarlas en mi terreno real. Mi rendimiento mejoró 35% en 6 meses.",
      achievement: "⭐ Early Adopter"
    },
    {
      id: 3,
      name: "Ana López",
      role: "Huerto Orgánico - Cusco",
      avatar: "🥕",
      rating: 5,
      text: "Como agricultora orgánica, las recomendaciones de la IA me ayudan a optimizar sin químicos. Puedo ver en el juego cómo cada decisión afecta mi cultivo real. Es educativo y práctico.",
      achievement: "🌱 Sustainable Champion"
    },
    {
      id: 4,
      name: "Roberto Sánchez",
      role: "Cooperativa de Arroz - Piura",
      avatar: "🌾",
      rating: 5,
      text: "Manejo 200 hectáreas y AgroVerse me da visibilidad de toda mi operación en un solo lugar. Las alertas de heladas y análisis satelital me ahorraron miles. ROI positivo en el primer año.",
      achievement: "💰 Profit Maximizer"
    }
  ]

  return (
    <section className="py-20 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-3xl md:text-4xl mb-6 gradient-text">
            Historias de Éxito
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-code leading-relaxed">
            Agricultores reales compartiendo cómo AgroVerse les ayudó a mejorar sus cultivos con tecnología de Google Cloud.
            Desde pequeños productores hasta cooperativas grandes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((testimonial) => (
            <GamingCard key={testimonial.id} className="hover-pixel group relative overflow-hidden">
              <div className="absolute top-4 right-4 pixel-panel p-2">
                <span className="text-xs font-pixel">{testimonial.achievement}</span>
              </div>

              <GamingCardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="pixel-panel p-3 text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <GamingCardTitle className="font-pixel text-lg">
                      {testimonial.name}
                    </GamingCardTitle>
                    <p className="text-sm text-muted-foreground font-code">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-secondary text-secondary" />
                  ))}
                </div>
              </GamingCardHeader>

              <GamingCardContent>
                <div className="relative">
                  <Quote className="w-8 h-8 text-secondary/30 absolute -top-2 -left-2" />
                  <GamingCardDescription className="font-code leading-relaxed pl-6">
                    "{testimonial.text}"
                  </GamingCardDescription>
                </div>
              </GamingCardContent>
            </GamingCard>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="pixel-panel p-8 max-w-4xl mx-auto">
            <h3 className="font-pixel text-2xl mb-4 gradient-text">
              Únete a la Comunidad
            </h3>
            <p className="text-muted-foreground font-code leading-relaxed mb-6">
              Miles de agricultores ya están usando AgroVerse para optimizar sus granjas con IA y datos satelitales.
              Empieza gratis y descubre cómo la simulación 2D puede mejorar tu cultivo real.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="font-pixel text-3xl text-secondary mb-2">15K+</div>
                <p className="text-sm text-muted-foreground font-code">Usuarios Activos</p>
              </div>
              <div>
                <div className="font-pixel text-3xl text-accent mb-2">850K</div>
                <p className="text-sm text-muted-foreground font-code">Hectáreas en Simulación</p>
              </div>
              <div>
                <div className="font-pixel text-3xl text-highlight mb-2">96%</div>
                <p className="text-sm text-muted-foreground font-code">Satisfacción</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
