import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Menu, X, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsOpen(false)
  }

  const handlePlayGame = () => {
    // Redirigir a la página de login
    navigate('/login')
  }

  const navItems = [
    { label: "Inicio", id: "hero" },
    { label: "Sobre", id: "about" },
    { label: "Tutorial", id: "tutorial" },
    { label: "Características", id: "features" },
    { label: "Tecnología", id: "technology" },
    { label: "Estadísticas", id: "stats" },
    { label: "Testimonios", id: "testimonials" },
    { label: "Contacto", id: "contact" }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pixel-panel backdrop-blur-md bg-background/80 border-b-3 border-pixel-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="pixel-panel p-2">
              <Zap className="w-6 h-6 text-secondary" />
            </div>
            <span className="font-pixel text-lg gradient-text">AgroVerse</span>
          </div>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.id}>
                  <NavigationMenuLink
                    className={cn(
                      "pixel-panel px-4 py-2 mx-1 hover-pixel transition-all cursor-pointer font-code text-sm",
                      "hover:bg-secondary/10 hover:border-secondary"
                    )}
                    onClick={() => scrollToSection(item.id)}
                  >
                    {item.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button
              className="pixel-panel bg-secondary hover:bg-secondary/80 text-white font-code px-6 py-2 hover-pixel neon-glow font-bold"
              onClick={handlePlayGame}
            >
              ¡Jugar Ahora!
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden pixel-panel p-2 hover-pixel"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-pixel-border pt-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  className="pixel-panel p-3 text-left hover-pixel font-code text-sm"
                  onClick={() => scrollToSection(item.id)}
                >
                  {item.label}
                </button>
              ))}
              <Button
                className="pixel-panel bg-secondary hover:bg-secondary/80 text-white font-code mt-2 hover-pixel neon-glow font-bold"
                onClick={handlePlayGame}
              >
                ¡Jugar Ahora!
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
