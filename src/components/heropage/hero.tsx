"use client"

import React, { useRef } from 'react'
import Link from "next/link"
import {
  ArrowRight,
  BarChart3,
  Users,
  Settings,
  CheckCircle,
  ArrowUpRight,
  Sparkles,
  Star,
  ArrowRight as ArrowRightIcon
} from 'lucide-react'
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from '@radix-ui/react-scroll-area'
import Image from 'next/image'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
}

const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <motion.div
    animate={{ y: [0, -10, 0] }}
    transition={{
      duration: 4,
      repeat: Infinity,
      repeatType: "reverse",
      ease: "easeInOut",
      delay,
    }}
  >
    {children}
  </motion.div>
)

const AnimatedCard = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
      className="h-full"
    >
      {children}
    </motion.div>
  )
}

const testimonials = [
  {
    quote: "CMS Pro has revolutionized how we manage customer relationships. The insights have been invaluable.",
    author: "Sarah Johnson",
    role: "Head of Customer Success",
    company: "Tech Innovators Inc.",
    avatar: "/api/placeholder/32/32"
  },
  {
    quote: "The customization options allowed us to tailor the system perfectly to our unique workflow.",
    author: "Michael Chen",
    role: "Operations Director",
    company: "Global Solutions Ltd.",
    avatar: "/api/placeholder/32/32"
  },
  {
    quote: "The analytics features have helped us make data-driven decisions that improved our retention.",
    author: "Emma Williams",
    role: "Customer Experience Lead",
    company: "StartUp Dynamo",
    avatar: "/api/placeholder/32/32"
  }
]

const features = [
  {
    icon: Users,
    title: "Customer Management",
    description: "Efficiently organize and manage your customer database with powerful tools and insights.",
    features: ["Comprehensive profiles", "Interaction tracking", "Smart segmentation", "AI-powered insights"],
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    icon: BarChart3,
    title: "Analytics & Reporting",
    description: "Make data-driven decisions with advanced analytics and customizable reports.",
    features: ["Real-time dashboards", "Custom reports", "Trend analysis", "Export capabilities"],
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    icon: Settings,
    title: "Customization",
    description: "Tailor the system to match your specific business needs and workflows.",
    features: ["Custom fields", "Workflow automation", "Integrations", "White-labeling"],
    gradient: "from-purple-500 to-pink-500"
  }
]

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    description: "Perfect for small businesses just getting started.",
    features: [
      "Up to 1,000 contacts",
      "Basic analytics",
      "Email support",
      "5 team members"
    ]
  },
  {
    name: "Professional",
    price: "$99",
    description: "Ideal for growing businesses with advanced needs.",
    features: [
      "Up to 10,000 contacts",
      "Advanced analytics",
      "Priority support",
      "Unlimited team members",
      "API access"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with specific requirements.",
    features: [
      "Unlimited contacts",
      "Custom analytics",
      "24/7 dedicated support",
      "Custom integrations",
      "On-premise option"
    ]
  }
]

export default function HeroPage() {
  return (
    <ScrollArea>
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="px-6 lg:px-8 h-20 flex items-center justify-between border-b sticky top-0 bg-white/80 backdrop-blur-sm z-50"
      >
        <Link className="flex items-center justify-center" href="#">
          <motion.span
            className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
            whileHover={{ scale: 1.05 }}
          >
            CMS Pro
          </motion.span>
        </Link>
        <nav className="hidden md:flex gap-8">
          {["Features", "Testimonials", "Pricing"].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors relative group"
                href={`#${item.toLowerCase()}`}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </Link>
            </motion.div>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button asChild variant="ghost" className="hover:text-blue-600">
              <Link href="/dashboard/userdetails">Sign In</Link>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }}>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/dashboard/userdetails">Get Started</Link>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-neutral-50" />
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          </motion.div>

          <div className="container relative px-4 md:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]"
            >
              <div className="flex flex-col justify-center space-y-8">
                <motion.div variants={fadeIn}>
                  <Badge variant="secondary" className="w-fit bg-blue-100/80 text-blue-700 hover:bg-blue-100 backdrop-blur-sm">
                    <Sparkles className="w-4 h-4 mr-2" />
                    New: AI-Powered Insights
                  </Badge>
                </motion.div>

                <motion.div variants={fadeIn} className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight sm:text-6xl xl:text-7xl/none bg-gradient-to-r from-neutral-900 via-blue-950 to-blue-900 bg-clip-text text-transparent">
                    Manage Customers with Confidence
                  </h1>
                  <p className="max-w-[600px] text-lg text-neutral-600 md:text-xl">
                    Streamline relationships, boost engagement, and drive growth with our intelligent CMS platform.
                  </p>
                </motion.div>

                <motion.div variants={fadeIn} className="flex flex-col gap-3 sm:flex-row">
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button className="px-8 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20" size="lg">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }}>
                    <Button variant="outline" size="lg" className="group border-2">
                      View Demo
                      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Button>
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 text-sm pt-4">
                  {[
                    "14-day free trial",
                    "No credit card required"
                  ].map((text, i) => (
                    <motion.div
                      key={text}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }}
                      className="flex items-center"
                    >
                      <CheckCircle className="text-green-500 mr-2 h-5 w-5" />
                      <span className="text-neutral-600">{text}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div className="hidden lg:flex items-center justify-center">
                <FloatingElement>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full aspect-square rounded-2xl bg-gradient-to-br from-blue-100 via-blue-50 to-white shadow-lg"
                  >
                    <motion.div
                      className="absolute inset-2 rounded-xl bg-white/80 backdrop-blur-sm border shadow-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  </motion.div>
                </FloatingElement>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16"
            >
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">Features</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4 bg-gradient-to-r from-neutral-900 to-neutral-800 bg-clip-text text-transparent">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-neutral-600">
                Powerful tools and insights to help you manage, analyze, and grow your customer relationships.
              </p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-3">
              {features.map((feature, index) => (
                <AnimatedCard key={index}>
                  <Card className="group h-full hover:shadow-xl transition-all duration-300 border-neutral-200/80 overflow-hidden">
                    <CardHeader>
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br mb-4 relative">
                        <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 transition-opacity rounded-lg`} />
                        <feature.icon className="w-6 h-6 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <CardTitle className="text-xl bg-gradient-to-r from-neutral-900 to-neutral-800 bg-clip-text text-transparent">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-neutral-600">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {feature.features.map((item, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center text-sm text-neutral-600"
                          >
                            <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            {item}
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="w-full py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16"
            >
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">Testimonials</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4 bg-gradient-to-r from-neutral-900 to-neutral-800 bg-clip-text text-transparent">
                What our customers say
              </h2>
              <p className="text-lg text-neutral-600">
                See how CMS Pro has helped businesses like yours transform their customer relationships.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <AnimatedCard key={index}>
                  <Card className="h-full flex flex-col justify-between p-6">
                    < CardContent className="space-y-4">
                      <p className="text-neutral-600">
                      &quot;{testimonial.quote}&quot;
                      </p>
                      <div className="flex items-center">
                        <Image
                          src={testimonial.avatar}
                          alt={`${testimonial.author} avatar`}
                          className="w-12 h-12 rounded-full mr-4"
                        />
                        <div>
                          <p className="font-semibold">{testimonial.author}</p>
                          <p className="text-sm text-neutral-600">{testimonial.role} at {testimonial.company}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="w-full py-24 md:py-32">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16"
            >
              <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">Pricing</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-5xl mb-4 bg-gradient-to-r from-neutral-900 to-neutral-800 bg-clip-text text-transparent">
                Plans for every stage of growth
              </h2>
              <p className="text-lg text-neutral-600">
                Choose the plan that best fits your needs and start transforming your customer relationships today.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {pricingPlans.map((plan, index) => (
                <AnimatedCard key={index}>
                  <Card className="h-full flex flex-col justify-between p-6">
                    <CardHeader>
                      <CardTitle className="text-xl">{plan.name}</CardTitle>
                      <CardDescription className="text-neutral-600">
                        {plan.description}
                      </CardDescription>
                      <div className="mt-4 text-4xl font-bold">{plan.price}</div>
                      {plan.popular && (
                        <Badge variant="secondary" className="mt-2 bg-blue-600 text-white">
                          <Star className="w-4 h-4 mr-2" />
                          Most Popular
                        </Badge>
                      )}
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="flex items-center text-sm text-neutral-600"
                          >
                            <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </CardContent>
                    <div className="mt-6">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700">
                        Choose Plan
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                </AnimatedCard>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="w-full py-24 md:py-32 bg-blue-600">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center">
              <div className="space-y-4 max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tight sm:text-5xl text-white">Ready to transform your business?</h2>
                <p className="text-lg text-blue-100">
                  Join thousands of companies already using CMS Pro to scale their customer relationships.
                </p>
              </div>
              <div className="w-full max-w-md space-y-3">
                <form className="flex gap-3">
                  <Input
                    className="flex-1 bg-white/90 backdrop-blur-sm border-white/20 text-neutral-900 placeholder:text-neutral-500"
                    placeholder="Enter your email"
                    type="email"
                  />
                  <Button type="submit" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">
                    Start Free Trial
                  </Button>
                </form>
                <p className="text-sm text-blue-100">
                  14-day free trial · No credit card required
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 px-4 md:px-6 border-t bg-white">
        <div className="container flex flex-col gap-4 sm:flex-row items-center">
          <p className="text-sm text-neutral-500">© 2024 CMS Pro. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-6">
            <Link className="text-sm text-neutral-500 hover:text-blue-600 transition-colors" href="#">Terms</Link>
            <Link className="text-sm text-neutral-500 hover:text-blue-600 transition-colors" href="#">Privacy</Link>
            <Link className="text-sm text-neutral-500 hover:text-blue-600 transition-colors" href="#">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
    </ScrollArea>
  )
}