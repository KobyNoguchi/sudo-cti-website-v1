import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import ContentBlock from '@/components/sections/ContentBlock'
import Stats from '@/components/sections/Stats'
import RansomwareMap from '@/components/sections/RansomwareMap'
import CTA from '@/components/sections/CTA'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <ContentBlock
        image="/Assets/LNG Infrastructure v2.jpg"
        imageAlt="LNG energy infrastructure"
        title="Tailored for the Utility Sector"
        content="As a cyber threat intelligence analyst who has spent years analyzing cyber threats targeting multinational utility companies, I've witnessed firsthand how the threat landscape has evolved dramatically over the past 4 years. The targeting of critical infrastructure has intensified to unprecedented levels due to geopolitical tensions and rapid advancement in open source threat actor tooling. I've established this specialized intelligence service specifically to help utility organizations like yours maintain your operational tempo to outpace evolving threats."
        reverse={false}
        buttonText="Learn More"
        buttonHref="/about"
      />
      <Stats />
      <RansomwareMap />
      <ContentBlock
        image="/Assets/OT Specific Threat Analysis.webp"
        imageAlt="OT threat analysis"
        title="OT-Specific Threat Analysis"
        content="Gain insights into threats targeting Operational Technology (OT) systems and industrial control systems (ICS). Our specialized analysis helps you understand the unique risks facing your critical infrastructure and provides actionable intelligence to protect your operational assets."
        reverse={true}
        buttonText="Explore Intelligence"
        buttonHref="/intelligence"
      />
      <CTA
        title="Ready to enhance your cyber defenses?"
        description="Schedule your briefing today and see how our platform can help you stay ahead of cyber threats."
        buttonText="Schedule Your Briefing"
        buttonHref="/contact"
      />
    </>
  )
}

