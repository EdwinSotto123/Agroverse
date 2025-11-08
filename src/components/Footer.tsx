import { Zap, Github, Twitter, Linkedin, Mail } from "lucide-react"
import { GamingButton } from "./ui/gaming-button"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    producto: [
      { label: "Características", href: "#features" },
      { label: "Tecnología", href: "#technology" },
      { label: "Precios", href: "#pricing" },
      { label: "Demo", href: "#contact" }
    ],
    empresa: [
      { label: "Sobre Nosotros", href: "#about" },
      { label: "Blog", href: "#" },
      { label: "Carreras", href: "#" },
      { label: "Prensa", href: "#" }
    ],
    soporte: [
      { label: "Centro de Ayuda", href: "#" },
      { label: "Documentación", href: "#" },
      { label: "Contacto", href: "#contact" },
      { label: "Status", href: "#" }
    ],
    legal: [
      { label: "Privacidad", href: "#" },
      { label: "Términos", href: "#" },
      { label: "Cookies", href: "#" },
      { label: "GDPR", href: "#" }
    ]
  }

  const socialLinks = [
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Mail, href: "mailto:hola@agroverse.app", label: "Email" }
  ]

  return (
    <footer className="bg-muted/30 border-t border-pixel-border">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="pixel-panel p-2">
                <Zap className="w-6 h-6 text-secondary" />
              </div>
              <span className="font-pixel text-xl gradient-text">AgroVerse</span>
            </div>
            <p className="text-muted-foreground font-code leading-relaxed mb-6">
              Un juego 2D donde simulas tu granja real. Recibe alertas y recomendaciones
              en tiempo real usando IoT, satélites e IA para mejorar tu cultivo.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const IconComponent = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="pixel-panel p-3 hover-pixel transition-all"
                    aria-label={social.label}
                  >
                    <IconComponent className="w-5 h-5 text-secondary" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-pixel text-lg mb-4 capitalize">
                {category}
              </h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-secondary font-code text-sm transition-colors hover-pixel"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 pt-8 border-t border-pixel-border">
          <div className="max-w-md mx-auto text-center lg:mx-0 lg:text-left lg:max-w-none lg:flex lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h3 className="font-pixel text-lg mb-2">Mantente Actualizado</h3>
              <p className="text-muted-foreground font-code text-sm">
                Recibe las últimas novedades sobre agricultura digital y nuevas características.
              </p>
            </div>
            <div className="flex gap-3 max-w-sm mx-auto lg:mx-0">
              <input
                type="email"
                placeholder="tu@email.com"
                className="pixel-panel px-4 py-2 flex-1 font-code text-sm"
              />
              <GamingButton size="sm" className="hover-pixel">
                Suscribir
              </GamingButton>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-pixel-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground font-code text-sm">
              © {currentYear} AgroVerse. Todos los derechos reservados. Powered by Google Cloud Platform.
            </p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground font-code">
              <span>Hecho con ❤️ para agricultores</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                <span>Sistema Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
