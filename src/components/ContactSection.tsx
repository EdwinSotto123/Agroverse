import { useState } from "react"
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react"
import { GamingButton } from "./ui/gaming-button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { GamingCard, GamingCardContent, GamingCardDescription, GamingCardHeader, GamingCardTitle } from "./ui/gaming-card"

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    farmSize: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log('Form submitted:', formData)
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "hola@agroverse.app",
      description: "Respuesta en menos de 24 horas"
    },
    {
      icon: Phone,
      title: "Teléfono",
      value: "+51 (1) 234-5678",
      description: "Lunes a Viernes, 9AM - 6PM"
    },
    {
      icon: MapPin,
      title: "Oficina",
      value: "Lima, Perú",
      description: "Disponible para visitas"
    }
  ]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-pixel text-3xl md:text-4xl mb-6 gradient-text">
            ¡Hablemos de Tu Granja!
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto font-code leading-relaxed">
            ¿Listo para simular tu granja en 2D? Contáctanos para una demo personalizada.
            Te mostraremos cómo crear tu granja digital y empezar a recibir alertas y recomendaciones.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <GamingCard>
              <GamingCardHeader>
                <GamingCardTitle className="font-pixel text-2xl">
                  Solicitud de Demo Gratuita
                </GamingCardTitle>
                <GamingCardDescription className="font-code">
                  Completa el formulario y un especialista se pondrá en contacto contigo
                  para agendar una demostración personalizada de AgroVerse.
                </GamingCardDescription>
              </GamingCardHeader>
              <GamingCardContent>
                {isSubmitted ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
                    <h3 className="font-pixel text-xl mb-2 gradient-text">
                      ¡Mensaje Enviado!
                    </h3>
                    <p className="text-muted-foreground font-code">
                      Gracias por tu interés. Te contactaremos pronto.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-code mb-2">Nombre Completo</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="pixel-panel"
                          placeholder="Tu nombre"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-code mb-2">Email</label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="pixel-panel"
                          placeholder="tu@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-code mb-2">Teléfono</label>
                        <Input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="pixel-panel"
                          placeholder="+52 55 1234 5678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-code mb-2">Tamaño de Granja (hectáreas)</label>
                        <Input
                          name="farmSize"
                          value={formData.farmSize}
                          onChange={handleChange}
                          className="pixel-panel"
                          placeholder="Ej: 50"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-code mb-2">Mensaje</label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        className="pixel-panel min-h-32"
                        placeholder="Cuéntanos sobre tus cultivos y desafíos actuales..."
                        required
                      />
                    </div>

                    <GamingButton type="submit" className="w-full hover-pixel">
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Solicitud
                    </GamingButton>
                  </form>
                )}
              </GamingCardContent>
            </GamingCard>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((info, index) => {
              const IconComponent = info.icon
              return (
                <GamingCard key={index} className="hover-pixel">
                  <GamingCardContent>
                    <div className="flex items-start gap-4">
                      <div className="pixel-panel p-3">
                        <IconComponent className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-pixel text-lg mb-1">{info.title}</h3>
                        <p className="font-code text-secondary mb-1">{info.value}</p>
                        <p className="text-sm text-muted-foreground font-code">{info.description}</p>
                      </div>
                    </div>
                  </GamingCardContent>
                </GamingCard>
              )
            })}

            <GamingCard className="pixel-panel">
              <GamingCardContent>
                <h3 className="font-pixel text-xl mb-4 gradient-text">¿Por qué elegir AgroVerse?</h3>
                <ul className="space-y-2 font-code text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Demo gratuita personalizada
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Implementación en menos de 48 horas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Soporte técnico 24/7
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Capacitación incluida
                  </li>
                </ul>
              </GamingCardContent>
            </GamingCard>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
