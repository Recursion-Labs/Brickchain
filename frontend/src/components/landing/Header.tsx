/* eslint-disable @next/next/no-img-element */
import { Book, Menu, Sunset, Trees, Zap } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface Navbar1Props {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
}

const Header = ({
  logo = {
    url: "",
    src: "https://ik.imagekit.io/mwhha64ay/Brickchain/Recursionlogo.png",
    alt: "logo",
    title: "Brickchain",
  },
  menu = [
    { title: "Home", url: "/#hero" },
    { title: "How it works", url: "/#how-it-works" },
    { title: "FAQs", url: "/#faqs" },
    { title: "Waitlist", url: "/waitlist" },
    { title: "Forum", url: "/forum" },
    {
      title: "Resources",
      url: "#",
      items: [
        {
          title: "Help Center",
          description: "Get all the answers you need right here",
          icon: <Zap className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Contact Us",
          description: "We are here to help you with any questions you have",
          icon: <Sunset className="size-5 shrink-0" />,
          url: "/contact",
        },
        {
          title: "Status",
          description: "Check the current status of our services and APIs",
          icon: <Trees className="size-5 shrink-0" />,
          url: "#",
        },
        {
          title: "Terms of Service",
          description: "Our terms and conditions for using our services",
          icon: <Book className="size-5 shrink-0" />,
          url: "#",
        },
      ],
    },
    {
      title: "Pricing",
      url: "#",
    },
  ],
}: Navbar1Props) => {
  return (
    <section className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto py-4 px-4">
        {/* Desktop Menu */}
        <nav className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-12"
                alt={logo.alt}
              />
              <span className="ml-2 text-xl font-bold tracking-tighter text-foreground">
                {logo.title}
              </span>
            </a>
            <div className="flex items-center">
              <NavigationMenu>
                <NavigationMenuList>
                  {menu.map((item) => renderMenuItem(item))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-foreground hover:bg-secondary/80"
            >
              <a href="/waitlist">Join Waitlist</a>
            </Button>
            <Button
              asChild
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <a href="/me">Explore</a>
            </Button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <img
                src={logo.src}
                className="max-h-12"
                alt={logo.alt}
              />
              <span className="ml-2 text-lg font-semibold text-foreground">
                {logo.title}
              </span>
            </a>
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-secondary/80"
                >
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto bg-background text-foreground border-border">
                <SheetHeader>
                  <SheetTitle>
                    <a href={logo.url} className="flex items-center gap-2">
                      <img
                        src={logo.src}
                        className="max-h-12"
                        alt={logo.alt}
                      />
                      <span className="ml-2 text-lg font-semibold text-foreground">
                        {logo.title}
                      </span>
                    </a>
                  </SheetTitle>
                </SheetHeader>
                <div className="flex flex-col gap-6 p-4">
                  <Accordion
                    type="single"
                    collapsible
                    className="flex w-full flex-col gap-4"
                  >
                    {menu.map((item) => renderMobileMenuItem(item))}
                  </Accordion>

                  <div className="flex flex-col gap-3">
                    <Button
                      asChild
                      variant="ghost"
                      className="text-foreground hover:bg-secondary/80 justify-start"
                    >
                      <a href="/waitlist">Join Waitlist</a>
                    </Button>
                    <Button
                      asChild
                      className="bg-primary text-primary-foreground hover:bg-primary/90 justify-start"
                    >
                      <a href="/me">Explore</a>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
        <NavigationMenuItem key={item.title}>
          <NavigationMenuTrigger className="text-foreground hover:text-foreground bg-background hover:bg-secondary/80">{item.title}</NavigationMenuTrigger>
          <NavigationMenuContent className="bg-background text-foreground border-border ">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink
        href={item.url}
        className="bg-background hover:bg-secondary/80 text-foreground hover:text-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        {item.title}
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const renderMobileMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <AccordionItem key={item.title} value={item.title} className="border-b-0">
        <AccordionTrigger className="text-md py-0 font-semibold hover:no-underline text-foreground">
          {item.title}
        </AccordionTrigger>
        <AccordionContent className="mt-2">
          {item.items.map((subItem) => (
            <SubMenuLink key={subItem.title} item={subItem} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  }

  return (
    <a key={item.title} href={item.url} className="text-md font-semibold text-foreground">
      {item.title}
    </a>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <a
      className="hover:bg-secondary/80 text-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold text-foreground">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </a>
  );
};

export { Header };