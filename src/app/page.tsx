"use client";
import { useState } from "react";
import {
  Brain,
  Linkedin,
  Instagram,
  Twitter,
  Play,
  Sparkles,
  Book,
  Clock,
  Trophy,
  Target,
  ChevronRight,
  Search,
  Menu,
  X,
  Download,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-indigo-950 to-black text-white'>
      <div className='absolute inset-0  bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]' />

      <Header />

      <main className='relative'>
        <Hero />
        <Dashboard />
        <Features />
        <Testimonials />
        <Pricing />
      </main>

      <Footer />
    </div>
  );
}

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='sticky top-0 z-50 bg-indigo-950/80 backdrop-blur-sm'>
      <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
        <div className='flex items-center gap-2'>
          <Play className='h-8 w-8 text-indigo-400' />
          <div className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400'>
            Autoplay
          </div>
        </div>
        <nav className='hidden md:flex items-center gap-6'>
          <Link
            href='#features'
            className='text-gray-300 hover:text-white transition-colors'
          >
            Features
          </Link>
          <Link
            href='#testimonials'
            className='text-gray-300 hover:text-white transition-colors'
          >
            Testimonials
          </Link>
          <Link
            href='#pricing'
            className='text-gray-300 hover:text-white transition-colors'
          >
            Pricing
          </Link>
        </nav>
        <div className='hidden md:flex items-center gap-4'>
        <Link href="/sign-up">
          <Button
            variant='outline' effect="ringHover"
            className='bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-500/50 hover:bg-indigo-500/20'
          >
           
            Try Free
          </Button>
           </Link>
            <Link href="/sign-in">
          <Button effect="ringHover" className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'>
            Sign In
          </Button>
          </Link>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='md:hidden'
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className='h-6 w-6' />
          ) : (
            <Menu className='h-6 w-6' />
          )}
        </Button>
      </div>

      {mobileMenuOpen && (
        <div className='md:hidden bg-black/90 backdrop-blur-sm'>
          <div className='container mx-auto px-4 py-4 flex flex-col gap-4'>
            <Link
              href='#features'
              className='text-gray-300 hover:text-white transition-colors'
            >
              Features
            </Link>
            <Link
              href='#testimonials'
              className='text-gray-300 hover:text-white transition-colors'
            >
              Testimonials
            </Link>
            <Link
              href='#pricing'
              className='text-gray-300 hover:text-white transition-colors'
            >
              Pricing
            </Link>
            <Button
              variant='outline' effect="ringHover"
              className='text-white border-indigo-500/50 bg-indigo-400/20 hover:bg-indigo-500/20'
            >
              Try Free
            </Button>
            <Button effect="ringHover" className='w-full bg-gradient-to-r from-indigo-600 to-purple-600'>
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className='container mx-auto px-4 pt-24 pb-32'>
      <div className='text-center max-w-3xl mx-auto'>
        <div className='flex items-center justify-center gap-2 mb-4'>
          <Sparkles className='h-6 w-6 text-indigo-400' />
          <span className='text-indigo-400 font-semibold'>
            AI-Powered Learning
          </span>
        </div>
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400'>
          Your AI Study Companion
        </h1>
        <p className='text-lg text-gray-300 mb-8'>
          Personalized learning paths, smart study schedules, and instant help
          when you need it
        </p>

        <div className='flex flex-col sm:flex-row justify-center gap-4 mb-12'>
          <Button className='bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'>
            Start Learning Now
          </Button>
          <Button
            variant='outline'
            className='text-white border-indigo-500/50 bg-indigo-400/20 hover:bg-indigo-500/20'
          >
            Watch Demo
          </Button>
        </div>

        <div className='flex flex-col sm:flex-row justify-center items-center gap-4'>
          <Button className='w-full sm:w-auto bg-black hover:bg-gray-900 flex items-center gap-2'>
            <Download className='h-5 w-5' />
            Download for iOS
          </Button>
          <Button className='w-full sm:w-auto bg-black hover:bg-gray-900 flex items-center gap-2'>
            <Download className='h-5 w-5' />
            Download for Android
          </Button>
        </div>
      </div>
    </section>
  );
}

function Dashboard() {
  const [activePlatform, setActivePlatform] = useState("Instagram");
  const [activeTab, setActiveTab] = useState("Overview");

  const platforms = [
    { name: "Instagram", icon: <Instagram className="w-5 h-5 text-indigo-300" /> , categories: ["Reels", "Stories", "Posts"] },
    { name: "Twitter", icon: <Twitter className="w-5 h-5 text-indigo-300" /> , categories: ["Threads", "Tweets", "Polls"] },
    { name: "LinkedIn", icon: <Linkedin className="w-5 h-5 text-indigo-300" /> , categories: ["Articles", "Tips", "Career"] },
  ];

  const stats = [
    { label: "Posts Created", value: "56", icon: Sparkles },
    { label: "Engagement Rate", value: "7.3%", icon: Target },
    { label: "Followers Gained", value: "120", icon: Trophy },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold text-center mb-8">
        Social Media Assistant Preview
      </h2>

      <div className="max-w-6xl mx-auto bg-indigo-950/50 backdrop-blur-sm rounded-2xl border border-indigo-500/20 overflow-hidden">
        <div className="bg-black/40 p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex overflow-x-auto hide-scrollbar">
              {["Overview", "Generate Post", "Scheduled", "Analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "hover:bg-indigo-500/10 text-gray-400"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-auto">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search posts or hashtags..."
                className="w-full md:w-64 bg-black/40 rounded-full py-2 pl-10 pr-4 text-sm border border-indigo-500/20 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
        </div>

        {/* Sidebar & Stats Section */}
        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3 bg-black/40 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Platforms</h3>
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible hide-scrollbar">
              {platforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => setActivePlatform(platform.name)}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activePlatform === platform.name
                      ? "bg-indigo-500/20 text-indigo-300"
                      : "hover:bg-indigo-500/10"
                  }`}
                >
                  <span className="text-xl">{platform.icon}</span>
                  <span>{platform.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-9 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="bg-black/40 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-indigo-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">{label}</div>
                    <div className="text-xl font-semibold">{value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-black/40 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">
                {activePlatform} Categories
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {platforms
                  .find((p) => p.name === activePlatform)
                  ?.categories.map((cat) => (
                    <div
                      key={cat}
                      className="bg-indigo-950/50 rounded-lg p-4 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{cat}</span>
                        <ChevronRight className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                          style={{ width: `${Math.random() * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="bg-black/40 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Suggested Posts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Quote: Start your week with motivation",
                  "Tip: How to increase engagement",
                  "Poll: What content works best?",
                  "Trend: #ThrowbackThursday idea",
                ].map((item) => (
                  <div
                    key={item}
                    className="bg-indigo-950/50 rounded-lg p-4 hover:bg-indigo-500/10 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>{item}</span>
                    <Button
                      size="sm"
                      className="bg-indigo-500 hover:bg-indigo-400"
                    >
                      Generate
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Play,
      title: "AI-Generated Posts",
      description:
        "Leverage AI to create engaging, platform-optimized social media content tailored to your brand and audience.",
    },
    {
      icon: Sparkles,
      title: "Instant Publishing",
      description:
        "Schedule or instantly publish posts across multiple platforms with a single click, saving you valuable time.",
    },
    {
      icon: Book,
      title: "Content Library",
      description:
        "Store and manage your best-performing posts, drafts, and ideas in one centralized, organized content hub.",
    },
    {
      icon: Clock,
      title: "Performance Insights",
      description:
        "Track likes, shares, reach, and more with real-time analytics that help you measure success and optimize future content.",
    },
  ];

  return (
    <section
      id='features'
      className='container mx-auto px-4 py-16'
    >
      <h2 className='text-3xl font-bold text-center mb-12'>Key Features</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
        {features.map((feature, index) => (
          <div
            key={index}
            className='bg-indigo-950/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/20'
          >
            <feature.icon className='h-12 w-12 text-indigo-400 mb-4' />
            <h3 className='text-xl font-semibold mb-2'>{feature.title}</h3>
            <p className='text-gray-300'>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const testimonials = [
    {
      quote:
        "This app has completely changed how I manage my brand’s social media. Content creation and scheduling are now effortless!",
      author: "Sarah J.",
      role: "Digital Marketer",
      avatar: "/Adewale-olufemi.jpg",
    },
    {
      quote:
        "As a busy entrepreneur, I needed a tool that could handle content and analytics. This app does it all — and brilliantly too.",
      author: "Michael T.",
      role: "Startup Founder",
      avatar: "/Adewale-olufemi.jpg",
    },
    {
      quote:
        "The AI suggestions are on point, and the analytics help me improve my engagement every week. It's like having a full marketing team!",
      author: "Emily R.",
      role: "Content Creator",
      avatar: "/Adewale-olufemi.jpg",
    },
  ];

  return (
    <section
      id='testimonials'
      className='container mx-auto px-4 py-16'
    >
      <h2 className='text-3xl font-bold text-center mb-12'>
        What Our Users Say
      </h2>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className='bg-indigo-950/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/20'
          >
            <p className='text-gray-300 mb-4'>
              &quot;{testimonial.quote}&quot;
            </p>
            <div className='flex items-center'>
              <Image
                src={testimonial.avatar}
                alt={testimonial.author}
                width={40}
                height={40}
                className='rounded-full mr-4'
              />
              <div>
                <p className='font-semibold'>{testimonial.author}</p>
                <p className='text-sm text-gray-400'>{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Basic",
      price: "$9.99",
      features: [
        "Generate AI-powered posts",
        "Schedule up to 10 posts/month",
        "Basic performance analytics",
        "Multi-platform publishing",
      ],
    },
    {
      name: "Pro",
      price: "$19.99",
      features: [
        "All Basic features",
        "Unlimited post scheduling",
        "Advanced engagement insights",
        "Hashtag and trend suggestions",
        "Remove branding from posts",
      ],
    },
    {
      name: "Premium",
      price: "$29.99",
      features: [
        "All Pro features",
        "Team collaboration tools",
        "Content strategy recommendations",
        "API access and integrations",
        "Priority support",
      ],
    },
  ];

  return (
    <section
      id='pricing'
      className='container mx-auto px-4 py-16'
    >
      <h2 className='text-3xl font-bold text-center mb-12'>Choose Your Plan</h2>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
        {plans.map((plan, index) => (
          <div
            key={index}
            className='bg-indigo-950/50 backdrop-blur-sm rounded-xl p-6 border border-indigo-500/20 flex flex-col'
          >
            <h3 className='text-2xl font-semibold mb-2'>{plan.name}</h3>
            <p className='text-4xl font-bold mb-6'>
              {plan.price}
              <span className='text-sm font-normal'>/month</span>
            </p>
            <ul className='mb-8 flex-grow'>
              {plan.features.map((feature, featureIndex) => (
                <li
                  key={featureIndex}
                  className='flex items-center mb-2'
                >
                  <Check className='h-5 w-5 text-indigo-400 mr-2' />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <Button effect="shineHover" className='w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500'>
              Get Started
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className='bg-indigo-950/80 border-t border-indigo-500/20'>
      <div className='container mx-auto px-4 py-8'>
        <div className='flex flex-col md:flex-row justify-between items-center'>
          <div className='flex items-center mb-4 md:mb-0'>
            <Play className='h-8 w-8 text-indigo-400 mr-2' />
            <span className='text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400'>
              Autoplay
            </span>
          </div>
          <nav className='flex flex-wrap justify-center gap-6'>
            <Link
              href='#features'
              className='text-gray-300 hover:text-white transition-colors'
            >
              Features
            </Link>
            <Link
              href='#testimonials'
              className='text-gray-300 hover:text-white transition-colors'
            >
              Testimonials
            </Link>
            <Link
              href='#pricing'
              className='text-gray-300 hover:text-white transition-colors'
            >
              Pricing
            </Link>
            <a
              href='#'
              className='text-gray-300 hover:text-white transition-colors'
            >
              Privacy Policy
            </a>
            <a
              href='#'
              className='text-gray-300 hover:text-white transition-colors'
            >
              Terms of Service
            </a>
          </nav>
        </div>
        <div className='mt-8 text-center text-gray-400'>
          © 2025 Autoplay. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
